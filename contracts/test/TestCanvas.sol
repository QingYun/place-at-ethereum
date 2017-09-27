pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/canvas/Canvas.sol";

contract TestCanvas is Canvas {
  function testRepositionOnSizeChanges() {
    size = 3;
    var p00 = getPos(0, 0);
    var p01 = getPos(0, 1);
    var p11 = getPos(1, 1);
    var p02 = getPos(0, 2);
    var p20 = getPos(2, 0);
    var p22 = getPos(2, 2);

    size = 5;
    Assert.equal(getPos(1, 1), p00, "Positions should move left down by 1");
    Assert.equal(getPos(1, 2), p01, "Positions should move left down by 1");
    Assert.equal(getPos(2, 2), p11, "Positions should move left down by 1");
    Assert.equal(getPos(1, 3), p02, "Positions should move left down by 1");
    Assert.equal(getPos(3, 1), p20, "Positions should move left down by 1");
    Assert.equal(getPos(3, 3), p22, "Positions should move left down by 1");
  }
}