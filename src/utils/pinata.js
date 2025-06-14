import axios from 'axios';

// Pinata API credentials from environment variables
const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;
const pinataJWT = import.meta.env.VITE_PINATA_JWT;

// Function to upload an image to IPFS via Pinata
export const uploadImageToPinata = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'Authorization': `Bearer ${pinataJWT}`
        }
      }
    );

    return {
      success: true,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      ipfsHash: response.data.IpfsHash
    };
  } catch (error) {
    console.error('Error uploading image to Pinata:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Function to upload metadata to IPFS via Pinata
export const uploadMetadataToPinata = async (metadata) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataJWT}`
        }
      }
    );

    return {
      success: true,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
      ipfsHash: response.data.IpfsHash
    };
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Function to create and upload NFT metadata
export const createAndUploadMetadata = async (name, description, imageUrl) => {
  try {
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: [
        {
          trait_type: 'Creation Date',
          value: new Date().toISOString()
        }
      ]
    };

    return await uploadMetadataToPinata(metadata);
  } catch (error) {
    console.error('Error creating and uploading metadata:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Function to fetch metadata from IPFS
export const fetchMetadataFromIPFS = async (tokenURI) => {
  try {
    // If the tokenURI is already an IPFS URL, use it directly
    const url = tokenURI.startsWith('ipfs://')
      ? `https://gateway.pinata.cloud/ipfs/${tokenURI.replace('ipfs://', '')}`
      : tokenURI;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
};
