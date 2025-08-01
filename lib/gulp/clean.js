'use strict';

const del = require('del');


module.exports = function (gulp, options) {
  gulp.task('clean', function () {
    return del([options.paths.dist + '**/*', '!' + options.paths.dist + '/readme.md']);
  });

  gulp.task('clean:deploy', function () {
    return del([options.paths.deploy + '**/*', '!' + options.paths.deploy + '/readme.md']);
  });
};
