pragma solidity ^0.4.2;

contract IPlayerActivities {
  function recordPainting(address) external;
  function getLastPaintingTime(address) external returns (uint);
}