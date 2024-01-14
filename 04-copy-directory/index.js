const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'files');
const destDir = path.resolve(__dirname, 'files-copy');

async function copyFolder(fromDir, toDir) {
  fs.readdir(fromDir, { withFileTypes: true }, function (err, files) {
    if (err) {
      throw new Error('Error reading directory: ' + err.message);
    }
    fs.mkdir(toDir, { recursive: true }, (err) => {
      if (err) {
        throw new Error('Error creating directory: ' + err.message);
      }
    });

    if (files.length > 0) {
      files.forEach((file) => {
        if (file.isDirectory()) {
          const subDir = file.name;
          copyFolder(
            path.resolve(fromDir, subDir),
            path.resolve(toDir, subDir),
          );
        } else {
          fs.createReadStream(path.resolve(fromDir, file.name)).pipe(
            fs.createWriteStream(path.resolve(toDir, file.name)),
          );
        }
      });
    }
  });
}

copyFolder(srcDir, destDir);

module.exports = { copyFolder };
