// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./ERC721.sol";

contract ERC721Facet is ERC721 {
    constructor() ERC721("DIAMOND_ERC721_1", "DMER721_1") {}

    function tokenURI(
        uint256 id
    ) public view virtual override returns (string memory) {
        return "https://doesntmatter.com/{id}";
    }

    function name() external view returns (string memory) {
        Storage storage _storage = _getStorage();
        return _storage.name;
    }
}
