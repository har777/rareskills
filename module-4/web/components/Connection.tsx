import {useState} from "react";

// @ts-ignore
const Connection = ({ setWalletConnected }) => {
  const [error, setError] = useState("");

  const connectWallet = async () => {
    // @ts-ignore
    if(window.ethereum) {
      // Connect to wallet
      // @ts-ignore
      await window.ethereum.request({method: "eth_requestAccounts"});

      // Change network to polygon mumbai
      try {
        // @ts-ignore
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });

        setWalletConnected(true);
      } catch (switchError) {
        // This error code indicates that the chain has not been added to wallet
        // Try adding the chain
        // @ts-ignore
        if (switchError.code === 4902) {
          try {
            // @ts-ignore
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                  chainName: "Mumbai",
                  rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                  nativeCurrency: {
                    name: "Matic Token",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                },
              ],
            });
            // @ts-ignore
            setWalletConnected(true);
          } catch (addError) {
            setError("Error adding polygon mumbai chain to wallet");
          }
        } else {
          setError("Error switching ethereum chain")
        }
      }

      // If network is changed get wallet to unconnected again
      // @ts-ignore
      window.ethereum.on('networkChanged', function (networkId) {
        if(networkId !== 8001) {
          setWalletConnected(false);
        }
      })
    } else {
      setError("You need to install metamask");
    }
  }

  return (
    <div>
      <button className="rounded bg-sky-800 text-white p-2" onClick={connectWallet}>Connect Wallet</button>
      {error && (
        <div className="rounded bg-red-700 text-white p-2 m-2">
          {error}
        </div>
      )}
    </div>
  )
}

export default Connection;
