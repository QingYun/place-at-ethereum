pragma solidity ^0.4.2;

import "../Module.sol";
import "./ICanvas.sol";

contract Canvas is Module, ICanvas {
  mapping (uint => Pixel) canvas;

  uint128 constant MIN_SIZE = 5;
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

  function setColor(uint128 x, uint128 y, Color color) external {
    require(calledBy("throttle"));

    var pos = getPos(x, y);
    canvas[pos].color = color;
    LogUpdateColor(x, y, color);
  }

  function setDifficulties(uint128[] xs, uint128[] ys, uint8[] ds, uint paintedAt) external {
    require(calledBy("throttle"));
    require(xs.length == ys.length && xs.length == ds.length);

    for (uint i = 0; i < xs.length; i++) {
      var pos = getPos(xs[i], ys[i]);
      canvas[pos].difficulty = ds[i];
      canvas[pos].paintedAt = paintedAt;
    }
    LogUpdateDifficulties(xs, ys, ds, paintedAt);
  }

  function setWork(uint128 x, uint128 y, bytes32 work) external {
    require(calledBy("throttle"));

    var pos = getPos(x, y);
    canvas[pos].work = work;
    LogUpdateWork(x, y, work);
  }

  function getPixel(uint128 x, uint128 y) external returns (Color color, uint8 difficulty, bytes32 work, uint paintedAt) {
    var pos = getPos(x, y);
    return (canvas[pos].color, canvas[pos].difficulty, canvas[pos].work, canvas[pos].paintedAt);
  }

  function getPos(uint128 x, uint128 y) private returns (uint) {
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