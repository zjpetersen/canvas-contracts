pragma solidity ^0.8.4;

import "./Tiles.sol";

contract MosaicMarket {
    Tiles tiles;

    struct Offer {
        address payable offerer;
        uint amount;
    }

    //key: tokenId, value: offers array
    mapping(uint => Offer[]) offerMap;
    uint[7056] public asks;
    mapping(address => uint) pendingWithdrawals;
    //offers for any tiles
    // Offer[] globalOffers;
    address public admin;

    event AskUpdated(uint tokenId, address owner, uint ask);
    event ColorBytesUpdated(uint tokenId, address owner, bytes updatedColor);
    event OffersUpdated(uint tokenId, address offerer, uint offer, bool globalOffer);


    constructor(address addr, uint[] memory tokenIds) {
        admin = msg.sender;
        tiles = Tiles(addr);
        setInitialTiles(tokenIds); //Set initial tiles
    }

    function getOwner(uint tokenId) external view returns (address) {
        require(isValidToken(tokenId));

        if (tiles.exists(tokenId)) {
            return tiles.ownerOf(tokenId);
        } else {
            return address(0);
        }
    }

    function getAsk(uint tokenId) external view returns (uint) {
        require(isValidToken(tokenId));

        return asks[tokenId];
    }

    function getOffersForTile(uint tokenId) external view returns (Offer[] memory) {
        isValidToken(tokenId);

        return offerMap[tokenId];
    }

    function setInitialTiles(uint[] memory tokenIds) private {
        require(tokenIds.length > 0 && msg.sender == admin);
        for (uint i = 0; i < tokenIds.length; i++) {
            tiles.getTileForFree(tokenIds[i], msg.sender);
        }
    }

    function getTilesForFree(uint[] memory tokenIds) public {
        require(tokenIds.length > 0 && tokenIds.length < 20);
        tiles.getTilesForFree(tokenIds, msg.sender);
    }

    //Emits a transfer
    function getTileForFree(uint tokenId) external {
        require(isValidToken(tokenId));
        tiles.getTileForFree(tokenId, msg.sender);
    }

    //Trading functions
    function ask(uint tokenId, uint amount) external {
        require(isValidToken(tokenId));
        require(isOwner(tokenId, msg.sender));
        require(amount > 1000); //Sanity check, amount needs to be in wei

        Offer[] storage offers = offerMap[tokenId];
        Offer memory highestOffer;
        uint position;
        for (uint i = 0; i < offers.length; i++) {
            if (offers[i].amount >= amount && highestOffer.amount < offers[i].amount) {
                highestOffer = offers[i];
                position = i;
            }
        }

        //Approve this contract to transfer the NFT in the future.
        if (tiles.getApproved(tokenId) != address(this)) {
            tiles.approve(address(this), tokenId);
        }

        if (highestOffer.amount >= amount) {
          offers[position]=offers[offers.length-1];
          offers.pop();
          emit OffersUpdated(tokenId, highestOffer.offerer, 0, false);
          updateOwner(tokenId, highestOffer.offerer, highestOffer.amount);
        } else {
          asks[tokenId] = amount;
          emit AskUpdated(tokenId, msg.sender, amount);
        }
    }

    function removeAsk(uint tokenId) external {
        require(isValidToken(tokenId));
        require(isOwner(tokenId, msg.sender));

        //Clear approval since the ask is removed
        tiles.approve(address(0), tokenId);

        asks[tokenId] = 0;
        emit AskUpdated(tokenId, msg.sender, 0);
    }

    //TODO there is a bug if already have an offer, then submit another offer=ask.  Will lock the funds of first offer.
    //TODO refactor this to have offers be a map of id -> amount
    function offer(uint tokenId) external payable {
        require(isValidToken(tokenId));
        require(!isOwner(tokenId, msg.sender));
        uint _ask = asks[tokenId];
        if (_ask != 0 && _ask < msg.value) {
            revert("There is already an ask lower than the offer, resend with the ask price");
        } else if (_ask != 0 && _ask == msg.value) { //Accept the offer right away
            // addPendingReturn(msg.value - tiles.ask);
            updateOwner(tokenId, msg.sender, msg.value);
        } else {
            Offer[] storage offers = offerMap[tokenId];
            // mapping(address => uint) storage offers = offerMap[tokenId];
            // bool hadPrevOffer;
            for (uint i = 0; i < offers.length; i++) {
                if (offers[i].offerer == msg.sender) {
                    // offers[i].amount = msg.value;
                    // hadPrevOffer = true;
                    revert("Cannot have multiple offers for the same tile, if you want to submit a new offer first delete the old one.");
                }
            }

            // if (!hadPrevOffer) {
              Offer memory newOffer = Offer({offerer: payable(msg.sender), amount: msg.value});
              offers.push(newOffer);
            // }
            emit OffersUpdated(tokenId, msg.sender, msg.value, false);
        }
    }

    //TODO create global offers
    // function offer() public payable {
    // }

    function removeOffer(uint tokenId) external {
        require(isValidToken(tokenId));
        require(!isOwner(tokenId, msg.sender));


        Offer[] storage offers = offerMap[tokenId];
        // mapping(address => uint) storage offers = offerMap[tokenId];
        Offer memory offerToRemove;
        uint position;
        for (uint i = 0; i < offers.length; i++) {
            if (offers[i].offerer == msg.sender) {
              offerToRemove = offers[i];
              position = i;
            }
        }

        if (offerToRemove.offerer == address(0)) {
            revert("There is no offer to remove");
        }

        uint amount = offerToRemove.amount;
        offers[position]=offers[offers.length-1];
        offers.pop();

        pendingWithdrawals[msg.sender] += amount;
        emit OffersUpdated(tokenId, msg.sender, 0, false);
    }

    //End trading functions

    function setColorBytesBulk(uint[] memory tokenIds, bytes[] memory colors) external {
        require(tokenIds.length > 0 && tokenIds.length == colors.length);
        for (uint i = 0; i < tokenIds.length; i++) {
            setColorBytes(tokenIds[i], colors[i]);
        }
    }

    function setColorBytes(uint tokenId, bytes memory color) public {
        require(isValidToken(tokenId));
        require(isOwner(tokenId, msg.sender));
        //TODO validate color string, also some check on color size.

        emit ColorBytesUpdated(tokenId, msg.sender, color);
    }

    function updateOwner(uint tokenId, address newOwner, uint amount) private {
        address payable oldOwner = payable(tiles.ownerOf(tokenId));
        //This call will work because this contract has already been added as an approver
        asks[tokenId]=0;
        tiles.safeTransferFrom(oldOwner, newOwner, tokenId);
        pendingWithdrawals[oldOwner] += amount;
    }

    function withdraw() external {
        uint amount = pendingWithdrawals[msg.sender];
        require(amount != 0);
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function isValidToken(uint tokenId) private pure returns (bool) {
        return tokenId >= 0 && tokenId < 7056;
    }

    function isOwner(uint tokenId, address addr) private view returns (bool){
        return tiles.ownerOf(tokenId) == addr;
    }

}