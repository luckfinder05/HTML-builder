const fs = require('fs');
const path = require('path');

const stylesDir = path.resolve(__dirname, 'styles');
const destFile = path.resolve(__dirname, 'project-dist/bundle.css');

function deleteFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.rm(filepath, { force: true, recursive: true }, (err) => {
      if (err) {
        console.log('Directory : ', filepath, 'is not exist');
        reject(err);
      }
      resolve();
    });
  });
}

async function bundleStyles(dir, bundleFile) {
  await deleteFile(destFile);
  fs.mkdir(stylesDir, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory: ' + err.message);
    }
  });

  fs.readdir(dir, { withFileTypes: true }, function (err, files) {
    if (err) {
      throw err;
    }

    files.forEach((file) => {
      const isFile = !file.isDirectory();
      if (isFile) {
        const extension = path.extname(file.name).slice(1);
        const isCss = extension === 'css';
        if (isCss) {
          fs.createReadStream(path.resolve(dir, file.name)).pipe(
            fs.createWriteStream(path.resolve(dir, bundleFile), { flags: 'a' }),
          );
        }
      }
    });
  });
}

bundleStyles(stylesDir, destFile);

module.exports = { bundleStyles };
