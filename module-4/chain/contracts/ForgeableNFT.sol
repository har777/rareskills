// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract ForgeableNFT is ERC1155, AccessControl, ERC1155Burnable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant RED = 0;
    uint256 public constant GREEN = 1;
    uint256 public constant BLUE = 2;
    uint256 public constant YELLOW = 3;
    uint256 public constant CYAN = 4;
    uint256 public constant PINK = 5;
    // Combining all should be white but black is cooler
    uint256 public constant BLACK = 6;

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setURI(string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        _mint(account, id, amount, data);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
