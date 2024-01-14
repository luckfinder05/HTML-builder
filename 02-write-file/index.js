const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'text.txt');

const fileStream = fs.createWriteStream(file, {
  flags: 'a',
  encoding: 'utf-8',
});
const stdin = process.stdin;
const stdout = process.stdout;

const closeApp = (fileStream) => {
  fileStream.close();
  process.stdout.write('\n\rGood bye!');
  process.exit(0);
};

stdout.write(`Start writing to file ${file}\n\r`);
stdout.write('> ');

stdin.on('data', function (chunk) {
  const result = chunk.toString();
  if (result === 'exit\u000d\u000a') {
    closeApp(fileStream);
  }
  fileStream.write(chunk);
  stdout.write('> ');
});

process.on('SIGINT', function () {
  closeApp(fileStream);
});
