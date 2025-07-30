'use strict';

/**
 * @fileOverview Gulp task CLM Build
 */

const browserSync = require('browser-sync'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  flatten = require('gulp-flatten'),
  path = require('path'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  size = require('gulp-size'),
  uglify = require('gulp-uglify'),
  utils = require('../utils');

module.exports = function (gulp, options) {

  const runSequence = require('run-sequence').use(gulp);

  /**
     * Handles CSS pre-processing using SCSS.
     * @author Steven Britton
     * @date   2015-02-06
     * @return {function}   Returns callback function
     */
  function styles () {
    return new Promise(function (resolve, reject) {

      if (options.verbose) {
        utils.log.note('    ⤷ Compile & Minify CSS');
      }

      gulp.src(path.join(options.paths.src, 'assets', 'scss', '**', '*.scss'))
          .pipe(sass({
            errLogToConsole: true
          }))
          .pipe(replace('/shared', '../'))
      // Compile & Minify CSS
          .pipe(cleanCSS())
          .pipe(size({
            showFiles: options.verbose,
            gzip: options.verbose
          }))
          .pipe(gulp.dest(path.join(options.paths.dist, options.paths.sharedAssets, 'css')))
          .once('error', function (err) {
            utils.log.error(err);
            reject(err);
          })
          .on('end', resolve)
          .pipe(browserSync.reload({
            stream: true
          }));
    });
  }


  /**
     * Handles concatenating and Uglifying custom js scripts (defined in the main gulpfile.js).
     * @author Steven Britton
     * @date   2015-02-06
     * @return {function}   Returns callback function
     */
  function handleJSScripts () {
    return new Promise(function (resolve, reject) {

      if (options.verbose) {
        utils.log.note('    ⤷ Processing presentation specific JavaScripts');
      }

      const filterMain = filter(path.join(options.paths.src, 'assets', 'js', 'scripts', '**', '*.js'), { restore: true, passthrough: false });
      const filterStandAlone = filter(path.join(options.paths.src, 'assets', 'js', 'standalone', '**', '*.js'), { restore: true, passthrough: false });

      const filterVendor = filter([
        path.join(options.paths.src, 'assets', 'js', 'vendor', '**/*.js')
      ], { restore: true, passthrough: false });

      gulp.src(path.join(options.paths.src, 'assets', 'js', '**', '*.js'))
          .pipe(filterMain)
          .pipe(concat('main.js'))
          .pipe(uglify())
          .pipe(gulp.dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));


      filterMain.restore
          .pipe(filterStandAlone)
          .pipe(flatten())
          .pipe(gulp.dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));

      filterStandAlone.restore
          .pipe(filterVendor)
          .pipe(concat('vendor.js'))
          .pipe(uglify())
          .pipe(gulp.dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')))
          .once('error', function (err) {
            utils.log.error(err);
            reject(err);
          })
          .on('end', function () {
            resolve();
          });
    });
  }

  function handleSharedURLs () {

    if (options.verbose) {
      utils.log.note('    ⤷ Updating shared assets URLs');
    }

    return new Promise(function (resolve, reject) {
      gulp.src(path.join(options.paths.dist, '**', '*.html'))
          // .pipe(replace(options.paths.root + options.paths.sharedAssets, './shared/' + options.paths.sharedAssets))
          .pipe(replace(options.paths.root + options.paths.sharedAssets, './shared'))
          // .pipe(replace(options.paths.root + options.paths.sharedAssets, options.paths.sharedAssets))
          .pipe(gulp.dest(options.paths.dist))
          .once('error', function (err) {
            utils.log.error(err);
            reject(err);
          })
          .on('end', resolve);
    });
  }

  function build () {
    return new Promise(function (resolve, reject) {
      styles()
          .then(() => handleJSScripts())
          .then(() => {

            // set Assemble Data Deploy to true
            options.module.workflow.assemble.data.deploy = true;
            options.module.workflow.assemble.data.root = '../';

            options.deploying = true;

            runSequence(['assemble'], ['veeva-thumbs'], ['copy-shared-assets'], resolve);
          });
    });
  }


  /**
     * Build Gulp task, which runs the full build process.
     * @author Steven Britton
     * @date   2015-02-06
     */
  gulp.task('build', ['clean'], function () {

    utils.log.log(utils.log.chalk.yellow.bold('   ⤷ Running task: '), utils.log.chalk.underline.yellow('build'));

    return build()
        .then(handleSharedURLs)
        .then(() => utils.log.log(utils.log.chalk.yellow.bold('   ⤷ Finished running task: '), utils.log.chalk.underline.yellow('build')));
  });

};
