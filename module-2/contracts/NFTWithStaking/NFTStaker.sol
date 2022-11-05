// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./RewardToken.sol";
import "./RewardNFT.sol";

contract NFTStaker is IERC721Receiver, ReentrancyGuard {
    uint256 private constant TOKENS_PER_DAY = 10e18;

    RewardToken public immutable token;
    RewardNFT public immutable nft;

    mapping(uint256 => address) private nftIdToOriginalOwner;

    struct Staker {
        uint256 nftCount;
        // using block.timestamp even though it can be manipulated to an extend
        uint256 lastUpdated;
        uint256 unclaimedTokens;
    }

    mapping(address => Staker) private stakers;

    constructor(RewardToken _token, RewardNFT _nft) {
        token = _token;
        nft = _nft;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external nonReentrant returns (bytes4) {
        Staker storage staker = stakers[from];

        // 1. move existing claimable tokens to unclaimed tokens field
        _updateUnclaimedTokens(staker);

        // 2. increase count of nft's staked by the user
        staker.nftCount += 1;
        // 3. track the original owner of the staked nft so that they can withdraw it eventually
        nftIdToOriginalOwner[tokenId] = from;

        return IERC721Receiver.onERC721Received.selector;
    }

    function withdrawNFT(uint256 nftId) external nonReentrant {
        address user = msg.sender;
        Staker storage staker = stakers[user];

        // 1. move existing claimable tokens to unclaimed tokens field
        _updateUnclaimedTokens(staker);

        // 2. check if user is original owner and transfer nft back
        require(
            nftIdToOriginalOwner[nftId] == user,
            "NFT can only be withdrawn by its staker"
        );

        // 3. reduce count of nft's staked by the user
        staker.nftCount -= 1;

        // 4. transfer nft back to user
        nft.safeTransferFrom(address(this), user, nftId);
    }

    function claimTokens() external nonReentrant {
        address user = msg.sender;
        Staker storage staker = stakers[user];

        // 1. get total claimable tokens by the user
        uint256 totalUnclaimedTokens = _getTotalClaimableTokens(staker);

        // 2. set unclaimed tokens field back to zero
        staker.unclaimedTokens = 0;
        // 3. set the lastUpdated field to current block timestamp
        staker.lastUpdated = block.timestamp;

        // 4. mint the total claimable tokens to the user
        token.mint(user, totalUnclaimedTokens);
    }

    function _updateUnclaimedTokens(Staker storage staker) internal {
        uint256 newClaimableTokens = _getNewClaimableTokens(staker);
        staker.unclaimedTokens += newClaimableTokens;
        staker.lastUpdated = block.timestamp;
    }

    function _getNewClaimableTokens(Staker memory staker)
        internal
        view
        returns (uint256 newClaimableTokens)
    {
        uint256 timeSinceLastClaim = block.timestamp - staker.lastUpdated;
        newClaimableTokens =
            (timeSinceLastClaim * staker.nftCount * TOKENS_PER_DAY) /
            1 days;
    }

    function _getTotalClaimableTokens(Staker memory staker)
        internal
        view
        returns (uint256 totalUnclaimedTokens)
    {
        totalUnclaimedTokens =
            _getNewClaimableTokens(staker) +
            staker.unclaimedTokens;
    }

    function getTotalClaimableTokens()
        public
        view
        returns (uint256 totalUnclaimedTokens)
    {
        Staker memory staker = stakers[msg.sender];
        totalUnclaimedTokens = _getTotalClaimableTokens(staker);
    }
}
