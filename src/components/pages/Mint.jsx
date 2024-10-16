import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress } from 'arweave-wallet-kit';

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

    const getContentType = (file) => {
        return file.type || "application/octet-stream";
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const convertFileToArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
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
            // Step 1: Upload Contract Source Code
            const contractSrc = `
const functions = { balance, transfer, updateState, buy };

export function handle(state, action) {
    if (Object.keys(functions).includes(action.input.function)) {
        return functions[action.input.function](state, action);
    }
    throw new ContractError('function not defined!');
}

function balance(state, action) {
    const { input, caller } = action;
    let target = input.target ? input.target : caller;
    const { ticker, balances } = state;
    ContractAssert(typeof target === 'string', 'Must specify target to retrieve balance for');
    return {
        result: {
            target,
            ticker,
            balance: target in balances ? balances[target] : 0
        }
    };
}

function transfer(state, action) {
    const { input, caller } = action;
    const { target, qty } = input;
    ContractAssert(target, 'No target specified');
    ContractAssert(caller !== target, 'Invalid Token Transfer.');
    ContractAssert(qty, 'No quantity specified');
    const { balances } = state;
    ContractAssert(
        caller in balances && balances[caller] >= qty,
        'Caller has insufficient funds'
    );
    balances[caller] -= qty;
    if (!(target in balances)) {
        balances[target] = 0;
    }
    balances[target] += qty;
    state.balances = balances;
    return { state };
}

function updateState(state, action) {
    const { input, caller } = action;
    ContractAssert(caller === state.owner, 'Only the owner can update the state');
    state.owner = input.newOwner; // Update owner
    state.title = input.newTitle; // Update title
    state.description = input.newDescription; // Update description
    state.price = input.newPrice; // Update price
    state.forSale = input.forSale; // Update for sale status
    return { state };
}

function buy(state, action) {
    const { input, caller } = action;
    const { price, newTitle, newDescription, forSale } = input;

    // Ensure the buyer can afford the price
    ContractAssert(caller in state.balances && state.balances[caller] >= price, 'Insufficient funds');

    // Transfer ownership
    state.balances[state.owner] = 0;  // Set seller's balance to 0
    state.balances[caller] = 1; // Set buyer's balance to 1

    // Update the Init-State
    state.owner = caller;
    state.title = newTitle; // Update title to new title
    state.description = newDescription; // Update description to new description
    state.price = price; // Update price
    state.forSale = forSale; // Update for sale status
    state.sold = true; // Mark as sold

    return { state };
};

export { handle };
`;

            const contractSrcTx = await arweave.createTransaction({
                data: contractSrc,
            });
            contractSrcTx.addTag("Content-Type", "text/javascript");
            contractSrcTx.addTag('App-Name', 'SmartWeaveAction');
            await arweave.transactions.sign(contractSrcTx, "use_wallet"); // Sign with wallet address
            await arweave.transactions.post(contractSrcTx);

            setContractId(contractSrcTx.id);  // Save the Contract ID

            // Step 2: Convert file to ArrayBuffer for Arweave transaction
            const fileArrayBuffer = await convertFileToArrayBuffer(selectedFile);

            // Step 3: Upload the Image with Init-State
            const imageTransaction = await arweave.createTransaction({
                data: fileArrayBuffer,
            });
            imageTransaction.addTag("Network", "Perma-Press");
            imageTransaction.addTag("Content-Type", getContentType(selectedFile));
            imageTransaction.addTag("Init-State", JSON.stringify({
                owner: walletAddress,
                title,
                description,
                price,
                balance: 1,
             
            }));
            imageTransaction.addTag("Contract-Src", contractSrcTx.id);  // Linking the image to the contract

            await arweave.transactions.sign(imageTransaction, "use_wallet"); // Sign with wallet address
            await arweave.transactions.post(imageTransaction);

            setImageTxId(imageTransaction.id);  // Save the Image Transaction ID
            setShowConfirmation(true);

        } catch (err) {
            setError('Error minting NFT: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mint-container">
            <h1 className="text-center text-2xl font-bold mb-4">Mint Your NFT</h1>
            <form onSubmit={handleMint}>
                <div>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="file">File</label>
                    <input type="file" id="file" onChange={handleFileChange} required />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Minting..." : "Mint NFT"}
                </button>
                {error && <p className="text-red-600">{error}</p>}
                {showConfirmation && (
                    <div className="confirmation-message">
                        <h2 className="text-green-600">Minting Successful!</h2>
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
