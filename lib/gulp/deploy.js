'use strict';

const ftp = require('basic-ftp');
const path = require('path');
const plumber = require('gulp-plumber');
const size = require('gulp-size');
const utils = require('../utils');
const zip = require('gulp-zip');
const { parseAsync } = require('json2csv');
const vaultFields = require('./helpers/vault_fields').vaultFields;

module.exports = function(gulp, options) {
  const { src, dest, series, parallel } = gulp;

  async function ftpDeploy(files, ftpPath = '') {
    const client = new ftp.Client();
    client.trackProgress(info => {
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


  async function prepareVaultData(keyMessages) {

    const buildArray = keyMessages.map(item => {
      if (options.clm.product && options.clm.product.name) {
        item.key_message = options.clm.product.name + options.clm.product.suffix + item.key_message;
      }

      // https://commercial.veevavault.help/en/lr/26902/#csv-columns
      return {
        'document_id__v': '',
        'external_id__v': item.key_message.toLowerCase(),
        'name__v': item.key_message,
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

    // Now add the Presentation details
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

    // Now add a row for a shared asset key message
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

  async function handleFTPZips() {
    utils.log.log('   ⤷ Deploying zipped files');
    const files = await utils.getFiles(path.join(process.cwd(), options.paths.deploy));
    const zips = files.filter(el => path.extname(el) === '.zip');
    return ftpDeploy(zips);
  }

  async function handleFTPCtls() {
    utils.log.log('\n   ⤷ Deploying control files');
    const files = await utils.getFiles(path.join(process.cwd(), options.paths.deploy));
    const ctls = files.filter(el => path.extname(el) === '.ctl');
    return ftpDeploy(ctls, 'ctlfile');
  }

  async function handleStaging(keyMessages) {
    await utils.mkFolder(options.paths.deploy);

    keyMessages.push({ key_message: 'shared' });

    const compress = async (km) => {
      let formattedKeyMessage = km.key_message;
      if (options.clm.product.name) {
        formattedKeyMessage = options.clm.product.name + options.clm.product.suffix + formattedKeyMessage;
      }

      const keyMessageExclude = (options.deploying && options.clm.crm.deploy_to === 'vault') ? '!*.jpg' : '!thumb.png';

      return new Promise((resolve, reject) => {
        src(['**/*', keyMessageExclude], {
            cwd: path.join(process.cwd(), options.paths.dist, formattedKeyMessage),
            base: path.join(options.paths.dist, formattedKeyMessage)
          })
          .pipe(plumber())
          .pipe(zip(`${formattedKeyMessage.toLowerCase()}.zip`))
          .pipe(size({
            title: utils.log.chalk.green.bold('⤷ Zipping Key Message: ') + utils.log.chalk.yellow.bold(formattedKeyMessage),
            showFiles: options.verbose
          }))
          .pipe(dest(options.paths.deploy))
          .on('error', reject)
          .on('end', resolve);
      });
    };

    const controlFile = async (km) => {
      if (options.clm.crm.deploy_to === 'vault') return;

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
    };

    const tasks = [];
    for (const km of keyMessages) {
      tasks.push(compress(km));
      tasks.push(controlFile(km));
    }

    return Promise.all(tasks);
  }

  gulp.task('deploy', series(handleFTPZips, handleFTPCtls, (done) => {
    utils.log.log('');
    utils.log.success('Done Deploying Key Messages');
    done();
  }));

  gulp.task('stage', series('clean:deploy', 'build', async () => {
    await handleStaging(options.clm.key_messages);
    utils.log.success('Done Staging Key Messages');
  }));

  gulp.task('stage-vault', async function() {
    utils.log.log('⤷ Generating Veeva Vault CSV file');
    await utils.mkFolder(options.paths.deploy);
    const data = await prepareVaultData(options.clm.key_messages);
    const csv = await parseAsync(data, { fields: vaultFields });
    await utils.setFile(path.join(process.cwd(), options.paths.deploy, 'VAULT_CSV.csv'), csv);
    utils.log.success('Veeva Vault CSV file has been successfully generated');
  });
};
