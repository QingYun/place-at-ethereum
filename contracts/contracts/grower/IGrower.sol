pragma solidity ^0.4.2;

import "../canvas/ICanvas.sol";

contract IGrower {
  function sawPainting(uint128, uint128, ICanvas.Color) external;
  function tryResize();
}