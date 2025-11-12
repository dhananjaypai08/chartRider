import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '../utils/web3Provider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Katana Block Rider - Ninja Runner Game',
  description: 'Surf across Katana network blocks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white antialiased min-h-screen bg-[var(--katana-bg)]">
        <Web3Provider>
          <Navbar />
          <main>{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}
