import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ConnectButton } from "arweave-wallet-kit";

function NavBar({ onSearchBarToggle }) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearchButtonClick = () => {
    setIsSearchVisible(prev => !prev); // Toggle visibility
    onSearchBarToggle(); // Notify the Home component
  };

  return (
    <nav className="bg-gray-900 p-6 flex items-center justify-between">
      <div className="logo">
        <img src="/Perma-Press-Logo.png" alt="Perma Press Logo" className="h-16 w-auto" />
      </div>
      <ul className="flex space-x-4">
        <li>
          <NavLink
            to="/"
            className="bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600 transition duration-300"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/mint"
            className="bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600 transition duration-300"
          >
            Mint
          </NavLink>
        </li>
        <li>
          <button
            onClick={handleSearchButtonClick}
            className="bg-purple-500 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-600 transition duration-300"
          >
            Search
          </button>
        </li>
      </ul>
      <div className="wallet-connect">
        <ConnectButton className="text-white font-bold py-2 px-4 rounded-full bg-green-500 hover:bg-green-600 transition duration-300" showBalance={true} showProfilePicture={true} />
      </div>
    </nav>
  );
}

export default NavBar;
