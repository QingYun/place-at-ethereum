const Web3 = require('web3')
const R = require('ramda');
const server = require('http').createServer();
const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')
const web3 = new Web3(provider);

provider.on('connect', () => {
  let account = null;
  web3.eth.getAccounts().then(accounts => {
    account = accounts[process.env.ACC_INDEX]
    return web3.eth.personal.unlockAccount(account, process.env.ACC_PASS, 0);
  }).then(() => {
    const contracts = require('./contracts')(web3);
    require('./http_server')(server);
    require('./ws_server')(server);
    server.listen(8080, () => console.log('server listening on 8080'))
  })
});