import type { Metadata } from "next";
import "./globals.css";
import FlowProviderWrapper from "@/components/FlowProviderWrapper";
import ConnectWallet from "@/components/ConnectWallet";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SmileCard - Multi-Brand Loyalty Platform",
  description: "Tokenized loyalty economy on Flow blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f1a] antialiased">
        <FlowProviderWrapper>
          <nav className="border-b border-gray-800 bg-[#0f0f1a]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <Link href="/" className="text-xl font-bold text-gradient">
                    SmileCard
                  </Link>
                  <div className="hidden md:flex items-center gap-6">
                    <Link href="/brands" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Brands
                    </Link>
                    <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/stake" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Stake
                    </Link>
                    <Link href="/cards" className="text-sm text-gray-400 hover:text-white transition-colors">
                      My Cards
                    </Link>
                  </div>
                </div>
                <ConnectWallet />
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </FlowProviderWrapper>
      </body>
    </html>
  );
}
