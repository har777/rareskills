// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract EnumerableNFT is ERC721, ERC721Enumerable {
    uint256 public supply;
    uint256 public constant MAX_SUPPLY = 20;

    constructor() ERC721("EnumerableNFT", "ENFT") {}

    function safeMint() external {
        uint256 _supply = supply;
        require(_supply < MAX_SUPPLY, "All NFTs already minted");
        unchecked {
            _supply = _supply + 1;
        }
        _safeMint(_msgSender(), _supply);
        supply = _supply;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
