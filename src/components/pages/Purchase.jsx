import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Ensure this is imported for styling

export const Purchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const walletAddress = useActiveAddress();

  // Extract the data passed from the Home component
  const { contractTxId, price, owner, oldestTxId, title, description } = location.state;
  const [newPrice, setNewPrice] = useState(price);

  const handlePurchase = async () => {
    const arweave = Arweave.init();

    // Create a new transaction for the purchase
    const contract = await arweave.createTransaction({
      data: Math.random().toString().slice(-4)  // Adding random data for the new transaction
    });

    // Add tags for the purchase transaction
    contract.addTag('App-Name', 'SmartWeaveAction');
    contract.addTag('App-Version', '0.3.0');
    contract.addTag('Network', 'Perma-Press');
    contract.addTag('Contract-Src', contractTxId);  // Reference to the original contract source
    contract.addTag('Original-Tx-Id', oldestTxId);  // Reference to the original minting transaction

    // Update Init-State for the new purchase
    contract.addTag('Init-State', JSON.stringify({
      owner: walletAddress,  // Set the buyer's wallet as the new owner
      title: title,   // Keep the title the same
      description: description,  // Keep the description the same
      price: newPrice,  // Allow the buyer to set a new price
      balance: 1,  // Transfer the balance to the buyer
    }));

    // Sign and post the transaction
    try {
      await arweave.transactions.sign(contract, "use_wallet");
      const response = await arweave.transactions.post(contract);

      if (response.status === 200) {
        // Show success toast and navigate back after a short delay
        toast.success(`Purchase successful! Transaction ID: ${contract.id}`);
        setTimeout(() => {
          navigate('/');  // Navigate back to home after success
        }, 3000);  // Wait 3 seconds before redirecting
      } else {
        toast.error('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      toast.error('Transaction error. Please try again.');
    }
  };

  return (
    <div className="purchase-container">
      {/* Displaying the NFT image */}
      <img src={`https://arweave.net/${oldestTxId}`} alt="NFT" />

      {/* Displaying contract details */}
      <div className="nft-details">
        <p><strong>Contract-Src:</strong> {contractTxId}</p>
        <p><strong>Original-Tx-Id:</strong> {oldestTxId}</p>
        <p><strong>Current Owner:</strong> {owner}</p>
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Price:</strong>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </p>
      </div>

      <button onClick={handlePurchase}>Confirm Purchase</button>
    </div>
  );
};

export default Purchase;
