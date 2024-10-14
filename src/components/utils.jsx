import { arweave } from 'arweave-react';

export const getCurrentState = async (nftId) => {
    const tx = await arweave.transactions.get(nftId);
    const initState = JSON.parse(tx.tags.find(tag => tag.name === 'Init-State').value);
    return {
        ...initState,
        contractSrcTx: {
            id: tx.tags.find(tag => tag.name === 'Contract-Src').value
        }
    };
};