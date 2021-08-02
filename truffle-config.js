const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "contracts/build"),
    compilers: {
      solc: {
        version: "^0.8.4"
      }
    },
  plugins: ["solidity-coverage"]
};
