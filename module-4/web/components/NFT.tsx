import Image from "next/image";
import {useEffect, useState} from "react";

// @ts-ignore
const NFT = ({ nftId, counts, refresh, forgeableNft, forge, mintInCooldown, disableButtons, setDisableButtons }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [nftLoading, setNftLoading] = useState("");
  const [tradeForId, setTradeForId] = useState(0);

  useEffect(() => {
    async function getImageUrl() {
      if(!imageUrl && !isNaN(nftId) && forgeableNft) {
        setDisableButtons(true);
        setNftLoading("Getting metadata");
        const metadataIpfs = await forgeableNft.uri(nftId);
        const metadataUrl = metadataIpfs.replace("ipfs://", "https://ipfs.io/ipfs/").replace("{id}", nftId);
        const metadata = await fetch(metadataUrl);
        // @ts-ignore
        const imageIpfs = (await metadata.json()).image;
        const imageUrl = imageIpfs.replace("ipfs://", "https://ipfs.io/ipfs/");
        setImageUrl(imageUrl);
        setDisableButtons(false);
        setNftLoading("");
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
  const mintDisabled = mintInCooldown || disableButtons;
  const mintOnClick = async () => {
    setDisableButtons(true);
    setNftLoading("Minting");
    try {
      const transaction = await forge.mint(nftId);
      await transaction.wait();
    } catch(err) {
      console.log(`Mint transaction for id: ${nftId} rejected`);
    }
    setDisableButtons(false);
    setNftLoading("");
    await refresh();
  };

  const tradeAvailable = true;
  const tradeDisabled = count == 0 || disableButtons;
  const tradeOnClick = async () => {
    if(tradeForId) {
      setDisableButtons(true);
      setNftLoading("Trading");
      try {
        const transaction = await forge.trade(nftId, tradeForId);
        await transaction.wait(); 
      } catch (error) {
        console.log(`Trade transaction for id: ${nftId} rejected`);
      }
      setDisableButtons(false);
      setNftLoading("");
      await refresh();
    }
  };

  const forgeAvailable = !isBaseToken;
  let forgeDisabled = disableButtons;
  if(!disableButtons) {
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
    setDisableButtons(true);
    setNftLoading("Forging");
    try {
      const transaction = await forge.forge(nftId);
      await transaction.wait();   
    } catch (error) {
      console.log(`Forge transaction for id: ${nftId} rejected`);
    }
    setDisableButtons(false);
    setNftLoading("");
    await refresh();
  };

  const destroyAvailable = !isBaseToken;
  const destroyDisabled = count == 0 || disableButtons;
  const destroyOnClick = async () => {
    setDisableButtons(true);
    setNftLoading("Destroying");
    try {
      const transaction = await forge.burn(nftId);
      await transaction.wait();   
    } catch (error) {
      console.log(`Destroy transaction for id: ${nftId} rejected`);
    }
    setDisableButtons(false);
    setNftLoading("");
    await refresh();
  };

  if(nftLoading) {
    return (
      <div className="rounded border-2 border-gray-400 p-4 pb-1 hover:border-gray-900">
        <div className="flex justify-center">
          {nftLoading}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border-2 border-gray-400 p-4 pb-1 hover:border-gray-900">
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
            <div className="flex justify-center rounded bg-sky-800 opacity-25 text-white mx-1 mt-2 grow h-10">
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          ) : (
            <div className="flex justify-center rounded bg-sky-800 text-white mx-1 mt-2 grow h-10">
              <button onClick={mintOnClick} disabled={mintDisabled}>Mint</button>
            </div>
          )}
        </div>
      )}

      {forgeAvailable && (
        <div className="flex justify-center">
          {forgeDisabled ? (
            <div className="flex justify-center rounded bg-sky-800 opacity-25 text-white mx-1 mt-2 grow h-10">
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          ) : (
            <div className="flex justify-center rounded bg-sky-800 text-white mx-1 mt-2 grow h-10">
              <button onClick={forgeOnClick} disabled={forgeDisabled}>Forge</button>
            </div>
          )}
        </div>
      )}

      {tradeAvailable && (
        <div className="flex justify-center">
          {tradeDisabled ? (
            <div className="flex grow">
              <div className="flex justify-center rounded bg-sky-800 opacity-25 text-white mx-1 mt-2 h-10 grow">
                <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
              </div>
              <select className="border-2 border-gray-400 rounded h-10 mt-2 ml-1 mr-1" onChange={onSelectTradeForId} disabled={true} defaultValue={0}>
                <option>Trade for</option>
                {tradeForIdOptions.map((id, index) => {
                  return <option key={index}>{id}</option>
                })}
              </select>
            </div>
          ) : (
            <div className="flex grow">
              <div className="flex justify-center rounded bg-sky-800 text-white mx-1 mt-2 h-10 grow">
                <button onClick={tradeOnClick} disabled={tradeDisabled}>Trade</button>
              </div>
              <select className="border-2 border-gray-400 rounded h-10 mt-2 ml-1 mr-1" onChange={onSelectTradeForId} defaultValue={0}>
                <option>Trade for</option>
                {tradeForIdOptions.map((id, index) => {
                  return <option key={index}>{id}</option>
                })}
              </select>
            </div>
          )}
        </div>
      )}

      {destroyAvailable && (
        <div className="flex justify-center">
          {destroyDisabled ? (
            <div className="flex justify-center rounded bg-sky-800 opacity-25 text-white mx-1 mt-2 grow h-10">
              <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
            </div>
          ) : (
            <div className="flex justify-center rounded bg-sky-800 text-white mx-1 mt-2 grow h-10">
              <button onClick={destroyOnClick} disabled={destroyDisabled}>Destroy</button>
            </div>
          )}
        </div>
      )}
      <div className="flex mt-1 justify-center">
        You own: {count}
      </div>
    </div>
  )
}

export default NFT;
