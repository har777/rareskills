import {useState} from "react";
import Image from "next/image";

// @ts-ignore
const NFT = ({ nftId, counts, account, forgeableNft, forge }) => {
  const imageUrl = `https://gateway.pinata.cloud/ipfs/QmQuLt2abVQsCFNChLuWT6o7SEoBanDi3s8LPx2UAxy21W/${nftId}.png`

  const isBaseToken = nftId == 0 || nftId == 1 || nftId == 2;
  const count = counts[nftId];

  const mintAvailable = isBaseToken;
  const mintDisabled = false;
  const mintOnClick = () => {};

  const tradeAvailable = isBaseToken;
  const tradeDisabled = count == 0;
  const tradeOnClick = () => {};

  const forgeAvailable = !isBaseToken;
  let forgeDisabled = true;
  if(forgeAvailable) {
    if(nftId == 3) {
      forgeDisabled = counts[0] > 0 && counts[1] > 0;
    } else if(nftId == 4) {
      forgeDisabled = counts[1] > 0 && counts[2] > 0;
    } else if(nftId == 5) {
      forgeDisabled = counts[0] > 0 && counts[2] > 0;
    } else if(nftId == 6) {
      forgeDisabled = counts[0] > 0 && counts[1] > 0 && counts[2] > 0;
    }
  }
  const forgeOnClick = () => {};

  const destroyAvailable = !isBaseToken;
  const destroyDisabled = count == 0;
  const destroyOnClick = () => {};

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
          <div className={`flex justify-center rounded border-2 bg-${mintDisabled ? "red" : "lime"}-600 text-white mx-1 mt-2 w-[500px] h-10`}>
            <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
          </div>
        </div>
      )}
      {tradeAvailable && (
        <div className="flex justify-center">
          <div className={`flex justify-center rounded border-2 bg-${tradeDisabled ? "red" : "lime"}-600 text-white mx-1 m-1 w-[500px] h-10`}>
            <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
          </div>
        </div>
      )}
      {forgeAvailable && (
        <div className="flex justify-center">
          <div className={`flex justify-center rounded border-2 bg-${forgeDisabled ? "red" : "lime"}-600 text-white mx-1 mt-2 w-[500px] h-10`}>
            <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
          </div>
        </div>
      )}
      {destroyAvailable && (
        <div className="flex justify-center">
          <div className={`flex justify-center rounded border-2 bg-${destroyAvailable ? "red" : "lime"}-600 text-white mx- m-1 w-[500px] h-10`}>
            <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
          </div>
        </div>
      )}
      <div className="flex justify-center">
        You own: {count}
      </div>
    </div>
  )
}

export default NFT;
