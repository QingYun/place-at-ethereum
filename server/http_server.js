const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { toIntObj } = require('./utils');
const { getUpdates, getResizing } = require('./db');

const STATIC_PATH = path.join(__dirname, '../client/dist')

module.exports = (server, draw) => {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.get('/', (req, res) => res.sendFile(path.join(STATIC_PATH, 'index.html')))

  app.post('/draw', async (req, res) => {
    const {x, y, color} = req.body;
    if (x === undefined || y === undefined || color === undefined) {
      return res.sendStatus(400);
    }
    try {
      await draw(x, y, color);
      res.sendStatus(200);
    } catch (e) {
      logger.error('On processing drawing request on (%d, %d) for the color [%d]: \n%s', x, y, color, e);
      res.sendStatus(500);
    }
  });

  app.get('/getUpdates', async (req, res) => {
    const { every, from, to } = toIntObj(req.query);
    if (every === undefined || from === undefined || to === undefined) 
      return res.sendStatus(400);

    try {
      const docs = await getUpdates({ every, from, to});
      res.send(JSON.stringify(docs));
    } catch (e) {
      logger.error('On getting updates [%d, %d) for every %ds: \n%s', from, to, every, e);
      res.sendStatus(500);
    }
  });

  app.get('/getResizings', async (req, res) => {
    const { from, to } = toIntObj(req.query);
    if (from === undefined || to === undefined)
      return res.sendStatus(500);

    try {
      const docs = await getResizing({ from, to});
      res.send(JSON.stringify(docs));
    } catch (e) {
      logger.error('On getting resizings [%d, %d): \n%s', from, to, e);
      res.sendStatus(500);
    }
  });

  app.use(express.static(STATIC_PATH));
  server.on('request', app);
};