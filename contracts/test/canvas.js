const Canvas = artifacts.require("Canvas");

contract('Canvas', (accounts) => {
  it('can be drawn pixels', () => {
    let canvas = null;
    return Canvas.deployed().then((ins) => {
      canvas = ins;
      return ins.setUser("throttle", accounts[0]);
    }).then(() => {
      return canvas.draw(0, 0, 1, accounts[0], 0x0);
    }).then(() => {
      canvas.draw(1, 2, 1, accounts[0], 0x0);
    });
  });
});