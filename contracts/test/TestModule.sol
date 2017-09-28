pragma solidity ^0.4.2;

import "../contracts/Module.sol";

contract TestModule is Module {
  string value;

  function setValue(string v) onlyModule("setter") external {
    value = v;
  }

  function getValue() onlyModule("getter") external returns (string) {
    return value;
  }
}