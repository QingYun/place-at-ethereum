pragma solidity ^0.4.2;

contract ICanvas {
  // TODO: add more colors
  enum Color {
    Black,
    White
  }

  struct Pixel {
    Color color;
    uint8 difficulty;
    bytes32 work;
    uint paintedAt;
  }

  event LogResize(uint128 from, uint128 to);
  event LogUpdateColor(uint128 x, uint128 y, Color color);
  event LogUpdateDifficulties(uint128[] x, uint128[] y, uint8[] difficulty, uint paintedAt);
  event LogUpdateWork(uint128 x, uint128 y, bytes32 work);

  function getSize() returns (uint128);
  function enlarge() external;
  function shrink() external;
  function setColor(uint128 x, uint128 y, Color color) external;
  function setDifficulties(uint128[] xs, uint128[] ys, uint8[] ds, uint paintedAt) external;
  function setWork(uint128 x, uint128 y, bytes32 work) external;
  function getPixel(uint128 x, uint128 y) external returns (Color color, uint8 difficulty, bytes32 work, uint paintedAt);
}