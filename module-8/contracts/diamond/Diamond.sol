// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IDiamond {
    enum FacetCutAction {
        Add,
        Replace,
        Remove
    }
    // Add=0, Replace=1, Remove=2

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}

interface IDiamondCut is IDiamond {
    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
}

// A loupe is a small magnifying glass used to look at diamonds.
// These functions look at diamonds
interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /// @notice Gets all facet addresses and their four byte function selectors.
    /// @return facets_ Facet
    function facets() external view returns (Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet.
    /// @param _facet The facet address.
    /// @return facetFunctionSelectors_
    function facetFunctionSelectors(
        address _facet
    ) external view returns (bytes4[] memory facetFunctionSelectors_);

    /// @notice Get all the facet addresses used by a diamond.
    /// @return facetAddresses_
    function facetAddresses()
        external
        view
        returns (address[] memory facetAddresses_);

    /// @notice Gets the facet that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _functionSelector The function selector.
    /// @return facetAddress_ The facet address.
    function facetAddress(
        bytes4 _functionSelector
    ) external view returns (address facetAddress_);
}

contract Diamond is IDiamond, IDiamondCut {
    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    fallback() external payable {
        // get facet from function selector
        Storage storage _storage = _getStorage();
        address facet = _storage.selectorToFacet[msg.sig];

        // Require a facet to exist for the function selector
        require(facet != address(0));

        // Execute external function from facet using delegatecall and return any value.
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {}

    bytes32 constant STORAGE_SLOT = keccak256("diamond.proxy");

    struct Storage {
        mapping(bytes4 => address) selectorToFacet;
    }

    function _getStorage() internal view returns (Storage storage _storage) {
        bytes32 storageSlot = STORAGE_SLOT;
        assembly {
            _storage.slot := storageSlot
        }
    }

    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        for (uint256 idx = 0; idx < _diamondCut.length; idx++) {
            FacetCutAction facetCutAction = _diamondCut[idx].action;
            if (facetCutAction == FacetCutAction.Add) {
                _addFunctions(
                    _diamondCut[idx].facetAddress,
                    _diamondCut[idx].functionSelectors
                );
            } else if (facetCutAction == FacetCutAction.Replace) {
                _replaceFunctions(
                    _diamondCut[idx].facetAddress,
                    _diamondCut[idx].functionSelectors
                );
            } else if (facetCutAction == FacetCutAction.Remove) {
                _removeFunctions(
                    _diamondCut[idx].facetAddress,
                    _diamondCut[idx].functionSelectors
                );
            } else {
                revert("FacetCut.action does not exist");
            }
        }

        // require(_init != address(0));

        // (bool success, bytes memory error) = _init.delegatecall(_calldata);
        // require(success, string(error));

        emit DiamondCut(_diamondCut, _init, _calldata);
    }

    function _addFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(_facetAddress != address(0));

        Storage storage _storage = _getStorage();

        for (uint256 idx = 0; idx < _functionSelectors.length; idx++) {
            bytes4 functionSelector = _functionSelectors[idx];
            address selectorCurrentFacet = _storage.selectorToFacet[
                functionSelector
            ];
            require(selectorCurrentFacet == address(0));
            _storage.selectorToFacet[functionSelector] = _facetAddress;
        }
    }

    function _replaceFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(_facetAddress != address(0));

        Storage storage _storage = _getStorage();

        for (uint256 idx = 0; idx < _functionSelectors.length; idx++) {
            bytes4 functionSelector = _functionSelectors[idx];
            address selectorCurrentFacet = _storage.selectorToFacet[
                functionSelector
            ];
            require(selectorCurrentFacet != address(0));
            require(selectorCurrentFacet != _facetAddress);
            _storage.selectorToFacet[functionSelector] = _facetAddress;
        }
    }

    function _removeFunctions(
        address _facetAddress,
        bytes4[] memory _functionSelectors
    ) internal {
        require(_facetAddress != address(0));

        Storage storage _storage = _getStorage();

        for (uint256 idx = 0; idx < _functionSelectors.length; idx++) {
            bytes4 functionSelector = _functionSelectors[idx];
            address selectorCurrentFacet = _storage.selectorToFacet[
                functionSelector
            ];
            require(selectorCurrentFacet != address(0));
            delete _storage.selectorToFacet[functionSelector];
        }
    }
}
