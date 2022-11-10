// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract PrimeNFTCounter {
    uint256 private constant TOKENS_PER_DAY = 10e18;

    IERC721Enumerable public immutable nft;

    constructor(IERC721Enumerable _nft) {
        nft = _nft;
    }

    function getPrimeNFTCount(
        address user
    ) external view returns (uint256 primeCount) {
        uint256 userNFTCount = nft.balanceOf(user);
        uint256 index = 0;
        while (index < userNFTCount) {
            uint256 tokenId = nft.tokenOfOwnerByIndex(user, index);
            if (_isPrime(tokenId)) {
                unchecked {
                    primeCount += 1;
                }
            }
            unchecked {
                index += 1;
            }
        }
    }

    function _isPrime(uint256 number) internal pure returns (bool) {
        if (number > 1) {
            uint256 index = 2;
            uint256 limit = Math.sqrt(number) + 1;
            while (index < limit) {
                if (number % index == 0) {
                    return false;
                }
                unchecked {
                    index += 1;
                }
            }
            return true;
        } else {
            return false;
        }
    }
}
