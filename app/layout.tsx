import type { Metadata } from 'next';
import './globals.css';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Katana Block Rider - Ninja Runner Game',
  description: 'Surf through Katana blocks in a sleek on-chain game experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-white antialiased min-h-screen bg-[var(--katana-bg)]">
        <nav className="w-full flex items-center justify-between px-8 py-3.5 bg-white/5 backdrop-blur-2xl border-b border-[var(--katana-border)] shadow-[0_2px_12px_rgba(11,154,237,0.15)] sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Image
              src="/Katana-banner.png"
              alt="Katana Logo"
              width={56}
              height={56}
              className="object-contain rounded-lg drop-shadow-[0_0_12px_rgba(11,154,237,0.25)]"
              priority
            />
            <div>
              <span className="font-semibold text-base leading-tight block tracking-tight">
                Katana Block Rider
              </span>
              <span className="text-[11px] text-white/60 font-light tracking-wide">
                Powered by Katana Network
              </span>
            </div>
          </div>

          <a
            href="https://app.katana.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--katana-yellow)] hover:bg-[var(--katana-yellow-soft)] text-[var(--katana-blue-dark)] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-xs tracking-wide"
          >
            Trade on Katana →
          </a>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
