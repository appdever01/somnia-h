"use client";

import LeaderBoardCard from "@/components/leaderboardCard";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loader";
import { toast } from "sonner";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { getLeaderboard, getUserRank, getUserPoints } from "@/app/api/contractApi";
import { useSelector } from "react-redux";
import { userAccountType } from "@/app/page";
import { somniaTestnet } from "wagmi/chains";

type leaderboardType = {
  addresses: string[],
  points: number[],
}

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
      state.userAccount,
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
        toast.message("Switching network to Somnia Testnet")
        switchChain({
          chainId: somniaTestnet.id
        })
        toast.success("You're now on Somnia Testnet")
      }
    } catch {
      toast.error("Failed to switch network")
      return;
    }
  }, [isConnected])

  useEffect(() => {
    if (isConnected) {
      handleGetLeaderboard();
      handleGetUserRank();
      handleGetUserPoints();
    }
  }, [isConnected])

  useEffect(() => {
    if (leaderboard && userRank) {
      setLoading(false);
    }
  }, [leaderboard, userRank])

  const handleGetLeaderboard = async () => {
    try {
      const result = await getLeaderboard();
      setLeaderboard(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to retrieve leaderboard data. Reload the page");
    }
  }

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
    setPages(
      Math.ceil(
        (leaderboard.addresses.length) / 10,
      ),
    );
  }, [leaderboard]);

  return (
    <main className="w-full px-5 flex flex-col items-center gap-8 mb-24">
      <h1 className="font-rubik text-5xl text-center sm:text-3xl lg:text-5xl">
        Wall of Fame
      </h1>
      {loading && <LoadingSpinner className="w-12 h-12 sm:w-24 sm:h-24" />}
      {!loading && leaderboard && address && userRank && (
        <div className="flex flex-col gap-4 w-full items-center">
          <LeaderBoardCard
            profilePic="/images/pumpaz.webp"
            name={address}
            points={userAccount.points ? userAccount.points : userPoints ? userPoints : 0}
            rank={userRank}
          />
          <div className="flex flex-col gap-4 w-full lg:max-w-[40rem]">
            <div className="w-full flex items-center justify-between">
              <p className="font-love text-sm sm:text-2xl lg:text-4xl">
                {} holders
              </p>
              <p className="font-unkempt text-xs sm:text-base lg:text-2xl">
                (Top 100)
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {Array.from({ length: leaderboard.addresses.length })
              .slice((page - 1) * 10, (page * 10)).map((_, id) => (
                <LeaderBoardCard
                  profilePic="/images/pumpaz.webp"
                  name={leaderboard.addresses[((page - 1) * 10) + id]}
                  points={leaderboard.points[((page - 1) * 10) + id]}
                  rank={((page - 1) * 10) + id + 1}
                  key={id}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div
          className={
            "w-6 h-6 rounded-lg bg-[#FFFFFF33] flex items-center justify-center hover:cursor-pointer" +
            (page == 1 ? " opacity-50" : "")
          }
          onClick={() => (page > 1 ? setPage((a) => a - 1) : null)}
        >
          <Image
            src="/icons/arrow-right.svg"
            alt="previous"
            width={6}
            height={12}
            className="rotate-180"
          />
        </div>
        <div className="w-[3.3125rem] h-10 rounded-lg bg-[#FFFFFF33] py-1 px-2 font-unkempt text-2xl flex items-center justify-center">
          {page}
        </div>
        <div
          className={
            "w-6 h-6 rounded-lg bg-[#FFFFFF33] flex items-center justify-center hover:cursor-pointer" +
            (page == pages ? " opacity-50" : "")
          }
          onClick={() => (page < pages ? setPage((a) => a + 1) : null)}
        >
          <Image
            src="/icons/arrow-right.svg"
            alt="next"
            width={6}
            height={12}
          />
        </div>
      </div>
    </main>
  );
}
