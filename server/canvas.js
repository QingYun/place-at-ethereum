const { range, zip, unnest, map, flip, reduce, juxt, pluck, pick, compose, evolve, identity, assocPath, pathOr, path } = require('ramda');

const INTERVAL = 10;

function calcDifficulty({ difficulty, paintedAt }) {
  const t = Date.now() / 1000;
  const d = Math.max(1, difficulty);
  return Math.max(0, d - Math.floor((t - paintedAt) * d / (2 * INTERVAL)));
}

module.exports = async (contracts) => {
  const parse = flip(parseInt)(10);

  const initCanvas = (size) => Promise.all(
    range(0, size).map(x => Promise.all(
      range(0, size).map(y =>
        contracts.Canvas.methods.getPixel(x, y).call()
      )
    ))
  ).then(map(map(compose(
    evolve({
      color: parse,
      difficulty: parse,
      work: identity,
      paintedAt: parse,
    }),
    pick(['color', 'difficulty', 'work', 'paintedAt']
  )))));

  try {

  contracts.Throttle.events.LogErrorDraw({}, console.log)

  let canvasSize = parse(await contracts.Canvas.methods.getSize().call());
  logger.info('Initializing canvas at size [%d]', canvasSize);
  let canvas = await initCanvas(canvasSize);

  let onResize = [];
  contracts.Canvas.events.LogResize({}, async (err, { returnValues }) => {
    const {from, to} = map(parse, returnValues);
    logger.info('Canvas resized from [%d] to [%d]', from, to);
    canvasSize = to;
    canvas = await initCanvas(to);
    onResize.forEach(cb => cb(to, from));
  });

  let onColorChange = [];
  contracts.Canvas.events.LogUpdateColor({}, (err, { returnValues }) => {
    const {x, y, color} = map(parse, returnValues);
    const oldPoint = canvas[x][y];

    if (oldPoint.color == color) {
      logger.info('Defending pixel (%d, %d) for color [%d]', x, y, color);
      return;
    }

    oldPoint.color = color;
    logger.info('Pixel (%d, %d) has been changed from [%d] to [%d]', x, y, oldPoint.color, color)
    onColorChange.forEach(cb => cb(x, y, color, oldPoint.color));
  });

  let onDifficultyChange = [];
  contracts.Canvas.events.LogUpdateDifficulties({}, (err, { returnValues: { x, y, difficulty, paintedAt }}) => {
    zip(zip(x, y), difficulty).map(unnest).map(map(parse)).forEach(([x, y, d]) => {
      const oldPoint = canvas[x][y];
      logger.info('Difficulty change of pixel (%d, %d): [%d] at [%s] => [%d] at [%s]', x, y, oldPoint.difficulty, oldPoint.paintedAt, d, paintedAt);
      oldPoint.difficulty = d;
      oldPoint.paintedAt = paintedAt;
      onDifficultyChange.forEach(cb => cb(x, y, difficulty, paintedAt));
    });
  });

  let onWorkChange = [];
  contracts.Canvas.events.LogUpdateWork({}, (err, { returnValues: {x, y, work} }) => {
    const ix = parse(x);
    const iy = parse(y);
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