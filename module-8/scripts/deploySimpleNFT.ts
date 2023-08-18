import * as dotenv from "dotenv";
import { ethers, upgrades } from "hardhat";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
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

  const SimpleNFT = await ethers.getContractFactory("SimpleNFT", relaySigner);
  const simpleNFT = await upgrades.deployProxy(SimpleNFT, [], { kind: "uups" });
  await simpleNFT.deployed();

  const proxyAddress = simpleNFT.address;
  console.log(`SimpleNFT Proxy: ${proxyAddress}`);

  const currentImplAddress = await getImplementationAddress(
    provider,
    proxyAddress
  );
  console.log(`SimpleNFT Implementation: ${currentImplAddress}`);
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
