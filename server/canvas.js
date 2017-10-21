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
  ).then(reduce(([cs, ds], row) => {
    const [c, d] = juxt([
      compose(map(parse), pluck('color')),
      map(compose(
        evolve({
          difficulty: parse,
          work: identity,
          paintedAt: parse,
        }),
        pick(['difficulty', 'work', 'paintedAt'])))
    ])(row);
    return [cs.concat([c]), ds.concat([d])];
  }, [[], []]));

  try {

  contracts.Throttle.events.LogErrorDraw({}, console.log)

  let canvasSize = parse(await contracts.Canvas.methods.getSize().call());
  logger.info('Initializing canvas at size [%d]', canvasSize);
  let [canvas, difficultyMatrix] = await initCanvas(canvasSize);
  console.log(canvas, difficultyMatrix);

  let onResize = [];
  contracts.Canvas.events.LogResize({}, async (err, { returnValues }) => {
    const {from, to} = map(parse, returnValues);
    logger.info('Canvas resized from [%d] to [%d]', from, to);
    canvasSize = to;
    [canvas, difficultyMatrix] = await initCanvas(to);
    onResize.forEach(cb => cb(to, from));
  });

  let onColorChange = [];
  contracts.Canvas.events.LogUpdateColor({}, (err, { returnValues }) => {
    const {x, y, color} = map(parse, returnValues);
    const oldColor = canvas[x][y];

    if (oldColor == color) {
      logger.info('Defending pixel (%d, %d) for color [%d]', x, y, color);
      return;
    }

    canvas[x][y] = color;
    logger.info('Pixel (%d, %d) has been changed from [%d] to [%d]', x, y, oldColor, color)
    onColorChange.forEach(cb => cb(x, y, color, oldColor));
  });

  let onDifficultyChange = [];
  contracts.Canvas.events.LogUpdateDifficulties({}, (err, { returnValues: { x, y, difficulty, paintedAt }}) => {
    zip(zip(x, y), difficulty).map(unnest).map(map(parse)).forEach(([x, y, d]) => {
      const oldPoint = difficultyMatrix[x][y];
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
    difficultyMatrix[ix][iy].work = work;
    onWorkChange.forEach(cb => cb(ix, iy, work));
  });

  let pointWatchers = {};

  onResize.push(() => {
    pointWatchers.forEach((row, x) => {
      row.forEach((cb, y) => {
        [x, y] = [x, y].map(parse);
        cb({
          color: canvas[x][y],
        });
      });
    });
  });

  /*
  onColorChange.push((x, y, color) => {
    [x, y] = [x, y].map(v => v + '');
    pointWatchers[x][y]({
      color,
    });
  });
  */

  return {
    getSize: () => canvasSize,
    getPoint: (x, y) => canvas[x][y],
    getPoints: () => canvas,
    getDifficulty: (x, y) => calcDifficulty(difficultyMatrix[x][y]),
    getDifficulties: () => difficultyMatrix.map(map(calcDifficulty)),
    getPrevWork: (x, y) => difficultyMatrix[x][y].work,
    onDifficultyChange: (cb) => onDifficultyChange.push(cb),
    onColorChange: (cb) => onColorChange.push(cb),
    onResize: (cb) => onResize.push(cb),
    watchPoint: (x, y, cb) => {
      x = '' + x;
      y = '' + y;
      pointWatchers = assocPath([x, y], pathOr([], [x, y], pointWatchers).concat(cb), pointWatchers);
      return path([x, y]).length;
    },
    unwatchPoint: (x, y, idx) => {
      pointWatchers = assocPath([x, y], path([x, y], pointWatchers).splice(idx - 1, 1), pointWatchers);
    },
  };

  } catch (e) {
    logger.error(e);
  }

}