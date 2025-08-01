const chalk = require('chalk'),
  log = require('./log'),
  path = require('path'),
  fs = require('fs');

const mkdirp = require('mkdirp');
const { promisify } = require('util');

module.exports = {
  executeWhen: function (condition, func, successMsg, failureMsg) {
    if (Array.isArray(condition)) {
      condition = condition.reduce(function (acc, val) {
        return acc && val;
      }, true);
    }
    if (condition) {
      if (successMsg) {
        console.log(chalk.green.bold(successMsg));
      }
      return func();
    } else {
      if (failureMsg) {
        log.note(failureMsg);
      }
      return new Promise((resolve, reject) => {
        resolve('Short circuit');
      });
    }
  },
  isDirectory: function (folder, callback) {
    fs.stat(folder, function (err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          return fs.mkdir(folder, callback);
        }
      } else {
        callback();
      }
    });
  },
  getDirectories: function (srcpath) {
    return fs.readdirSync(srcpath).filter(function (file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
  },
  getFiles: function (srcpath) {
    return new Promise(function (resolve, reject) {
      try {
        const files = fs.readdirSync(srcpath).filter((file) => fs.statSync(path.join(srcpath, file)).isFile()).filter((file) => !(/(^|\/)\.[^\/\.]/g).test(file));
        resolve(files);
      } catch (error) {
        return reject(error);
      }
    });
  },
  getVersion: function (numbers) {
    return {
      major: parseInt(numbers[0], 10),
      minor: parseInt(numbers[1], 10),
      patch: parseInt(numbers[2], 10)
    };
  },
  log: log,
  rm: function (filename) {
    return new Promise(function (resolve, reject) {
      log.verbose('Deleting: ', filename);
      fs.unlink(filename, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  lookupCollectionObject: function (collection, name, value) {

    if (!Array.isArray(collection) || !name || !value) {
      return false;
    }

    for (let i = 0, j = collection.length; i < j; i++) {
      if (collection[i][name] && collection[i][name] === value) {

        // add index to the returned object
        collection[i].index = i;

        return collection[i];
      }
    }

    return null;
  },
  hasFile: function (file) {
    const stat = promisify(fs.stat);
    return stat(file)
        .then((stats) => stats.isFile())
        .catch((err) => {
          if (err.code === 'ENOENT') {
            return false;
          }
        });
  },
  getFile: function (file) {
    const readFile = promisify(fs.readFile);
    return readFile(file)
        .catch((err) => {
          if (err.code === 'ENOENT') {
            return false;
          }
        });
  },
  setFile: function (path, data) {
    const writeFile = promisify(fs.writeFile);
    return writeFile(path, data);
  },
  mkFolder: function (directory) {
    return mkdirp(directory);
  }
};
