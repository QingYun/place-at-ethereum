const { toBN, leftPad, soliditySha3 } = require('web3').utils;
const sleep = require('sleep-promise');

module.exports = (contracts, account) => async function draw (x, y, color) {
  logger.info('Start drawing pixel (%d, %d) Color: %d', x, y, color);

  try {

    // needs to be a second epoch
    let t = Date.now() / 1000;
    // TODO: update target
    let nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    //const {difficulty, prevWork} = await contracts.Throttle.methods
    //  .calculateDifficulty(x, y, color, t).call()
    const difficulty = 0;
    const prevWork = leftPad('0x0', 64);
    const target = toBN(2)
      .pow(toBN(256))
      .subn(1)
      .ushrn(parseInt(difficulty, 10));

    logger.info('Get work for pixel (%d, %d). \nD\t= %d\nprevW\t= %s\ntarget\t= %s', 
      x, y, difficulty, prevWork, target.toString(16, 64));

    let cur = null;
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
      .draw(x, y, color, leftPad('0x' + nonce, 64)).send({ from: account });

  } catch (e) {
    logger.error('On drawing (%d, %d) to [%d]', x, y, color);
    logger.error(e);
    logger.info('retrying drawing (%d, %d) to [%d]', x, y, color);
    await sleep(1000 - (Date.now() % 1000));
    // TODO: recursion limit
    return await draw(x, y, color)
  }
};
