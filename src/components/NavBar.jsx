import React from "react";
import { NavLink } from "react-router-dom";
import { ConnectButton } from "arweave-wallet-kit";
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="logo">Logo</div>
      <ul className="nav-links">
        <li><NavLink to="/">Home</NavLink></li>
       
        <li><NavLink to="/mint">Mint</NavLink></li>
        
      </ul>
      <div className="wallet-connect">
        <ConnectButton showBalance={true} showProfilePicture={true} />
      </div>
    </nav>
  );
}

export default NavBar;