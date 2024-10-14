import React, { useState, useEffect } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';
import { useLocation } from 'react-router-dom';

export const Purchase = () => {
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });

    const walletAddress = useActiveAddress();
    const [newPrice, setNewPrice] = useState("");
    const [forSale, setForSale] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newTxId, setNewTxId] = useState(null);

    const location = useLocation();
    const { txId, currentOwner, currentPrice, currentTitle, currentDescription, contractSrc } = location.state || {};

    useEffect(() => {
        // Set the new price to the current price upon component mount
        setNewPrice(currentPrice);
    }, [currentPrice]);

    const handlePurchase = async () => {
        setLoading(true);
        setError("");
        setNewTxId(null);
    
        try {
            const input = {
                function: 'buy',
                newPrice: newPrice,
                newTitle: currentTitle,  
                newDescription: currentDescription, 
                forSale: forSale  
            };
    
            // Create a new transaction for the purchase
            const contract = await arweave.createTransaction({
                data: Math.random().toString().slice(-4)  // Adding random data for the new transaction
            });
    
            // Add tags for the purchase transaction
            contract.addTag('App-Name', 'SmartWeaveAction');
            contract.addTag('App-Version', '0.3.0');
            contract.addTag('Network', 'PermaPress');
            contract.addTag('Contract-Src', contractSrc);  // Reference to the original contract source
    
            // Add the reference to the original minting transaction
            contract.addTag('Original-Tx-Id', txId);  // txId refers to the original minting transaction ID (e.g., "abc123")
    
            // Update Init-State for the new purchase
            contract.addTag('Init-State', JSON.stringify({
                owner: walletAddress,  // Set the buyer's wallet as the new owner
                title: currentTitle,   // Allow updating the title
                description: currentDescription,  // Allow updating the description
                price: newPrice,  // Allow the buyer to set a new price
                balance: 1,  // Transfer the balance to the buyer
                sold: true  // Mark this transaction as sold
            }));
    
            // Sign and post the transaction
            await arweave.transactions.sign(contract, "use_wallet");
            await arweave.transactions.post(contract);
    
            setNewTxId(contract.id);  // Set the new transaction ID
            alert('NFT purchased successfully!');
        } catch (err) {
            setError("An error occurred during the transaction.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto">
            <h1 className="text-center text-3xl font-bold mb-5">Purchase NFT</h1>
            
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            <div className="mt-4">
                <p><strong>Title:</strong> {currentTitle}</p>
                <p><strong>Description:</strong> {currentDescription}</p>
                <p><strong>Current Owner:</strong> {currentOwner}</p>
                <p><strong>Current Price:</strong> {currentPrice}</p>
            </div>
            
            <div className="mt-4">
                <label htmlFor="newPrice" className="block text-lg font-semibold">New Price</label>
                <input
                    type="text"
                    id="newPrice"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="border rounded p-2 w-full"
                />
            </div>
            
            <div className="mt-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={forSale}
                        onChange={() => setForSale(!forSale)}
                    />
                    <span className="ml-2">Put NFT for sale</span>
                </label>
            </div>
            
            <button 
                onClick={handlePurchase} 
                className={`mt-6 bg-green-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50' : ''}`}
                disabled={loading}
            >
                {loading ? "Processing..." : "Confirm Purchase"}
            </button>
            
            {newTxId && (
                <div className="mt-4">
                    <p><strong>New Transaction ID:</strong></p>
                    <a
                        href={`https://viewblock.io/arweave/tx/${newTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        {newTxId}
                    </a>
                </div>
            )}
        </div>
    );
};

export default Purchase;
