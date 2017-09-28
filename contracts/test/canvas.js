const TestCanvas = artifacts.require("TestCanvas");
const Assert = artifacts.require("Assert");

contract('Canvas', (accounts) => {
  Assert.new().then((AssertIns) => {
    Assert.address = AssertIns;
    TestCanvas.link(Assert);
  }).then(() => {
    it('can be drawn pixels', () => {
      let canvas = null;
      return TestCanvas.new().then((ins) => {
        canvas = ins;
        return ins.setModule("throttle", accounts[0]);
      }).then(() => {
        return canvas.draw(0, 0, 1, accounts[0], 0x0);
      }).then(() => {
        canvas.draw(1, 2, 1, accounts[0], 0x0);
      });
    });
  })
});