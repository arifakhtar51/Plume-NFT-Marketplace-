import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const MintNFT = ({ account }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const MARKETPLACE_ADDRESS = '0x2c87064a63bfd4b9ad347540b7da055e7f8ae23c'; // ETH marketplace

  // Pinata API credentials
  const PINATA_API_KEY = '2183cb1e2753a69d1b0c';
  const PINATA_SECRET_API_KEY = 'bc9a74d849368b7f230ec5ba89c48b0d30d25eb4cf0a78b77b1770ede332b070';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !name || !description || !price) {
      setError('Please fill in all fields');
      return;
    }

    try {
      console.log('Starting NFT minting process...');
      setLoading(true);
      setError('');

      // Upload image to IPFS
      console.log('Uploading image to IPFS...');
      const formData = new FormData();
      formData.append('file', file);

      const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE0NjJlYTNjZGU1NzU4ZmZlOWJjIiwic2NvcGVkS2V5U2VjcmV0IjoiZmFjOGYzY2Q1MGRiZWE5OTllOGNjNjliMTUzYjQyMjNmMjNiODE4M2JhZjAxZWQ5N2YyMzIzOGEwNDhkM2NmYyIsImV4cCI6MTc4MTQ1NzcxMH0.OiFKDLvkRNmGJRSLLljFM0Dvxc4tiYMbqtiohD1H-6I`
        },
        body: formData,
      });

      if (!imageResponse.ok) {
        console.error('Image upload failed:', await imageResponse.text());
        throw new Error(`Image upload failed: ${imageResponse.status}`);
      }

      const imageData = await imageResponse.json();
      console.log('Image uploaded successfully:', imageData);
      const imageHash = imageData.IpfsHash;

      // Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadata = {
        name,
        description,
        image: `ipfs://${imageHash}`,
      };

      const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE0NjJlYTNjZGU1NzU4ZmZlOWJjIiwic2NvcGVkS2V5U2VjcmV0IjoiZmFjOGYzY2Q1MGRiZWE5OTllOGNjNjliMTUzYjQyMjNmMjNiODE4M2JhZjAxZWQ5N2YyMzIzOGEwNDhkM2NmYyIsImV4cCI6MTc4MTQ1NzcxMH0.OiFKDLvkRNmGJRSLLljFM0Dvxc4tiYMbqtiohD1H-6I`
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        console.error('Metadata upload failed:', await metadataResponse.text());
        throw new Error(`Metadata upload failed: ${metadataResponse.status}`);
      }

      const metadataData = await metadataResponse.json();
      console.log('Metadata uploaded successfully:', metadataData);
      const metadataHash = metadataData.IpfsHash;

      // Mint NFT using ETH contract
      console.log('Connecting to Ethereum network...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('Connected to wallet:', await signer.getAddress());
      
      const contract = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        ['function mint(string memory tokenURI, uint256 price) public'],
        signer
      );

      const priceInWei = ethers.parseEther(price);
      console.log('Minting NFT with price:', priceInWei.toString());
      const tx = await contract.mint(metadataHash, priceInWei);
      console.log('Transaction sent:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed!');

      alert('NFT minted successfully!');
      navigate('/my-nfts');
    } catch (error) {
      console.error('Error minting NFT:', error);
      setError(error.message || 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Please connect your wallet to mint an NFT
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Mint New NFT</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            rows="4"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Price (ETH)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            min="0"
            step="0.0001"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>
      </form>
    </div>
  );
};

export default MintNFT;
