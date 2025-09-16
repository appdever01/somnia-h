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
    <main className="w-screen min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-900 flex items-center justify-center px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold text-orange-400 leading-tight">
                NEXUS
                <span className="block text-white">GAMING</span>
              </h1>
              <div className="w-20 h-1 bg-orange-500 mx-auto lg:mx-0"></div>
            </div>

            <p className="text-lg md:text-xl text-purple-100 max-w-2xl font-sans leading-relaxed">
              Master the art of Dice, Coin Flip, Staking, and NFT Farming in the ultimate
              blockchain gaming experience with revolutionary earning mechanics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Playing
              </button>
              <button className="border-2 border-purple-400 text-purple-200 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Gaming Visual */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Gaming Console/Controller Visual */}
              <div className="bg-gradient-to-r from-orange-600 to-purple-600 p-1 rounded-3xl shadow-2xl">
                <div className="bg-gray-900 rounded-3xl p-8">
                  <div className="space-y-6">
                    {/* Gaming Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-orange-500/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-orange-400">25K+</div>
                        <div className="text-sm text-purple-200">Active Players</div>
                      </div>
                      <div className="bg-purple-500/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-400">$2.5M</div>
                        <div className="text-sm text-orange-200">Total Rewards</div>
                      </div>
                    </div>

                    {/* Gaming Elements */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
                            <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
                            <path d="M6 18h.01"/>
                            <path d="M10 14h.01"/>
                            <path d="M15 6h.01"/>
                            <path d="M18 9h.01"/>
                          </svg>
                          <span className="text-purple-300">Dice Games</span>
                        </div>
                        <span className="text-orange-400 font-semibold">LIVE</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 8v4"/>
                            <path d="M12 16h.01"/>
                          </svg>
                          <span className="text-purple-300">Coin Flip</span>
                        </div>
                        <span className="text-orange-400 font-semibold">HOT</span>
                      </div>
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                          </svg>
                          <span className="text-purple-300">NFT Farming</span>
                        </div>
                        <span className="text-orange-400 font-semibold">EARN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                <rect width="12" height="12" x="2" y="10" rx="2" ry="2"/>
                <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>
                <path d="M6 18h.01"/>
                <path d="M10 14h.01"/>
                <path d="M15 6h.01"/>
                <path d="M18 9h.01"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-400">Dice Games</h3>
            <p className="text-purple-200 text-sm">Roll your way to victory with provably fair dice games</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-400">Coin Flip</h3>
            <p className="text-purple-200 text-sm">Double or nothing in lightning-fast coin flip battles</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-400">Staking Rewards</h3>
            <p className="text-purple-200 text-sm">Stake your tokens and earn passive income daily</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-orange-400">NFT Farming</h3>
            <p className="text-purple-200 text-sm">Cultivate rare NFTs and harvest maximum profits</p>
          </div>
        </div>
      </div>
    </main>
  );
}
