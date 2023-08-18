// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Week22Exercise3 is Ownable {
    using ECDSA for bytes32;

    mapping(address => uint256) public nonceForAddress;

    function claimAirdrop(
        uint256 amount,
        address to,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 hash_ = keccak256(
            abi.encodePacked(nonceForAddress[to], amount, to)
        );
        nonceForAddress[to]++;
        address recovered = ecrecover(hash_, v, r, s);
        require(recovered == owner(), "invalid signature");
        // claim airdrop
    }
}
