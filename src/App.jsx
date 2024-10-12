import './App.css';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import { Mint } from './components/pages/Mint';
import { Home } from './components/pages/Home';
import { Purchase } from './components/pages/Purchase';
import { ArweaveWalletKit } from "arweave-wallet-kit";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Instantiate the QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <ArweaveWalletKit>
        {/* Wrap your app in QueryClientProvider and pass the instantiated queryClient */}
        <QueryClientProvider client={queryClient}>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mint" element={<Mint />} />
            <Route path="/purchase" element={<Purchase />} />
          </Routes>
        </QueryClientProvider>
      </ArweaveWalletKit>
    </div>
  );
}

export default App;
