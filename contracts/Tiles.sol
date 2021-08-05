pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Tiles is ERC721 {
    address approvedMarket;
    address admin;

    constructor() ERC721("Tiles", "TIL") {
        admin = msg.sender;
    }

    //Trading functionality is extracted out to a separate contract.
    //If an issue ever comes up in the trading functions, this can be used to update the contract.
    function addApprovedMarket(address market) external {
        require(msg.sender == admin);
        approvedMarket = market;
    }

    //Override approve method to allow the market as an approver
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ERC721.ownerOf(tokenId);
        require(to != owner, "ERC721: approval to current owner");

        require(
            _msgSender() == approvedMarket || _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERC721: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    //Can be called directly or via a trading contract
    //Emits transfer
    //TODO rename
    function getSectionsForFree(uint[] memory tokenIds, address sender) public {
        require(tokenIds.length > 0 && tokenIds.length < 20);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(isValidToken(tokenIds[i]));
            _safeMint(sender, tokenIds[i]);
        }
    }

    //Can be called directly or via a trading contract
    //Emits a transfer
    function getSectionForFree(uint tokenId, address sender) external {
        require(isValidToken(tokenId));
        _safeMint(sender, tokenId);
    }

    function exists(uint tokenId) public view returns (bool) {
        require(isValidToken(tokenId));

        return _exists(tokenId);
    }

    function isValidToken(uint tokenId) private pure returns (bool) {
        return tokenId >= 0 && tokenId < 7056;
    }

}