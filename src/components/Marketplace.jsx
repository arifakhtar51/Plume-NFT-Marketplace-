import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Marketplace = ({ account }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contract address
  const MARKETPLACE_ADDRESS = '0x2c87064a63bfd4b9ad347540b7da055e7f8ae23c';

  useEffect(() => {
    if (account) {
      loadNFTs();
    }
  }, [account]);

  const loadNFTs = async () => {
    try {
      setError('');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentAccount = await signer.getAddress();

      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        [
          'function tokenCounter() view returns (uint)',
          'function getNFTDetails(uint256 tokenId) view returns (address owner, string memory cid, uint256 price)'
        ],
        signer
      );

      const total = await contract.tokenCounter();
      const items = [];

      for (let i = 0; i < total; i++) {
        const [owner, cid, price] = await contract.getNFTDetails(i);
        
        // Skip NFTs owned by the current user
        // if (owner.toLowerCase() === currentAccount.toLowerCase()) continue;

        // Create NFT object with basic information
        const nft = {
          tokenId: i.toString(),
          owner,
          price: ethers.formatUnits(price, 18),
          image: `https://ipfs.io/ipfs/${cid}`,
          name: `NFT #${i}`,
          description: 'No description available'
        };

        // Try to fetch metadata from IPFS
        try {
          const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
          const response = await fetch(ipfsUrl);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            
            // If it's JSON, try to parse it as metadata
            if (contentType && contentType.includes('application/json')) {
              const metadata = await response.json();
              if (metadata.name) nft.name = metadata.name;
              if (metadata.description) nft.description = metadata.description;
              if (metadata.image) {
                nft.image = metadata.image.startsWith('ipfs://')
                  ? `https://ipfs.io/ipfs/${metadata.image.replace('ipfs://', '')}`
                  : metadata.image;
              }
            }
          }
        } catch (metadataError) {
          console.warn(`Could not load metadata for NFT ${i}:`, metadataError);
          // Continue with basic NFT information
        }

        items.push(nft);
      }

      setNfts(items);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setError('Connect to Plume Network to view the marketplace');
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async (tokenId, price) => {
    try {
      setError('');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        ['function buy(uint _tokenId) public payable'],
        signer
      );

      const priceInWei = ethers.parseUnits(price, 18);
      const tx = await contract.buy(tokenId, { value: priceInWei });
      await tx.wait();

      alert('NFT purchased successfully!');
      loadNFTs(); // Refresh the list
    } catch (error) {
      console.error('Error buying NFT:', error);
      // Check if the error is due to user rejection
      if (error.code === 'ACTION_REJECTED' || error.message.includes('user rejected')) {
        alert('Transaction was rejected. Please try again if you want to proceed with the purchase.');
      } else {
        setError('Failed to buy NFT. Please try again.');
      }
    }
  };

  if (!account) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Please connect your wallet to view the marketplace
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-8">
        Loading marketplace...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">NFT Marketplace</h1>
        {nfts.length === 0 ? (
          <div className="text-center text-gray-600 mt-8">
            No NFTs available for purchase
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {nfts.map((nft) => {
              const isOwner = nft.owner.toLowerCase() === account.toLowerCase();
              return (
                <div key={nft.tokenId} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                    {isOwner && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        You Own This
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800">{nft.name}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-2">{nft.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800">{nft.price} Plume</span>
                        <span className="text-sm text-gray-500">
                          Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                        </span>
                      </div>
                      {!isOwner && (
                        <button
                          onClick={() => buyNFT(nft.tokenId, nft.price)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
