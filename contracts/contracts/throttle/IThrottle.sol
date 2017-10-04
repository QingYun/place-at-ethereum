pragma solidity ^0.4.2;

import "../canvas/ICanvas.sol";

contract IThrottle {
  event LogDrawThrottle(uint128, uint128, ICanvas.Color, address);
  function draw(uint128, uint128, ICanvas.Color, bytes32) external;
  function getTarget(uint128, uint128, ICanvas.Color, uint) external returns (bytes32);
}