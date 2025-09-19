"use client";

import LeaderBoardCard from "@/components/leaderboardCard";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loader";
import { toast } from "sonner";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import {
  getLeaderboard,
  getUserRank,
  getUserPoints,
} from "@/app/api/contractApi";
import { useSelector } from "react-redux";
import { userAccountType } from "@/app/page";
import { somniaTestnet } from "wagmi/chains";

type leaderboardType = {
  addresses: string[];
  points: number[];
};

export default function LeaderBoard() {
  const { address, isConnected } = useAccount();
  const [leaderboard, setLeaderboard] = useState<leaderboardType>();
  const [userRank, setUserRank] = useState<number>();
  const [userPoints, setUserPoints] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const router = useRouter();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isConnected) return;

    try {
      if (currentChainId !== somniaTestnet.id) {
        toast.message("Switching network to Somnia Testnet");
        switchChain({
          chainId: somniaTestnet.id,
        });
        toast.success("You're now on Somnia Testnet");
      }
    } catch {
      toast.error("Failed to switch network");
      return;
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      handleGetLeaderboard();
      handleGetUserRank();
      handleGetUserPoints();
    }
  }, [isConnected]);

  useEffect(() => {
    if (leaderboard && userRank) {
      setLoading(false);
    }
  }, [leaderboard, userRank]);

  const handleGetLeaderboard = async () => {
    try {
      const result = await getLeaderboard();
      setLeaderboard(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to retrieve leaderboard data. Reload the page");
    }
  };

  const handleGetUserRank = async () => {
    try {
      const result = await getUserRank();
      setUserRank(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to get user rank. Reload the page");
    }
  };

  const handleGetUserPoints = async () => {
    try {
      if (!address) return;
      const result = await getUserPoints(address);
      setUserPoints(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to get user points. Reload the page");
    }
  };

  useEffect(() => {
    if (!leaderboard) return;
    setPages(Math.ceil(leaderboard.addresses.length / 10));
  }, [leaderboard]);

  return (
    <main className="w-full min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Header */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-2xl">🏆</span>
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg sm:text-xl text-white">
              Leaderboard
            </h2>
            <p className="text-gray-400 text-sm">Top 100 Players</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner className="w-8 h-8 text-orange-500" />
          </div>
        ) : leaderboard && address && userRank ? (
          <div className="space-y-8">
            {/* User's Rank */}
            <div className="bg-black border border-orange-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 text-sm font-mono">
                      YOU
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-white text-sm">
                      {`${address.slice(0, 4)}...${address.slice(-4)}`}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {userAccount.points
                        ? userAccount.points
                        : userPoints
                        ? userPoints
                        : 0}{" "}
                      Points
                    </p>
                  </div>
                </div>
                <div className="font-mono text-sm">
                  {userRank === 1 ? (
                    <span className="text-orange-500">🥇 1st</span>
                  ) : userRank === 2 ? (
                    <span className="text-gray-300">🥈 2nd</span>
                  ) : userRank === 3 ? (
                    <span className="text-orange-300">🥉 3rd</span>
                  ) : (
                    <span className="text-gray-400">#{userRank}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="bg-black border border-orange-500/20 rounded-lg p-6">
              <div className="space-y-4">
                {Array.from({ length: leaderboard.addresses.length })
                  .slice((page - 1) * 10, page * 10)
                  .map((_, id) => (
                    <LeaderBoardCard
                      key={id}
                      profilePic="/images/nexus.webp"
                      name={leaderboard.addresses[(page - 1) * 10 + id]}
                      points={leaderboard.points[(page - 1) * 10 + id]}
                      rank={(page - 1) * 10 + id + 1}
                    />
                  ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  className={
                    "px-3 py-2 rounded-lg font-mono text-sm transition-colors " +
                    (page === 1
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-black border border-orange-500/20 text-white hover:bg-orange-500/10")
                  }
                  onClick={() => page > 1 && setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <div className="px-4 py-2 bg-black border border-orange-500/20 rounded-lg font-mono text-sm text-white">
                  {page}
                </div>
                <button
                  className={
                    "px-3 py-2 rounded-lg font-mono text-sm transition-colors " +
                    (page === pages
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-black border border-orange-500/20 text-white hover:bg-orange-500/10")
                  }
                  onClick={() => page < pages && setPage((p) => p + 1)}
                  disabled={page === pages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
