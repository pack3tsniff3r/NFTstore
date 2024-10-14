import './App.css';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import { Mint } from './components/pages/Mint';
import { Home } from './components/pages/Home';
import { Purchase } from './components/pages/Purchase';
import { ArweaveWalletKit } from "arweave-wallet-kit";

function App() {
  return (
    <div className="App">
      <ArweaveWalletKit>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/purchase" element={<Purchase />} />
          </Routes>
      </ArweaveWalletKit>
    </div>
  );
}

export default App;
