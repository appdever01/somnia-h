"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageLoading } from "@/redux/loader/pageLoader";

export type userAccountType = {
  address: string;
  balance: string | number;
  stt_balance: string | number;
  walletName?: string;
  points?: number;
};

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageLoading(false));
  }, [dispatch]);

  return (
    <main className="w-screen min-h-screen bg-black flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="space-y-3">
                <div className="inline-block text-orange-500/60 font-mono text-sm px-3 py-1 rounded-full border border-orange-500/20">
                  Web3 Gaming Platform
                </div>
                <h1 className="font-mono text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tighter">
                  Play. Win.
                  <span className="block mt-2 bg-gradient-to-r from-orange-500 to-orange-400 text-transparent bg-clip-text">
                    Earn Rewards.
                  </span>
                </h1>
              </div>

              <p className="text-base md:text-lg text-gray-400 max-w-xl font-mono leading-relaxed">
                Experience the future of gaming with our blockchain-powered
                platform. Compete, stake, and farm NFTs in a secure and fair
                environment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded font-mono text-sm transition-colors duration-200">
                  Start Playing
                </button>
                <button className="border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 px-6 py-2.5 rounded font-mono text-sm transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Gaming Visual */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Gaming Stats Card */}
                <div className="bg-black border border-orange-500/20 rounded-lg p-6">
                  <div className="space-y-6">
                    {/* Gaming Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-orange-500/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-mono font-bold text-orange-500">
                          25K+
                        </div>
                        <div className="text-sm text-gray-400">
                          Active Players
                        </div>
                      </div>
                      <div className="border border-orange-500/20 p-4 rounded-lg text-center">
                        <div className="text-2xl font-mono font-bold text-orange-500">
                          $2.5M
                        </div>
                        <div className="text-sm text-gray-400">
                          Total Rewards
                        </div>
                      </div>
                    </div>

                    {/* Gaming Elements */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border border-orange-500/10 p-3 rounded">
                        <div className="flex items-center space-x-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-orange-500"
                          >
                            <rect
                              width="12"
                              height="12"
                              x="2"
                              y="10"
                              rx="2"
                              ry="2"
                            />
                            <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
                          </svg>
                          <span className="text-gray-400 font-mono text-sm">
                            Dice Games
                          </span>
                        </div>
                        <span className="text-orange-500 font-mono text-sm">
                          LIVE
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-orange-500/10 p-3 rounded">
                        <div className="flex items-center space-x-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-orange-500"
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          <span className="text-gray-400 font-mono text-sm">
                            Coin Flip
                          </span>
                        </div>
                        <span className="text-orange-500 font-mono text-sm">
                          HOT
                        </span>
                      </div>
                      <div className="flex items-center justify-between border border-orange-500/10 p-3 rounded">
                        <div className="flex items-center space-x-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-orange-500"
                          >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                          <span className="text-gray-400 font-mono text-sm">
                            NFT Farming
                          </span>
                        </div>
                        <span className="text-orange-500 font-mono text-sm">
                          EARN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-orange-500/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-mono font-bold text-white mb-4">
              Gaming Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of blockchain gaming with our
              innovative features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border border-orange-500/20 p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
                  <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
                </svg>
                <h3 className="text-lg font-mono font-bold text-orange-500">
                  Dice Games
                </h3>
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                Roll your way to victory with provably fair dice games
              </p>
            </div>
            <div className="border border-orange-500/20 p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <h3 className="text-lg font-mono font-bold text-orange-500">
                  Coin Flip
                </h3>
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                Double or nothing in lightning-fast coin flip battles
              </p>
            </div>
            <div className="border border-orange-500/20 p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <h3 className="text-lg font-mono font-bold text-orange-500">
                  Staking
                </h3>
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                Stake your tokens and earn passive income daily
              </p>
            </div>
            <div className="border border-orange-500/20 p-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-orange-500"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <h3 className="text-lg font-mono font-bold text-orange-500">
                  NFT Farming
                </h3>
              </div>
              <p className="mt-2 text-gray-400 text-sm">
                Cultivate rare NFTs and harvest maximum profits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 border-t border-orange-500/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-mono font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get started with blockchain gaming in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 font-mono font-bold">1</span>
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2">
                Connect Wallet
              </h3>
              <p className="text-gray-400 text-sm">
                Link your Web3 wallet to start playing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 font-mono font-bold">2</span>
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2">
                Choose Game
              </h3>
              <p className="text-gray-400 text-sm">
                Select from our variety of games
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-500 font-mono font-bold">3</span>
              </div>
              <h3 className="text-lg font-mono font-bold text-white mb-2">
                Start Earning
              </h3>
              <p className="text-gray-400 text-sm">
                Win games and earn rewards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-orange-500/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 font-mono text-sm">
              © 2025 Nexus Gaming. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497 -3.753C20.18 7.773 21.692 5.25 22 4.009z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
