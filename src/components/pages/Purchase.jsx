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
    
            const contract = await arweave.createTransaction({
                data: Math.random().toString().slice(-4)  // Adding random data for the new transaction
            });
    
            // Add tags for the purchase transaction
            contract.addTag('App-Name', 'SmartWeaveAction');
            contract.addTag('App-Version', '0.3.0');
            contract.addTag('Contract-Src', contractSrc);  // Reference to the original contract source
    
            // Add the reference to the original minting transaction
            contract.addTag('Mint-Tx', txId);  // txId refers to the original minting transaction ID (e.g., "abc123")
    
            // Update Init-State for the new purchase
            contract.addTag('Init-State', JSON.stringify({
                owner: walletAddress,  // Set the buyer's wallet as the new owner
                title: currentTitle,   // Allow updating the title
                description: currentDescription,  // Allow updating the description
                price: newPrice,  // Allow the buyer to set a new price
                balance: 1  // Transfer the balance to the buyer
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
            <h1 className="text-center text-2xl font-bold my-5">Purchase NFT</h1>
            <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg">
                <div>
                    <img
                        src={`https://arweave.net/${txId}`}
                        alt={`Transaction ${txId}`}
                        className="w-full h-60 object-cover mb-4"
                    />
                    <h3 className="text-lg font-semibold text-primary">Transaction ID:</h3>
                    <p className="text-sm break-words mb-3">{txId}</p>

                    <h3 className="text-lg font-semibold text-primary">Current Owner:</h3>
                    <p className="text-sm break-words mb-3">{currentOwner}</p>

                    <h3 className="text-lg font-semibold text-primary">Title:</h3>
                    <p className="text-sm break-words mb-3">{currentTitle}</p>

                    <h3 className="text-lg font-semibold text-primary">Description:</h3>
                    <p className="text-sm break-words mb-3">{currentDescription}</p>

                    <h3 className="text-lg font-semibold text-primary">New Price:</h3>
                    <input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full border p-2 mb-3"
                    />

                    <div className="flex items-center mb-3">
                        <input
                            type="checkbox"
                            checked={forSale}
                            onChange={(e) => setForSale(e.target.checked)}
                            className="mr-2"
                        />
                        <label>List for sale</label>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        onClick={handlePurchase}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Purchase'}
                    </button>

                    {newTxId && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-primary">New Transaction ID:</h3>
                            <a
                                href={`https://viewblock.io/arweave/tx/${newTxId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 break-words"
                            >
                                {newTxId}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Purchase;
