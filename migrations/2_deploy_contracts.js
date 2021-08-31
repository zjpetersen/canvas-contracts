const CryptoCanvas = artifacts.require("CryptoCanvas");
const fs = require('fs');


module.exports = async (deployer, network) => {
  let uri = "localhost:4000/tile/metadata/";
  let addr;
  let proxyRegistrationAddress = ""; //TODO delete this?
  if (network == 'main' || network === 'main-fork') {
    addr = deployer.networks.main.from;
    proxyRegistrationAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } if (network === 'rinkeby' || network === 'rinkeby-fork') {
    addr = deployer.networks.rinkeby.from;
    proxyRegistrationAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else {
    addr = deployer.networks.development.from;
    proxyRegistrationAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  }
  await deployer.deploy(CryptoCanvas, 7056, uri);
  const tiles = await CryptoCanvas.deployed();

  //Write contract addresses to file
  let filePath = '../../canvas-server/src/contractInfo.config'
  let data = tiles.address + "," + "2";
  fs.writeFile(filePath, data, function (err) {
    if (err) throw err;
    console.log('Wrote contract addresses to ' + filePath);
  })
};