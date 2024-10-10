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

    const handleMint = async (e) => {
        e.preventDefault();

        if (!selectedFile || !price || !title || !description) {
            setError('Please provide a title, description, file, and price.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const src = `// SmartWeave Contract Source Code
const functions = { balance, transfer, updateState };

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
    return { state };
}
 `;

            const cSrc = await arweave.createTransaction({ data: src });
            cSrc.addTag('Content-Type', 'application/javascript');
            cSrc.addTag('App-Name', 'SmartWeaveContractSource');
            cSrc.addTag('App-Version', '0.3.0');
            await arweave.transactions.sign(cSrc, "use_wallet");
            await arweave.transactions.post(cSrc);
            console.log("Contract Source ID:", cSrc.id)
            const fileBuffer = await selectedFile.arrayBuffer();
            const contract = await arweave.createTransaction({ data: fileBuffer });

            contract.addTag('Content-Type', getContentType(selectedFile));
            contract.addTag('Network', 'PermaPress');
            contract.addTag('App-Name', 'SmartWeaveContract');
            contract.addTag('App-Version', '0.3.1');
            contract.addTag('Contract-Src', cSrc.id);
            contract.addTag('NSFW', 'false');
            contract.addTag('Init-State', JSON.stringify({
                owner: walletAddress,
                title: title,
                description: description,
                ticker: 'ATOMICNFT',
                balances: { [walletAddress]: 1 },
                price: price,
                locked: [],
                contentType: getContentType(selectedFile),
                createdAt: Date.now(),
                tags: [],
                isPrivate: false
            }));

            await arweave.transactions.sign(contract, "use_wallet");
            await arweave.transactions.post(contract);

            setContractId(contract.id);
            setImageTxId(contract.id);

            setShowConfirmation(true);
        } catch (err) {
            console.error(err);
            setError("Minting failed, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Mint your NFT</h1>
            <form onSubmit={handleMint}>
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                />
                <input 
                    type="number" 
                    placeholder="Price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                />
                <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    onChange={handleFileChange} 
                    required 
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Minting...' : 'Mint NFT'}
                </button>
            </form>

            {showConfirmation && (
                <div className="modal">
                    <h2>Mint Confirmation</h2>
                    <p><strong>Title:</strong> {title}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Price:</strong> {price} AR</p>
                    <p><strong>Transaction ID:</strong> {contractId}</p>
                    {imageTxId && (
                        <div>
                            <h3>Uploaded Image</h3>
                            <img 
                                src={`https://arweave.net/${imageTxId}`} 
                                alt="NFT" 
                                style={{ width: '300px', height: '300px' }} 
                            />
                        </div>
                    )}
                    <button onClick={() => setShowConfirmation(false)}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Mint;
