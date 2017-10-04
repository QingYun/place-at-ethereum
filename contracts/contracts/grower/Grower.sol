pragma solidity ^0.4.2;

import "../Module.sol";
import "./IGrower.sol";

contract Grower is Module, IGrower {
  uint size;
  uint counter;

  function sawPainting(uint128 x, uint128 y, ICanvas.Color color) external {
    require(calledBy("throttle"));

    counter++;
    LogSawPainting(x, y, color, counter);
  }

  function tryResize() {
    // TODO: shrink
    LogTryResize();
    if (counter / (size * size) >= 5) {
      var canvas = ICanvas(getModule("canvas"));
      canvas.enlarge(); 
      counter = 0;
      size = canvas.getSize();
    }
  }
}