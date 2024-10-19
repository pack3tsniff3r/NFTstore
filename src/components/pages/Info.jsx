import React from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from "../NavBar"; // Import NavBar

export const Info = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { contractTxId, title, description, owner, price, mostRecentTxId, oldestTxId } = location.state;

  const handleBuyNowClick = () => {
    navigate('/purchase', { state: { contractTxId, title, description, owner, price, mostRecentTxId, oldestTxId } });
  };

  return (
    <div className="bg-black text-silver min-h-screen">
      <NavBar /> {/* Include NavBar here */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-900 border border-silver rounded-lg p-6 shadow-2xl w-full max-w-lg"> {/* Added silver border */}
          <h3 className="text-xl font-bold text-white mb-4">Title: {title}</h3>

          <img
            src={`https://arweave.net/${oldestTxId}`}
            alt={title}
            className="rounded-lg w-full h-60 object-contain mb-4" // Adjusted margin
          />
          <hr className="border-t border-silver mb-4" /> {/* Added horizontal silver line */}

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Description:</h3>
            <p className="text-white mb-2">{description}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Price:</h3>
            <p className="text-white font-semibold mb-2">{price} AR</p>
          </div>
          
          <div className="mb-4">
            <a className="text-purple-400 underline" href={`https://viewblock.io/arweave/tx/${contractTxId}`} target="_blank" rel="noopener noreferrer">
              Contract Source: {contractTxId}
            </a>
          </div>
          <div className="mb-4">
            <a className="text-purple-400 underline" href={`https://viewblock.io/arweave/tx/${oldestTxId}`} target="_blank" rel="noopener noreferrer">
              Original Contract: {oldestTxId}
            </a>
          </div>
          <div className="mb-6">
            <a className="text-purple-400 underline" href={`https://viewblock.io/arweave/tx/${mostRecentTxId}`} target="_blank" rel="noopener noreferrer">
              Current Contract: {mostRecentTxId}
            </a>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={handleBuyNowClick}
              className="bg-green-600 text-white py-3 px-8 rounded-full hover:bg-green-700 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
