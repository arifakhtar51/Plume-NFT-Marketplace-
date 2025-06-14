import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateNFT = () => {
  const [formInput, setFormInput] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Contract addresses
  const NFT_CONTRACT_ADDRESS = '0x2c87064a63bfd4b9ad347540b7da055e7f8ae23c';
  const PLUME_TOKEN_ADDRESS = '0xa50ae16accd05fccee005e595ce25e22e2e926a6';

  // Contract ABI
  const contractABI = [
    "function mint(string memory _cid, uint _price) public",
    "function buy(uint _tokenId) public payable",
    "function tokenCounter() view returns (uint)",
    "function getNFTDetails(uint _tokenId) view returns (address, string memory, uint)",
    "function getMyNFTs() view returns (uint[] memory)"
  ];
  

  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE0NjJlYTNjZGU1NzU4ZmZlOWJjIiwic2NvcGVkS2V5U2VjcmV0IjoiZmFjOGYzY2Q1MGRiZWE5OTllOGNjNjliMTUzYjQyMjNmMjNiODE4M2JhZjAxZWQ5N2YyMzIzOGEwNDhkM2NmYyIsImV4cCI6MTc4MTQ1NzcxMH0.OiFKDLvkRNmGJRSLLljFM0Dvxc4tiYMbqtiohD1H-6I'
          }
        }
      );

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  };

  const createNFT = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
  
      if (!formInput.name || !formInput.description || !formInput.price || !formInput.image) {
        throw new Error('Please fill in all fields');
      }
  
      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(formInput.image);
      const cid = imageUrl.replace('ipfs://', '');
  
      // Upload metadata
      const metadata = {
        name: formInput.name,
        description: formInput.description,
        image: imageUrl
      };
      
      const metadataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE0NjJlYTNjZGU1NzU4ZmZlOWJjIiwic2NvcGVkS2V5U2VjcmV0IjoiZmFjOGYzY2Q1MGRiZWE5OTllOGNjNjliMTUzYjQyMjNmMjNiODE4M2JhZjAxZWQ5N2YyMzIzOGEwNDhkM2NmYyIsImV4cCI6MTc4MTQ1NzcxMH0.OiFKDLvkRNmGJRSLLljFM0Dvxc4tiYMbqtiohD1H-6I'
          }
        }
      );
  
      // Connect wallet & contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, contractABI, signer);
  
      // Get current token ID
      const currentTokenId = await contract.tokenCounter();
  
      const priceInTokens = ethers.parseUnits(formInput.price, 18);
  
      // Mint NFT
      const tx = await contract.mint(cid, priceInTokens);
      await tx.wait();
  
      // Get details
      const details = await contract.getNFTDetails(currentTokenId);
      console.log('NFT details:', {
        owner: details[0],
        cid: details[1],
        price: ethers.formatUnits(details[2], 18)
      });
  
      setSuccess('NFT created successfully!');
      setFormInput({
        name: '',
        description: '',
        price: '',
        image: null
      });
      navigate('/my-nfts');
    } catch (error) {
      console.error('Error creating NFT:', error);
      setError(error.message || 'Failed to create NFT');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">Create New NFT</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <form onSubmit={createNFT} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formInput.name}
                  onChange={e => setFormInput({ ...formInput, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NFT Name"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formInput.description}
                  onChange={e => setFormInput({ ...formInput, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NFT Description"
                  required
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (Plume)
                </label>
                <input
                  type="number"
                  id="price"
                  value={formInput.price}
                  onChange={e => setFormInput({ ...formInput, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NFT Price in Plume"
                  required
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  NFT Image
                </label>
                <input
                  type="file"
                  id="image"
                  onChange={e => setFormInput({ ...formInput, image: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create NFT'}
              </button>
              {error && (
                <div className="text-red-500 text-center mt-4">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT; 