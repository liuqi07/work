express = require('express');
let path = require('path');
let app = express();

app.use(express.static(path.join(__dirname, './dist')));

app.listen('8088', (err) => {
  console.log('port 8088 success');
});