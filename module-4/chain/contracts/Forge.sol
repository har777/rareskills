// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ForgeableNFT.sol";

error InCooldown();

contract Forge {
    ForgeableNFT public immutable forgeableNFT;

    mapping(address => uint256) redGreenBlueLastMintedTime;

    constructor(ForgeableNFT _forgeableNFT) {
        forgeableNFT = _forgeableNFT;
    }

    modifier notInCooldown() {
        if (block.timestamp <= redGreenBlueLastMintedTime[msg.sender] + 60) {
            revert InCooldown();
        }
        _;
    }

    function mintRed() external notInCooldown {
        redGreenBlueLastMintedTime[msg.sender] = block.timestamp;
        forgeableNFT.mint(msg.sender, 0, 1, "");
    }

    function mintGreen() external notInCooldown {
        redGreenBlueLastMintedTime[msg.sender] = block.timestamp;
        forgeableNFT.mint(msg.sender, 1, 1, "");
    }

    function mintBlue() external notInCooldown {
        redGreenBlueLastMintedTime[msg.sender] = block.timestamp;
        forgeableNFT.mint(msg.sender, 2, 1, "");
    }

    function forgeYellow() external {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory quantities = new uint256[](2);
        ids[0] = 0;
        ids[1] = 1;
        quantities[0] = 1;
        quantities[1] = 1;

        forgeableNFT.burnBatch(msg.sender, ids, quantities);
        forgeableNFT.mint(msg.sender, 3, 1, "");
    }

    function forgeCyan() external {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory quantities = new uint256[](2);
        ids[0] = 1;
        ids[1] = 2;
        quantities[0] = 1;
        quantities[1] = 1;

        forgeableNFT.burnBatch(msg.sender, ids, quantities);
        forgeableNFT.mint(msg.sender, 4, 1, "");
    }

    function forgePink() external {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory quantities = new uint256[](2);
        ids[0] = 0;
        ids[1] = 2;
        quantities[0] = 1;
        quantities[1] = 1;

        forgeableNFT.burnBatch(msg.sender, ids, quantities);
        forgeableNFT.mint(msg.sender, 5, 1, "");
    }

    function forgeBlack() external {
        uint256[] memory ids = new uint256[](3);
        uint256[] memory quantities = new uint256[](3);
        ids[0] = 0;
        ids[1] = 1;
        ids[2] = 2;
        quantities[0] = 1;
        quantities[1] = 1;
        quantities[2] = 1;

        forgeableNFT.burnBatch(msg.sender, ids, quantities);
        forgeableNFT.mint(msg.sender, 5, 1, "");
    }
}
