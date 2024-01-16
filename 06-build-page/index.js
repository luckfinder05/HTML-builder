const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const projectDir = path.resolve(__dirname, 'project-dist');
const styles = {
  srcDir: 'styles',
  output: 'style.css',
};

const assets = {
  srcDir: 'assets',
  destDir: 'assets',
};
function errorHandler(err) {
  if (err) {
    throw new Error(err);
  }
}

const htmlTemplate = 'template.html';
const componentsDir = 'components';

async function copyFolder(fromDir, destDir) {
  fs.readdir(fromDir, { withFileTypes: true }, function (err, files) {
    errorHandler(err);
    fs.mkdir(destDir, { recursive: true }, errorHandler);

    if (files.length > 0) {
      files.forEach((file) => {
        if (file.isDirectory()) {
          const subDir = file.name;
          copyFolder(
            path.resolve(fromDir, subDir),
            path.resolve(destDir, subDir),
          );
        } else {
          fs.createReadStream(path.resolve(fromDir, file.name)).pipe(
            fs.createWriteStream(path.resolve(destDir, file.name)),
          );
        }
      });
    }
  });
}

async function bundleStyles(stylesDir, bundleFilePath) {
  fs.readdir(stylesDir, { withFileTypes: true }, function (err, files) {
    errorHandler(err);

    files.forEach((file) => {
      if (!file.isDirectory()) {
        const extension = path.extname(file.name).slice(1);
        const isCss = extension === 'css';
        if (isCss) {
          fs.createReadStream(path.resolve(stylesDir, file.name)).pipe(
            fs.createWriteStream(path.resolve(stylesDir, bundleFilePath), {
              flags: 'a',
            }),
          );
        }
      }
    });
  });
}

function getComponentContent(componentName) {
  return new Promise((resolve, reject) => {
    let tempStream;
    let content = '';
    try {
      tempStream = fs.createReadStream(
        path.resolve(srcDir, componentsDir, `${componentName}.html`),
        'utf-8',
      );
    } catch (err) {
      reject(err);
    }
    tempStream.on('data', (chunk) => {
      content += chunk.toString();
    });

    tempStream.on('close', () => {
      resolve(content);
    });
  });
}

function getComponentNamesFromTemplate(template) {
  return Array.from(template.matchAll(/{{([a-zA-Z]*)}}/gm)).map((match) => {
    return { name: match[1], content: '' };
  });
}

async function buildPage(dist) {
  // 1 Creates a folder named 'project-dist'
  fs.mkdir(dist, { recursive: true }, errorHandler);

  // 2 Replaces template tags in the template.html file with filenames of files
  // from the components folder(e.g., {{ section }}) with components content
  // and saves the result in './project-dist/index.html'.
  const templateSrc = path.resolve(srcDir, htmlTemplate);

  let templateContent = '';
  const templateStream = fs.createReadStream(templateSrc, 'utf-8');
  templateStream.on('data', (chunk) => {
    templateContent += chunk.toString();
  });

  templateStream.on('close', () => {
    const componentNames = getComponentNamesFromTemplate(templateContent);

    const promises = componentNames.map((componentName, index) => {
      return new Promise((resolve) => {
        getComponentContent(componentName.name).then((content) => {
          componentNames[index].content = content;
          templateContent = templateContent.replaceAll(
            `{{${componentName.name}}}`,
            content,
          );
          resolve();
        });
      });
    });

    Promise.all(promises).then(() => {
      const resultStream = fs.createWriteStream(
        path.resolve(dist, 'index.html'),
      );
      resultStream.write(templateContent, errorHandler);
      resultStream.end();
    });
  });

  // 3 Compiles styles from the styles folder into a single file and places it in project-dist/style.css
  const srcStylesDir = path.resolve(srcDir, styles.srcDir);
  const bundleStylesFile = path.resolve(dist, styles.output);
  bundleStyles(srcStylesDir, bundleStylesFile);

  // 4 Copies the assets folder into project-dist/assets.
  const srcAssetsDir = path.resolve(srcDir, assets.srcDir);
  const destAssetsDir = path.resolve(dist, assets.destDir);
  copyFolder(srcAssetsDir, destAssetsDir);
}

buildPage(projectDir);
