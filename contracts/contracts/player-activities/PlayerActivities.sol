pragma solidity ^0.4.2;

import "../Module.sol";
import "./IPlayerActivities.sol";

contract PlayerActivities is Module, IPlayerActivities {
  mapping (address => uint) lastPaintingAt;

  function recordPainting(address player) external {
    require(calledBy("throttle"));

    lastPaintingAt[player] = now;
  }

  function getLastPaintingTime(address player) external returns (uint) {
    return lastPaintingAt[player];
  }
}