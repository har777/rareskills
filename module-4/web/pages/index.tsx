import Connection from "../components/Connection";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import ForgebleNftABI from "../abi/forgeableNft.json";
import ForgeABI from "../abi/forge.json";
import NFT from "../components/NFT";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [counts, setCounts] = useState({});
  const [forgeableNft, setForgeableNft] = useState();
  const [forge, setForge] = useState();
  const [mintInCooldownCheckRunning, setMintInCooldownCheckRunning] = useState(false);
  const [mintInCooldown, setMintInCooldown] = useState(true);
  const [loading, setLoading] = useState(true);
  const [disableButtons, setDisableButtons] = useState(false);

  const forgeableNftAddress = "0x8102d6B74dD030a4CC30F9c17128f50A2779d89a";
  const forgeAddress = "0x60D9423FD4D675e1C29115CeF3690Dfe8cF47cDC";

  const nftIds = [0, 1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if(signer) {
      setLoading(true);
      refresh();
      setLoading(false);
    }
    return () => {};
  }, [signer]);

  useEffect(() => {
    if(walletConnected) {
      setLoading(true);
      handleWalletConnected();
      setLoading(false);
    }
    return () => {};
  }, [walletConnected]);

  const handleWalletConnected = async () => {
    setLoading(true);

    // @ts-ignore
    const provider: any = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const signer: any = provider.getSigner();
    setSigner(signer);

    // @ts-ignore
    const forgeableNft: any = new ethers.Contract(forgeableNftAddress, ForgebleNftABI, signer);
    setForgeableNft(forgeableNft);

    // @ts-ignore
    const forge: any = new ethers.Contract(forgeAddress, ForgeABI, signer);
    setForge(forge);

    setLoading(false);
  }

  const refreshAccount = async () => {
    // @ts-ignore
    const address = await signer.getAddress();
    setAccount(address);
  }

  const refreshEthBalance = async () => {
    // @ts-ignore
    const address = await signer.getAddress();
    // @ts-ignore
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.utils.formatEther(balance);
    setEthBalance(ethBalance);
  }

  const refreshCounts = async () => {
    // @ts-ignore
    const account = await signer.getAddress();
    const addresses = [account, account, account, account, account, account, account];
    // @ts-ignore
    const balances = await forgeableNft.balanceOfBatch(addresses, nftIds);
    setCounts(
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
  }

  const checkMintInCooldown = async () => {
    if(forge) {
      // @ts-ignore
      const mintInCooldown = await forge.isMintInCooldown();
      setMintInCooldown(mintInCooldown);
    }
  }

  const refresh = async () => {
    refreshEthBalance();
    refreshCounts();
    checkMintInCooldown();
    if(!mintInCooldownCheckRunning) {
      setInterval(checkMintInCooldown, 1000);
      setMintInCooldownCheckRunning(true);
    }
  }

  if(!walletConnected) {
    return (
      <div className="m-auto">
        <Connection setWalletConnected={setWalletConnected} />
      </div>
    )
  }

  if(loading) {
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
        {nftIds.map((nftId, idx) => {
          return <NFT key={idx} nftId={nftId} counts={counts} refresh={refresh} forgeableNft={forgeableNft} forge={forge} mintInCooldown={mintInCooldown} disableButtons={disableButtons} setDisableButtons={setDisableButtons} />
        })}
      </div>
    </div>
  )
}
