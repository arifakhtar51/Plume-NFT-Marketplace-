import { ethers } from 'ethers';
import PictureNFTAbi from '../contracts/PictureNFT.json';

// Contract address from environment variables
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const chainId = import.meta.env.VITE_CHAIN_ID;

// Function to get the Ethereum provider
export const getProvider = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
  }

  // Check if the user is connected to the correct network (Plume Testnet)
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (parseInt(currentChainId, 16) !== parseInt(chainId)) {
    try {
      // Try to switch to the Plume Testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
      });
    } catch (error) {
      // If the chain is not added to MetaMask, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${parseInt(chainId).toString(16)}`,
              chainName: 'Plume Testnet',
              nativeCurrency: {
                name: 'PLUME',
                symbol: 'PLUME',
                decimals: 18,
              },
              rpcUrls: ['https://plume-testnet.rpc.thirdweb.com'],
              blockExplorerUrls: ['https://plume-testnet-explorer.com'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider;
};

// Function to get the signer
export const getSigner = async () => {
  const provider = await getProvider();
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  return signer;
};

// Function to get the contract instance
export const getContract = async () => {
  const signer = await getSigner();
  const contract = new ethers.Contract(contractAddress, PictureNFTAbi.abi, signer);
  return contract;
};

// Function to get the current account
export const getCurrentAccount = async () => {
  const provider = await getProvider();
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return address;
};

// Function to mint a new NFT
export const mintNFT = async (tokenURI, price) => {
  try {
    const contract = await getContract();
    const priceInWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.mintNFT(tokenURI, priceInWei);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
};

// Function to buy an NFT
export const buyNFT = async (tokenId, price) => {
  try {
    const contract = await getContract();
    const priceInWei = ethers.utils.parseEther(price.toString());
    const tx = await contract.buyNFT(tokenId, { value: priceInWei });
    await tx.wait();
    return tx;
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw error;
  }
};

// Function to get all NFTs
export const getAllNFTs = async () => {
  try {
    const contract = await getContract();
    const nfts = await contract.getAllNFTs();
    return nfts.map(nft => ({
      tokenId: nft.tokenId.toString(),
      owner: nft.owner,
      tokenURI: nft.tokenURI,
      price: ethers.utils.formatEther(nft.price),
      forSale: nft.forSale
    }));
  } catch (error) {
    console.error('Error getting all NFTs:', error);
    throw error;
  }
};

// Function to get NFTs by owner
export const getNFTsByOwner = async (owner) => {
  try {
    const contract = await getContract();
    const nfts = await contract.getNFTsByOwner(owner);
    return nfts.map(nft => ({
      tokenId: nft.tokenId.toString(),
      owner: nft.owner,
      tokenURI: nft.tokenURI,
      price: ethers.utils.formatEther(nft.price),
      forSale: nft.forSale
    }));
  } catch (error) {
    console.error('Error getting NFTs by owner:', error);
    throw error;
  }
};
