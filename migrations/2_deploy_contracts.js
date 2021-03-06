const CryptoCanvas = artifacts.require("CryptoCanvas");
const fs = require('fs');


module.exports = async (deployer, network) => {
  if (network == 'main' || network === 'main-fork' || network === '') {
    uri = "http://ethercanvas.io";
  } if (network === 'rinkeby' || network === 'rinkeby-fork') {
    uri = "http://ethercanvas.io";
  } else {
    uri = "https://ethercanvas.io"
  }
  uri = uri + "/tile/metadata/";
  await deployer.deploy(CryptoCanvas, uri);
  const tiles = await CryptoCanvas.deployed();

  //Write contract addresses to file
  let filePath = '../canvas-server/src/contractInfo.config'
  let data = tiles.address + "," + "2";
  fs.writeFile(filePath, data, function (err) {
    if (err) throw err;
    console.log('Wrote contract addresses to ' + filePath);
  })
};