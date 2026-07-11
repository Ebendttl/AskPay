import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';
import { WalletProvider } from "@/components/wallet-provider"
import { LanguageProvider } from '@/hooks/useLanguage';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'askpay-app',
  description: 'Pay-per-use AI chat mini app for MiniPay on Celo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <LanguageProvider>
            <WalletProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </WalletProvider>
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}

