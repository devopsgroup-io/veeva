'use strict';

const fs = require('fs/promises');

async function clean (options) {
  await fs.rm(options.paths.dist, { recursive: true, force: true });
}

async function cleanDeploy (options) {
  await fs.rm(options.paths.deploy, { recursive: true, force: true });
}

module.exports = { clean, cleanDeploy };
