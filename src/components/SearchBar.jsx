import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ fromDate, toDate, minPrice, maxPrice, ownerAddress });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col md:flex-row md:space-x-2">
        <input 
          type="date" 
          value={fromDate} 
          onChange={(e) => setFromDate(e.target.value)} 
          className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        />
        <input 
          type="date" 
          value={toDate} 
          onChange={(e) => setToDate(e.target.value)} 
          className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        />
        <input 
          type="number" 
          value={minPrice} 
          onChange={(e) => setMinPrice(e.target.value)} 
          placeholder="Min Price" 
          className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        />
        <input 
          type="number" 
          value={maxPrice} 
          onChange={(e) => setMaxPrice(e.target.value)} 
          placeholder="Max Price" 
          className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        />
        <input 
          type="text" 
          value={ownerAddress} 
          onChange={(e) => setOwnerAddress(e.target.value)} 
          placeholder="Owner Address" 
          className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        />
        <button 
          type="submit" 
          className="mt-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
