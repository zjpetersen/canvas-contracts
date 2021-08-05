const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "../canvas/client/src/contracts"),
    compilers: {
      solc: {
        version: "^0.8.4"
      }
    },
  plugins: ["solidity-coverage"]
};
