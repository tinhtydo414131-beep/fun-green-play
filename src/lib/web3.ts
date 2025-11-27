import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet, polygon, optimism, arbitrum, bsc } from 'wagmi/chains';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'a01e309e8e50a5c1e4cc4f9f05e0d5a1'; // WalletConnect Project ID

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

// 3. Create modal - simple, let it manage wallets itself
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#8B46FF',
    '--w3m-border-radius-master': '16px',
  },
});
