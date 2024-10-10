import React, { useState } from "react";
import Arweave from "arweave";
import { useActiveAddress, useConnection} from 'arweave-wallet-kit';
export const Mint = () => {
  const { walletAddress }= useActiveAddress();
  const { connect, disconnect } =useConnection();
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contractId, setContractId] = useState("");
  const [imageTxId, setImageTxId] = useState("");

  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  });

  const getContentType = (file) => {
    return file.type || "application/octet-stream";
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !price) {
      setError('Please select a file and set a price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Connect to the Arweave wallet
      await connect();

      const walletAddress = await arweaveWallet.getActiveAddress();

      const contractSource = `
        // SmartWeave contract source code goes here...
        export function handle(state, action) {
          const input = action.input;
          const caller = action.caller;
          // Example: handling transfers, balances, and ownership
          switch (input.function) {
            case 'transfer':
              const target = input.target;
              const qty = input.qty;
              if (!state.balances[caller] || state.balances[caller] < qty) {
                throw new Error('Not enough balance');
              }
              if (!state.balances[target]) {
                state.balances[target] = 0;
              }
              state.balances[caller] -= qty;
              state.balances[target] += qty;
              return { state };
            case 'balance':
              return { result: { balance: state.balances[caller] } };
            default:
              throw new ContractError('Invalid function');
          }
        }
      `;

      // Create and post the contract source transaction
      const cSrcTransaction = await arweave.createTransaction({ data: contractSource });
      cSrcTransaction.addTag('Content-Type', 'application/javascript');
      cSrcTransaction.addTag('App-Name', 'SmartWeaveContractSource');
      cSrcTransaction.addTag('App-Version', '0.3.0');
      await arweave.transactions.sign(cSrcTransaction, 'use_wallet');
      await arweave.transactions.post(cSrcTransaction);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target.result;

        // Create the actual contract transaction
        const contract = await arweave.createTransaction({ data: fileData });
        contract.addTag('Content-Type', getContentType(selectedFile));
        contract.addTag('Network', 'PermaPress');
        contract.addTag('App-Name', 'SmartWeaveContract');
        contract.addTag('App-Version', '0.3.1');
        contract.addTag('Contract-Src', cSrcTransaction.id);  // Link the contract to the source
        contract.addTag('Type', 'asset');
        contract.addTag('Price', price);
        contract.addTag('Title', title);  // Add title tag
        contract.addTag('Description', description || 'No description provided');  // Add description tag
        contract.addTag('Init-State', JSON.stringify({
          owner: walletAddress,
          name: title,
          description: description || 'No description provided',
          price: price,
          ticker: 'ATOMIC',
          balances: {
            [walletAddress]: 1,
          },
          locked: [],
          createdAt: Date.now(),
          tags: [],
        }));

        // Sign and post the contract transaction
        await arweave.transactions.sign(contract, 'use_wallet');
        await arweave.transactions.post(contract);
        
        // Save transaction details
        setContractId(contract.id);
        setImageTxId(contract.id);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      console.error('Error during minting:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mint-container">
      <h1 className="text-2xl font-bold mb-5">Mint a New NFT</h1>
      <form onSubmit={handleMint} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Upload Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="input-field"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Minting..." : "Mint NFT"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {contractId && (
        <p className="text-green-500 mt-4">
          NFT minted successfully! Contract ID: {contractId}
        </p>
      )}

      {walletAddress ? (
        <button onClick={disconnect} className="btn btn-secondary mt-4">
          Disconnect Wallet
        </button>
      ) : (
        <button onClick={connect} className="btn btn-primary mt-4">
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default Mint;
