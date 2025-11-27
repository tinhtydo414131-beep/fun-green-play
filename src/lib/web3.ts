import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc } from 'wagmi/chains';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'f8c84e1e3c6e8d6b3f2a9b1c5d4e3f2a'; // Demo project ID

// 2. Create wagmiConfig
const metadata = {
  name: 'FUN Planet',
  description: 'Kết nối ví và chơi game kiếm crypto!',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, polygon, optimism, arbitrum, bsc] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  auth: {
    email: false,
    socials: [],
    showWallets: true,
    walletFeatures: true,
  },
});

// 3. Create modal with featured wallets (MetaMask first) - Hide "All Wallets"
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#8B46FF',
    '--w3m-border-radius-master': '16px',
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby Wallet
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby Wallet
  ],
  // Hide "All Wallets" and only show specified wallets
  allWallets: 'HIDE',
});
