'use strict';

const fs = require('fs');
const fsPromises = require('fs/promises');
const glob = require('glob');
const path = require('path');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const utils = require('../utils');
const ___ = require('lodash');

const { KnownDevices } = require('puppeteer');
const iPad = KnownDevices['iPad landscape'];

const openBrowser = async () => puppeteer.launch({ args: ['--allow-file-access-from-files'], headless: true });

const renderPage = async (browser, url, output) => {
  const page = await browser.newPage();
  const emulation = iPad;
  await page.emulate(emulation);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: output + '.png' });
};

const convertImage = async (srcPath, width, height, destPath) => {
  await sharp(srcPath)
      .resize(width, height, { fit: 'inside' })
      .jpeg({ quality: 75 })
      .toFile(destPath);
};

async function generateThumbnails (options) {
  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Generating Veeva Thumbnails'));
  const basePath = path.join(process.cwd(), options.paths.dist);
  const dirs = utils.getDirectories(basePath);
  const sizes = Object.assign({
    full: { width: 1024, height: 768, name: 'full.jpg', quality: 75 },
    thumb: { width: 1024, height: 768, name: 'thumb.jpg', quality: 55 }
  }, options.clm.thumbnail_sizes);

  const browser = await openBrowser();

  const allScreenshots = dirs.map(async (dir) => {
    const files = await utils.getFiles(path.join(basePath, dir));
    if (!files) {
      return;
    }
    const htmlFiles = ___(files).filter((file) => {
      const matchFileName = (options.clm.crm.deploy_to === 'vault') ? 'index' : dir;
      return file.match(matchFileName + '.html');
    });

    for (const file of htmlFiles) {
      const completePath = 'file://' + path.join(basePath, dir, file + '#screenshot');
      const outputFile = path.join(basePath, dir, dir);
      await renderPage(browser, completePath, outputFile);
      await convertImage(
          `${outputFile}.png`,
          sizes.thumb.width,
          sizes.thumb.height,
          path.join(basePath, dir, 'thumb.png')
      );
      await utils.rm(`${outputFile}.png`);
    }
  });

  await Promise.all(allScreenshots);
  await browser.close();
}

async function copyThumbnails (options) {
  if (!options.clm.crm.hasFlyoutMenu) {
    return;
  }
  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Copying thumbnails to shared assets'));

  const thumbFiles = glob.sync(path.join(options.paths.dist, '**', '*-thumb.jpg'));
  const outDir = path.join(options.paths.dist, options.paths.sharedAssets, 'img', 'flyout-menu');
  await fsPromises.mkdir(outDir, { recursive: true });

  for (const file of thumbFiles) {
    await fsPromises.copyFile(file, path.join(outDir, path.basename(file)));
  }
}

async function handleTempReferences (options) {
  if (options.verbose) {
    utils.log.note('    ⤷ Updating .tmp references');
  }

  const files = glob.sync(path.join(options.paths.dist, '**', '*.{html,css,js}'));
  for (const file of files) {
    let content = await fsPromises.readFile(file, 'utf8');
    content = content.split('/shared/').join('../');
    content = content.split('/.tmp/').join('../../.tmp/');
    await fsPromises.writeFile(file, content);
  }
}

async function generateScreenshots (screenshotPaths) {
  utils.log.log('\n' + utils.log.chalk.yellow('    ⤷ Generating screenshots'));
  const browser = await openBrowser();
  const results = [];

  await fsPromises.mkdir('screenshots', { recursive: true });

  const allScreenshots = screenshotPaths.map((screenshot, index) => {
    const outputFile = screenshot.split('/').pop();
    const outputPath = path.join('screenshots', `${index}-${outputFile}.png`);
    results.push(outputPath);
    return renderPage(browser, screenshot, path.join('screenshots', `${index}-${outputFile}`));
  });

  await Promise.all(allScreenshots);
  await browser.close();
  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done generating screenshots'));
  return results;
}

function generatePDF (screenshots, options) {
  return new Promise((resolve, reject) => {
    try {
      const config = Object.assign({
        layout: 'portrait',
        margins: { top: 72, left: 60, right: 72, bottom: 20 },
        size: [2048, 1536],
        width: 2048,
        height: 1536
      }, options.clm.pdf_document);

      const imageSize = Object.assign({ width: 2048, height: 1536 }, options.clm.pdf_document);

      const pdf = new PDFDocument(config);
      const fileName = options.clm.job.number && options.clm.job.name
        ? `${options.clm.job.number}_${options.clm.job.name}`
        : 'screenshots';

      pdf.pipe(fs.createWriteStream(`screenshots/${fileName}.pdf`));

      screenshots.forEach((screenshot, index) => {
        if (screenshot.includes('.png')) {
          if (index > 0) {
            pdf.addPage();
          }
          pdf.image(screenshot, 0, 0, imageSize);
        }
      });

      pdf.end();
      utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done generating pdf'));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

async function screenshotsTask (options) {
  if (!options.clm) {
    return;
  }

  const screenshotPaths = [];
  for (const km of options.clm.key_messages) {
    let keyMessage = km.key_message;
    if (options.clm.product.name) {
      keyMessage = options.clm.product.name + options.clm.product.suffix + keyMessage;
    }

    const keyMessagePath = path.join(process.cwd(), options.paths.dist, keyMessage, 'index');
    const isHTML = await utils.hasFile(`${keyMessagePath}.html`);
    if (!isHTML) {
      continue;
    }

    for (const [slideIndex, slide] of km.slides.entries()) {
      screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&screenshot`);

      if (slide.screenshots) {
        slide.screenshots.forEach((screenshot) => {
          if (typeof screenshot === 'object') {
            screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&event=${Object.keys(screenshot)[0]}&element_id=${Object.values(screenshot)[0]}&screenshot`);
          } else {
            screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&event=${screenshot}&screenshot`);
          }
        });
      }

      for (const overlay of slide.overlays || []) {
        if (await utils.hasFile(path.join(options.paths.dist, keyMessage, overlay.file))) {
          screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&popup=${overlay.file}&screenshot`);
        }
      }

      for (const enlargement of slide.enlargements || []) {
        if (await utils.hasFile(path.join(options.paths.dist, keyMessage, enlargement.file))) {
          screenshotPaths.push(`file://${keyMessagePath}.html#page=${slideIndex + 1}&popup=${enlargement.file}&screenshot`);
        }
      }
    }
  }

  await fsPromises.rm('screenshots', { recursive: true, force: true });
  await handleTempReferences(options);
  const images = await generateScreenshots(screenshotPaths);
  await generatePDF(images, options);
}

async function veevaThumbsTask (options) {
  await generateThumbnails(options);
  await copyThumbnails(options);
}

async function screenshots (options) {
  const { assemble } = require('./assemble');
  const { styles, handleJSScripts } = require('./build');
  const { imagesDev } = require('./dev');

  await assemble(options);
  await styles(options);
  await handleJSScripts(options);
  await imagesDev(options);
  await screenshotsTask(options);
}

module.exports = { screenshots, veevaThumbsTask, generateThumbnails, copyThumbnails };
