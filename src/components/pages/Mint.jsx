import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';
import NavBar from "../NavBar"; // Import NavBar

export const Mint = () => {
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });

    const walletAddress = useActiveAddress();
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [contractId, setContractId] = useState("");
    const [imageTxId, setImageTxId] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleMint = async (e) => {
        e.preventDefault();
        if (!selectedFile || !price || !title || !description) {
            setError('Please provide a title, description, file, and price.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Contract Source Upload
            const contractSrc = `...contract source code...`;
            const contractSrcTx = await arweave.createTransaction({ data: contractSrc });
            contractSrcTx.addTag("Content-Type", "text/javascript");
            contractSrcTx.addTag('App-Name', 'SmartWeaveAction');
            await arweave.transactions.sign(contractSrcTx, "use_wallet");
            await arweave.transactions.post(contractSrcTx);
            setContractId(contractSrcTx.id);

            // Step 2: File Upload
            const fileArrayBuffer = await selectedFile.arrayBuffer();
            const imageTransaction = await arweave.createTransaction({ data: fileArrayBuffer });
            imageTransaction.addTag("Network", "Perma-Press");
            imageTransaction.addTag("Content-Type", selectedFile.type);
            imageTransaction.addTag("Init-State", JSON.stringify({ owner: walletAddress, title, description, price, balance: 1 }));
            imageTransaction.addTag("Contract-Src", contractSrcTx.id);
            await arweave.transactions.sign(imageTransaction, "use_wallet");
            await arweave.transactions.post(imageTransaction);

            setImageTxId(imageTransaction.id);
            setShowConfirmation(true);
        } catch (err) {
            setError('Error minting NFT: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-silver min-h-screen">
            <NavBar /> {/* Include NavBar here */}
            <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-center text-2xl font-bold text-white mb-6">Mint Your NFT</h1>
                <form onSubmit={handleMint} className="border border-silver rounded p-6">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-white mb-2">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-white mb-2">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-purple-500"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-white mb-2">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="file" className="block text-white mb-2">File</label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            required
                            className="w-full text-white bg-gray-700 rounded px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {loading ? "Minting..." : "Mint NFT"}
                    </button>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                    {showConfirmation && (
                        <div className="mt-6 text-center">
                            <h2 className="text-green-500">Minting Successful!</h2>
                            <p>Your NFT has been minted with the following Transaction IDs:</p>
                            <p className="text-white">Contract Source: {contractId}</p>
                            <p className="text-white">Image: {imageTxId}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Mint;
