pragma solidity ^0.4.2;


contract Canvas {
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

  mapping (uint => Pixel) canvas;

  uint128 constant MIN_SIZE = 3;
  uint128 size = MIN_SIZE;

  function enlarge() external {
    size += 2;
  }

  function shrink() external {
    if (size > MIN_SIZE)
      size -= 2;
  }

  function draw(uint128 x, uint128 y, Color color) external {
    var pos = getPos(x, y);
    canvas[pos].color = color;
  }

  function getPixel(uint128 x, uint128 y) external returns (Color, address, bytes32, uint) {
    var pos = getPos(x, y);
    return (canvas[pos].color, canvas[pos].painter, canvas[pos].work, canvas[pos].paintedAt);
  }

  function getPos(uint128 x, uint128 y) internal returns (uint) {
    var mid = size / 2;
    int128 _x = int128(x - mid);   
    int128 _y = int128(y - mid);   
    uint pos = uint(_x);
    pos = pos << 128;
    pos = pos | (uint(_y) & uint(2 ** 128 - 1));
    return pos;
  }
}