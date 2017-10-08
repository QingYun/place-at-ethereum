const Web3 = require('web3')
const R = require('ramda');
const server = require('http').createServer();
const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')
const web3 = new Web3(provider);
const logger = require('pino')({
  level: process.env.LOG_LEVEL || 'trace',
  prettyPrint: process.env.NODE_ENV != 'production',
});

let account = null;
let contracts = null;

async function draw(x, y, color) {
  logger.info('Start drawing pixel (%d, %d) Color: %d', x, y, color);

  // needs to be a second epoch
  let t = Date.now() / 1000;
  // TODO: update target
  const {difficulty, prevWork} = await contracts.Throttle.methods
    .calculateDifficulty(x, y, color, t).call({ from: account })
  const target = web3.utils.toBN(2)
    .pow(web3.utils.toBN(256))
    .subn(1)
    .ushrn(parseInt(difficulty, 10));

  logger.info('Get work for pixel (%d, %d). \nD\t= %d\nprevW\t= %s\ntarget\t= %s', 
    x, y, difficulty, prevWork, target.toString(16, 64));

  let cur = null;
  let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  do {
    nonce++;
    cur = web3.utils.toBN(
      web3.utils.soliditySha3({type: 'uint8', value: color}, 
      prevWork, 
      web3.utils.leftPad('0x' + nonce, 64)));
  } while (cur.gte(target))

  logger.info('Done work for pixel (%d, %d). \nnonce\t= %d\ntarget\t= %s\nwork\t= %s', 
    x, y, nonce, target.toString(16, 64), cur.toString(16, 64));

  return await contracts.Gateway.methods
    .draw(x, y, color, web3.utils.leftPad('0x' + nonce, 64)).send({ from: account })
}

provider.on('connect', async () => {
  const accounts = await web3.eth.getAccounts();
  account = accounts[process.env.ACC_INDEX];
  //await web3.eth.personal.unlockAccount(account, process.env.ACC_PASS, 0);

  contracts = require('./contracts')(web3);
  require('./http_server')(server);
  require('./ws_server')(server);
  server.listen(8080, () => console.log('server listening on 8080'))

  await draw(1, 1, 1);
});
