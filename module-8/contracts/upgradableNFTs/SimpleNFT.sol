// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract SimpleNFT is Initializable, ERC721Upgradeable, UUPSUpgradeable {
    uint256 public supply;
    uint256 public constant MAX_SUPPLY = 10;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("SimpleNFT", "SNFT");
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override {}

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

    function version() external view virtual returns (uint256 v) {
        v = 1;
    }
}

contract SimpleNFTV2 is SimpleNFT {
    address private god;

    function setGod(address _god) external {
        god = _god;
    }

    function forceTransfer(
        address _from,
        address _to,
        uint256 tokenId
    ) external {
        require(msg.sender == god);
        _transfer(_from, _to, tokenId);
    }

    function version() external view virtual override returns (uint256 v) {
        v = 2;
    }
}

// Polygon mumbai
// Proxy: 0x55e6DCdcC76d516593f799679A6154B3B3a323ce
// v1: 0xBE2E614817FB3740138AA886dDFb3Cd663c0b183
// v2: 0x6Ec936737129Cb11a8B3E779Ad5EBe7Fbf4BA6E6
