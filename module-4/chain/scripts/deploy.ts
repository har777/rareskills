import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import {
  DefenderRelayProvider,
  DefenderRelaySigner,
} from "defender-relay-client/lib/ethers";

async function main() {
  const credentials = {
    apiKey: process.env.RELAYER_DEPLOYER_KEY as string,
    apiSecret: process.env.RELAYER_DEPLOYER_SECRET as string,
  };

  const provider = new DefenderRelayProvider(credentials);
  const relaySigner = new DefenderRelaySigner(credentials, provider, {
    speed: "fast",
  });

  const ForgeableNFT = await ethers.getContractFactory(
    "ForgeableNFT",
    relaySigner
  );
  const forgeableNFT = await ForgeableNFT.deploy();
  await forgeableNFT.deployed();

  const Forge = await ethers.getContractFactory("Forge", relaySigner);
  const forge = await Forge.deploy(forgeableNFT.address);
  await forge.deployed();

  await forgeableNFT.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE")),
    forge.address
  );
  await forgeableNFT.setURI(
    "ipfs://QmQ1p8VZyLitemj4fK4DYoo4eY2RenSCVkWUfjp5bwBfjb/{id}"
  );

  console.log(`ForgeableNFT: ${forgeableNFT.address}`);
  console.log(`Forge: ${forge.address}`);
}

if (require.main === module) {
  dotenv.config();
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
