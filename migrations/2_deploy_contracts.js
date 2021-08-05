const Tiles = artifacts.require("Tiles");
const MosaicMarket = artifacts.require("MosaicMarket");

module.exports = async (deployer) => {
  await deployer.deploy(Tiles);
  const tiles = await Tiles.deployed();
  await deployer.deploy(MosaicMarket, tiles.address);
  const mosaicMarket = await MosaicMarket.deployed();
  tiles.addApprovedMarket(mosaicMarket.address);
};