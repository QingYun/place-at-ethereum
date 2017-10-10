pragma solidity ^0.4.2;

import "../Module.sol";
import "./IThrottle.sol";
import "../canvas/ICanvas.sol";
import "../grower/IGrower.sol";
import "../player-activities/IPlayerActivities.sol";

contract Throttle is Module, IThrottle {
  uint constant INTERVAL = 10 seconds;

  event LogNewDifficulty(uint d);
  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 nonce) external {
    var (_, __, difficulty, prevWork, paintedAt) = ICanvas(getModule("canvas")).getPixel(x, y);
    var shift = calculateDifficultyImpl(x, y, color, paintedAt, now, difficulty);
    var work = keccak256(color, prevWork, nonce);

    require(work < (bytes32(-1) >> shift));
    // TODO: time limit check

    // TODO: a better growing step
    var newDifficulty = uint(shift) * 2;
    if (newDifficulty > 255)
      newDifficulty = 255;
    LogNewDifficulty(newDifficulty);

    IGrower(getModule("grower")).sawPainting(x, y, color);
    IPlayerActivities(getModule("player-activities")).recordPainting(msg.sender);
    ICanvas(getModule("canvas")).draw(x, y, color, msg.sender, work, uint8(newDifficulty + 1));
    LogDraw(x, y, color, msg.sender, shift);
  }

  function calculateDifficulty(uint128 x, uint128 y, ICanvas.Color color, uint at) external returns (uint8 difficulty, bytes32 prevWork) {
    var (_, __, d, work, paintedAt) = ICanvas(getModule("canvas")).getPixel(x, y);
    return (calculateDifficultyImpl(x, y, color, paintedAt, at, d), work);
  }

  event LogCalculateDifficultyImpl(uint128 x, uint128 y, ICanvas.Color color, uint paintedAt, uint at, uint8 difficulty, int newDifficulty);
  function calculateDifficultyImpl(
    uint128 x, uint128 y, ICanvas.Color color, uint paintedAt, uint at, uint8 difficulty) internal returns (uint8) {

    // TODO: improved algorithm
    require(paintedAt < at);

    var d = difficulty;
    if (d < 1) 
      d = 1;

    var shift = int(d - (((at - paintedAt) * d) / (2 * INTERVAL)));

    if (shift < 0)
      shift = 0;

    LogCalculateDifficultyImpl(x, y, color, paintedAt, at, difficulty, shift);
    return uint8(shift);
  }
}