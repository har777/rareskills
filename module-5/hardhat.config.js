require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.7.6",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.4.26",
      },
    ],
  },
};
