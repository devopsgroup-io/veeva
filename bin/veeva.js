#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
const gulp = require('gulp');
const pkg = require('../package.json');
const utils = require('../lib/utils');
const veeva = require('../index');

// Parse versions
const nodeVersion = utils.getVersion(process.version.replace('v', '').split('.'));
const requiredNodeVersion = utils.getVersion(pkg.engines.node.replace('>=', '').split('.'));

// Version check
if (nodeVersion.major < requiredNodeVersion.major) {
  console.error('\n' + chalk.red.bold('✗ ') +
    `NODE ${process.version} was detected. Veeva requires Node version ${pkg.engines.node}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);

function checkForCommand(command) {
  const commands = ['build', 'deploy', 'screenshots', 'stage', 'stage-vault'];
  return commands.includes(command);
}

(async () => {
  try {
    const options = await veeva.cli(args);

    // Import tasks and attach to gulp instance
    require('../lib/gulp')(gulp, options);

    const gulpCommand = checkForCommand(args[0]) ? args[0] : 'default';

    console.log();
    console.log(chalk.yellow.bold(' ⤷ Running veeva workflow: '), chalk.underline.yellow(gulpCommand));
    console.log();

    // Run the Gulp 4 task using series()
    await new Promise((resolve, reject) => {
      gulp.series(gulpCommand)((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

  } catch (err) {
    console.error('\n' + chalk.red.bold('✗ ') + err.message + '\n');
    process.exit(1);
  }
})();
