import {useState} from "react";

// @ts-ignore
const Connection = ({ account, setAccount }) => {
  const [error, setError] = useState("");

  const connectWallet = async () => {
    // @ts-ignore
    if(window.ethereum) {
      // @ts-ignore
      const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
      setAccount(accounts[0]);
    } else {
      setError("You need to install metamask");
    }
  }

  return (
    <div>
      <button className="rounded bg-sky-800 text-white p-2" onClick={connectWallet}>Connect Wallet</button>
      {error && (
        <div className="rounded bg-sky-800 text-white p-2">
          {error}
        </div>
      )}
    </div>
  )
}

export default Connection;
