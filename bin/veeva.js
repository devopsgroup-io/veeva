#!/usr/bin/env node

'use strict';

const chalk = require('chalk');
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

const COMMANDS = ['build', 'build-preview', 'deploy', 'screenshots', 'stage', 'stage-vault'];

function resolveCommand (command) {
  return COMMANDS.includes(command) ? command : 'default';
}

(async () => {
  try {
    const options = await veeva.cli(args);

    const tasks = require('../lib/tasks');
    const command = resolveCommand(args[0]);

    console.log();
    console.log(chalk.yellow.bold(' ⤷ Running veeva workflow: '), chalk.underline.yellow(command));
    console.log();

    await tasks[command](options);

  } catch (err) {
    console.error('\n' + chalk.red.bold('✗ ') + err.message + '\n');
    process.exit(1);
  }
})();
