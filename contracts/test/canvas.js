const Canvas = artifacts.require("Canvas");

contract('Canvas', (accounts) => {
  it('can be drawn pixels', () => {
    let canvas = null;
    return Canvas.deployed().then((ins) => {
      canvas = ins;
      return ins.draw(0, 0, 1);
    }).then(() => {
      canvas.draw(1, 2, 1);
    });
  });
});