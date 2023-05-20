// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Week22Exercise4 {
    using ECDSA for bytes32;
    bool public hacked;
    address signer = 0xB1700C08Aa433b319dEF2b4bB31d6De5C8512D96;
    mapping(bytes => bool) usedSignatures;

    function claimAirdrop(
        uint256 amount,
        bytes32 hash_,
        bytes memory signature
    ) external {
        require(matchAddressSigner(hash_, signature), "RECOVER_FAILURE");
        require(usedSignatures[signature] == false, "SIGNATURE_ALREADY_USED");
        usedSignatures[signature] = true;
        hacked = true;
    }

    function matchAddressSigner(
        bytes32 hash_,
        bytes memory signature
    ) private view returns (bool) {
        return signer == hash_.recover(signature);
    }
}
