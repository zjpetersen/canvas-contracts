const Tiles = artifacts.require("Tiles");
const MosaicMarket = artifacts.require("MosaicMarket");
const initialTiles = require('./initialTiles.js');


module.exports = async (deployer) => {
  await deployer.deploy(Tiles);
  const tiles = await Tiles.deployed();
  console.log(initialTiles.initialTileArray());
  await deployer.deploy(MosaicMarket, tiles.address, initialTiles.initialTileArray());
  const mosaicMarket = await MosaicMarket.deployed();
  tiles.addApprovedMarket(mosaicMarket.address);
};