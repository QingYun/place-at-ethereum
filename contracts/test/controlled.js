const TestControlled = artifacts.require("TestControlled");

contract("Controlled", (accounts) => {
  it("can only be updated by the owner", () => {
    let test = null;
    return TestControlled.new().then((ins) => {
      test = ins;
    }).then(() => {
      return test.setUser("user1", accounts[0])
        .catch(() => assert(false, "can't be updated by the owner"))
        .then(() => test.getUser.call("user1"))
        .then((addr) => assert.equal(addr, accounts[0], "wasn't updated to accounts[0]"))
    }).then(() => {
      return test.setUser("user2", accounts[0], { from: accounts[1] })
        .then(() => assert(false, "should not be able to be updated by non-owner addresses"))
        .catch(() => assert(true));
    });
  })
});
