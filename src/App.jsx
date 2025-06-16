import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MintNFT from './components/MintNFT';
import MyNFTs from './components/MyNFTs';
import Marketplace from './components/Marketplace';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(connection);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setProvider(provider);
      setAccount(address);
      
      // Listen for account changes
      connection.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar account={account} connectWallet={connectWallet} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<MintNFT account={account} />} />
            <Route path="/my-nfts" element={<MyNFTs account={account} />} />
            <Route path="/marketplace" element={<Marketplace account={account} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
