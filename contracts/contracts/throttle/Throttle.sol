pragma solidity ^0.4.2;

import "../Module.sol";
import "./IThrottle.sol";
import "../canvas/ICanvas.sol";
import "../grower/IGrower.sol";
import "../player-activities/IPlayerActivities.sol";

contract Throttle is Module, IThrottle {
  uint constant INTERVAL = 10 seconds;

  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 nonce) external {
    // TODO: time limit check

    var canvas = ICanvas(getModule("canvas"));
    var (oldColor, difficulty, prevWork, paintedAt) = canvas.getPixel(x, y);
    var shift = calculateDifficultyImpl(paintedAt, now, difficulty, oldColor == color);
    var work = keccak256(color, prevWork, nonce);

    require(work >= (bytes32(-1) >> shift));

    redistDifficulties(x, y);

    IGrower(getModule("grower")).sawPainting(x, y, color);
    IPlayerActivities(getModule("player-activities")).recordPainting(msg.sender);
    canvas.setColor(x, y, color);
    canvas.setWork(x, y, work);
    LogDraw(x, y, color, shift);
  }

  function calculateDifficulty(uint128 x, uint128 y, ICanvas.Color color, uint at) external returns (uint8) {
    var (oldColor, difficulty,, paintedAt) = ICanvas(getModule("canvas")).getPixel(x, y);
    return calculateDifficultyImpl(paintedAt, at, difficulty, color == oldColor);
  }

  function redistDifficulties(uint128 x, uint128 y) private {
    var canvas = ICanvas(getModule("canvas"));

    var (xl, xh, yl, yh) = getRedistRange(x, y);

    var xs = new uint128[](uint((xh - xl) * (yh - yl)));
    var ys = new uint128[](uint((xh - xl) * (yh - yl)));
    var ds = new uint8[](uint((xh - xl) * (yh - yl)));

    for (int i = 0; i < yh - yl; i++) {
      for (int j = 0; j < xh - xl; j++) {
        xs[uint(i * (xh - xl) + j)] = uint128(j + xl);
        ys[uint(i * (xh - xl) + j)] = uint128(i + yl);
        ds[uint(i * (xh - xl) + j)] = getRedistDifficulty(canvas, j + xl, i + yl, x, y);
      }
    }

    canvas.setDifficulties(xs, ys, ds, now);
  }

  function getRedistDifficulty(ICanvas canvas, int x, int y, uint128 cx, uint128 cy) private returns (uint8) {
    int disX = x - cx;
    if (disX < 0)
      disX = -disX;

    int disY = y - cy;
    if (disY < 0)
      disY = -disY;

    int dis = disX;
    if (disY > dis)
      dis = disY;

    var inc = 4 - dis;

    var (,, oldDifficulty,, lastAction) = canvas.getPixel(uint128(x), uint128(y));
    var newDifficulty = int(calculateDifficultyImpl(lastAction, now, oldDifficulty, false)) + inc;

    if (newDifficulty > 255)
      newDifficulty = 255;

    return uint8(newDifficulty);
  }

  function getRedistRange(uint128 x, uint128 y) private returns (int xl, int xh, int yl, int yh) {
    var canvas = ICanvas(getModule("canvas"));
    var size = canvas.getSize();
    
    xl = int(x) - 3;
    if (xl < 0)
      xl = 0;

    xh = int(x) + 4;
    if (xh > size)
      xh = size;

    yl = int(y) - 3;
    if (yl < 0)
      yl = 0;

    yh = int(y) + 4;
    if (yh > size)
      yh = size;
  }

  function calculateDifficultyImpl(uint paintedAt, uint at, uint8 difficulty, bool easy) private returns (uint8) {

    require(paintedAt < at);

    var d = difficulty;
    if (d < 1) 
      d = 1;

    var shift = int(d - (((at - paintedAt) * d) / (2 * INTERVAL)));

    // make it easier for defending (painting it to the same color)
    if (easy)
      shift -= 1;

    if (shift < 0)
      shift = 0;

    // the original difficulty will not greater than 255 (see draw())
    // so it's safe to convert shift(d - some positive number) to a uint8
    return uint8(shift);
  }
}