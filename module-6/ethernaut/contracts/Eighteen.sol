// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautEighteenMagicNum {
    address public solver;

    constructor() {}

    function setSolver(address _solver) public {
        solver = _solver;
    }

    /*
      ____________/\\\_______/\\\\\\\\\_____
       __________/\\\\\_____/\\\///////\\\___
        ________/\\\/\\\____\///______\//\\\__
         ______/\\\/\/\\\______________/\\\/___
          ____/\\\/__\/\\\___________/\\\//_____
           __/\\\\\\\\\\\\\\\\_____/\\\//________
            _\///////////\\\//____/\\\/___________
             ___________\/\\\_____/\\\\\\\\\\\\\\\_
              ___________\///_____\///////////////__
    */
}

// https://ethernaut.openzeppelin.com/level/0xFe18db6501719Ab506683656AAf2F80243F8D0c0

// Solution
// This was really hard but I get how it works now.
// I didn't implement a function selector. Just a contract that returns 42.
//
// Bytecode of contract returning 42: 602a60005260206000f3
// PUSH1 0x2a
// PUSH1 0x00
// MSTORE
// PUSH1 0x20
// PUSH1 0x00
// RETURN
//
// Final bytecode which deploys the above and returns address: 69602a60005260206000f3600052600a6016f3
// PUSH10 0x602a60005260206000f3
// PUSH1 0x00
// MSTORE
// PUSH1 0x0A
// PUSH1 0x16
// RETURN
