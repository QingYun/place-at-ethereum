const Canvas = artifacts.require("Canvas");

contract('Canvas', (accounts) => {
  it('can be drawn pixels', () => {
    let canvas = null;
    return Canvas.new().then((ins) => {
      canvas = ins;
      return ins.setModule("throttle", accounts[1]);
    }).then(() => {
      return canvas.draw(0, 0, 1, accounts[0], 0x0, { from: accounts[1] });
    }).then(() => {
      canvas.draw(1, 2, 1, accounts[0], 0x0, { from: accounts[1] });
    });
  });
});