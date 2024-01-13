const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'text.txt');

let result = '';
const stream = fs.createReadStream(file, 'utf-8');
stream.on('data', function (chunk) {
  result += chunk;
});

stream.on('close', function () {
  console.log(result);
});
