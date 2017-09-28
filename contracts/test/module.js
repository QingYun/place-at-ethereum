const TestModule = artifacts.require("TestModule");

contract("Module", (accounts) => {
  it("can only be updated by the admin", () => {
    let test = null;
    return TestModule.new().then((ins) => {
      test = ins;
    }).then(() => {
      return test.setModule("module1", accounts[0])
        .catch(() => assert(false, "can't be updated by the admin"))
        .then(() => test.getModule.call("module1"))
        .then((addr) => assert.equal(addr, accounts[0], "wasn't updated to accounts[0]"))
    }).then(() => {
      return test.setModule("module2", accounts[0], { from: accounts[1] })
        .then(() => assert(false, "should not be able to be updated by non-admin addresses"))
        .catch(() => assert(true));
    })
  });

  it("only allows a particular module to use a particular function", () => {
    let test = null;
    return TestModule.new().then((ins) => {
      test = ins;
    }).then(() => {
      return test.setModule("setter", accounts[1]);
    }).then(() => {
      return test.setModule("getter", accounts[2]);
    }).then(() => {
      return test.setValue("test value", { from: accounts[1] })
        .catch(() => assert(false, "should be able to set by the setter"));
    }).then(() => {
      return test.setValue("test value", { from: accounts[2] })
        .then(() => assert(false, "should not be able to set by the getter"))
        .catch(() => {})
    }).then(() => {
      return test.getValue.call({ from: accounts[1] })
        .then(() => assert(false, "should not be able to call by the setter"))
        .catch(() => {})
    }).then(() => {
      return test.getValue.call({ from: accounts[2] })
        .catch((e) => assert(false, "should be able to call by the getter " + e));
    })
  });
});
