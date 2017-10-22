pragma solidity ^0.4.2;

contract IGrower {
  event LogSawPainting(uint128, uint128, uint8, uint);
  event LogTryResize();
  function sawPainting(uint128, uint128, uint8) external;
  function tryResize();
}