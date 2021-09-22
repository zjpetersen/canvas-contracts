const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");

const MNEMONIC = process.env.MNEMONIC;
const PRIVATE_KEY = process.env.PRIVATE_KEY_POLY;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_API_KEY = process.env.INFURA_PROJECT_ID || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;

const needsNodeAPI =
  process.env.npm_config_argv &&
  (process.env.npm_config_argv.includes("rinkeby") ||
    process.env.npm_config_argv.includes("live") ||
    process.env.npm_config_argv.includes("mumbai") ||
    process.env.npm_config_argv.includes("polygon")
    );

if ((!MNEMONIC || !NODE_API_KEY) && needsNodeAPI) {
  console.error("Please set a mnemonic and ALCHEMY_KEY or INFURA_KEY.");
  process.exit(0);
}

const rinkebyNodeUrl = isInfura
  ? "wss://rinkeby.infura.io/ws/v3/" + NODE_API_KEY
  : "https://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;

const mumbaiNodeUrl = isInfura
  ? "https://polygon-mumbai.infura.io/v3/" + NODE_API_KEY
  : "";

const polygonNodeUrl = isInfura
  ? "https://polygon-mainnet.infura.io/v3/" + NODE_API_KEY
  : "";

const mainnetNodeUrl = isInfura
  ? "https://mainnet.infura.io/v3/" + NODE_API_KEY
  : "https://eth-mainnet.alchemyapi.io/v2/" + NODE_API_KEY;

module.exports = {
  contracts_build_directory: path.join(__dirname, "../canvas/client/src/contracts"),
    compilers: {
      solc: {
        version: "^0.8.0"
      }
    },
    networks: {
      development: {
        host: "127.0.0.1",
        port: 7545,
        network_id: "*"
      },
      rinkeby: {
        provider: function () {
          return new HDWalletProvider(PRIVATE_KEY, rinkebyNodeUrl, 0, 1);
        },
        gas: 5000000,
        network_id: 4,
      },
      mumbai: {
        provider: function () {
          return new HDWalletProvider(PRIVATE_KEY, mumbaiNodeUrl, 0, 1);
        },
        gas: 5000000,
        network_id: 80001,
        gasPrice: 1000000000 //1 gwei
      },
      polygon: {
        provider: function () {
          return new HDWalletProvider(PRIVATE_KEY, polygonNodeUrl, 0, 1);
        },
        gas: 5000000,
        network_id: 137,
        gasPrice: 18000000000 //18 gwei
      },
      live: {
        network_id: 1,
        provider: function () {
          return new HDWalletProvider(PRIVATE_KEY, mainnetNodeUrl);
        },
        gas: 5000000,
        gasPrice: 5000000000,
      },
    },
  plugins: ["solidity-coverage"]
};
