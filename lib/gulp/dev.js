'use strict';

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const flatten = require('gulp-flatten');
const path = require('path');
const plumber = require('gulp-plumber');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const mergeStream = require('merge-stream');

module.exports = function(gulp, options) {
  const { src, dest, series, parallel, watch } = gulp;

  function bsReload(done) {
    browserSync.reload();
    done();
  }

  function scriptsDev() {
    const jsGlob = path.join(options.paths.src, 'assets', 'js', '**', '*.js');

    const mainStream = src(jsGlob)
      .pipe(filter(path.join(options.paths.src, 'assets', 'js', 'scripts', '**', '*.js')))
      .pipe(concat('main.js'))
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));

    const standaloneStream = src(jsGlob)
      .pipe(filter(path.join(options.paths.src, 'assets', 'js', 'standalone', '**', '*.js')))
      .pipe(flatten())
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));

    const vendorStream = src(jsGlob)
      .pipe(filter([
        path.join(options.paths.src, 'assets', 'js', 'vendor', '**/*.js'),
        '!' + path.join(options.paths.src, 'assets', 'js', 'vendor', 'zepto.min.js'),
        '!' + path.join(options.paths.src, 'assets', 'js', 'vendor', 'zepto.ghostclick.js')
      ]))
      .pipe(concat('vendor.js'))
      .pipe(uglify())
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'js')));

    return mergeStream(mainStream, standaloneStream, vendorStream);
  }

  function sassDev() {
    return src([path.join(options.paths.src, 'assets', 'scss', '**', '*.scss')])
      .pipe(plumber())
      .pipe(sass().on('error', sass.logError))
      .pipe(replace('/shared', '..'))
      .pipe(replace('../../img', '/.tmp/img'))
      .pipe(replace('../img', '/.tmp/img'))
      .pipe(dest(path.join(options.paths.dist, options.paths.sharedAssets, 'css')))
      .pipe(filter('**/*.css'))
      .pipe(browserSync.stream());
  }

  function imagesDev() {
    return src(path.join(options.paths.src, 'templates', 'pages', '**', '*.{png,jpg,svg}'))
      .pipe(flatten())
      .pipe(dest(path.join(options.paths.tmp, 'img')));
  }

  function assembleDev(done) {
    series('assemble', bsReload)(done);
  }

  function defaultTask(done) {
    options.isWatching = true;

    browserSync.init({
      logLevel: 'debug',
      logConnections: true,
      server: {
        baseDir: options.paths.dist,
        directory: true
      }
    });

    watch(path.join(options.paths.src, 'assets', 'js', 'scripts', '**', '*.js'), series(scriptsDev, bsReload));
    watch(path.join(options.paths.src, 'assets', 'scss', '**', '*.scss'), sassDev);
    watch(path.resolve(process.cwd(), 'app', 'templates', '**', '*.{yml,json,hbs}'), assembleDev);
    watch(path.join(options.paths.src, 'templates', '**', '*.{png,jpg,svg}'), series(imagesDev, bsReload));

    done();
  }

  gulp.task('bs-reload', bsReload);
  gulp.task('scripts:dev', scriptsDev);
  gulp.task('sass:dev', sassDev);
  gulp.task('images:dev', imagesDev);
  gulp.task('assemble:dev', assembleDev);
  gulp.task('default', series('assemble', sassDev, scriptsDev, imagesDev, defaultTask));
};
