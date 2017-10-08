const { toBN, leftPad, soliditySha3 } = require('web3').utils;

module.exports = (contracts, account) => async (x, y, color) => {
  logger.info('Start drawing pixel (%d, %d) Color: %d', x, y, color);

  // needs to be a second epoch
  let t = Date.now() / 1000;
  // TODO: update target
  const {difficulty, prevWork} = await contracts.Throttle.methods
    .calculateDifficulty(x, y, color, t).call({ from: account })
  const target = toBN(2)
    .pow(toBN(256))
    .subn(1)
    .ushrn(parseInt(difficulty, 10));

  logger.info('Get work for pixel (%d, %d). \nD\t= %d\nprevW\t= %s\ntarget\t= %s', 
    x, y, difficulty, prevWork, target.toString(16, 64));

  let cur = null;
  let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  do {
    nonce++;
    cur = toBN(
      soliditySha3({type: 'uint8', value: color}, 
      prevWork, 
      leftPad('0x' + nonce, 64)));
  } while (cur.gte(target))

  logger.info('Done work for pixel (%d, %d). \nnonce\t= %d\ntarget\t= %s\nwork\t= %s', 
    x, y, nonce, target.toString(16, 64), cur.toString(16, 64));

  return await contracts.Gateway.methods
    .draw(x, y, color, leftPad('0x' + nonce, 64)).send({ from: account })
};
