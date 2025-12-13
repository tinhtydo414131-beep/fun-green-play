import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';

// Reown Cloud Project ID (from https://cloud.reown.com)
const projectId = 'a01e309e8e50a5c1e4cc4f9f05e0d5a1';

// CAMLY Token Contract on BSC Mainnet
// ⚠️ THAY ĐỔI ĐỊA CHỈ NÀY SAU KHI DEPLOY CONTRACT MỚI
export const CAMLY_CONTRACT_ADDRESS = '0xf9FfF1976FADEf8712319fa46881DB0E0FB2f828';

// Charity wallet receives 11% of all rewards
export const CHARITY_WALLET_ADDRESS = '0x1234567890123456789012345678901234567890';

// Reward amounts
export const REWARDS = {
  FIRST_WALLET_CONNECT: 50000,
  GAME_COMPLETE: 10000,
  DAILY_CHECKIN: 5000,
  UPLOAD_GAME: 500000,
  NFT_MINT_COST: 1000,
};

// CAMLY Token ABI (ERC20 + Airdrop functions)
export const CAMLY_ABI = [
  // ERC20 Standard
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
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  // Airdrop Functions
  {
    constant: false,
    inputs: [],
    name: 'claimAirdrop',
    outputs: [],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'account', type: 'address' }],
    name: 'hasClaimedAirdrop',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'remainingAirdropPool',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'AIRDROP_AMOUNT',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'recipient', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'AirdropClaimed',
    type: 'event',
  },
] as const;

// App metadata
const metadata = {
  name: 'FUN Planet',
  description: 'Build Your Planet – Play & Earn Joy! 🌍',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://funplanet.app',
  icons: ['https://funplanet.app/pwa-512x512.png'],
};

// Define BSC network using Reown's defineChain
const bscNetwork = defineChain({
  id: 56,
  caipNetworkId: 'eip155:56',
  chainNamespace: 'eip155',
  name: 'BNB Smart Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-dataseed.binance.org'],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
});

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [bscNetwork],
  projectId,
  ssr: false,
});

// Export wagmi config for provider
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Create AppKit modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [bscNetwork],
  projectId,
  metadata,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#FF6B00',
    '--w3m-border-radius-master': '16px',
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
  },
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

// Export web3Modal for backwards compatibility
export const web3Modal = appKit;
