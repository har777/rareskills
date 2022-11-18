import {useState} from "react";

// @ts-ignore
const Connection = ({ account, setAccount }) => {
  const [error, setError] = useState("");

  const connectMetamask = async () => {
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
      <button className="rounded border-2 border-lime-600 p-1" onClick={connectMetamask}>Connect Metamask</button>
      {error && (
        <div className="rounded border-2 border-rose-600 p-1">
          {error}
        </div>
      )}
    </div>
  )
}

export default Connection;
