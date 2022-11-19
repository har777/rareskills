import Image from "next/image";
import {useEffect, useState} from "react";

// @ts-ignore
const NFT = ({ nftId, counts, setLoading, refresh, forgeableNft, forge }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [nftLoading, setNftLoading] = useState(true);

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

  const isBaseToken = nftId == 0 || nftId == 1 || nftId == 2;
  const count = counts[nftId];

  const mintAvailable = isBaseToken;
  const mintDisabled = false;
  const mintOnClick = async () => {
    setLoading(true);
    if(nftId == 0) {
      const transaction = await forge.mintRed();
      await transaction.wait();
    } else if(nftId == 1) {
      const transaction = await forge.mintGreen();
      await transaction.wait();
    } else if(nftId == 2) {
      const transaction = await forge.mintBlue();
      await transaction.wait();
    }
    await refresh();
    setLoading(false);
  };

  const tradeAvailable = isBaseToken;
  const tradeDisabled = count == 0;
  const tradeOnClick = async () => {
    await refresh();
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
    if(nftId == 3) {
      const transaction = await forge.forgeYellow();
      await transaction.wait();
    } else if(nftId == 4) {
      const transaction = await forge.forgeCyan();
      await transaction.wait();
    } else if(nftId == 5) {
      const transaction = await forge.forgePink();
      await transaction.wait();
    } else if(nftId == 6) {
      const transaction = await forge.forgeBlack();
      await transaction.wait();
    }
    await refresh();
    setLoading(false);
  };

  const destroyAvailable = !isBaseToken;
  const destroyDisabled = count == 0;
  const destroyOnClick = async () => {
    await refresh();
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
      {mintAvailable && (
        <div className="flex justify-center">
          {mintDisabled ? (
            <div className={`flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[500px] h-10`}>
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          ) : (
            <div className={`flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[500px] h-10`}>
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          )}
        </div>
      )}
      {tradeAvailable && (
        <div className="flex justify-center">
          {tradeDisabled ? (
            <div className={`flex justify-center rounded border-2 bg-rose-600 text-white mx-1 m-1 w-[500px] h-10`}>
              <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
            </div>
          ) : (
            <div className={`flex justify-center rounded border-2 bg-lime-600 text-white mx-1 m-1 w-[500px] h-10`}>
              <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
            </div>
          )}
        </div>
      )}
      {forgeAvailable && (
        <div className="flex justify-center">
          {forgeDisabled ? (
            <div className={`flex justify-center rounded border-2 bg-rose-600 text-white mx-1 mt-2 w-[500px] h-10`}>
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          ) : (
            <div className={`flex justify-center rounded border-2 bg-lime-600 text-white mx-1 mt-2 w-[500px] h-10`}>
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          )}
        </div>
      )}
      {destroyAvailable && (
        <div className="flex justify-center">
          {destroyDisabled ? (
            <div className={`flex justify-center rounded border-2 bg-rose-600 text-white mx- m-1 w-[500px] h-10`}>
              <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
            </div>
          ) : (
            <div className={`flex justify-center rounded border-2 bg-lime -600 text-white mx- m-1 w-[500px] h-10`}>
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
