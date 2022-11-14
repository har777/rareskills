// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./RewardToken.sol";
import "./RewardNFT.sol";

contract NFTStaker is IERC721Receiver {
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
    ) external returns (bytes4) {
        // if the user does a transferFrom instead of safeTransferFrom then this logic
        // is never called and the nft is trapped
        // wonder if there is a better way to do this?

        // 1. check if nft received is from the nft contract we expect
        require(msg.sender == address(nft), "Incorrect nft received");

        Staker storage staker = stakers[from];

        // 2. move existing claimable tokens to unclaimed tokens field
        _updateUnclaimedTokens(staker);

        // 3. increase count of nft's staked by the user
        staker.nftCount += 1;
        // 4. track the original owner of the staked nft so that they can withdraw it eventually
        nftIdToOriginalOwner[tokenId] = from;

        return IERC721Receiver.onERC721Received.selector;
    }

    // NOTE: I removed the reentrancy check here because I don't see how rerentrancy
    // is possible here given the safeTransferFrom call is the last statement
    // and any reentracy will already encounter updated state
    // But this might be wrong. Recheck.
    function withdrawNFT(uint256 nftId) external {
        address user = msg.sender;
        Staker storage staker = stakers[user];

        // 1. check if user is original owner
        require(
            nftIdToOriginalOwner[nftId] == user,
            "NFT can only be withdrawn by its staker"
        );

        // 2. set original owner of nft to address(0)
        // I thought I could ignore this step because safeTransferFrom would revert if user tried to withdraw twice
        // but can cause issues if the user approves the nft again for the contract and make the nftCount state wrong
        nftIdToOriginalOwner[nftId] = address(0);

        // 3. move existing claimable tokens to unclaimed tokens field
        _updateUnclaimedTokens(staker);

        // 4. reduce count of nft's staked by the user
        staker.nftCount -= 1;

        // 5. transfer nft back to user
        nft.safeTransferFrom(address(this), user, nftId);
    }

    function claimTokens() external {
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

    function _getNewClaimableTokens(
        Staker memory staker
    ) internal view returns (uint256 newClaimableTokens) {
        uint256 secondsSinceLastClaim = block.timestamp - staker.lastUpdated;
        newClaimableTokens =
            (secondsSinceLastClaim * staker.nftCount * TOKENS_PER_DAY) /
            1 days;
    }

    function _getTotalClaimableTokens(
        Staker memory staker
    ) internal view returns (uint256 totalUnclaimedTokens) {
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
