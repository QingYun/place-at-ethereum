const { range, prop } = require('ramda');

module.exports = async (contracts) => {
  const fillCanvas = async (size) => Promise.all(
    range(0, size).map(x => Promise.all(
      range(0, size).map(y => 
        contracts.Canvas.methods.getPixel(x, y).call()
          .then(prop('color')).then(c => parseInt(c, 10))
      )
    ))
  );

  let canvasSize = parseInt(await contracts.Canvas.methods.getSize().call(), 10);
  logger.info('Initializing canvas at size [%d]', canvasSize);
  let canvas = await fillCanvas(canvasSize);

  let onResize = [];
  contracts.Canvas.events.LogResize({}, async (err, { returnValues: { from, to } }) => {
    [from, to] = [from, to].map(d => parseInt(d, 10))
    logger.info('Canvas resized from [%d] to [%d]', from, to);
    canvasSize = to;
    canvas = await fillCanvas(to);
    onResize.forEach(cb => cb(to, from));
  });

  let onColorChange = [];
  contracts.Canvas.events.LogDraw({}, (err, { returnValues: { x, y, color } }) => {
    const [nx, ny, ncolor] = [x, y, color].map(c => parseInt(c, 10));
    const oldColor = canvas[x][y];

    if (oldColor == ncolor) return;

    canvas[x][y] = color;
    logger.info('Pixel (%d, %d) has been changed from [%d] to [%d]', x, y, oldColor, color)
    onColorChange.forEach(cb => cb(nx, ny, ncolor, oldColor));
  });

  return {
    getSize: () => canvasSize,
    getPoint: (x, y) => canvas[x][y],
    getPoints: () => canvas,
    onColorChange: (cb) => onColorChange.push(cb),
    onResize: (cb) => onResize.push(cb),
  };
}