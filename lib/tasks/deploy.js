'use strict';

const archiver = require('archiver');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const utils = require('../utils');
const { parseAsync } = require('json2csv');
const { vaultFields } = require('./helpers/vault_fields');
const { build } = require('./build');
const { cleanDeploy } = require('./clean');

async function ftpDeploy (files, options, ftpPath = '') {
  const client = new ftp.Client();
  client.trackProgress((info) => {
    utils.log.log('');
    utils.log.log('       File: ', info.name);
    utils.log.log('       Type: ', info.type);
    utils.log.log('       Transferred: ', info.bytes);
    utils.log.log('       Transferred Overall: ', info.bytesOverall);
  });

  client.ftp.verbose = options.verbose;
  try {
    await client.access({
      host: options.ftp.host,
      user: options.ftp.user,
      password: options.ftp.pass,
      port: options.ftp.port || 21,
      secure: options.ftp.secure,
      secureOptions: { rejectUnauthorized: false }
    });

    for (const file of files) {
      await client.uploadFrom(path.join(options.paths.deploy, file), path.join(ftpPath, file));
    }
  } catch (err) {
    console.error(err);
  }
  client.close();
}

async function prepareVaultData (keyMessages, options) {
  const buildArray = keyMessages.map((item) => {
    if (options.clm.product && options.clm.product.name) {
      item.key_message = options.clm.product.name + options.clm.product.suffix + item.key_message;
    }

    return {
      'document_id__v': '',
      'external_id__v': item.key_message.toLowerCase(),
      'name__v': item.name,
      'Type': 'Slide',
      'lifecycle__v': 'CRM Content Lifecycle',
      'Presentation Link': options.clm.crm.presentation_id,
      'Fields Only': 'FALSE',
      'slide.country__v.name__v': options.clm.crm.presentation_country,
      'slide.crm_disable_actions__v': '',
      'slide.crm_media_type__v': 'HTML',
      'slide.filename': item.key_message.toLowerCase() + '.zip',
      'slide.product__v.name__v': options.clm.product.name,
      'slide.related_shared_resource__v': options.clm.crm.slide_related_shared_resource,
      'slide.related_sub_pres__v': ''
    };
  });

  buildArray.push({
    'Create Presentation': 'FALSE',
    'external_id__v': options.clm.crm.presentation_id,
    'lifecycle__v': 'Binder Lifecycle',
    'name__v': options.clm.crm.presentation_name,
    'pres.country__v.name__v': options.clm.crm.presentation_country,
    'pres.crm_training__v': options.clm.crm.presentation_training,
    'pres.crm_end_date__v': '',
    'pres.crm_start_date__v': '',
    'pres.product__v.name__v': options.clm.product.name,
    'Type': 'Presentation'
  });

  if (options.clm.crm.slide_related_shared_resource && options.clm.crm.slide_related_shared_resource !== '') {
    buildArray.push({
      'external_id__v': options.clm.crm.slide_related_shared_resource,
      'Fields Only': 'FALSE',
      'name__v': options.clm.crm.slide_related_shared_resource,
      'lifecycle__v': 'CRM Content Lifecycle',
      'slide.country__v.name__v': options.clm.crm.presentation_country,
      'slide.crm_media_type__v': 'HTML',
      'slide.crm_shared_resource__v': true,
      'slide.filename': options.clm.crm.slide_related_shared_resource.replace(/-/g, '_') + '.zip',
      'slide.product__v.name__v': options.clm.product.name,
      'Type': 'Shared'
    });
  }

  return buildArray;
}

function compress (km, options) {
  return new Promise((resolve, reject) => {
    let formattedKeyMessage = km.key_message;
    if (options.clm.product.name) {
      formattedKeyMessage = options.clm.product.name + options.clm.product.suffix + formattedKeyMessage;
    }

    const keyMessageExclude = (options.deploying && options.clm.crm.deploy_to === 'vault') ? '*.jpg' : 'thumb.png';
    const sourceDir = path.join(process.cwd(), options.paths.dist, formattedKeyMessage);
    const outputZip = path.join(options.paths.deploy, `${formattedKeyMessage.toLowerCase()}.zip`);

    utils.log.log(
        utils.log.chalk.green.bold('⤷ Zipping Key Message: ') +
      utils.log.chalk.yellow.bold(formattedKeyMessage)
    );

    const output = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.glob('**/*', { cwd: sourceDir, ignore: [keyMessageExclude] });
    archive.finalize();
  });
}

async function createControlFile (km, options) {
  if (options.clm.crm.deploy_to === 'vault') {
    return;
  }

  let formattedKeyMessage = km.key_message;
  if (options.clm.product.name) {
    formattedKeyMessage = options.clm.product.name + options.clm.product.suffix + formattedKeyMessage;
  }

  const content = [
    `USER=${options.ftp.user}`,
    `PASSWORD=${options.ftp.pass}`,
    `EMAIL=${options.ftp.email}`,
    `NAME=${formattedKeyMessage}`,
    `Description_vod__c=${km.description}`,
    `FILENAME=${formattedKeyMessage}.zip`
  ].join('\n');

  return utils.setFile(path.join(options.paths.deploy, `${formattedKeyMessage}.ctl`), content);
}

async function handleStaging (keyMessages, options) {
  await utils.mkFolder(options.paths.deploy);

  keyMessages.push({ key_message: 'shared' });

  const tasks = [];
  for (const km of keyMessages) {
    tasks.push(compress(km, options));
    tasks.push(createControlFile(km, options));
  }

  await Promise.all(tasks);
}

async function handleFTPZips (options) {
  utils.log.log('   ⤷ Deploying zipped files');
  const files = await utils.getFiles(path.join(process.cwd(), options.paths.deploy));
  const zips = files.filter((el) => path.extname(el) === '.zip');
  return ftpDeploy(zips, options);
}

async function handleFTPCtls (options) {
  utils.log.log('\n   ⤷ Deploying control files');
  const files = await utils.getFiles(path.join(process.cwd(), options.paths.deploy));
  const ctls = files.filter((el) => path.extname(el) === '.ctl');
  return ftpDeploy(ctls, options, 'ctlfile');
}

async function deploy (options) {
  await handleFTPZips(options);
  await handleFTPCtls(options);
  utils.log.log('');
  utils.log.success('Done Deploying Key Messages');
}

async function stage (options) {
  await cleanDeploy(options);
  await build(options);
  await handleStaging(options.clm.key_messages, options);
  utils.log.success('Done Staging Key Messages');
}

async function stageVault (options) {
  utils.log.log('⤷ Generating Veeva Vault CSV file');
  await utils.mkFolder(options.paths.deploy);
  const data = await prepareVaultData(options.clm.key_messages, options);
  const csv = await parseAsync(data, { fields: vaultFields });
  await utils.setFile(path.join(process.cwd(), options.paths.deploy, 'VAULT_CSV.csv'), csv);
  utils.log.success('Veeva Vault CSV file has been successfully generated');
}

module.exports = { deploy, stage, stageVault };
