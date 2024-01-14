const fs = require('fs');
const path = require('path');

const currentDir = path.resolve(__dirname, 'secret-folder');
const stdout = process.stdout;

async function filesInFolder(dir) {
  fs.readdir(dir, { withFileTypes: true }, function (err, files) {
    if (err) {
      throw err;
    }

    files.forEach((file) => {
      if (file.isDirectory()) {
        // filesInFolder(path.resolve(dir, file.name));
      } else {
        fs.stat(path.resolve(dir, file.name), (err, stats) => {
          const extension = path.extname(file.name).slice(1);
          const name =
            extension !== ''
              ? file.name.slice(0, -extension.length - 1)
              : file.name;
          const size = stats.size + ' bytes';
          stdout.write(`${name} - ${extension} - ${size}\n\r`);
        });
      }
    });
  });
}

filesInFolder(currentDir);
