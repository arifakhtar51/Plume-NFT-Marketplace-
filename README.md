
### 🔧 Contract Features

- Mint new NFTs with metadata stored on IPFS
- List NFTs for sale
- Buy NFTs using Plume tokens
- View owned NFTs
- View all NFTs in the marketplace

### ⚙️ Contract Functions

```solidity
// Core Functions
function mint(string memory _cid, uint _price) public
function buy(uint _tokenId) public payable
function getNFTDetails(uint _tokenId) view returns (address owner, string memory cid, uint price)
function getMyNFTs() view returns (uint[] memory)
function tokenCounter() view returns (uint)
