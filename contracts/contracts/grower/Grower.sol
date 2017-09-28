pragma solidity ^0.4.2;

import "../Module.sol";
import "./IGrower.sol";

contract Grower is Module, IGrower {
  uint size;
  uint counter;

  function sawPainting(uint128, uint128, ICanvas.Color) external {
    require(calledBy("throttle"));

    counter++;
  }

  function tryResize() {
    // TODO: shrink
    if (counter / (size * size) >= 5) {
      var canvas = ICanvas(getModule("canvas"));
      canvas.enlarge(); 
      counter = 0;
      size = canvas.getSize();
    }
  }
}