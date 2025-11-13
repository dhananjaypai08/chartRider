'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

export const katana: Chain = {
  id: 747474,
  name: 'Katana',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.katana.network'] },
    public: { http: ['https://rpc.katana.network'] },
  },
  blockExplorers: {
    default: { name: 'Katana Explorer', url: 'https://katanascan.com' },
  },
  testnet: false,
};

export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Katana Block Rider',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [katana],
  ssr: true,
});
