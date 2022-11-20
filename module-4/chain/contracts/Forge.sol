// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ForgeableNFT.sol";

error InCooldown();
error InvalidId();

contract Forge {
    ForgeableNFT public immutable forgeableNFT;

    mapping(address => uint256) public redGreenBlueLastMintedTime;

    constructor(ForgeableNFT _forgeableNFT) {
        forgeableNFT = _forgeableNFT;
    }

    modifier notInCooldown() {
        if (isMintInCooldown()) {
            revert InCooldown();
        }
        _;
    }

    function isMintInCooldown() public view returns (bool mintInCooldown) {
        mintInCooldown =
            block.timestamp <= redGreenBlueLastMintedTime[msg.sender] + 60;
    }

    function mint(uint256 id) external notInCooldown {
        if (id > 2) {
            revert InvalidId();
        }
        redGreenBlueLastMintedTime[msg.sender] = block.timestamp;
        forgeableNFT.mint(msg.sender, id, 1, "");
    }

    function burn(uint256 id) external {
        if (id < 3 || id > 6) {
            revert InvalidId();
        }
        forgeableNFT.burn(msg.sender, id, 1);
    }

    function trade(uint256 oldId, uint256 newId) external {
        if (newId > 2) {
            revert InvalidId();
        }
        forgeableNFT.burn(msg.sender, oldId, 1);
        forgeableNFT.mint(msg.sender, newId, 1, "");
    }

    function forge(uint256 id) external {
        if (id < 3 || id > 6) {
            revert InvalidId();
        }

        uint256[] memory ids;
        uint256[] memory quantities;

        if (id == 6) {
            ids = new uint256[](3);
            quantities = new uint256[](3);
            ids[0] = 0;
            ids[1] = 1;
            ids[2] = 2;
            quantities[0] = 1;
            quantities[1] = 1;
            quantities[2] = 1;
        } else {
            quantities = new uint256[](2);
            quantities[0] = 1;
            quantities[1] = 1;

            ids = new uint256[](2);
            if (id == 3) {
                ids[0] = 0;
                ids[1] = 1;
            } else if (id == 4) {
                ids[0] = 1;
                ids[1] = 2;
            } else if (id == 5) {
                ids[0] = 0;
                ids[1] = 2;
            }
        }

        forgeableNFT.burnBatch(msg.sender, ids, quantities);
        forgeableNFT.mint(msg.sender, id, 1, "");
    }
}
