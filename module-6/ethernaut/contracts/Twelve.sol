// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthernautTwelvePrivacy {
    bool public locked = true;
    uint256 public ID = block.timestamp;
    uint8 private flattening = 10;
    uint8 private denomination = 255;
    uint16 private awkwardness = uint16(block.timestamp);
    bytes32[3] private data;

    constructor(bytes32[3] memory _data) {
        data = _data;
    }

    function unlock(bytes16 _key) public {
        require(_key == bytes16(data[2]));
        locked = false;
    }

    /*
      A bunch of super advanced solidity algorithms...

        ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
        .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
        *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
        `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
        ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
    */
}

// https://ethernaut.openzeppelin.com/level/0xcAac6e4994c2e21C5370528221c226D1076CfDAB

// Solution
// Unlocking the contract simply means fetching the last value inside
// the data array, casting it to bytes16 and calling unlock with it
// data[2] is present in the 5th storage slot of the contract
// locked and ID take up slots 0 and 1; flattening, denomination and
// awkwardness together take up slot 2; data[0] and data[1] take up slots
// 3 and 4; and hence data[2] is in slot 5
