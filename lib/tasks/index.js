'use strict';

const { build } = require('./build');
const { deploy, stage, stageVault } = require('./deploy');
const { defaultTask } = require('./dev');
const { screenshots } = require('./screenshot');

module.exports = {
  'default': defaultTask,
  'build': build,
  'deploy': deploy,
  'stage': stage,
  'stage-vault': stageVault,
  'screenshots': screenshots
};
