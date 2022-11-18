import Connection from "../components/Connection";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import ForgebleNftABI from "../abi/forgeableNft.json";
import ForgeABI from "../abi/forge.json";
import NFT from "../components/NFT";
import {Simulate} from "react-dom/test-utils";

export default function Home() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [ethBalance, setEthBalance] = useState("");
  const [counts, setCounts] = useState({});
  const [forgeableNft, setForgeableNft] = useState();
  const [forge, setForge] = useState();
  const [loading, setLoading] = useState(true);

  const forgeableNftAddress = "";
  const forgeAddress = "";

  const nftIds = [0, 1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if(provider) {
      setLoading(true);
      refreshEthBalance();
      refreshCounts();
      setLoading(false);
    }
    return () => {};
  }, [signer]);

  const handleAccountConnect = async (account: string) => {
    setAccount(account);

    // @ts-ignore
    const provider: any = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const signer: any = provider.getSigner();
    setSigner(signer);

    // // @ts-ignore
    // const forgeableNft: any = new ethers.Contract(forgeableNftAddress, ForgebleNftABI, signer);
    // setForgeableNft(forgeableNft);
    //
    // // @ts-ignore
    // const forge: any = new ethers.Contract(forgeAddress, ForgeABI, signer);
    // setForge(forge);
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
    setCounts(
      {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
      }
    );
  }

  if(!account) {
    return (
      <div className="m-auto">
        <Connection account={account} setAccount={handleAccountConnect} />
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
      <div className="flex flex-col rounded border-2 border-slate-600 p-1">
        <div>Connected to {account}</div>
        <div>ETH balance: {ethBalance}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-2">
        {nftIds.map((nftId, idx) => {
          return <NFT key={idx} nftId={nftId} counts={counts} account={account} forgeableNft={forgeableNft} forge={forge} />
        })}
      </div>
    </div>
  )
}
