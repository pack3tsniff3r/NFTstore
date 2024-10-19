import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Ensure this is imported for styling
import NavBar from "../NavBar"; // Import NavBar

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
        data: Math.random().toString().slice(-4)
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
  
      await arweave.transactions.sign(contract, "use_wallet");
      const contractResponse = await arweave.transactions.post(contract);
  
      if (contractResponse.status === 200) {
        setContractTxIdDisplay(contract.id);
  
        const paymentTransaction = await arweave.createTransaction({
          target: owner,
          quantity: arweave.ar.arToWinston(newPrice),
        });
  
        await arweave.transactions.sign(paymentTransaction, "use_wallet");
        const paymentResponse = await arweave.transactions.post(paymentTransaction);
  
        if (paymentResponse.status === 200) {
          setPaymentTxIdDisplay(paymentTransaction.id);
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
    <>
      <NavBar />  {/* Add NavBar here */}
      <div className="max-w-lg mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold mb-6">Purchase NFT</h2>
        <div className="border border-silver rounded-lg p-6 bg-gray-800 shadow-md">
          <img 
            src={`https://arweave.net/${oldestTxId}`} 
            alt={`NFT from Transaction ID: ${oldestTxId}`} 
            className="rounded-md w-full h-auto mb-6"
          />
          <div className="mb-4">
            <strong>Title:</strong> {title}
          </div>
          <div className="mb-4">
            <strong>Description:</strong> {description}
          </div>
          <div className="mb-4">
            <strong>Current Owner:</strong> {owner}
          </div>
          <div className="mb-4">
            <strong>Current Price:</strong> {price} AR
          </div>
          <div className="mb-6">
            <label htmlFor="newPrice" className="block text-white mb-2"><strong>Set New Sale Price:</strong></label>
            <input 
              type="number" 
              id="newPrice" 
              value={newPrice} 
              onChange={(e) => setNewPrice(e.target.value)} 
              className="w-full p-2 bg-gray-700 border border-silver rounded-md text-white"
              placeholder="Enter new price"
            />
          </div>
          <button 
            onClick={handlePurchase} 
            className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Confirm Purchase
          </button>
        </div>
        {contractTxIdDisplay && (
          <div className="mt-6 p-4 bg-green-700 text-white rounded-lg shadow-md">
            <strong>Contract Transaction ID:</strong> {contractTxIdDisplay}<br />
            <strong>Payment Transaction ID:</strong> {paymentTxIdDisplay}<br />
            <p className="mt-2">You just sent {newPrice} AR to the wallet address of the seller ({owner})!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Purchase;
