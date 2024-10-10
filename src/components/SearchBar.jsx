import React, { useState } from "react";
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [contentType, setContentType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  const handleSearch = () => {
    onSearch({ contentType, fromDate, toDate, minPrice, maxPrice, ownerAddress });
  };

  return (
    <div className="search-bar">
      <input type="text" placeholder="Content-Type" value={contentType} onChange={(e) => setContentType(e.target.value)} />
      <input type="date" placeholder="From Date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      <input type="date" placeholder="To Date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
      <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      <input type="text" placeholder="Owner Address" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;

