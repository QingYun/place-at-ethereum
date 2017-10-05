const Web3 = require('web3')
const R = require('ramda');
const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')
const web3 = new Web3(provider);

provider.on('connect', () => {
  let account = null;
  web3.eth.getAccounts().then(accounts => {
    account = accounts[process.env.ACC_INDEX]
    return web3.eth.personal.unlockAccount(account, process.env.ACC_PASS, 0);
  }).then(() => {
    const contracts = require('./contracts')(web3);
    require('./http_server')();

    contracts
      .Gateway.methods.draw(1, 1, 1, web3.utils.padLeft('0x123', 32)).send({ from: account })
      .then(console.log)
      .then(() => contracts.Canvas.methods.getPixel(1, 1).call())
      .then(console.log)
      .catch(console.log)
  })
});