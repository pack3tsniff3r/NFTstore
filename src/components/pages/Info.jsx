import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';

export const Info = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { contractTxId, title, description, owner, price, mostRecentTxId, oldestTxId } = location.state;

  const handleBuyNowClick = () => {
    navigate('/purchase', { state: { contractTxId, title, description, owner, price, mostRecentTxId, oldestTxId }});
  };

  return (
    <div className="bg-black text-silver p-4 min-h-screen">
      <div className="bg-silver rounded-lg p-6 shadow-xl">
<br></br>
<h3 className="text-lg font-bold text-white">Title: {title}</h3>

            <img
              src={`https://arweave.net/${oldestTxId}`}
              alt={title}
              className="rounded-xl w-full h-55 object-cover mb-4"
            />
            <h3 className="text-lg font-bold text-white">Title: {title}</h3>
            <p className="text-white">Description: {description}</p>
            <p className="text-white font-semibold">Price: {price} AR</p>
            <a className="text-white underline" href={`https://arweave.net/tx/${contractTxId}`} target="_blank" rel="noopener noreferrer">
  Contract Source: https://arweave.net/tx/{contractTxId}
</a>
<br />
<a className="text-white underline" href={`https://arweave.net/tx/${oldestTxId}`} target="_blank" rel="noopener noreferrer">
  Original Contract: https://arweave.net/tx/{oldestTxId}
</a>
<br />
<a className="text-white underline" href={`https://arweave.net/tx/${mostRecentTxId}`} target="_blank" rel="noopener noreferrer">
  Current Contract: https://arweave.net/tx/{mostRecentTxId}
</a>

            <div className="flex justify-between mt-4">
            <button
          onClick={handleBuyNowClick}
          className="mt-6 bg-primary text-white py-2 px-6 rounded-full hover:bg-purple-700 transition"
        >
          Buy Now
        </button>
    </div>
      </div>
    </div>
  );
};

export default Info;