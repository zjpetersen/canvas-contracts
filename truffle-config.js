const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");

const MNEMONIC = process.env.MNEMONIC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NODE_API_KEY = process.env.INFURA_PROJECT_ID || process.env.ALCHEMY_KEY;
const isInfura = !!process.env.INFURA_KEY;

const needsNodeAPI =
  process.env.npm_config_argv &&
  (process.env.npm_config_argv.includes("rinkeby") ||
    process.env.npm_config_argv.includes("live"));

if ((!MNEMONIC || !NODE_API_KEY) && needsNodeAPI) {
  console.error("Please set a mnemonic and ALCHEMY_KEY or INFURA_KEY.");
  process.exit(0);
}

const rinkebyNodeUrl = isInfura
  ? "wss://rinkeby.infura.io/ws/v3/" + NODE_API_KEY
  : "https://eth-rinkeby.alchemyapi.io/v2/" + NODE_API_KEY;

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
      live: {
        network_id: 1,
        provider: function () {
          return new HDWalletProvider(MNEMONIC, mainnetNodeUrl);
        },
        gas: 5000000,
        gasPrice: 5000000000,
      },
    },
  plugins: ["solidity-coverage"]
};
