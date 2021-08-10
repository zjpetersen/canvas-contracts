pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//Rename to MosaicTiles, get rid of MosaicMarket
contract MosaicTiles is ERC721 {
    address approvedMarket;
    address admin;

    event ColorBytesUpdated(uint tokenId, address owner, bytes updatedColor);

    constructor(uint[] memory tokenIds) ERC721("Tiles", "TIL") {
        admin = msg.sender;
        _setInitialTiles(tokenIds); //Set initial tiles
    }

    //Trading functionality is extracted out to a separate contract.
    //If an issue ever comes up in the trading functions, this can be used to update the contract.
    // function addApprovedMarket(address market) external {
    //     require(msg.sender == admin);
    //     approvedMarket = market;
    // }

    //Override approve method to allow the market as an approver
    // function approve(address to, uint256 tokenId) public virtual override {
    //     address owner = ERC721.ownerOf(tokenId);
    //     require(to != owner, "ERC721: approval to current owner");

    //     require(
    //         _msgSender() == approvedMarket || _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
    //         "ERC721: approve caller is not owner nor approved for all"
    //     );

    //     _approve(to, tokenId);
    // }
    function _setInitialTiles(uint[] memory tokenIds) private {
        require(tokenIds.length > 0 && msg.sender == admin);
        for (uint i = 0; i < tokenIds.length; i++) {
            mintTile(tokenIds[i]);
        }
    }

    function getOwner(uint tokenId) external view returns (address) {
        require(_isValidToken(tokenId));

        if (exists(tokenId)) {
            return ownerOf(tokenId);
        } else {
            return address(0);
        }
    }

    //Can be called directly or via a trading contract
    //Emits transfer
    function mintTiles(uint[] memory tokenIds) public {
        require(tokenIds.length > 0 && tokenIds.length <= 20);
        require(balanceOf(msg.sender) + tokenIds.length <= 100);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(_isValidToken(tokenIds[i]));
            _safeMint(msg.sender, tokenIds[i]);
        }
    }

    //Can be called directly or via a trading contract
    //Emits a transfer
    function mintTile(uint tokenId) public {
        require(balanceOf(msg.sender) < 100);
        require(_isValidToken(tokenId));
        _safeMint(msg.sender, tokenId);
    }

    function _baseURI() override internal pure returns (string memory) {
        return "localhost:4000/tile";
    }

    function setColorBytesBulk(uint[] memory tokenIds, bytes[] memory colors) external {
        require(tokenIds.length > 0 && tokenIds.length == colors.length, "tokenIds length must match colors length");
        for (uint i = 0; i < tokenIds.length; i++) {
            setColorBytes(tokenIds[i], colors[i]);
        }
    }

    function setColorBytes(uint tokenId, bytes memory color) public {
        require(_isValidToken(tokenId), "TokenId is too high");
        require(_isOwner(tokenId, msg.sender), "Sender is not the token owner");
        //TODO validate color string, also some check on color size.

        emit ColorBytesUpdated(tokenId, msg.sender, color);
    }


    function exists(uint tokenId) public view returns (bool) {
        require(_isValidToken(tokenId));

        return _exists(tokenId);
    }

    function _isValidToken(uint tokenId) private pure returns (bool) {
        return tokenId >= 0 && tokenId < 7056;
    }

    function _isOwner(uint tokenId, address addr) private view returns (bool){
        return ownerOf(tokenId) == addr;
    }

}