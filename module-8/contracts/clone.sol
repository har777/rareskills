// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetFixedSupplyUpgradeable.sol";

contract NormalFactory {
    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        address owner
    ) external returns (address tokenAddress) {
        ERC20PresetFixedSupply token = new ERC20PresetFixedSupply(
            name,
            symbol,
            initialSupply,
            owner
        );
        tokenAddress = address(token);
    }
}

contract CloneFactory {
    address private immutable token;

    constructor() {
        token = address(new ERC20PresetFixedSupplyUpgradeable());
    }

    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        address owner
    ) external returns (address clone) {
        clone = Clones.clone(token);
        ERC20PresetFixedSupplyUpgradeable(clone).initialize(
            name,
            symbol,
            initialSupply,
            owner
        );
    }
}

// ·---------------------------------|----------------------------|-------------|-----------------------------·
// |      Solc version: 0.8.17       ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
// ··································|····························|·············|······························
// |  Methods                                                                                                 │
// ··················|···············|··············|·············|·············|···············|··············
// |  Contract       ·  Method       ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
// ··················|···············|··············|·············|·············|···············|··············
// |  CloneFactory   ·  createToken  ·           -  ·          -  ·     188448  ·            1  ·          -  │
// ··················|···············|··············|·············|·············|···············|··············
// |  NormalFactory  ·  createToken  ·           -  ·          -  ·    1273708  ·            1  ·          -  │
// ··················|···············|··············|·············|·············|···············|··············
// |  Deployments                    ·                                          ·  % of limit   ·             │
// ··································|··············|·············|·············|···············|··············
// |  CloneFactory                   ·           -  ·          -  ·    2145036  ·        7.2 %  ·          -  │
// ··································|··············|·············|·············|···············|··············
// |  NormalFactory                  ·           -  ·          -  ·    1968969  ·        6.6 %  ·          -  │
// ·---------------------------------|--------------|-------------|-------------|---------------|-------------·
