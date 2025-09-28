import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Providers } from "@/lib/wagmi";
import Image from 'next/image'
import Link from 'next/link'
import { HeaderWalletButton } from '@/components/HeaderWalletButton'
import CosmicBackground from '@/components/CosmicBackground'
import { WaitlistControl } from '@/components/WaitlistControl'
import logoPng from '../../public/logo.png'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Camuverse",
  description: "Camuverse frontend",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3Providers>`n          <CosmicBackground />
          <header className="relative flex items-center gap-3 p-4 border-b border-gray-200">
            <Link href="/" className="relative flex items-center gap-2">
              <Image src={logoPng} alt="Camuverse" width={32} height={32} priority />
              <span className="font-semibold hover:underline">Camuverse</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
              <WaitlistControl />
              <HeaderWalletButton />
            </nav>
          </header>
          <main className="relative z-10">
            {children}
          </main>
        </Web3Providers>
      </body>
    </html>
  );
}







