const del = require('del');
const flatten = require('gulp-flatten');
const fs = require('fs');
const im = require('imagemagick');
const path = require('path');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const replace = require('gulp-replace');

// https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts
const iPad = puppeteer.devices['iPad landscape'];
const utils = require('../utils');

const ___ = require('lodash');

module.exports = (gulp, options) => {

  const openBrowser = async () => {
    const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files'] });
    return browser;
  };

  const renderPage = async (browser, url, output) => {
    const page = await browser.newPage();
    const emulation = options.clm.device || iPad;
    await page.emulate(emulation);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: output + '.png' });
  };

  const generateThumbnails = async () => {

    utils.log.log(utils.log.chalk.green.bold('     ✔︎ Generating Veeva Thumbnails'));
    const basePath = path.join(process.cwd(), options.paths.dist);
    const dirs = utils.getDirectories(basePath);
    const defaultSizes = {
      full: {
        width: 1024,
        height: 768,
        name: 'full.jpg',
        quality: 75
      },
      thumb: {
        width: 1024,
        height: 768,
        name: 'thumb.jpg',
        quality: 55
      }
    };
    const sizes = {
      ...defaultSizes,
      ...options.clm.thumbnail_sizes
    };


    function convertImage(opts) {
      return new Promise(function(resolve, reject) {
        im.convert(opts, function(err) {
          if (err) {
            utils.log.error(err);
            reject(err);
          }
          return resolve();
        });
      });
    }

    const browser = await openBrowser();

    // create an array of promise-returning functions
    const allScreenshots = dirs.map(function(dir) {
      return utils.getFiles(path.join(basePath, dir))
        .then((files) => {
          if (!files) {
            return Promise.resolve();
          }
          const htmlFiles = ___(files).filter(function(file) {
            let matchFileName = dir;

            if (options.clm.crm.deploy_to && options.clm.crm.deploy_to === 'vault'){
              matchFileName = 'index';
            }
            return file.match(matchFileName + '.html');
          });

          for (const file of htmlFiles) {
            const completePath = 'file://' + path.join(process.cwd(), options.paths.dist, dir, file + '#screenshot'),
              outputFile = path.join(options.paths.dist, dir, dir);
            return renderPage(browser, completePath, outputFile)
              .then(() => convertImage([outputFile + '.png', '-resize', `${sizes.full.width}x${sizes.full.height}`, '-quality', `${sizes.full.quality}`, '-format', 'jpg', '-flatten', path.join(options.paths.dist, dir, `${dir}-${sizes.full.name}`)]))
              .then(() => convertImage([outputFile + '.png', '-resize', `${sizes.thumb.width}x${sizes.thumb.height}`, '-quality', `${sizes.thumb.quality}`, '-format', 'jpg', '-flatten', path.join(options.paths.dist, dir, `${dir}-${sizes.thumb.name}`)]))
              .then(() => convertImage([outputFile + '.png', '-resize', `${sizes.thumb.width}x${sizes.thumb.height}`, path.join(options.paths.dist, dir, 'thumb.png')]))
              .then(() => utils.rm(outputFile + '.png'));
          }
        });

    });

    return await Promise.all(allScreenshots)
      .then(async () => {
        await browser.close();
        return Promise.resolve();
      });
  };

  const copyThumbnails = () => {
    utils.log.log(utils.log.chalk.green.bold('     ✔︎ Copying thumbnails to shared assets'));
    return new Promise(function(resolve, reject) {
      gulp.src(path.join(options.paths.dist, '**', '*-thumb.jpg'))
        .pipe(flatten())
        .pipe(gulp.dest(`${options.paths.dist}/${options.paths.sharedAssets}/img/flyout-menu`))
        .once('error', function(err) {
          utils.log.error(err);
          reject(err);
        })
        .on('end', resolve);
    });
  };


  const generateScreenshots = async (screenshotPaths) => {
    utils.log.log('');
    utils.log.log(utils.log.chalk.yellow('    ⤷ Generating screenshots'));
    const browser = await openBrowser();
    const retArry = [];
    // create an array of promise-returning functions
    const allScreenshots = screenshotPaths.map((screenshot, index) => {
      const outputFile = screenshot.split('/').pop();
      retArry.push(path.join('screenshots', `${index}-${outputFile}.png`));
      return renderPage(browser, screenshot, path.join('screenshots', `${index}-${outputFile}`));
    });

    return utils.mkFolder('screenshots')
      .then(async () => await Promise.all(allScreenshots))
      .then(async () => await browser.close())
      .then(() => utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done generating screenshots')))
      .then(() => retArry);
  };

  const handleTempReferences = () => {

    if (options.verbose) {
      utils.log.note('    ⤷ Updating .tmp references');
    }

    return new Promise(function(resolve, reject) {
      gulp.src(path.join(options.paths.dist, '**', '*.{html,css,js}'))
        .pipe(replace('/shared/', '../'))
        .pipe(replace('/.tmp/', '../../.tmp/'))
        .pipe(gulp.dest(options.paths.dist))
        .once('error', function(err) {
          utils.log.error(err);
          reject(err);
        })
        .on('end', resolve);
    });
  };

  const generatePDF = (screenshots) => {
    utils.log.log('');
    utils.log.log(utils.log.chalk.yellow('    ⤷ Generating PDF'));
    return new Promise((resolve, reject) => {

      try {
        const defaultPDFDocument = {
          layout: 'portrait',
          margins: {
            top: 72,
            left: 60,
            right: 72,
            bottom: 20
          },
          size: [2048, 1536],
          width: 2048,
          height: 1536
        };

        const pdfDocument = {
          ...defaultPDFDocument,
          ...options.clm.pdf_document
        };

        const pdfDefaultImageSize = {
          height: 1536,
          width: 2048
        };

        const pdImageSize = {
          ...pdfDefaultImageSize,
          ...options.clm.pdf_document
        };

        const pdf = new PDFDocument(pdfDocument);

        let pdfDocumentName = 'screenshots';

        if (options.clm.job && options.clm.job.name && options.clm.job.number) {
          pdfDocumentName = `${options.clm.job.number}_${options.clm.job.name}`;
        }

        pdf.pipe(fs.createWriteStream(`screenshots/${pdfDocumentName}.pdf`));

        for (const [screenshotIndex, screenshot] of screenshots.entries()) {

          if (screenshot.includes('.png')) {

            if (screenshotIndex > 0) {
              pdf.addPage();
            }

            pdf.image(screenshot, 0, 0, pdImageSize);
          }
        }
        pdf.end();
        utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done generating pdf'));
        return resolve();

      } catch (error) {
        return reject(error);
      }
    });
  };

  gulp.task('veeva-thumbs', function() {
    return generateThumbnails()
      .then(() => utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done generating Veeva thumbnails')))
      .then(copyThumbnails);
  });

  gulp.task('screenshots', ['assemble', 'sass:dev', 'scripts:dev', 'images:dev'], async () => {

    if (!options.clm) {
      return Promise.resolve();
    }

    const screenshotPaths = [];

    for (const km of options.clm.key_messages) {

      let keyMessage = km.key_message;

      if (options.clm.product && options.clm.product.name) {
        keyMessage = options.clm.product.name + options.clm.product.suffix + keyMessage;
      }
      const keyMessagePath = path.join(process.cwd(), options.paths.dist, keyMessage, keyMessage);
      const isKeyMessageHTML = await utils.hasFile(`${keyMessagePath}.html`);

      if (isKeyMessageHTML) {
        for (const [slideIndex, slide] of km.slides.entries()) {

          screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&screenshot`);

          if (slide.screenshots) {
            for (const screenshot of slide.screenshots) {
              screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&event=${screenshot}&screenshot`);
            }
          }

          if (slide.overlays) {
            for (const overlay of slide.overlays) {
              if (await utils.hasFile(path.join(process.cwd(), options.paths.dist, keyMessage, overlay.file))) {
                screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&popup=${overlay.file}&screenshot`);
              }
            }
          }

          if (slide.enlargements) {
            for (const enlargement of slide.enlargements) {
              if (await utils.hasFile(path.join(process.cwd(), options.paths.dist, keyMessage, enlargement.file))) {
                screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&popup=${enlargement.file}&screenshot`);
              }
            }
          }
        }
      }
    }

    return del('screenshots')
      .then(() => handleTempReferences())
      .then(() => generateScreenshots(screenshotPaths))
      .then((screenshots) => generatePDF(screenshots));
  });

};
