import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MyNFTs = ({ account }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contract addresses
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
      const account = await signer.getAddress();

      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        [
          'function getMyNFTs() view returns (uint[] memory)',
          'function getNFTDetails(uint256 tokenId) view returns (address owner, string memory cid, uint256 price)'
        ],
        signer
      );

      const myNFTIds = await contract.getMyNFTs();
      console.log('My NFT IDs:', myNFTIds);

      const nftPromises = [];

      for (const tokenId of myNFTIds) {
        try {
          const details = await contract.getNFTDetails(tokenId);
          console.log(`NFT ${tokenId} details:`, details);

          // Create NFT object with basic information
          const nft = {
            tokenId: tokenId.toString(),
            owner: details.owner,
            price: ethers.formatUnits(details.price, 18),
            image: `https://ipfs.io/ipfs/${details.cid}`,
            name: `NFT #${tokenId}`,
            description: 'No description available'
          };

          // Try to fetch metadata from IPFS
          try {
            const ipfsUrl = `https://ipfs.io/ipfs/${details.cid}`;
            console.log(`Fetching metadata from: ${ipfsUrl}`);
            
            const response = await fetch(ipfsUrl);
            if (!response.ok) {
              throw new Error(`Failed to fetch metadata: ${response.statusText}`);
            }

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
            // If it's an image, we already have the correct image URL
          } catch (metadataError) {
            console.warn(`Could not load metadata for NFT ${tokenId}:`, metadataError);
            // Continue with basic NFT information
          }

          nftPromises.push(nft);
        } catch (error) {
          console.error(`Error loading NFT ${tokenId}:`, error);
        }
      }

      const nftList = await Promise.all(nftPromises);
      console.log('Final NFT list:', nftList);
      setNfts(nftList);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Please connect your wallet to view your NFTs
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center mt-8">
        Loading your NFTs...
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
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">My NFTs</h1>
        {nfts.length === 0 ? (
          <div className="text-center text-gray-600 mt-8">
            You don't own any NFTs yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {nfts.map((nft) => (
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
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNFTs; 