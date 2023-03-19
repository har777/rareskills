// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// This is a modified solmate implementation

abstract contract ERC721 {
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed id
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 indexed id
    );
    event ApprovalForAll(
        address indexed owner,
        address indexed operator,
        bool approved
    );

    bytes32 public immutable STORAGE_SLOT;

    struct Storage {
        string name;
        string symbol;
        mapping(uint256 => address) _ownerOf;
        mapping(address => uint256) _balanceOf;
        mapping(uint256 => address) getApproved;
        mapping(address => mapping(address => bool)) isApprovedForAll;
    }

    constructor(string memory _name, string memory _symbol) {
        STORAGE_SLOT = keccak256(
            abi.encodePacked(_name, _symbol, address(this))
        );

        Storage storage _storage = _getStorage();
        _storage.name = _name;
        _storage.symbol = _symbol;
    }

    function tokenURI(uint256 id) public view virtual returns (string memory);

    function ownerOf(uint256 id) public view virtual returns (address owner) {
        Storage storage _storage = _getStorage();
        require((owner = _storage._ownerOf[id]) != address(0), "NOT_MINTED");
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        Storage storage _storage = _getStorage();
        require(owner != address(0), "ZERO_ADDRESS");

        return _storage._balanceOf[owner];
    }

    function approve(address spender, uint256 id) public virtual {
        Storage storage _storage = _getStorage();
        address owner = _storage._ownerOf[id];

        require(
            msg.sender == owner || _storage.isApprovedForAll[owner][msg.sender],
            "NOT_AUTHORIZED"
        );

        _storage.getApproved[id] = spender;

        emit Approval(owner, spender, id);
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        Storage storage _storage = _getStorage();
        _storage.isApprovedForAll[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 id) public virtual {
        Storage storage _storage = _getStorage();
        require(from == _storage._ownerOf[id], "WRONG_FROM");

        require(to != address(0), "INVALID_RECIPIENT");

        require(
            msg.sender == from ||
                _storage.isApprovedForAll[from][msg.sender] ||
                msg.sender == _storage.getApproved[id],
            "NOT_AUTHORIZED"
        );

        // Underflow of the sender's balance is impossible because we check for
        // ownership above and the recipient's balance can't realistically overflow.
        unchecked {
            _storage._balanceOf[from]--;

            _storage._balanceOf[to]++;
        }

        _storage._ownerOf[id] = to;

        delete _storage.getApproved[id];

        emit Transfer(from, to, id);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id
    ) public virtual {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 ||
                ERC721TokenReceiver(to).onERC721Received(
                    msg.sender,
                    from,
                    id,
                    ""
                ) ==
                ERC721TokenReceiver.onERC721Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        bytes calldata data
    ) public virtual {
        transferFrom(from, to, id);

        require(
            to.code.length == 0 ||
                ERC721TokenReceiver(to).onERC721Received(
                    msg.sender,
                    from,
                    id,
                    data
                ) ==
                ERC721TokenReceiver.onERC721Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID for ERC165
            interfaceId == 0x80ac58cd || // ERC165 Interface ID for ERC721
            interfaceId == 0x5b5e139f; // ERC165 Interface ID for ERC721Metadata
    }

    function _mint(address to, uint256 id) internal virtual {
        Storage storage _storage = _getStorage();
        require(to != address(0), "INVALID_RECIPIENT");

        require(_storage._ownerOf[id] == address(0), "ALREADY_MINTED");

        // Counter overflow is incredibly unrealistic.
        unchecked {
            _storage._balanceOf[to]++;
        }

        _storage._ownerOf[id] = to;

        emit Transfer(address(0), to, id);
    }

    function _burn(uint256 id) internal virtual {
        Storage storage _storage = _getStorage();
        address owner = _storage._ownerOf[id];

        require(owner != address(0), "NOT_MINTED");

        // Ownership check above ensures no underflow.
        unchecked {
            _storage._balanceOf[owner]--;
        }

        delete _storage._ownerOf[id];

        delete _storage.getApproved[id];

        emit Transfer(owner, address(0), id);
    }

    function _safeMint(address to, uint256 id) internal virtual {
        _mint(to, id);

        require(
            to.code.length == 0 ||
                ERC721TokenReceiver(to).onERC721Received(
                    msg.sender,
                    address(0),
                    id,
                    ""
                ) ==
                ERC721TokenReceiver.onERC721Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    function _safeMint(
        address to,
        uint256 id,
        bytes memory data
    ) internal virtual {
        _mint(to, id);

        require(
            to.code.length == 0 ||
                ERC721TokenReceiver(to).onERC721Received(
                    msg.sender,
                    address(0),
                    id,
                    data
                ) ==
                ERC721TokenReceiver.onERC721Received.selector,
            "UNSAFE_RECIPIENT"
        );
    }

    function _getStorage() internal view returns (Storage storage _storage) {
        bytes32 storageSlot = STORAGE_SLOT;
        assembly {
            _storage.slot := storageSlot
        }
    }
}

abstract contract ERC721TokenReceiver {
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external virtual returns (bytes4) {
        return ERC721TokenReceiver.onERC721Received.selector;
    }
}
