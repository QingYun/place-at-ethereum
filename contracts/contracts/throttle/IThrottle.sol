pragma solidity ^0.4.2;

import "../canvas/ICanvas.sol";

contract IThrottle {
  event LogDraw(uint128 x, uint128 y, ICanvas.Color color, uint8 difficulty);
  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 nonce) external;
  function calculateDifficulty(uint128 x, uint128 y, ICanvas.Color color, uint at) external returns (uint8);
}