'use strict';


const assemble = require('assemble');
const changed = require('gulp-changed');
const extname = require('gulp-extname');
const handlebarsCustomHelpers = require('./helpers/customHelpers.js');
const handlebarsHelpers = require('handlebars-helpers')();
const path = require('path');
const plumber = require('gulp-plumber');
const rename = require('./rename');
const utils = require('../utils');
const YAML = require('js-yaml');


module.exports = function(gulp, options) {

  const _handleFileRename = function(sPath) {

    if (options.clm.key_messages.length === 1) {
      sPath.dirname = options.clm.key_messages[0].key_message;
    }
    if (options.clm.product && options.clm.product.name) {

      sPath.dirname = options.clm.product.name + options.clm.product.suffix + sPath.dirname;

      // only change clm key message names
      if (utils.lookupCollectionObject(options.clm.key_messages, 'key_message', sPath.basename)) {
        if (options.deploying && options.clm.crm.deploy_to && options.clm.crm.deploy_to === 'vault'){
          sPath.basename = 'index';
        } else {
          sPath.basename = options.clm.product.name + options.clm.product.suffix + sPath.basename;
        }
      }
    }

    return sPath;
  };

  const _handleFileRenameChanged = function(sPath) {

    if (typeof sPath === 'string') {
      const parsedPath = path.parse(sPath);
      sPath = {
        basename: parsedPath.name,
        dirname: parsedPath.name,
        extname: parsedPath.ext
      };
    }

    if (options.clm.key_messages.length === 1) {
      sPath.dirname = options.clm.key_messages[0].key_message;
    }
    if (options.clm.product && options.clm.product.name) {

      sPath.dirname = options.clm.product.name + options.clm.product.suffix + sPath.dirname;

      // only change clm key message names
      if (utils.lookupCollectionObject(options.clm.key_messages, 'key_message', sPath.basename)) {
        sPath.basename = options.clm.product.name + options.clm.product.suffix + sPath.basename;
      }
    }
    // console.log('returning', path.join(process.cwd(), options.paths.dist, sPath.dirname, sPath.basename + sPath.extname));
    return path.join(process.cwd(), options.paths.dist, sPath.dirname, sPath.basename + sPath.extname);
  };

  function assembleTemplates() {
    return new Promise(function(resolve, reject) {

      utils.log.log(utils.log.chalk.green.bold('     ✔︎ Assembling Key Message(s)'));

      const app = assemble();
      const appDest = options.paths.dist;

      // handle yml files
      app.dataLoader('yml', function(str) {
        return YAML.safeLoad(str);
      });


      app.data([
        path.join(process.cwd(), 'app', 'templates', 'data', '**', '*.{json,yml}')
      ]);

      // pass paths through assemble
      app.data('paths', options.paths);

      // is deploy set (build workflow)
      if (options.deploying) {
        app.data('deploy', options.deploying);
      }

      app.partials(path.join(options.paths.src, 'templates', 'includes', '*.hbs'));
      app.layouts(path.join(options.paths.src, options.paths.layouts, '*.hbs'));

      if (options.clm.key_messages.length === 1) {
        app.pages(path.join(options.paths.src, options.paths.pages, options.clm.key_messages[0].key_message, '*.hbs'));
      } else {
        app.pages(path.join(options.paths.src, options.paths.pages, '**', '*.hbs'));
      }

      app.preLayout(/\.hbs$/, function(view, next) {
        // only set the layout if it's not already defined
        if (view.data.layout === undefined) {
          view.data.layout = options.module.workflow.assemble.defaultLayout;
        }
        next();
      });

      app.helpers(handlebarsHelpers);
      app.helpers(handlebarsCustomHelpers);

      // app.src(path.join(options.paths.src, options.paths.pages, '**', '*.hbs'))
      app.toStream('pages')
        .pipe(plumber())
        .pipe(changed(appDest, {
          hasChanged: changed.compareLastModifiedTime,
          transformPath: (newPath) => _handleFileRenameChanged(newPath)
        }))
        .pipe(app.renderFile('hbs'))
        .on('error', function(err) {
          utils.log.error(err);
          reject(err);
        })
        .pipe(extname())
        .pipe(rename((path) => _handleFileRename(path)))
        .pipe(app.dest(appDest))
        .on('end', function() {
          resolve();
        });
    });
  }

  function copyTemplateAssets() {

    return new Promise(function(resolve, reject) {

      gulp.src(['**/*.*', '!**/*.hbs'], {
          cwd: path.join(process.cwd(), options.paths.src, 'templates', 'pages')
        })
        .pipe(plumber())
        .pipe(rename((filePath) => {
          if (options.clm.product && options.clm.product.name && filePath.dirname !== '.') {
            filePath.dirname = options.clm.product.name + options.clm.product.suffix + filePath.dirname;
          }
        }))
        .pipe(gulp.dest(path.join(options.paths.dist)))
        .once('error', function(err) {
          utils.log.error(err);
          reject(err);
        })
        .once('end', function() {
          resolve();
        });
    });
  }

  const copySharedAssets = () => {

    if (!options.clm.crm.hasSharedResources) {
      return Promise.resolve();
    }

    utils.log.log(utils.log.chalk.green.bold('     ✔︎ Copying shared assets to each key message'));

    function copyAssets(keyMessage) {
      return new Promise(function(resolve, reject) {

        let formattedKeyMessage = keyMessage['key_message'];

        if (options.clm.product && options.clm.product.name) {
          formattedKeyMessage = options.clm.product.name + options.clm.product.suffix + formattedKeyMessage;
        }

        gulp.src(`${options.paths.dist}/${options.paths.sharedAssets}/**/*`)
          .pipe(plumber())
          .pipe(gulp.dest(path.join(process.cwd(), options.paths.dist, formattedKeyMessage, options.paths.sharedAssets)))
          .on('error', function(err) {
            reject(err);
          })
          .on('end', function() {
            resolve();
          });
      });
    }


    const promises = [];

    for (const km of options.clm.key_messages) {
      if (!km['shared_assets_ignore']) {
        promises.push(copyAssets(km));
      }
    }

    return Promise.all(promises);
  };


  function generateGlobalAppConfig() {
    return utils.setFile(path.join(options.paths.dist, options.paths.sharedAssets, 'app.json'), JSON.stringify(options.clm.key_messages));
  }

  gulp.task('assemble', function() {
    return assembleTemplates()
      .then(() => copyTemplateAssets())
      .then(() => generateGlobalAppConfig())
      .then(() => utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done Assembling Key Messages')));
  });

  gulp.task('copy-shared-assets', function() {
    return copySharedAssets();
  });

};
