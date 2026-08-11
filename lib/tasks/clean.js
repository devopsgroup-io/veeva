'use strict';

const fs = require('fs/promises');
const path = require('path');

async function clean (options) {
  await fs.rm(options.paths.dist, { recursive: true, force: true });
}

async function cleanDeploy (options) {
  await fs.rm(options.paths.deploy, { recursive: true, force: true });
}

async function cleanPreview (options) {
  const publicConfig = options.paths.public || {};
  const publicDir = publicConfig.dir || 'public';
  const keep = publicConfig.keep || [];

  if (keep.length === 0) {
    await fs.rm(publicDir, { recursive: true, force: true });
    return;
  }

  let entries;
  try {
    entries = await fs.readdir(publicDir);
  } catch (e) {
    return;
  }

  await Promise.all(
      entries
          .filter((entry) => !keep.includes(entry))
          .map((entry) => fs.rm(path.join(publicDir, entry), { recursive: true, force: true }))
  );
}

module.exports = { clean, cleanDeploy, cleanPreview };
