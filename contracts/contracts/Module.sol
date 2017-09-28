pragma solidity ^0.4.2;


contract Module {
  mapping (string => address) modules;

  function Module() {
    modules["admin"] = msg.sender;
  }

  modifier onlyModule(string module) {
    require(calledBy(module));
    _;
  }

  function calledBy(string module) returns (bool) {
    return modules[module] == msg.sender;
  }

  function setModule(string module, address addr) onlyModule("admin") {
    modules[module] = addr;
  }

  function getModule(string module) returns (address) {
    return modules[module];
  }
}