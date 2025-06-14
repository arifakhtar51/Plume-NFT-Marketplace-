import { Link } from 'react-router-dom';

const Navbar = ({ account, connectWallet }) => {
  return (
    <nav className="bg-white shadow-lg w-full">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800">
              NFT Marketplace
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
              Marketplace
            </Link>
            <Link to="/create" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
              Create NFT
            </Link>
            <Link to="/my-nfts" className="text-gray-600 hover:text-gray-900 text-lg font-medium">
              My NFTs
            </Link>
            {account ? (
              <span className="text-gray-600 font-medium">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-lg font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 