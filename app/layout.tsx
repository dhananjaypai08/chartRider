import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Katana Block Rider - Surf the Blocks',
  description: 'An exciting game where you ride across Katana network blocks',
};

import Image from 'next/image';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <Image src="/katana-banner.png" alt="Katana Logo" width={40} height={40} />
            <span className="font-bold text-lg tracking-tight">Katana Block Rider</span>
          </div>
        </nav>
        <main className="min-h-screen bg-white">{children}</main>
      </body>
    </html>
  );
}