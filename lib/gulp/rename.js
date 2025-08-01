'use strict';

const Stream = require('stream');
const Path = require('path');

function Rename (obj, options) {

  options = options || {};

  const stream = new Stream.Transform({objectMode: true});

  function parsePath (path) {
    const extname = options.multiExt ? Path.basename(path).slice(Path.basename(path).indexOf('.')) : Path.extname(path);
    return {
      dirname: Path.dirname(path),
      basename: Path.basename(path, extname),
      extname: extname
    };
  }

  stream._transform = function (originalFile, unused, callback) {


    const file = originalFile.clone({contents: false});
    const parsedPath = parsePath(file.relative);
    let path;

    const type = typeof obj;

    if (type === 'string' && obj !== '') {

      path = obj;

    } else if (type === 'function') {

      obj(parsedPath, file);
      path = Path.join(parsedPath.dirname, parsedPath.basename + parsedPath.extname);

    } else if (type === 'object' && obj !== undefined && obj !== null) {

      const dirname = 'dirname' in obj ? obj.dirname : parsedPath.dirname,
        prefix = obj.prefix || '',
        suffix = obj.suffix || '',
        basename = 'basename' in obj ? obj.basename : parsedPath.basename,
        extname = 'extname' in obj ? obj.extname : parsedPath.extname;

      path = Path.join(dirname, prefix + basename + suffix + extname);

    } else {

      callback(new Error('Unsupported renaming parameter type supplied'), undefined);
      return;

    }

    file.path = Path.join(file.base, path);

    // Rename sourcemap if present
    if (file.sourceMap) {
      file.sourceMap.file = file.relative;
    }

    callback(null, file);
  };

  return stream;
}

module.exports = Rename;
