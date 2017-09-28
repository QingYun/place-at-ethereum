pragma solidity ^0.4.2;

import "../Module.sol";
import "../canvas/Canvas.sol";

contract Grower is Module {
  uint size;
  uint counter;

  function sawPainting(uint128, uint128, Canvas.Color) onlyModule("throttle") external {
    counter++;
  }

  function tryResize() {
    // TODO: shrink
    if (counter / (size * size) >= 5) {
      var canvas = Canvas(getModule("canvas"));
      canvas.enlarge(); 
      counter = 0;
      size = canvas.size();
    }
  }
}