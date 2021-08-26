const MosaicTiles = artifacts.require("MosaicTiles");
const initialTiles = require('./initialTiles.js');
const fs = require('fs');


module.exports = async (deployer) => {
  await deployer.deploy(MosaicTiles, initialTiles.initialTileArray());
  const tiles = await MosaicTiles.deployed();
  // tiles.addApprovedMarket(mosaicMarket.address);

  //Write contract addresses to file
  let filePath = '../canvas-server/src/contractAddresses.txt'
  // fs.writeFile(filePath, tiles.address + "," + mosaicMarket.address, function (err) {
  //   if (err) throw err;
  //   console.log('Wrote contract addresses to ' + filePath);
  // })
  fs.writeFile(filePath, tiles.address, function (err) {
    if (err) throw err;
    console.log('Wrote contract addresses to ' + filePath);
  })
};