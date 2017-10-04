pragma solidity ^0.4.2;

import "../Module.sol";
import "../canvas/ICanvas.sol";
import "../throttle/IThrottle.sol";
import "../grower/IGrower.sol";

contract Gateway is Module {
  event LogDraw(uint128, uint128, ICanvas.Color, bytes32);
  event LogCall(string, address);
  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 work) external {
    IThrottle(getModule("throttle")).draw(x, y, color, work);
    LogDraw(x, y, color, work);
  }
  event LogTryResize();
  function tryResize() external {
    IGrower(getModule("grower")).tryResize();
    LogTryResize();
  }
}