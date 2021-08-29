const CryptoCanvas = artifacts.require("CryptoCanvas");
const initialTiles = require('./initialTiles.js');
const fs = require('fs');


module.exports = async (deployer) => {
  uri = "localhost:4000/tile/metadata/";
  let res = await deployer.deploy(CryptoCanvas, initialTiles.initialTileArray(), uri);
  const tiles = await CryptoCanvas.deployed();
  console.log(res);

  //Write contract addresses to file
  let filePath = '../canvas-server/src/contractInfo.config'
  let data = tiles.address + "," + "1";
  fs.writeFile(filePath, data, function (err) {
    if (err) throw err;
    console.log('Wrote contract addresses to ' + filePath);
  })
};