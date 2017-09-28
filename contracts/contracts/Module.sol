pragma solidity ^0.4.2;


contract Module {
  mapping (string => address) modules;

  function Module() {
    modules["admin"] = msg.sender;
  }

  modifier onlyModule(string module) {
    require(modules[module] == msg.sender);
    _;
  }

  function setModule(string module, address addr) onlyModule("admin") {
    modules[module] = addr;
  }

  function getModule(string module) returns (address) {
    return modules[module];
  }
}