// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
  @dev ERC721, Non-Fungible Token, implementation.  There are 7056
    available NFTs.  Includes functionality to mint new tiles as well
    as to update the color of the tile.
 */
contract CryptoCanvas is ERC721, Ownable {
    address admin;
    uint maxColorSize;
    string uri;
    uint tokenCount;

    /**
     * @dev Emitted when `owner` changes the `tokenId` color to `updatedColor`.
     */ 
    event ColorBytesUpdated(uint tokenId, address owner, bytes updatedColor);

    constructor(string memory _uri) ERC721("Tiles", "TIL") {
        admin = msg.sender;
        maxColorSize = 1000000; //1 MB
        uri = _uri;
        tokenCount = 7056;
    }

    /**
     * @dev Mints new tiles for all `tokenIds` if it doesn't already exist.
     *
     * Requires sender to be the contract creator and is only called on startup
     * Emits a {Transfer} event for each tokenId.
     */
    function batchMint(uint tokenStart, uint tokenEnd) external {
        require(msg.sender == admin);
        require(tokenStart < tokenEnd);
        require(tokenEnd <= tokenCount); 
        for (uint i = tokenStart; i < tokenEnd; i++) {
            _safeMint(msg.sender, i);
        }
    }

    /**
     * @dev Returns the owner of the tile, or the empty address if no
     * owner exists or out of range.
     */
    function getOwner(uint tokenId) external view returns (address) {
        if (_exists(tokenId)) {
            return ownerOf(tokenId);
        } else {
            return address(0);
        }
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
     * @dev Tokens 0 - 7055 are valid
     */
    function _isValidToken(uint tokenId) private view returns (bool) {
        return tokenId < tokenCount;
    }

    function _isOwner(uint tokenId, address addr) private view returns (bool){
        return ownerOf(tokenId) == addr;
    }

}