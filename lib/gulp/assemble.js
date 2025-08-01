'use strict';

/**
 * @fileOverview Gulp 4-compatible CLM Build Task (Handlebars Edition)
 */

const customHelpers = require('./helpers/customHelpers.js');
const frontMatter = require('gulp-front-matter');
const fs = require('fs');
const glob = require('glob');
const handlebars = require('handlebars');
const handlebarsHelpers = require('handlebars-helpers')();
const handlebarsLayouts = require('handlebars-layouts');
const hb = require('gulp-hb');
const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const utils = require('../utils');
const YAML = require('js-yaml');


handlebars.registerHelper(handlebarsLayouts(handlebars));

function loadYamlData(pattern) {
  const files = glob.sync(pattern);
  const data = {};

  files.forEach(file => {
    const yamlContent = YAML.load(fs.readFileSync(file, 'utf8'));
    const basename = path.basename(file, path.extname(file));
    data[basename] = yamlContent;
  });

  return data;
}

module.exports = function (gulp, options) {
  const { src, dest, series } = gulp;

  function assembleTemplates() {
    return new Promise((resolve, reject) => {
      utils.log.log(utils.log.chalk.green.bold('     ✔︎ Assembling Key Message(s)'));

      const dataFiles = path.join('app', 'templates', 'data', '**', '*.json');
      const yamlData = loadYamlData('app/templates/data/**/*.yml');      

      return src(path.join(options.paths.src, options.paths.pages, '**', '*.hbs'))
        .pipe(plumber())
        .pipe(frontMatter({ property: 'data', remove: true }))
        .pipe(hb({ handlebars })
          .partials(path.join(options.paths.src, 'templates', 'includes', '**/*.hbs'))
          .partials(path.join(options.paths.src, options.paths.layouts, '**/*.hbs'))
          .helpers(handlebarsHelpers)
          .helpers(customHelpers)
          .data(yamlData)
          .data(dataFiles)
          .data({
            paths: options.paths,
            deploy: options.deploying,
            layout: options.module.workflow.assemble.defaultLayout
          })
        )
        .pipe(rename(filePath => {
          if (options.clm.key_messages.length === 1) {
            filePath.dirname = options.clm.key_messages[0].key_message;
          }

          if (options.clm.product && options.clm.product.name) {
            const suffix = options.clm.product.suffix || '';
            filePath.dirname = (options.clm.product.name + suffix + filePath.dirname).toLowerCase();

            if (utils.lookupCollectionObject(options.clm.key_messages, 'key_message', filePath.basename)) {
              filePath.basename = (options.deploying && options.clm.crm.deploy_to === 'vault')
                ? 'index'
                : options.clm.product.name + suffix + filePath.basename;
            }
          }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(dest(options.paths.dist))
        .on('error', reject)
        .on('end', resolve);
    });
  }

  function copyTemplateAssets() {
    return new Promise((resolve, reject) => {
      return src(['**/*.*', '!**/*.hbs'], {
        cwd: path.join(process.cwd(), options.paths.src, 'templates', 'pages')
      })
        .pipe(plumber())
        .pipe(rename(filePath => {
          if (options.clm.product && options.clm.product.name && filePath.dirname !== '.') {
            filePath.dirname = (options.clm.product.name + options.clm.product.suffix + filePath.dirname).toLowerCase();
          }
        }))
        .pipe(dest(path.join(options.paths.dist)))
        .on('error', reject)
        .on('end', resolve);
    });
  }

  function generateGlobalAppConfig() {
    return utils.setFile(path.join(options.paths.dist, options.paths.sharedAssets, 'app.json'), JSON.stringify(options.clm.key_messages));
  }

  function copySharedAssets() {
    if (!options.clm.crm.hasSharedResources) {
      return Promise.resolve();
    }

    utils.log.log(utils.log.chalk.green.bold('     ✔︎ Copying shared assets to each key message'));

    const copyAssets = (keyMessage) => {
      return new Promise((resolve, reject) => {
        let keyName = keyMessage.key_message;

        if (options.clm.product && options.clm.product.name) {
          keyName = options.clm.product.name + options.clm.product.suffix + keyName;
        }

        return src(`${options.paths.dist}/${options.paths.sharedAssets}/**/*`)
          .pipe(plumber())
          .pipe(dest(path.join(process.cwd(), options.paths.dist, keyName, options.paths.sharedAssets)))
          .on('error', reject)
          .on('end', resolve);
      });
    };

    const tasks = options.clm.key_messages
      .filter(km => !km.shared_assets_ignore)
      .map(copyAssets);

    return Promise.all(tasks);
  }

  gulp.task('assemble', function () {
    return assembleTemplates()
      .then(copyTemplateAssets)
      .then(generateGlobalAppConfig)
      .then(() => utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done Assembling Key Messages')));
  });

  gulp.task('copy-shared-assets', function () {
    return copySharedAssets();
  });
};