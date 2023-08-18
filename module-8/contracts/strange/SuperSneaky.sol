// SPDX-License-Identifier: MIT
pragma solidity >=0.5.6 <0.9.0;

import "./MetamorphicContractFactory.sol";

contract SuperSneakyFactory {
    MetamorphicContractFactory public metamorphicContractFactory;
    SuperSneakyInterface public superSneaky;

    SuperSneakyV1 private superSneakyV1;
    SuperSneakyV2 private superSneakyV2;

    constructor() public {
        metamorphicContractFactory = new MetamorphicContractFactory("");
        superSneakyV1 = new SuperSneakyV1();
        superSneakyV2 = new SuperSneakyV2();
    }

    function deploySuperSneakyV1(bytes32 salt) external {
        superSneaky = SuperSneakyInterface(
            metamorphicContractFactory
                .deployMetamorphicContractFromExistingImplementation(
                    salt,
                    address(superSneakyV1),
                    ""
                )
        );
    }

    function deploySuperSneakyV2(bytes32 salt) external returns (address) {
        superSneaky = SuperSneakyInterface(
            metamorphicContractFactory
                .deployMetamorphicContractFromExistingImplementation(
                    salt,
                    address(superSneakyV2),
                    ""
                )
        );
    }

    function destroy() external {
        address payable _address = msg.sender;
        superSneaky.destroy(_address);
    }
}

interface SuperSneakyInterface {
    function destroy(address payable _address) external;
}

contract SuperSneakyV1 {
    function balanceOf(address _address) external pure returns (uint256) {
        // omg so rich
        return uint256(uint160(_address));
    }

    function destroy(address payable _address) external {
        selfdestruct(_address);
    }
}

contract SuperSneakyV2 {
    function balanceOf(address _address) external pure returns (uint256) {
        // ahahahaha 0
        return 0;
    }

    function destroy(address payable _address) external {
        selfdestruct(_address);
    }
}
