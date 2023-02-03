// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./Ownable-05.sol";

contract EthernautNineteenAlienCodex is Ownable {
    bool public contact;
    bytes32[] public codex;

    modifier contacted() {
        assert(contact);
        _;
    }

    function make_contact() public {
        contact = true;
    }

    function record(bytes32 _content) public contacted {
        codex.push(_content);
    }

    function retract() public contacted {
        codex.length--;
    }

    function revise(uint i, bytes32 _content) public contacted {
        codex[i] = _content;
    }
}

// https://ethernaut.openzeppelin.com/level/0x40055E69E7EB12620c8CCBCCAb1F187883301c30

// Solution
//
