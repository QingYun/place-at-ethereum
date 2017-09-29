pragma solidity ^0.4.2;

import "../Module.sol";
import "../canvas/ICanvas.sol";
import "../throttle/IThrottle.sol";
import "../grower/IGrower.sol";

contract Gateway is Module {
  function draw(uint128 x, uint128 y, ICanvas.Color color, bytes32 work) external {
    IThrottle(getModule("throttle")).draw(x, y, color, work);
  }
  function tryResize() external {
    IGrower(getModule("grower")).tryResize();
  }
}