pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
  @dev ERC721, Non-Fungible Token, implementation.  There are 7056
    available NFTs.  Includes functionality to mint new tiles as well
    as to update the color of the tile.
 */
contract MosaicTiles is ERC721 {
    address admin;
    uint maxColorSize;
    string uri;

    /**
     * @dev Emitted when `owner` changes the `tokenId` color to `updatedColor`.
     */ 
    event ColorBytesUpdated(uint tokenId, address owner, bytes updatedColor);

    constructor(uint[] memory tokenIds, string memory uriIn) ERC721("Tiles", "TIL") {
        admin = msg.sender;
        maxColorSize = 5000;
        uri = uriIn;
        _setInitialTiles(tokenIds); //Set initial tiles
    }

    /**
     * @dev Mints the initial set of tiles on contract creation.
     */
    function _setInitialTiles(uint[] memory tokenIds) private {
        require(tokenIds.length > 0 && msg.sender == admin);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(_isValidToken(tokenIds[i]));
            _safeMint(msg.sender, tokenIds[i]);
        }
    }

    /**
     * @dev Returns the owner of the tile, or the empty address if no
     * owner exists 
     */
    function getOwner(uint tokenId) external view returns (address) {
        require(_isValidToken(tokenId));

        if (exists(tokenId)) {
            return ownerOf(tokenId);
        } else {
            return address(0);
        }
    }

    /**
     * @dev Mints new tiles for all `tokenIds` if it doesn't already exist.
     * Emits a {Transfer} event.
     */
    function mintTiles(uint[] memory tokenIds) external {
        require(tokenIds.length > 0 && tokenIds.length <= 20);
        require(balanceOf(msg.sender) + tokenIds.length <= 100);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(_isValidToken(tokenIds[i]));
            _safeMint(msg.sender, tokenIds[i]);
        }
    }

    /**
     * @dev Mints new tile for `tokenId` if it doesn't already exist.
     * Emits a {Transfer} event.
     */
    function mintTile(uint tokenId) external {
        require(balanceOf(msg.sender) < 100);
        require(_isValidToken(tokenId));
        _safeMint(msg.sender, tokenId);
    }

    /**
     * @dev Overriding URI from {ERC721-_baseURI}.  Used to display the NFT metadata.
     */
    function _baseURI() override internal view returns (string memory) {
        return uri;
    }

    /**
     * @dev Sets the color for all `tokenIds`.  `colors` will be updated for `tokenIds` with the same index.
     * Setting the color is actually just emitting an event.
     * For example tokenIds=[10,50] and colors=[x,y] would emit events 
     * ColorBytesUpdated(10, <msg.sender>, x) and ColorBytesUpdated(50, <msg.sender>, y)
     *
     * Requires tokenIds and colors to be the same length.
     */
    function setColorBytesBulk(uint[] memory tokenIds, bytes[] memory colors) external {
        require(tokenIds.length > 0 && tokenIds.length == colors.length, "tokenIds length must match colors length");
        for (uint i = 0; i < tokenIds.length; i++) {
            setColorBytes(tokenIds[i], colors[i]);
        }
    }

    /**
     * @dev Sets the `color` for `tokenId`
     * Setting the color is actually just emitting an event.
     * Does a sanity check to ensure people aren't uploading full size images or other large data.
     * Full validation of the color byte array is handled off chain to ensure it is a png, jpg, or gif.
     *
     * Emits a {ColorBytesUpdated} event
     */
    function setColorBytes(uint tokenId, bytes memory color) public {
        require(_isValidToken(tokenId), "TokenId is invalid");
        require(_isOwner(tokenId, msg.sender), "Sender is not the token owner");

        require(color.length < maxColorSize, "Color array is too big, please use 16x16 image");

        emit ColorBytesUpdated(tokenId, msg.sender, color);
    }


    /**
     * @dev Check if `tokenId` exists.
     */
    function exists(uint tokenId) public view returns (bool) {
        require(_isValidToken(tokenId));

        return _exists(tokenId);
    }

    /**
     * @dev Tokens 0 - 7055 are valid
     */
    function _isValidToken(uint tokenId) private pure returns (bool) {
        return tokenId < 7056;
    }

    function _isOwner(uint tokenId, address addr) private view returns (bool){
        return ownerOf(tokenId) == addr;
    }

}