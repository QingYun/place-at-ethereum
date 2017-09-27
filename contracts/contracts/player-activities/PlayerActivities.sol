pragma solidity ^0.4.2;

import "../Controlled.sol";

contract PlayerAcitivies is Controlled {
  mapping (address => uint) lastPaintingAt;

  function recordPainting(address player) onlyUser("throttle") external {
    lastPaintingAt[player] = now;
  }

  function getLastPaintingTime(address player) external returns (uint) {
    return lastPaintingAt[player];
  }
}