import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Navbar } from '@/components/navbar';
import { SiteFooter } from '@/components/site-footer';
import { WalletProvider } from "@/components/wallet-provider"
import { LanguageProvider } from '@/hooks/useLanguage';
import { ThemeProvider } from '@/lib/theme-context';
import { NotificationProvider } from '@/lib/notification-context';
import { ToastContainer } from '@/components/toast';
import { OnboardingWrapper } from '@/components/onboarding-wrapper';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('askpay_theme');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col">
          <ThemeProvider>
            <NotificationProvider>
              <LanguageProvider>
                <WalletProvider>
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <SiteFooter />
                  <ToastContainer />
                  <OnboardingWrapper />
                </WalletProvider>
              </LanguageProvider>
            </NotificationProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

