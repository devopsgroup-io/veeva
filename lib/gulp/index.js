'use strict';

const utils = require('../utils');

module.exports = function (gulp, options) {

  try {

    // override gulp logging
    /*
    gutil.log = function (log) {
      if (options.verbose) {
        console.log(log);
      }
      return this;
    };
    */
   

    require('./assemble')(gulp, options);
    require('./build')(gulp, options);
    require('./clean')(gulp, options);
    require('./deploy')(gulp, options);
    require('./dev')(gulp, options);
    require('./screenshot')(gulp, options);

  } catch (error) {
    console.log(error);
    throw new Error(__dirname + '\n' + error);
  }

};
