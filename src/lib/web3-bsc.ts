import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';
import { bsc } from 'wagmi/chains';

// WalletConnect Project ID
const projectId = 'a01e309e8e50a5c1e4cc4f9f05e0d5a1';

// CAMLY Token Contract on BSC
export const CAMLY_CONTRACT_ADDRESS = '0x0910320181889fefde0bb1ca63962b0a8882e413';

// Charity wallet receives 11% of all rewards
export const CHARITY_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';

// Reward amounts
export const REWARDS = {
  FIRST_WALLET_CONNECT: 50000,
  GAME_COMPLETE: 10000,
  DAILY_CHECKIN: 5000,
  UPLOAD_GAME: 1000000,
  NFT_MINT_COST: 1000,
};

// CAMLY Token ABI (ERC20)
export const CAMLY_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

// Wagmi config for BSC only
const metadata = {
  name: 'FUN Planet',
  description: 'Build Your Planet – Play & Earn Joy! 🌍',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://funplanet.app',
  icons: ['https://funplanet.app/pwa-512x512.png'],
};

const chains = [bsc] as const;

export const wagmiConfigBSC = defaultWagmiConfig({
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

// Create modal for BSC
export const web3ModalBSC = createWeb3Modal({
  wagmiConfig: wagmiConfigBSC,
  projectId,
  enableAnalytics: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#FF6B00',
    '--w3m-border-radius-master': '16px',
  },
  defaultChain: bsc,
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
});

// Helper to format CAMLY amount
export const formatCamly = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString();
};

// Helper to shorten address
export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
