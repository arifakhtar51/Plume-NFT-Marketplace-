import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Home = () => {
  const [isPlumeNetwork, setIsPlumeNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkNetwork();
  }, []);

  const checkNetwork = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        // Plume Testnet chainId is 161221135
        setIsPlumeNetwork(network.chainId === 161221135n);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking network connection...</p>
        </div>
      </div>
    );
  }

  if (!isPlumeNetwork) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 text-gray-800">Welcome to NFT Marketplace</h1>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-700">
                    Please connect to Plume Testnet to use this marketplace. You can add the network in your MetaMask wallet.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={() => window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x99D5B5',
                    chainName: 'Plume Testnet',
                    nativeCurrency: {
                      name: 'PLUME',
                      symbol: 'PLUME',
                      decimals: 18
                    },
                    rpcUrls: ['https://plume-testnet.rpc.thirdweb.com'],
                    blockExplorerUrls: ['https://plume-testnet-explorer.com']
                  }]
                })}
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-medium transition-colors"
              >
                Add Plume Testnet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-gray-800">Welcome to NFT Marketplace</h1>
          <p className="text-2xl text-gray-600 mb-12">
            Create, buy, and sell unique digital assets on the blockchain
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/marketplace"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-medium transition-colors"
            >
              Browse Marketplace
            </Link>
            <Link
              to="/create"
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 text-lg font-medium transition-colors"
            >
              Create NFT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 