'use strict';

const chalk = require('chalk'),
  cli = require('./cli'),
  config = require('./config'),
  utils = require('./utils');

function configValidate (options) {

  console.log(chalk.yellow.bold(' ⤷ Validating configuration.yml'));

  // const errorMessage = 'Missing setting in configuration.yml file \n';
  const returnStatus = [];

  returnStatus.push('');

  /*
  function validate (setting, message) {
    if (setting !== null && setting !== '') {
      returnStatus.push(message);
    } else {

      throw new Error(errorMessage + message);
    }

  }
  */

  // did attempting to load configuration.yml return an error?
  if (options.Error) {

    if (options.Error.code === 'ENOENT') {
      throw new Error('Missing configuration.yml file.');
    } else {
      throw new Error('configuration.yml \n' + options.Error);
    }
  } else {
    returnStatus.push('configuration.yml file exists');
  }

  // check for required setting
  // validate(options.clm.product.name, 'Product name');
  // validate(options.clm.primary.name, 'Primary CLM presentation name');
  // validate(options.clm.assets.name, 'Assets CLM presentation name');


  return returnStatus;
}


function execute (cliArgs) {

  const options = config.mergeOptions(cliArgs);

  return new Promise((resolve, reject) => {

    if (cliArgs.version) {
      return cli.version();
    } else if (cliArgs.help) {
      return cli.help();
    } else if (cliArgs.config) {
      return cli.config(options);
    } else {
      cli.help();

      const validate = configValidate(options);

      console.log(chalk.green.bold(validate.join('\n   ✔︎ ')), '\n');

      utils.log.debugDir(options);

      // update shared assets directory to prepend the product name and suffix - defined in the clm.yml file
      if (options.clm.product) {
        options.paths.sharedAssets = options.clm.product.name + options.clm.product.suffix + options.paths.sharedAssets;
      }

      /**
       * Check key-message argument and make sure Key Message exists
       */
      if (options['key-message']) {

        options.clm.key_messages = options.clm.key_messages.filter((km) => (km.key_message === options['key-message'].toString()));

        if (options.clm.key_messages.length === 0) {

          utils.log.error('Invalid Key Message: ' + options['key-message']);

          throw new Error('Invalid Key Message: ' + options['key-message']);
        }
        utils.log.log('⤷ Single Key Message Mode: ' + options['key-message']);

      }
      return resolve(options);
    }

  }).catch((error) => {

    const reportError = Array.isArray(error) ? error.join('\n') : error;

    if (!options.debug) {
      console.error(chalk.red.bold('✗ '), chalk.red(reportError.stack));
      process.exit(0);
    } else {
      reject(reportError);
    }

  });
}

function fromCli (options) {
  return execute(cli.parse(options));
}

module.exports = {
  cli: fromCli,
  execute: execute
};
