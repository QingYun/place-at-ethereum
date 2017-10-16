const { range, zip, unnest, map, flip, lift, reduce, juxt, pluck, pick, compose, evolve, identity } = require('ramda');

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
    return [cs.concat(c), ds.concat(d)];
  }, [[], []]));

  try {

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

    if (oldColor == color) return;

    canvas[x][y] = color;
    logger.info('Pixel (%d, %d) has been changed from [%d] to [%d]', x, y, oldColor, color)
    onColorChange.forEach(cb => cb(x, y, color, oldColor));
  });

  contracts.Canvas.events.LogUpdateDifficulties({}, (err, { returnValues: { x, y, difficulty, paintedAt }}) => {
    zip(zip(x, y), difficulty).map(unnest).map(lift(parse)).forEach(([x, y, d]) => {
      logger.info('The difficulty of pixel (%d, %d) has been changed to [%d] at [%s]', x, y, d, paintedAt);
    });
  });

  return {
    getSize: () => canvasSize,
    getPoint: (x, y) => canvas[x][y],
    getPoints: () => canvas,
    onColorChange: (cb) => onColorChange.push(cb),
    onResize: (cb) => onResize.push(cb),
  };

  } catch (e) {
    logger.error(e);
  }

}