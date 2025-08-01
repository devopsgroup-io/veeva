const chalk = require('chalk'),
  log = require('./log'),
  parseArgs = require('minimist'),
  pkg = require('../package.json'),
  version = pkg.version;


const bannerText = [
  '\n',
  '======================================================',
  '======================================================',
  '======================================================',
  '======================================================',
  '=  =  ===   ====   ===  =  ===   =====================',
  '=  =  ==  =  ==  =  ==  =  ==  =  ====================',
  '==   ===     ==     ===   ======  ====================',
  '==   ===  =====  ======   ====    ====================',
  '=== ====  =  ==  =  ==== ====  =  ====================',
  '=== =====   ====   ===== =====    ====================',
  '======================================================',
  '',
  'Veeva                                                          v' + version,
  'Maintainer                                                     ' + pkg.author.name + ' <' + pkg.author.email + '>',
  '                                                               ' + pkg.author.url ,
  '',
  'Usage: veeva <task> [options]',
  '',
  'TASKS',
  '_______________________________________________________________________________________',
  '$ veeva                         Default task that kicks off development mode',
  '$ veeva build                   Build task',
  '$ veeva deploy                  Deploy task',
  '$ veeva screenshots             Generates screenshots based clm.yml config file and outputs a PDF',
  '$ veeva stage                   Stage task',
  '$ veeva stage-vault             Generates a Veeva Vault Multichannel Loader .CSV file',
  '',
  'OPTIONS',
  '_______________________________________________________________________________________',
  '-a --all-key-messages  Include hidden Key Messages when staging and deploying',
  '-c --config            Show merged configuration',
  '-d --dry-run           Do not touch or write anything, but show the commands and interactivity',
  '-e --debug             Output exceptions',
  '-h --help              Print this help',
  '-k --key-message       Build, Stage, and Deploy single Key Message',
  '-v --version           Print version number',
  '-V --verbose           Verbose output',
  '',
].join('\n');


const aliases = {
  a: 'all-key-messages',
  c: 'config',
  d: 'dry-run',
  e: 'debug',
  h: 'help',
  k: 'key-message',
  v: 'version',
  V: 'verbose'
};

module.exports = {
  banner: function () {
    log.log(chalk.yellow.bold(bannerText));
  },
  config: function () {
    log.log.apply(null, arguments);
  },

  help: function () {
    log.log(chalk.yellow.bold(bannerText));
  },
  parse: function (argv) {
    const options = parseArgs(argv, {
      boolean: true,
      alias: aliases
    });
    return options;
  },
  version: function () {
    log.log('v' + version);
  }
};
