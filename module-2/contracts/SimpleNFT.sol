// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleNFT is ERC721 {
    uint256 public supply;
    uint256 public constant MAX_SUPPLY = 10;

    constructor() ERC721("SimpleNFT", "SNFT") {}

    function mint() external {
        uint256 _supply = supply;

        require(_supply < MAX_SUPPLY, "All NFTs already minted");

        _mint(_msgSender(), _supply);
        unchecked {
            _supply = _supply + 1;
        }
        supply = _supply;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTbZEZiGQhYZQuxo7RCvKz4nVN94nKh1AE6EKS9aahKjQ/";
    }
}
