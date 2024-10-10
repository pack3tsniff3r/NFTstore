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

    const { walletAddress } = useActiveAddress();

    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const location = useLocation();
    const { txId, currentOwner, currentPrice, currentTitle, currentDescription, cSrcId } = location.state || {};

    // Ensure that the buyer can see the current title and description
    useEffect(() => {
        setNewTitle(currentTitle);
        setNewDescription(currentDescription);
        setNewPrice(currentPrice);
    }, [currentTitle, currentDescription, currentPrice]);

    const handlePurchase = async () => {
        setLoading(true);
        setError("");

        try {
            // Create a transaction for updating the Init-State
            const contractTx = await arweave.createTransaction({ data: "" });
            contractTx.addTag('App-Name', 'SmartWeaveContract');
            contractTx.addTag('App-Version', '0.3.1');
            contractTx.addTag('Contract-Src', cSrcId); // Reference the cSrc.id
            contractTx.addTag('Init-State', JSON.stringify({
                owner: walletAddress, // Update the owner to the buyer's wallet
                title: newTitle,
                description: newDescription,
                ticker: 'ATOMICNFT',
                balances: {
                    [currentOwner]: 0, // Set seller's balance to 0
                    [walletAddress]: 1 // Set buyer's balance to 1
                },
                price: newPrice,
                locked: [],
                contentType: 'application/octet-stream',
                createdAt: Date.now(),
                tags: [],
                isPrivate: false
            }));

            // Sign and post the transaction
            await arweave.transactions.sign(contractTx, "use_wallet");
            await arweave.transactions.post(contractTx);

            // You can navigate back or show a success message
            alert("Purchase successful!");
        } catch (err) {
            console.error(err);
            setError("Purchase failed, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Purchase NFT</h1>
            <p><strong>Current Owner:</strong> {currentOwner}</p>
            <p><strong>Current Title:</strong> {currentTitle}</p>
            <p><strong>Current Description:</strong> {currentDescription}</p>
            <p><strong>Current Price:</strong> {currentPrice} AR</p>

            <form onSubmit={(e) => { e.preventDefault(); handlePurchase(); }}>
                <input 
                    type="text" 
                    placeholder="New Title" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="New Description" 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="New Price" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(e.target.value)} 
                    required 
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Purchase NFT'}
                </button>
            </form>
        </div>
    );
};

export default Purchase;
