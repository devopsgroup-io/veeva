const path = require('path');
const fs = require('fs');
const YAML = require('js-yaml');

const config = {},
  _process = {};

const LOCAL_CONFIG_PATH = path.resolve(process.cwd(), 'configuration.yml');
const LOCAL_CLM_CONFIG_PATH = path.resolve(process.cwd(), 'app/templates/data/clm.yml');

function getLocalOptions(localConfigFile) {
  let localOptions = {};
  const localOptionsPath = localConfigFile
    ? path.resolve(process.cwd(), localConfigFile)
    : LOCAL_CONFIG_PATH;

  try {
    const fileContents = fs.readFileSync(localOptionsPath, 'utf8');
    const loadedConfig = YAML.load(fileContents);
    localOptions = JSON.parse(JSON.stringify(loadedConfig)); // optional deep copy
  } catch (error) {
    localOptions.Error = error;
  }

  if (Array.isArray(localOptions.pkgFiles) && localOptions.pkgFiles.length === 0) {
    localOptions.pkgFiles = false;
  }

  return localOptions;
}

const getNPMProps = function () {
  const { name, version } = require('../package.json');
  return { name, version };
};

config.mergeOptions = function (options) {
  const localOptions = getLocalOptions(LOCAL_CONFIG_PATH);
  const localCLMConfig = getLocalOptions(LOCAL_CLM_CONFIG_PATH);
  const npm = getNPMProps();
  const defaultOptions = require('./configuration.json');

  if (localOptions.Error) {
    this.options = { ...defaultOptions, ...options, ...localOptions };
  } else {
    localOptions.clm = { ...localOptions.clm, ...localCLMConfig };
    this.options = { ...defaultOptions, ...options, ...localOptions, ...npm };
    this.options.name = npm.name || path.basename(process.cwd());
  }

  return this.options;
};

config.getOptions = function () {
  return this.options;
};

config.isDebug = function () {
  return this.options.debug;
};

config.isDryRun = function () {
  return this.options['dry-run'];
};

config.isForce = function () {
  return this.options.force;
};

config.isVerbose = function () {
  return this.options.verbose;
};

config.hasSitemap = function () {
  return this.options.sitemap;
};

config.process = Object.create({
  get: function (key) {
    return _process[key];
  },
  set: function (key, value) {
    _process[key] = value;
  }
});

module.exports = Object.create(config);
