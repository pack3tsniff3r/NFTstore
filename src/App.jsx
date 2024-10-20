import './App.css';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import { Mint } from './components/pages/Mint';
import { Home } from './components/pages/Home';
import { Purchase } from './components/pages/Purchase';
import { Profile } from './components/pages/Profile';
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { ToastContainer } from 'react-toastify';
import { Info } from './components/pages/Info';
function App() {
  return (
    <div className="App">
      <ArweaveWalletKit>
     
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/info" element={<Info />} />
          </Routes>
      </ArweaveWalletKit>
    </div>
  );
}

export default App;
