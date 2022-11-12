require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20_000,
      },
    },
  },
  networks: {
    goerli: {
      url: process.env.NETWORK_GOERLI_URL,
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_GOERLI_API_KEY,
    },
  },
};
