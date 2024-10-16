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
  const [contractTxIdDisplay, setContractTxIdDisplay] = useState("");
  const [paymentTxIdDisplay, setPaymentTxIdDisplay] = useState("");

  const handlePurchase = async () => {
    const arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    try {
      // Step 1: Create the smart contract transaction (to update ownership)
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
  
      // Step 2: Sign and post the contract transaction
      await arweave.transactions.sign(contract, "use_wallet");
      const contractResponse = await arweave.transactions.post(contract);
  
      if (contractResponse.status === 200) {
        setContractTxIdDisplay(contract.id); // Set contract transaction ID for display
  
        // Step 3: If contract transaction is successful, transfer AR tokens to the seller
        const paymentTransaction = await arweave.createTransaction({
          target: owner,  // The current owner of the NFT (seller)
          quantity: arweave.ar.arToWinston(newPrice),  // Convert price from AR to winston (ARweave's smallest unit)
        });
  
        // Step 4: Sign and post the payment transaction
        await arweave.transactions.sign(paymentTransaction, "use_wallet");
        const paymentResponse = await arweave.transactions.post(paymentTransaction);
  
        if (paymentResponse.status === 200) {
          setPaymentTxIdDisplay(paymentTransaction.id); // Set payment transaction ID for display
          toast.success(`Transaction successful! Contract Tx ID: ${contract.id}`);
          toast.success(`AR sent to seller! Payment Tx ID: ${paymentTransaction.id}`);
        } else {
          toast.error(`Payment transaction failed! Status: ${paymentResponse.status}`);
        }

        navigate('/');
      } else {
        toast.error(`Contract transaction failed! Status: ${contractResponse.status}`);
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
      {contractTxIdDisplay && (
        <div className="mt-4 p-4 bg-green-800 text-white rounded-md">
          <strong>Contract Transaction ID:</strong> {contractTxIdDisplay}<br />
          <strong>Payment Transaction ID:</strong> {paymentTxIdDisplay}<br />
          <p>You just sent {newPrice} AR to the wallet address of the seller ({owner})!</p>
        </div>
      )}
    </div>
  );
};

export default Purchase;
