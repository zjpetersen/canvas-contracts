const CryptoCanvas = artifacts.require("CryptoCanvas");
const initialTiles = require('./initialTiles.js');
const fs = require('fs');


module.exports = async (deployer, network) => {
  uri = "localhost:4000/tile/metadata/";
  let addr;
  if (network == 'main' || network === 'main-fork') {
    addr = deployer.networks.main.from;
  } if (network === 'rinkeby' || network === 'rinkeby-fork') {
    addr = deployer.networks.rinkeby.from;
  } else {
    addr = deployer.networks.development.from;
  }
  await deployer.deploy(CryptoCanvas, 6000, 7000, uri);
  const tiles = await CryptoCanvas.deployed();

  //Write contract addresses to file
  let filePath = '../canvas-server/src/contractInfo.config'
  let data = tiles.address + "," + "2";
  fs.writeFile(filePath, data, function (err) {
    if (err) throw err;
    console.log('Wrote contract addresses to ' + filePath);
  })
};