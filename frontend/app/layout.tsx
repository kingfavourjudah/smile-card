import type { Metadata } from "next";
import "./globals.css";
import FlowProviderWrapper from "@/components/FlowProviderWrapper";
import ConnectWallet from "@/components/ConnectWallet";
import CartProvider from "@/components/CartProvider";
import CartIcon from "@/components/CartIcon";
import MintedCardsProvider from "@/components/MintedCardsProvider";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SmileCard - Shop, Earn & Save",
  description: "Multi-brand loyalty e-commerce on Flow blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        <FlowProviderWrapper>
          <MintedCardsProvider>
          <CartProvider>
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold text-[#1a1a1a] tracking-tight">
                      SmileCard
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                      <Link
                        href="/shop"
                        className="text-sm text-zinc-500 hover:text-[#1a1a1a] px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        Shop
                      </Link>
                      <Link
                        href="/cards"
                        className="text-sm text-zinc-500 hover:text-[#1a1a1a] px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        My Cards
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CartIcon />
                    <ConnectWallet />
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
            <footer className="border-t border-gray-200 mt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
                <span className="text-sm text-zinc-400">
                  <span className="font-semibold text-[#1a1a1a]">SmileCard</span>{" "}
                  — Loyalty reimagined on Flow
                </span>
                <span className="text-xs text-zinc-400">
                  Powered by Flow Blockchain
                </span>
              </div>
            </footer>
          </CartProvider>
          </MintedCardsProvider>
        </FlowProviderWrapper>
      </body>
    </html>
  );
}
