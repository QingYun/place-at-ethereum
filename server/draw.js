const { toBN, leftPad, soliditySha3 } = require('web3').utils;
const sleep = require('sleep-promise');

function tryFindNonce(color, target, prevWork) {
  let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  // NOTE: for demo
  return nonce;
  const stop = nonce + 100000;
  let cur = null;
  do {
    nonce++;
    cur = toBN(
      soliditySha3({type: 'uint8', value: color}, 
      prevWork, 
      leftPad('0x' + nonce, 64)));
  } while (cur.gte(target) && nonce < stop);

  return nonce > stop ? -1 : nonce;
}

module.exports = (contracts, account, canvas) => async function draw (x, y, color) {
  logger.info('Start drawing pixel (%d, %d) Color: %d', x, y, color);

  try {
    let difficulty = 0;
    let target = null;
    let nonce = -1;

    while (nonce === -1) {
      difficulty = Math.max(0, canvas.getDifficulty(x, y) - (color == canvas.getPoint(x, y).color));
      target = toBN(2)
        .pow(toBN(256))
        .subn(1)
        .ushrn(difficulty);
      nonce = tryFindNonce(color, target, canvas.getPoint(x, y).work);
    }

    logger.info('Done work for pixel (%d, %d). \nnonce\t= %d\ntarget\t= %s', 
      x, y, nonce, target.toString(16, 64));

    return await contracts.Gateway.methods
      .draw(x, y, color, leftPad('0x' + nonce, 64)).send({ from: account });

  } catch (e) {
    logger.error('On drawing (%d, %d) to [%d]', x, y, color);
    logger.error(e);
    logger.info('retrying drawing (%d, %d) to [%d]', x, y, color);
    await sleep(1000 - (Date.now() % 1000));
    // TODO: recursion limit
    return draw(x, y, color)
  }
};
