// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// This is a modified solmate implementation

abstract contract ERC20 {
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    uint8 public immutable decimals;
    bytes32 public immutable STORAGE_SLOT;

    struct Storage {
        string name;
        string symbol;
        uint256 totalSupply;
        mapping(address => uint256) balanceOf;
        mapping(address => mapping(address => uint256)) allowance;
    }

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        decimals = _decimals;

        STORAGE_SLOT = keccak256(
            abi.encodePacked(_name, _symbol, address(this))
        );

        Storage storage _storage = _getStorage();
        _storage.name = _name;
        _storage.symbol = _symbol;
    }

    function approve(
        address spender,
        uint256 amount
    ) public virtual returns (bool) {
        Storage storage _storage = _getStorage();
        _storage.allowance[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transfer(
        address to,
        uint256 amount
    ) public virtual returns (bool) {
        Storage storage _storage = _getStorage();
        _storage.balanceOf[msg.sender] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            _storage.balanceOf[to] += amount;
        }

        emit Transfer(msg.sender, to, amount);

        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual returns (bool) {
        Storage storage _storage = _getStorage();
        uint256 allowed = _storage.allowance[from][msg.sender]; // Saves gas for limited approvals.

        if (allowed != type(uint256).max)
            _storage.allowance[from][msg.sender] = allowed - amount;

        _storage.balanceOf[from] -= amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            _storage.balanceOf[to] += amount;
        }

        emit Transfer(from, to, amount);

        return true;
    }

    function _mint(address to, uint256 amount) internal virtual {
        Storage storage _storage = _getStorage();
        _storage.totalSupply += amount;

        // Cannot overflow because the sum of all user
        // balances can't exceed the max uint256 value.
        unchecked {
            _storage.balanceOf[to] += amount;
        }

        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal virtual {
        Storage storage _storage = _getStorage();
        _storage.balanceOf[from] -= amount;

        // Cannot underflow because a user's balance
        // will never be larger than the total supply.
        unchecked {
            _storage.totalSupply -= amount;
        }

        emit Transfer(from, address(0), amount);
    }

    function _getStorage() internal view returns (Storage storage _storage) {
        bytes32 storageSlot = STORAGE_SLOT;
        assembly {
            _storage.slot := storageSlot
        }
    }
}
