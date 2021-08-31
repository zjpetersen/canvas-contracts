**Contract for the Distributed App, <a href="ethercanvas.io">CryptoCanvas</a>

This contract extends from the <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol">OpenZeppelin ERC721 (NFT) contract</a>.
It also contains logic to implement <a href="https://eips.ethereum.org/EIPS/eip-2309">EIP-2309</a>.  This makes the minting process much cheaper. This logic is contained within ERC2309.

The main thing this contract can do, in addition to the standard NFT functionality, is set the users artwork and keep track of it on chain.
This is accomplished by calling `setColorBytes` which in turn emits the `ColorBytesUpdated` event.  This function is available only to the NFT owner.

If you want to know more about how this contract is used, please visit <a href="ethercanvas.io">CryptoCanvas</a>.