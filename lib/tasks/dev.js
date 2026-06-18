'use strict';

const browserSync = require('browser-sync');
const chokidar = require('chokidar');
const fs = require('fs');
const fsPromises = require('fs/promises');
const glob = require('glob');
const path = require('path');
const sass = require('sass');
const { minify } = require('terser');
const utils = require('../utils');
const { assemble } = require('./assemble');

async function sassDev (options, bs) {
  const scssBase = path.join(options.paths.src, 'assets', 'scss');
  const outDir = path.join(options.paths.dist, options.paths.sharedAssets, 'css');
  await fsPromises.mkdir(outDir, { recursive: true });

  const scssFiles = glob.sync(path.join(scssBase, '**', '*.scss'))
      .filter((f) => !path.basename(f).startsWith('_'));

  for (const file of scssFiles) {
    try {
      const result = sass.compile(file, { style: 'expanded' });
      const css = result.css
          .split('/shared').join('..')
          .split('../../img').join('/.tmp/img')
          .split('../img').join('/.tmp/img');
      const outName = path.basename(file, '.scss') + '.css';
      await fsPromises.writeFile(path.join(outDir, outName), css);
    } catch (err) {
      utils.log.error(err.message);
    }
  }

  if (bs) {
    bs.reload('*.css');
  }
}

async function scriptsDev (options) {
  const jsBase = path.join(options.paths.src, 'assets', 'js');
  const outDir = path.join(options.paths.dist, options.paths.sharedAssets, 'js');
  await fsPromises.mkdir(outDir, { recursive: true });

  // scripts/** → concat (no minify in dev)
  const scriptFiles = glob.sync(path.join(jsBase, 'scripts', '**', '*.js'));
  if (scriptFiles.length > 0) {
    const mainContent = scriptFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    await fsPromises.writeFile(path.join(outDir, 'main.js'), mainContent);
  }

  // standalone/**/*.js → copy flat
  const standaloneFiles = glob.sync(path.join(jsBase, 'standalone', '**', '*.js'));
  for (const f of standaloneFiles) {
    await fsPromises.copyFile(f, path.join(outDir, path.basename(f)));
  }

  // vendor/** → concat + minify (dev excludes zepto files)
  const vendorFiles = glob.sync(path.join(jsBase, 'vendor', '**', '*.js'))
      .filter((f) => !path.basename(f).includes('zepto.min') && !path.basename(f).includes('zepto.ghostclick'));
  if (vendorFiles.length > 0) {
    const vendorSrc = vendorFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const { code: vendorMin } = await minify(vendorSrc);
    await fsPromises.writeFile(path.join(outDir, 'vendor.js'), vendorMin || '');
  }
}

async function imagesDev (options) {
  const imgFiles = glob.sync(
      path.join(options.paths.src, 'templates', 'pages', '**', '*.{png,jpg,svg}')
  );
  const outDir = path.join(options.paths.tmp, 'img');
  await fsPromises.mkdir(outDir, { recursive: true });

  for (const file of imgFiles) {
    await fsPromises.copyFile(file, path.join(outDir, path.basename(file)));
  }
}

async function defaultTask (options) {
  options.isWatching = true;

  const bs = browserSync.create();
  bs.init({
    logLevel: 'debug',
    logConnections: true,
    server: {
      baseDir: options.paths.dist,
      directory: true
    }
  });

  // Initial build
  await assemble(options);
  await sassDev(options, null);
  await scriptsDev(options);
  await imagesDev(options);

  // Watchers
  chokidar
      .watch(path.join(options.paths.src, 'assets', 'js', 'scripts', '**', '*.js'), { ignoreInitial: true })
      .on('all', async () => { await scriptsDev(options); bs.reload(); });

  chokidar
      .watch(path.join(options.paths.src, 'assets', 'scss', '**', '*.scss'), { ignoreInitial: true })
      .on('all', async () => sassDev(options, bs));

  chokidar
      .watch(
          path.resolve(process.cwd(), 'app', 'templates', '**', '*.{yml,json,hbs}'),
          { ignoreInitial: true }
      )
      .on('all', async () => { await assemble(options); bs.reload(); });

  chokidar
      .watch(
          path.join(options.paths.src, 'templates', '**', '*.{png,jpg,svg}'),
          { ignoreInitial: true }
      )
      .on('all', async () => { await imagesDev(options); bs.reload(); });
}

module.exports = { defaultTask, sassDev, scriptsDev, imagesDev };
