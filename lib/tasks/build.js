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

  await Promise.all(scssFiles.map(async (file) => {
    const result = sass.compile(file);
    const css = result.css.replace(/\/shared/g, '../');
    const minified = new CleanCSS().minify(css);
    const outName = path.basename(file, '.scss') + '.css';

    if (options.verbose) {
      utils.log.note(`       ${outName}: ${minified.styles.length} bytes`);
    }

    await fsPromises.writeFile(path.join(outDir, outName), minified.styles);
  }));
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

  // vendor/** → concat + minify → vendor.js (zepto excluded; jQuery core before plugins)
  const vendorFiles = glob.sync(path.join(jsBase, 'vendor', '**', '*.js'))
      .filter((f) => !path.basename(f).includes('zepto.min') && !path.basename(f).includes('zepto.ghostclick'))
      .sort((a, b) => {
        const vendorPriority = (f) => {
          const name = path.basename(f);
          if (/^jquery-\d/.test(name)) return 0;
          if (/^jquery/.test(name)) return 1;
          return 2;
        };
        return vendorPriority(a) - vendorPriority(b) || path.basename(a).localeCompare(path.basename(b));
      });
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

  await Promise.all(htmlFiles.map(async (file) => {
    let content = await fsPromises.readFile(file, 'utf8');
    content = content.split(searchStr).join('./shared');
    await fsPromises.writeFile(file, content);
  }));
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

async function buildPublicFolder (options) {
  const publicDir = path.join(process.cwd(), options.paths.public || 'public');
  await fsPromises.mkdir(publicDir, { recursive: true });

  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Building public folder'));

  const isVault = options.clm.crm && options.clm.crm.deploy_to === 'vault';
  let firstKmSlug = null;

  for (const [index, km] of options.clm.key_messages.entries()) {
    const srcDirName = utils.formatKeyMessage(options, km);
    const srcDir = path.join(process.cwd(), options.paths.dist, srcDirName);

    try {
      await fsPromises.access(srcDir);
    } catch (e) {
      continue;
    }

    if (index === 0) firstKmSlug = srcDirName;

    const destDir = path.join(publicDir, srcDirName);
    await fsPromises.mkdir(destDir, { recursive: true });
    await fsPromises.cp(srcDir, destDir, { recursive: true });

    if (!isVault) {
      const mainHtmlName = (options.clm.product && options.clm.product.name)
        ? options.clm.product.name + options.clm.product.suffix + km.key_message + '.html'
        : km.key_message + '.html';

      try {
        await fsPromises.rename(
            path.join(destDir, mainHtmlName),
            path.join(destDir, 'index.html')
        );
      } catch (e) {
        // Already index.html or different casing — leave as-is
      }
    }
  }

  // Copy shared assets at the same level as KM folders so ../brand_shared/… paths resolve correctly
  const sharedSrc = path.join(process.cwd(), options.paths.dist, options.paths.sharedAssets);
  const sharedDest = path.join(publicDir, options.paths.sharedAssets);
  try {
    await fsPromises.cp(sharedSrc, sharedDest, { recursive: true });
  } catch (e) {}

  // Root index.html: redirect to first KM, or a configured override URL
  const previewRedirectURL = options.paths.previewURLDefault || (firstKmSlug ? `./${firstKmSlug}/index.html` : null);
  if (previewRedirectURL) {
    await fsPromises.writeFile(
      path.join(publicDir, 'index.html'),
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${previewRedirectURL}"></head><body></body></html>`
    );
  }
}

async function buildPreview (options) {
  const { cleanPreview } = require('./clean');

  options.module.workflow.assemble.data.deploy = false;
  options.module.workflow.assemble.data.root = '../';
  options.deploying = false;   // isDeployed: false in HTML → click events + URL nav work in browser

  await cleanPreview(options);
  await styles(options);
  await handleJSScripts(options);
  await assemble(options);
  await veevaThumbsTask(options);
  await copySharedAssets(options);
  await buildPublicFolder(options);

  utils.log.success('Done building preview');
}

module.exports = { styles, handleJSScripts, handleSharedURLs, build, buildPreview };
