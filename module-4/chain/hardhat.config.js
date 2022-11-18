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
    polygonMumbai: {
      url: process.env.NETWORK_MUMBAI_URL,
    },
  },
  etherscan: {
    polygonMumbai: {
      goerli: process.env.NETWORK_MUMBAI_URL,
    },
  },
};
