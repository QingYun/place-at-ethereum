const Web3 = require('web3')
const R = require('ramda');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546'));
const contracts = require('./contracts')(web3);

R.chain(R.toPairs, R.values(contracts).map(c => c.events))
  .map(([n, e]) => {
    const log = (t) => console.log(n, t)
    //e().on('data', log).on('changed', log).on('error', log)
  })

const run = () => 
  web3.eth.getAccounts().then(accounts => {
    const account = accounts[0]

    contracts
      .Gateway.methods.draw(1, 1, 1, web3.utils.padLeft('0x123', 32)).send({ from: account })
      .then(console.log)
      .then(() => contracts.Canvas.methods.getPixel(1, 1).call())
      .then(console.log)
      .catch(console.log)
  })

setTimeout(run, 200)