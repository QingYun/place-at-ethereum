pragma solidity ^0.4.2;

import "../Module.sol";

contract PlayerActivities is Module {
  mapping (address => uint) lastPaintingAt;

  function recordPainting(address player) onlyModule("throttle") external {
    lastPaintingAt[player] = now;
  }

  function getLastPaintingTime(address player) external returns (uint) {
    return lastPaintingAt[player];
  }
}