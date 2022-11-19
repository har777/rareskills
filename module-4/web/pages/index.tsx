import Connection from "../components/Connection";
import {useEffect, useState} from "react";
import {ethers} from "ethers";
import ForgebleNftABI from "../abi/forgeableNft.json";
import ForgeABI from "../abi/forge.json";
import NFT from "../components/NFT";

export default function Home() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [ethBalance, setEthBalance] = useState("");
  const [counts, setCounts] = useState({});
  const [forgeableNft, setForgeableNft] = useState();
  const [forge, setForge] = useState();
  const [loading, setLoading] = useState(true);

  const forgeableNftAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const forgeAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  const nftIds = [0, 1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if(signer) {
      setLoading(true);
      refresh();
      setLoading(false);
    }
    return () => {};
  }, [signer]);

  const handleAccountConnect = async (account: string) => {
    setLoading(true);

    setAccount(account);

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

  const refreshEthBalance = async () => {
    // @ts-ignore
    const address = await signer.getAddress();
    // @ts-ignore
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.utils.formatEther(balance);
    setEthBalance(ethBalance);
  }

  const refreshCounts = async () => {
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

  const refresh = async () => {
    refreshEthBalance();
    refreshCounts();
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
          return <NFT key={idx} nftId={nftId} counts={counts} refresh={refresh} setLoading={setLoading} forgeableNft={forgeableNft} forge={forge} />
        })}
      </div>
    </div>
  )
}
