'use strict';

const CleanCSS = require('clean-css');
const fs = require('fs');
const fsPromises = require('fs/promises');
const glob = require('glob');
const path = require('path');
const sass = require('sass');
const { minify } = require('terser');
const utils = require('../utils');
const { assemble, copySharedAssets } = require('./assemble');
const { veevaThumbsTask } = require('./screenshot');

async function styles (options) {
  if (options.verbose) {
    utils.log.note('    ⤷ Compile & Minify CSS');
  }

  const scssBase = path.join(options.paths.src, 'assets', 'scss');
  const outDir = path.join(options.paths.dist, options.paths.sharedAssets, 'css');
  await fsPromises.mkdir(outDir, { recursive: true });

  const scssFiles = glob.sync(path.join(scssBase, '**', '*.scss'))
      .filter((f) => !path.basename(f).startsWith('_'));

  for (const file of scssFiles) {
    const result = sass.compile(file);
    const css = result.css.replace(/\/shared/g, '../');
    const minified = new CleanCSS().minify(css);
    const outName = path.basename(file, '.scss') + '.css';

    if (options.verbose) {
      utils.log.note(`       ${outName}: ${minified.styles.length} bytes`);
    }

    await fsPromises.writeFile(path.join(outDir, outName), minified.styles);
  }
}

async function handleJSScripts (options) {
  if (options.verbose) {
    utils.log.note('    ⤷ Processing presentation specific JavaScripts');
  }

  const jsBase = path.join(options.paths.src, 'assets', 'js');
  const outDir = path.join(options.paths.dist, options.paths.sharedAssets, 'js');
  await fsPromises.mkdir(outDir, { recursive: true });

  // scripts/** → concat + minify → main.js
  const scriptFiles = glob.sync(path.join(jsBase, 'scripts', '**', '*.js'));
  if (scriptFiles.length > 0) {
    const mainSrc = scriptFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const { code: mainMin } = await minify(mainSrc);
    await fsPromises.writeFile(path.join(outDir, 'main.js'), mainMin || '');
  }

  // standalone/**/*.js → copy flat (no concat, no minify)
  const standaloneFiles = glob.sync(path.join(jsBase, 'standalone', '**', '*.js'));
  for (const f of standaloneFiles) {
    await fsPromises.copyFile(f, path.join(outDir, path.basename(f)));
  }

  // vendor/** → concat + minify → vendor.js
  const vendorFiles = glob.sync(path.join(jsBase, 'vendor', '**', '*.js'));
  if (vendorFiles.length > 0) {
    const vendorSrc = vendorFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    const { code: vendorMin } = await minify(vendorSrc);
    await fsPromises.writeFile(path.join(outDir, 'vendor.js'), vendorMin || '');
  }
}

async function handleSharedURLs (options) {
  if (options.verbose) {
    utils.log.note('    ⤷ Updating shared assets URLs');
  }

  const htmlFiles = glob.sync(path.join(options.paths.dist, '**', '*.html'));
  const searchStr = options.paths.root + options.paths.sharedAssets;

  for (const file of htmlFiles) {
    let content = await fsPromises.readFile(file, 'utf8');
    content = content.split(searchStr).join('./shared');
    await fsPromises.writeFile(file, content);
  }
}

async function build (options) {
  options.module.workflow.assemble.data.deploy = true;
  options.module.workflow.assemble.data.root = '../';
  options.deploying = true;

  await styles(options);
  await handleJSScripts(options);
  await assemble(options);
  await veevaThumbsTask(options);
  await copySharedAssets(options);
  await handleSharedURLs(options);
}

module.exports = { styles, handleJSScripts, handleSharedURLs, build };
