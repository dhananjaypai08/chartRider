import type { Metadata } from 'next';
import './globals.css';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Katana Block Rider - Ninja Runner Game',
  description: 'An industry-grade blockchain game where you surf across Katana network blocks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 antialiased">
        <nav className="w-full flex items-center justify-between px-8 py-3 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Image 
              src="/Katana-banner.png" 
              alt="Katana Logo" 
              width={50} 
              height={35} 
              className="object-contain"
              priority
            />
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-800 block">
                Katana Block Rider
              </span>
              <span className="text-xs text-slate-500 font-medium">Powered by Katana Network</span>
            </div>
          </div>
          
          <a
            href="https://app.katana.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg border border-amber-300 shadow-sm transition-all text-sm"
          >
            Trade on Katana →
          </a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}