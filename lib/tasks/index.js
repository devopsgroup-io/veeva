'use strict';

const { build, buildPreview } = require('./build');
const { deploy, stage, stageVault } = require('./deploy');
const { defaultTask } = require('./dev');
const { screenshots } = require('./screenshot');

module.exports = {
  'default': defaultTask,
  'build': build,
  'build-preview': buildPreview,
  'deploy': deploy,
  'stage': stage,
  'stage-vault': stageVault,
  'screenshots': screenshots
};
