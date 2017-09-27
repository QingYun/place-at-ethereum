pragma solidity ^0.4.2;


contract Controlled {
  mapping (string => address) users;

  function Controlled() {
    users["owner"] = msg.sender;
  }

  modifier onlyUser(string user) {
    require(users[user] == msg.sender);
    _;
  }

  function setUser(string user, address addr) onlyUser("owner") returns (address oldAddr) {
    oldAddr = users[user];
    users[user] = addr;
  }

  function getUser(string user) returns (address) {
    return users[user];
  }
}