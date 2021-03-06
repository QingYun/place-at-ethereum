const { range, zip, unnest, map, reduce, juxt, pluck, pick, compose, evolve, identity, assocPath, pathOr, path } = require('ramda');
const { toInt, toIntObj } = require('./utils');
const { addDrawing } = require('./db');

const INTERVAL = 10;

function calcDifficulty({ difficulty, paintedAt }) {
  const t = Date.now() / 1000;
  const d = Math.max(1, difficulty);
  return Math.max(0, d - Math.floor((t - paintedAt) * d / (2 * INTERVAL)));
}

module.exports = async (contracts) => {
  const initCanvas = (size) => Promise.all(
    range(0, size).map(x => Promise.all(
      range(0, size).map(y =>
        contracts.Canvas.methods.getPixel(x, y).call()
      )
    ))
  ).then(map(map(compose(
    evolve({
      color: toInt,
      difficulty: toInt,
      work: identity,
      paintedAt: toInt,
    }),
    pick(['color', 'difficulty', 'work', 'paintedAt']
  )))));

  try {

  contracts.Throttle.events.LogErrorDraw({}, console.log)

  let canvasSize = toInt(await contracts.Canvas.methods.getSize().call());
  logger.info('Initializing canvas at size [%d]', canvasSize);
  let canvas = await initCanvas(canvasSize);

  let onResize = [];
  contracts.Canvas.events.LogResize({}, async (err, { returnValues }) => {
    const {from, to} = toIntObj(returnValues);
    logger.info('Canvas resized from [%d] to [%d]', from, to);
    canvasSize = to;
    canvas = await initCanvas(to);
    onResize.forEach(cb => cb(to, from));
  });

  let onColorChange = [];
  contracts.Canvas.events.LogUpdateColor({}, (err, { returnValues }) => {
    const {x, y, color, at} = toIntObj(returnValues);
    const oldPoint = canvas[x][y];

    if (oldPoint.color == color) {
      logger.info('Defending pixel (%d, %d) for color [%d]', x, y, color);
    }

    logger.info('Pixel (%d, %d) has been changed from [%d] to [%d]', x, y, oldPoint.color, color)
    oldPoint.color = color;
    addDrawing({ x, y, color, at });
    onColorChange.forEach(cb => cb(x, y, color, oldPoint.color));
  });

  let onDifficultyChange = [];
  contracts.Canvas.events.LogUpdateDifficulties({}, (err, { returnValues: { x, y, difficulty, paintedAt }}) => {
    paintedAt = toInt(paintedAt);
    zip(zip(x, y), difficulty).map(unnest).map(toIntObj).forEach(([x, y, d]) => {
      const oldPoint = canvas[x][y];
      logger.info('Difficulty change of pixel (%d, %d): [%d] at [%d] => [%d] at [%d]', x, y, oldPoint.difficulty, oldPoint.paintedAt, d, paintedAt);
      oldPoint.difficulty = d;
      oldPoint.paintedAt = paintedAt;
      onDifficultyChange.forEach(cb => cb(x, y, d, paintedAt));
    });
  });

  let onWorkChange = [];
  contracts.Canvas.events.LogUpdateWork({}, (err, { returnValues: {x, y, work} }) => {
    const ix = toInt(x);
    const iy = toInt(y);
    canvas[ix][iy].work = work;
    onWorkChange.forEach(cb => cb(ix, iy, work));
  });

  return {
    getSize: () => canvasSize,
    getPoint: (x, y) => canvas[x][y],
    getPoints: () => canvas,
    getDifficulty: (x, y) => calcDifficulty(canvas[x][y]),
    onDifficultyChange: (cb) => onDifficultyChange.push(cb),
    onColorChange: (cb) => onColorChange.push(cb),
    onResize: (cb) => onResize.push(cb),
  };

  } catch (e) {
    logger.error(e);
  }

}