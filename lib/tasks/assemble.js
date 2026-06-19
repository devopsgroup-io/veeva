'use strict';

const customHelpers = require('./helpers/customHelpers.js');
const fs = require('fs');
const fsPromises = require('fs/promises');
const glob = require('glob');
const handlebars = require('handlebars');
const handlebarsHelpers = require('handlebars-helpers');
const handlebarsLayouts = require('handlebars-layouts');
const matter = require('gray-matter');
const path = require('path');
const utils = require('../utils');
const YAML = require('js-yaml');

handlebars.registerHelper(handlebarsLayouts(handlebars));

function loadDataFile (pattern) {
  const files = glob.sync(pattern);
  const data = {};
  files.forEach((file) => {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const content = path.extname(file) === '.json' ? JSON.parse(raw) : YAML.load(raw);
      const basename = path.basename(file, path.extname(file));
      data[basename] = content;
    } catch (e) {
      utils.log.warn(`Could not parse data file: ${file}`);
    }
  });
  return data;
}

function computeOutputPath (templateFile, options) {
  const pagesBase = path.join(options.paths.src, options.paths.pages);
  const rel = path.relative(pagesBase, templateFile);
  let dirname = path.dirname(rel);
  let basename = path.basename(rel, '.hbs');

  if (dirname === '.') {
    dirname = '';
  }

  if (options.clm.key_messages.length === 1) {
    dirname = options.clm.key_messages[0].key_message;
  }

  if (options.clm.product && options.clm.product.name) {
    const suffix = options.clm.product.suffix || '';
    dirname = (options.clm.product.name + suffix + dirname).toLowerCase();

    if (utils.lookupCollectionObject(options.clm.key_messages, 'key_message', basename)) {
      basename = (options.deploying && options.clm.crm.deploy_to === 'vault')
        ? 'index'
        : options.clm.product.name + suffix + basename;
    }
  }

  return path.join(options.paths.dist, dirname, basename + '.html');
}

async function registerPartials (options) {
  const includesPattern = path.join(options.paths.src, 'templates', 'includes', '**/*.hbs');
  const layoutsPattern = path.join(options.paths.src, options.paths.layouts, '**/*.hbs');

  const allPartials = [
    ...glob.sync(includesPattern),
    ...glob.sync(layoutsPattern)
  ];

  for (const file of allPartials) {
    const name = path.basename(file, '.hbs');
    handlebars.registerPartial(name, fs.readFileSync(file, 'utf8'));
  }
}

async function registerHelpersForAssemble (options) {
  handlebarsHelpers({ handlebars });
  handlebars.registerHelper(customHelpers);

  const userHelperPattern = path.join(options.paths.src, 'templates', 'helpers', '**/*.js');
  for (const hf of glob.sync(userHelperPattern)) {
    const h = require(path.resolve(hf));
    if (typeof h === 'function') {
      h(handlebars);
    } else if (h && typeof h === 'object') {
      handlebars.registerHelper(h);
    }
  }
}

async function assembleTemplates (options) {
  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Assembling Key Message(s)'));

  await registerPartials(options);
  await registerHelpersForAssemble(options);

  const yamlData = loadDataFile(path.join(options.paths.src, 'templates', 'data', '**', '*.yml'));
  const jsonData = loadDataFile(path.join(options.paths.src, 'templates', 'data', '**', '*.json'));

  const globalData = {
    ...yamlData,
    ...jsonData,
    paths: options.paths,
    deploy: options.deploying,
    layout: options.module.workflow.assemble.defaultLayout
  };

  const pagesPattern = path.join(options.paths.src, options.paths.pages, '**', '*.hbs');
  const templateFiles = glob.sync(pagesPattern);

  for (const templateFile of templateFiles) {
    const raw = fs.readFileSync(templateFile, 'utf8');
    const { content, data: frontMatterData } = matter(raw);
    const template = handlebars.compile(content);
    const html = template({ ...globalData, ...frontMatterData });

    const outputPath = computeOutputPath(templateFile, options);
    await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
    await fsPromises.writeFile(outputPath, html);
  }
}

async function copyTemplateAssets (options) {
  const pagesDir = path.join(process.cwd(), options.paths.src, 'templates', 'pages');
  const assetFiles = glob.sync('**/*.*', {
    cwd: pagesDir,
    ignore: ['**/*.hbs']
  });

  for (const relFile of assetFiles) {
    const srcFile = path.join(pagesDir, relFile);
    const relDir = path.dirname(relFile);
    let destFile;

    if (options.clm.product && options.clm.product.name && relDir !== '.') {
      const prefixedDir = (options.clm.product.name + options.clm.product.suffix + relDir).toLowerCase();
      destFile = path.join(options.paths.dist, prefixedDir, path.basename(relFile));
    } else {
      destFile = path.join(options.paths.dist, relFile);
    }

    await fsPromises.mkdir(path.dirname(destFile), { recursive: true });
    await fsPromises.copyFile(srcFile, destFile);
  }
}

async function generateGlobalAppConfig (options) {
  return utils.setFile(
      path.join(options.paths.dist, options.paths.sharedAssets, 'app.json'),
      JSON.stringify(options.clm.key_messages)
  );
}

async function copySharedAssets (options) {
  if (!options.clm.crm.hasSharedResources) {
    return;
  }

  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Copying shared assets to each key message'));

  const sharedSrc = path.join(options.paths.dist, options.paths.sharedAssets);
  const sharedFiles = glob.sync('**/*', { cwd: sharedSrc, nodir: true });

  const tasks = options.clm.key_messages
      .filter((km) => !km.shared_assets_ignore)
      .map(async (km) => {
        let keyName = km.key_message;
        if (options.clm.product && options.clm.product.name) {
          keyName = options.clm.product.name + options.clm.product.suffix + keyName;
        }

        for (const file of sharedFiles) {
          const src = path.join(sharedSrc, file);
          const dest = path.join(process.cwd(), options.paths.dist, keyName, options.paths.sharedAssets, file);
          await fsPromises.mkdir(path.dirname(dest), { recursive: true });
          await fsPromises.copyFile(src, dest);
        }
      });

  await Promise.all(tasks);
}

async function assemble (options) {
  await assembleTemplates(options);
  await copyTemplateAssets(options);
  await generateGlobalAppConfig(options);
  utils.log.log(utils.log.chalk.green.bold('     ✔︎ Done Assembling Key Messages'));
}

module.exports = { assemble, assembleTemplates, copyTemplateAssets, generateGlobalAppConfig, copySharedAssets };
