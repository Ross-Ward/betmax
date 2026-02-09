import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BetMax - Premium Sports Betting Odds",
  description: "Compare odds from top bookmakers for Football, Basketball, Tennis and more.",
};

import { StreamProvider } from "@/lib/stream-context";
import { GlobalStreamPlayer } from "@/components/streams/global-stream-player";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <StreamProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <GlobalStreamPlayer />
          </StreamProvider>
        </Providers>
      </body>
    </html>
  );
}

