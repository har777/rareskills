import Connection from "../components/Connection";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import ForgebleNftABI from "../abi/forgeableNft.json";
import ForgeABI from "../abi/forge.json";
import NFT from "../components/NFT";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const [provider, setProvider] = useState();
  const [account, setAccount] = useState("");
  const [ethBalance, setEthBalance] = useState("");

  const [forgeableNft, setForgeableNft] = useState();
  const [forge, setForge] = useState();
  const [nftBalances, setNftBalances] = useState({});

  const [mintInCooldown, setMintInCooldown] = useState(true);
  
  const [stageOneLoading, setStageOneLoading] = useState(true);
  const [stageTwoLoading, setStageTwoLoading] = useState(true);

  // To disable all buttons for all items
  const [disableButtons, setDisableButtons] = useState(false);

  const forgeableNftAddress = "0x8102d6B74dD030a4CC30F9c17128f50A2779d89a";
  const forgeAddress = "0x60D9423FD4D675e1C29115CeF3690Dfe8cF47cDC";
  
  const getNftIds = () => {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  // 1. once wallet is connected lets get the provider, signer, wallet address, native token balance, init Forge and NFT contract
  useEffect(() => {
    if(walletConnected) {
      const onWalletLoad = async () => {
        setStageOneLoading(true);

        // @ts-ignore
        const provider: any = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const signer: any = provider.getSigner();

        // @ts-ignore
        const address = await signer.getAddress();
        setAccount(address);

        // @ts-ignore
        const balance = await provider.getBalance(address);
        const ethBalance = ethers.utils.formatEther(balance);
        setEthBalance(ethBalance);

        // @ts-ignore
        const forgeableNft: any = new ethers.Contract(forgeableNftAddress, ForgebleNftABI, signer);
        setForgeableNft(forgeableNft);

        // @ts-ignore
        const forge: any = new ethers.Contract(forgeAddress, ForgeABI, signer);
        setForge(forge);

        setStageOneLoading(false);
      }

      onWalletLoad();      
    }
    return () => {};
  }, [walletConnected]);

  // 2. After account and NFT contract is initialised, if the NFT balances are empty, fetch the current account NFT balances
  useEffect(() => {
    if(account && forgeableNft && Object.keys(nftBalances).length === 0) {
      const onNftInit = async () => {
        setStageTwoLoading(true);

        const addresses = [account, account, account, account, account, account, account];

        // @ts-ignore
        const balances = await forgeableNft.balanceOfBatch(addresses, getNftIds());
        setNftBalances(
          {
            0: balances[0].toNumber(),
            1: balances[1].toNumber(),
            2: balances[2].toNumber(),
            3: balances[3].toNumber(),
            4: balances[4].toNumber(),
            5: balances[5].toNumber(),
            6: balances[6].toNumber(),
          }
        );

        setStageTwoLoading(false);
      }

      onNftInit();
    }
    return () => {};
  }, [forgeableNft, account, nftBalances]);

  // 3. After Forge is initialised, setup a timer check to poll for mint cooldown
  useEffect(() => {
    // @ts-ignore
    let interval;

    if(forge) {
      const checkMintInCooldown = async () => {
        // @ts-ignore
        const mintInCooldown = await forge.isMintInCooldown();
        setMintInCooldown(mintInCooldown);
      }
      interval = setInterval(checkMintInCooldown, 1000);
    }
    return () => { 
      // @ts-ignore
      if(interval) {
        clearInterval(interval) 
      }
    };
  }, [forge]);

  const onWriteAction = async () => {
      // @ts-ignore
      const balance = await provider.getBalance(account);
      const ethBalance = ethers.utils.formatEther(balance);
      setEthBalance(ethBalance);

      const addresses = [account, account, account, account, account, account, account];

      // @ts-ignore
      const balances = await forgeableNft.balanceOfBatch(addresses, getNftIds());
      setNftBalances(
        {
          0: balances[0].toNumber(),
          1: balances[1].toNumber(),
          2: balances[2].toNumber(),
          3: balances[3].toNumber(),
          4: balances[4].toNumber(),
          5: balances[5].toNumber(),
          6: balances[6].toNumber(),
        }
      );

      setDisableButtons(false);
  }

  if(!walletConnected) {
    return (
      <div className="m-auto">
        <Connection setWalletConnected={setWalletConnected} />
      </div>
    )
  }

  if(stageOneLoading || stageTwoLoading) {
    return (
      <div className="m-auto">
        Loading
      </div>
    )
  }

  return (
    <div className="m-auto">
      <div className="flex flex-col rounded border-2 border-gray-400 p-1">
        <div>Connected to {account}</div>
        <div>MATIC balance: {ethBalance}</div>
        <a className="text-sky-800" href="https://testnets.opensea.io/collection/unidentified-contract-up2buxeivo" target="_blank" rel="noreferrer">Opensea</a>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {getNftIds().map((nftId, idx) => {
          return (
            <NFT 
              key={idx} 
              nftId={nftId} 
              nftBalances={nftBalances} 
              onWriteAction={onWriteAction} 
              forgeableNft={forgeableNft} 
              forge={forge} 
              mintInCooldown={mintInCooldown} 
              disableButtons={disableButtons} 
              setDisableButtons={setDisableButtons} 
            />)
        })}
      </div>
    </div>
  )
}
