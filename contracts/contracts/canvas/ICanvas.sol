pragma solidity ^0.4.2;

contract ICanvas {
  // TODO: add more colors
  enum Color {
    Black,
    White
  }

  struct Pixel {
    Color color;
    address painter;
    bytes32 work;
    uint paintedAt;
  }

  event LogResize(uint128 from, uint128 to);

  function getSize() returns (uint128);
  function enlarge() external;
  function shrink() external;
  function draw(uint128 x, uint128 y, Color color, address painter, bytes32 work) external;
  function getPixel(uint128 x, uint128 y) external returns (Color, address, bytes32, uint);
}