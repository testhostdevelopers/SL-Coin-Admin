import './assets/css/index.css'
import './assets/css/theme.min.css'
import 'react-notifications/lib/notifications.css'
import Lawis from './pages/Lawis';
import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  getPhantomWallet()
]
function App() {
  const rpcEndpoint = process.env.REACT_APP_RPC_ENDPOINT;
  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} >
        <WalletModalProvider>
          <Lawis />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
