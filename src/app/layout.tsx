import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import Menu from "@/components/common/menu";
import Providers from "@/redux/providers";
import { Suspense } from "react";
import Web3Provider from "@/components/web3Provider";
import PageLoadingSpinner from "@/components/pageLoader";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AnalyticsPageView from "@/components/AnalyticsPageView";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Gaming",
  description:
    "The Ultimate Blockchain Gaming Platform for Play-to-Earn Casino Games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/pumpazLogo.webp" />
        <GoogleAnalytics />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <Providers>
            <Suspense>
              <AnalyticsPageView />
            </Suspense>
            <Suspense>
              <Header />
            </Suspense>
            <Suspense>
              <Menu />
            </Suspense>
            {children}
            <PageLoadingSpinner />
          </Providers>
        </Web3Provider>
      </body>
    </html>
  );
}
