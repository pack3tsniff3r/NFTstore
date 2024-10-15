import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Ensure this is imported for styling
import './Purchase.css'; // Import the CSS for custom styles

export const Purchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const walletAddress = useActiveAddress();

  const { contractTxId, price, owner, oldestTxId, title, description } = location.state;
  const [newPrice, setNewPrice] = useState(price);

  const handlePurchase = async () => {
    const arweave = Arweave.init();

    const contract = await arweave.createTransaction({
      data: Math.random().toString().slice(-4)  // Adding random data for the new transaction
    });

    contract.addTag('App-Name', 'SmartWeaveAction');
    contract.addTag('App-Version', '0.3.0');
    contract.addTag('Network', 'Perma-Press');
    contract.addTag('Contract-Src', contractTxId);
    contract.addTag('Original-Tx-Id', oldestTxId);

    contract.addTag('Init-State', JSON.stringify({
      owner: walletAddress,
      title: title,
      description: description,
      price: newPrice,
      balance: 1,
    }));

    try {
      await arweave.transactions.sign(contract);
      const response = await arweave.transactions.post(contract);

      if (response.status === 200) {
        toast.success(`Transaction successful! Transaction ID: ${contract.id}`);
        navigate('/');
      } else {
        toast.error(`Transaction failed! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error posting transaction:", error);
      toast.error("An error occurred while processing the transaction.");
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Purchase NFT</h2>
      <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
        <img 
          src={`https://arweave.net/${oldestTxId}`} 
          alt={`NFT from Transaction ID: ${oldestTxId}`} 
          className="rounded-md w-full h-auto mb-4"
        />
        <strong>Title:</strong> {title}<br />
        <strong>Description:</strong> {description}<br />
        <strong>Current Owner:</strong> {owner}<br />
        <strong>Current Price:</strong> {price}<br />
        <label className="block mt-4">
          <strong>Set New Sale Price:</strong>
          <input 
            type="number" 
            value={newPrice} 
            onChange={(e) => setNewPrice(e.target.value)} 
            className="mt-2 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
            placeholder="Enter new price"
          />
        </label>
        <button 
          onClick={handlePurchase} 
          className="mt-4 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};

export default Purchase;
