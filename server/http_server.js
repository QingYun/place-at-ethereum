const express = require('express');
const path = require('path');

const STATIC_PATH = path.join(__dirname, '../client/dist')

module.exports = () => {
  const app = express();
  app.get('/', (req, res) => res.sendFile(path.join(STATIC_PATH, 'index.html')))

  app.use(express.static(STATIC_PATH));
  app.listen(8080);
};