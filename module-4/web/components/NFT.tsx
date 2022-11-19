import Image from "next/image";
import {useEffect, useState} from "react";

// @ts-ignore
const NFT = ({ nftId, counts, setLoading, refresh, forgeableNft, forge, mintInCooldown }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [nftLoading, setNftLoading] = useState(true);
  const [tradeForId, setTradeForId] = useState(0);

  useEffect(() => {
    async function getImageUrl() {
      if(!imageUrl && !isNaN(nftId) && forgeableNft) {
        setNftLoading(true);
        const baseUrl = await forgeableNft.uri(nftId);
        const imageUrl = baseUrl.replace("{id}", nftId);
        setImageUrl(imageUrl);
        setNftLoading(false);
      }
    }
    getImageUrl();
  }, [nftId, forgeableNft])

  const tradeForIdOptions = [0, 1, 2];

  // @ts-ignore
  const onSelectTradeForId = (event) => {
    setTradeForId(event.target.value);
  }

  const isBaseToken = nftId == 0 || nftId == 1 || nftId == 2;
  const count = counts[nftId];

  const mintAvailable = isBaseToken;
  const mintDisabled = mintInCooldown;
  const mintOnClick = async () => {
    setLoading(true);
    const transaction = await forge.mint(nftId);
    await transaction.wait();
    await refresh();
    setLoading(false);
  };

  const tradeAvailable = true;
  const tradeDisabled = count == 0;
  const tradeOnClick = async () => {
    if(tradeForId) {
      setLoading(true);
      const transaction = await forge.trade(nftId, tradeForId);
      await transaction.wait();
      await refresh();
      setLoading(false);
    }
  };

  const forgeAvailable = !isBaseToken;
  let forgeDisabled = true;
  if(forgeAvailable) {
    if(nftId == 3) {
      forgeDisabled = counts[0] === 0 || counts[1] === 0;
    } else if(nftId == 4) {
      forgeDisabled = counts[1] === 0 || counts[2] === 0;
    } else if(nftId == 5) {
      forgeDisabled = counts[0] === 0 || counts[2] === 0;
    } else if(nftId == 6) {
      forgeDisabled = counts[0] === 0 || counts[1] === 0 || counts[2] === 0;
    }
  }
  const forgeOnClick = async () => {
    setLoading(true);
    const transaction = await forge.forge(nftId);
    await transaction.wait();
    await refresh();
    setLoading(false);
  };

  const destroyAvailable = !isBaseToken;
  const destroyDisabled = count == 0;
  const destroyOnClick = async () => {
    setLoading(true);
    const transaction = await forge.burn(nftId);
    await transaction.wait();
    await refresh();
    setLoading(false);
  };

  if(nftLoading) {
    return (
      <div className="rounded border-2 border-slate-600 p-1">
        <div className="flex justify-center">
          Loading
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border-2 border-slate-600 p-1">
      <div className="flex justify-center">
        <Image
          src={imageUrl}
          alt={`NFT: ${nftId}`}
          width={500}
          height={500}
        />
      </div>
      <div className="flex justify-center mx-1 mt-2">
        #{nftId}
      </div>
      {mintAvailable && (
        <div className="flex justify-center">
          {mintDisabled ? (
            <div className="flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          ) : (
            <div className="flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          )}
        </div>
      )}
      {tradeAvailable && (
        <div className="flex justify-center">
          {tradeDisabled ? (
            <div className="flex">
              <div className="flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[405px] h-10">
                <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
              </div>
              <select className="border-2 h-10 mt-2" onChange={onSelectTradeForId} disabled={true} defaultValue={0}>
                <option>Trade for</option>
                {tradeForIdOptions.map((id, index) => {
                  return <option key={index}>{id}</option>
                })}
              </select>
            </div>
          ) : (
            <div className="flex">
              <div className="flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[405px] h-10">
                <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
              </div>
              <select className="border-2 h-10 mt-2" onChange={onSelectTradeForId} defaultValue={0}>
                <option>Trade for</option>
                {tradeForIdOptions.map((id, index) => {
                  return <option key={index}>{id}</option>
                })}
              </select>
            </div>
          )}
        </div>
      )}
      {forgeAvailable && (
        <div className="flex justify-center">
          {forgeDisabled ? (
            <div className="flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          ) : (
            <div className="flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          )}
        </div>
      )}
      {destroyAvailable && (
        <div className="flex justify-center">
          {destroyDisabled ? (
            <div className="flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
            </div>
          ) : (
            <div className="flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[500px] h-10">
              <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center">
        You own: {count}
      </div>
    </div>
  )
}

export default NFT;
