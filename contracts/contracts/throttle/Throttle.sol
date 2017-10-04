pragma solidity ^0.4.2;

import "../Module.sol";
import "./IThrottle.sol";
import "../canvas/ICanvas.sol";
import "../grower/IGrower.sol";
import "../player-activities/IPlayerActivities.sol";

contract Throttle is Module, IThrottle {
  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 nonce) external {
    var (_, __, prevWork, ___) = ICanvas(getModule("canvas")).getPixel(x, y);
    var target = getTargetImpl(x, y, color, now, prevWork);
    var work = keccak256(color, prevWork, nonce);

    //require(work < target);

    IGrower(getModule("grower")).sawPainting(x, y, color);
    IPlayerActivities(getModule("player-activities")).recordPainting(msg.sender);
    ICanvas(getModule("canvas")).draw(x, y, color, msg.sender, work);
    LogDrawThrottle(x, y, color, msg.sender);
  }

  function getTarget(uint128 x, uint128 y, ICanvas.Color color, uint at) external returns (bytes32) {
    var (_, __, prevWork, ___) = ICanvas(getModule("canvas")).getPixel(x, y);
    return getTargetImpl(x, y, color, at, prevWork);
  }

  function getTargetImpl(uint128 x, uint128 y, ICanvas.Color color, uint at, bytes32 prevWork) internal returns (bytes32) {
    // TODO: actually calculate the difficulty
    return prevWork;
  }
}