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
  require('./http_server')(server);
  require('./ws_server')(server);
  server.listen(8080, () => console.log('server listening on 8080'))

  await require('./draw')(contracts, account)(1, 1, 1);
});
