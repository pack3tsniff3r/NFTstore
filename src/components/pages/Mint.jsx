import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';

export const Mint = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [contractId, setContractId] = useState("");
    const [imageTxId, setImageTxId] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleMint = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        // Logic to mint NFT on Arweave
        try {
            const arweave = Arweave.init();
            const address = await useActiveAddress();
            // Implement your minting logic here, including file upload and contract creation
            // After minting, set the contractId and imageTxId
            setShowConfirmation(true);
        } catch (err) {
            setError("Minting failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-center text-3xl font-bold mb-6">Mint Your NFT</h1>
            <form onSubmit={handleMint} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">File</label>
                    <input 
                        type="file" 
                        id="file" 
                        onChange={handleFileChange} 
                        required 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
                >
                    {loading ? "Minting..." : "Mint NFT"}
                </button>
                {error && <p className="text-red-600">{error}</p>}
                {showConfirmation && (
                    <div className="confirmation-message mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        <h2 className="font-bold">Minting Successful!</h2>
                        <p>Your NFT has been minted with the following Transaction IDs:</p>
                        <p>Contract Source: {contractId}</p>
                        <p>Image: {imageTxId}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Mint;
