pragma solidity ^0.4.2;

import "../contracts/Controlled.sol";

contract TestControlled is Controlled {
  string value;

  function setValue(string v) onlyUser("setter") external {
    value = v;
  }

  function getValue() onlyUser("getter") external returns (string) {
    return value;
  }
}