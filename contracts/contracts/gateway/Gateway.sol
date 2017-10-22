pragma solidity ^0.4.2;

import "../Module.sol";
import "../throttle/IThrottle.sol";
import "../grower/IGrower.sol";

contract Gateway is Module {
  event LogDraw(uint128, uint128, uint8, bytes32);
  event LogCall(string, address);
  function draw(uint128 x, uint128 y, uint8 color, bytes32 work) external {
    IThrottle(getModule("throttle")).draw(x, y, color, work);
    LogDraw(x, y, color, work);
  }
  event LogTryResize();
  function tryResize() external {
    IGrower(getModule("grower")).tryResize();
    LogTryResize();
  }
}