pragma solidity ^0.4.2;

import "../Module.sol";
import "./ICanvas.sol";

contract Canvas is Module, ICanvas {
  mapping (uint => Pixel) canvas;

  uint128 constant MIN_SIZE = 3;
  uint128 constant RESIZE_STEP = 2;
  uint128 size = MIN_SIZE;

  function getSize() returns (uint128) { return size; }

  function enlarge() external {
    require(calledBy("grower"));

    LogResize(size, size + RESIZE_STEP);
    size += RESIZE_STEP;
  }

  function shrink() external {
    require(calledBy("grower"));

    if (size > MIN_SIZE) {
      LogResize(size, size - RESIZE_STEP);
      size -= RESIZE_STEP;
    }
  }

  function draw(uint128 x, uint128 y, Color color, address painter, bytes32 work, uint8 difficulty) external {
    require(calledBy("throttle"));

    var pos = getPos(x, y);
    Pixel storage pixel = canvas[pos];
    pixel.color = color;
    pixel.painter = painter;
    pixel.paintedAt = now;
    pixel.work = work;
    pixel.difficulty = difficulty;
    LogDraw(x, y, color, painter, work, difficulty);
  }

  function getPixel(uint128 x, uint128 y) external returns (Color, address, uint8, bytes32, uint) {
    var pos = getPos(x, y);
    LogGetPixel(x, y);
    return (canvas[pos].color, canvas[pos].painter, canvas[pos].difficulty, canvas[pos].work, canvas[pos].paintedAt);
  }

  function getPos(uint128 x, uint128 y) internal returns (uint) {
    require(x >= 0 && x < size);
    require(y >= 0 && y < size);

    var mid = size / 2;
    int128 _x = int128(x - mid);   
    int128 _y = int128(y - mid);   
    uint pos = uint(_x);
    pos = pos << 128;
    pos = pos | (uint(_y) & uint(2 ** 128 - 1));
    return pos;
  }
}