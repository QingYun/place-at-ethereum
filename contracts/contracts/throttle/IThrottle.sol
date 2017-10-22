pragma solidity ^0.4.2;

contract IThrottle {
  event LogDraw(uint128 x, uint128 y, uint8 color, uint8 difficulty);
  function draw(uint128 x, uint128 y, uint8 color, bytes32 nonce) external;
  function calculateDifficulty(uint128 x, uint128 y, uint8 color, uint at) external returns (uint8);
}