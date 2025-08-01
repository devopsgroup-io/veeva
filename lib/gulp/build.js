'use strict';

/**
 * @fileOverview Gulp 4-compatible CLM Build Task
 */

const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const flatten = require('gulp-flatten');
const path = require('path');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const size = require('gulp-size');
const uglify = require('gulp-uglify');
const utils = require('../utils');

module.exports = function(gulp, options) {
  const { src, dest, series, parallel } = gulp;

  function styles() {
    if (options.verbose) {
      utils.log.note('    ⤷ Compile & Minify CSS');
    }

    return src(path.join(options.paths.src, 'assets', 'scss', '**', '*.scss'))
      .pipe(sass({ errLogToConsole: true }))
      .pipe(replace('/shared', '../'))
      .pipe(cleanCSS())
      .pipe(size({
        showFiles: options.verbose,
        gzip: options.verbose
      }))
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'css')))
      .pipe(browserSync.stream());
  }

  function handleJSScripts() {
    if (options.verbose) {
      utils.log.note('    ⤷ Processing presentation specific JavaScripts');
    }

    const mainFilter = filter(path.join(options.paths.src, 'assets', 'js', 'scripts', '**', '*.js'), { restore: true });
    const standAloneFilter = filter(path.join(options.paths.src, 'assets', 'js', 'standalone', '**', '*.js'), { restore: true });
    const vendorFilter = filter([
      path.join(options.paths.src, 'assets', 'js', 'vendor', '**/*.js')
    ], { restore: true });

    const jsPath = path.join(options.paths.src, 'assets', 'js', '**', '*.js');

    const stream = src(jsPath)
      // Main JS
      .pipe(mainFilter)
      .pipe(concat('main.js'))
      .pipe(uglify())
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')))
      .pipe(mainFilter.restore)

      // Standalone JS
      .pipe(standAloneFilter)
      .pipe(flatten())
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')))
      .pipe(standAloneFilter.restore)

      // Vendor JS
      .pipe(vendorFilter)
      .pipe(concat('vendor.js'))
      .pipe(uglify())
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));

    return stream;
  }


  function handleSharedURLs() {
    if (options.verbose) {
      utils.log.note('    ⤷ Updating shared assets URLs');
    }

    return src(path.join(options.paths.dist, '**', '*.html'))
      .pipe(replace(options.paths.root + options.paths.sharedAssets, './shared'))
      .pipe(dest(options.paths.dist));
  }

  function runAssembleWorkflow(done) {
    options.module.workflow.assemble.data.deploy = true;
    options.module.workflow.assemble.data.root = '../';
    options.deploying = true;


    return gulp.series('assemble', 'veeva-thumbs', 'copy-shared-assets')(done);
  }

  const build = series(styles, handleJSScripts, runAssembleWorkflow, handleSharedURLs);

  gulp.task('build', build);

  return {
    styles,
    handleJSScripts,
    handleSharedURLs,
    build
  };
};
