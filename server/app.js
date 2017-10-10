const Web3 = require('web3')
const R = require('ramda');
const server = require('http').createServer();
const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')
const web3 = new Web3(provider);

global.logger = require('pino')({
  level: process.env.LOG_LEVEL || 'trace',
  prettyPrint: process.env.NODE_ENV != 'production',
});

provider.on('connect', async () => {
  const accounts = await web3.eth.getAccounts();
  account = accounts[process.env.ACC_INDEX];
  //await web3.eth.personal.unlockAccount(account, process.env.ACC_PASS, 0);

  contracts = require('./contracts')(web3);
  const canvas = await require('./canvas')(contracts);

  require('./http_server')(server);
  require('./ws_server')(server, canvas);
  server.listen(8080, () => console.log('server listening on 8080'))

  const draw = require('./draw')(contracts, account);

  console.log(canvas.getPoints());
  canvas.onColorChange((x, y, c, oc) => logger.trace('Pixel (%d, %d) changed from [%d] to [%d]', x, y, oc, c))

  let size = canvas.getSize();
  canvas.onResize(ns => size = ns);

  const paint = async (x, y) => {
    if (y >= size) {
      y = 0;
      x++;
    }

    if (x >= size) {
      x = 0;
      y = 0;
    }

    await draw(x, y, 1);
    setTimeout(() => paint(x, y + 1), 1000);
  }

  paint(0, 0);
});
