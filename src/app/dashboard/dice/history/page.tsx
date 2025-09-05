"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoadingSpinner } from "@/components/loader";
import { getUserDiceHistory, getUserDiceCount } from "@/app/api/contractApi";
import { toast } from "sonner";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
import * as ethersUtils from "ethers";

type DiceHistoryType = {
  player: string;
  amount: ethersUtils.BigNumberish;
  dice1: ethersUtils.BigNumberish;
  dice2: ethersUtils.BigNumberish;
  outcome: ethersUtils.BigNumberish;
  won: boolean;
  winnings: ethersUtils.BigNumberish;
  houseCharge: ethersUtils.BigNumberish;
  createdAt: ethersUtils.BigNumberish;
}

export default function DiceHistory() {
  const { isConnected } = useAccount();
  const [history, setHistory] = useState<DiceHistoryType[]>([]);
  const [diceCount, setDiceCount] = useState<number>(0);
  const [pages, setPages] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleGetUserDiceCount();
  }, []) //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleGetUserDiceHistory(offset);
  }, [offset]) //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (diceCount) {
      setPages(Math.ceil(diceCount / 10));
    }
  }, [diceCount]) //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (diceCount && history) {
      setLoading(false)
    }
  }, [diceCount, history])

  const handleGetUserDiceHistory = async (offset: number) => {
    try {
      const result = await getUserDiceHistory(offset);
      setHistory(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to get user history");
    }
  }

  const handleGetUserDiceCount = async () => {
    try {
      const result = await getUserDiceCount();
      setDiceCount(result);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to get user dice count")
    }
  }

  const formatBigNumber = (value: ethersUtils.BigNumberish, decimals: number = 18): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  }

  const formatDate = (timeInSeconds: ethersUtils.BigNumberish) => {
    const date = new Date(Number(timeInSeconds) * 1000);
    return date.toLocaleString();
  }
  
  return (
    <main className="flex flex-col items-center relative px-5 lg:px-24 lg:mt-20 max-sm:mb-12 w-screen overflow-hidden">
      <div className="font-unkempt text-3xl absolute top-0 left-4 lg:left-24 px-3 rounded-lg bg-[#FFFFFF33] hover:cursor-pointer" onClick={() => router.back()}>{"<"}</div>
      <h1 className="font-rubik text-center text-3xl lg:text-5xl mb-20">Dice Game History</h1>
      {loading && <LoadingSpinner className="w-12 h-12 sm:w-24 sm:h-24" />}
      {!loading && (
        <>
        <div className="flex flex-col gap-4 overflow-x-auto w-full">
          <div className="grid grid-cols-6 bg-foreground py-2 rounded-md px-2 min-w-[600px]">
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">Outcome</p>
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">Amount</p>
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">Result</p>
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">Payout</p>
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">House charge</p>
            <p className="font-unkempt lg:text-lg text-white text-sm w-fit text-nowrap mr-2">Created At</p>
          </div>
          <div>
          {history && history.length > 0 ? (
            history.map((item, id) => (
              <div className="grid grid-cols-6 justify-between bg-[#FFFFFF33] rounded-sm p-2 min-w-[600px] border-b border-[#007BFF]" key={id}>
                  <p className="font-unkempt lg:text-lg text-sm">{formatBigNumber(item.outcome)}</p>
                  <p className="font-unkempt lg:text-lg text-sm">{formatBigNumber(item.amount)} STT</p>
                  <p className="font-unkempt lg:text-lg text-sm">{item.won ? "Won" : "Lost"}</p>
                  <p className="font-unkempt lg:text-lg text-sm">{formatBigNumber(item.winnings)} STT</p>
                  <p className="font-unkempt lg:text-lg text-sm">{formatBigNumber(item.houseCharge)} STT</p>
                  <p className="font-unkempt lg:text-lg text-sm">{formatDate(item.createdAt)}</p>
              </div>
            ))) : (
              <div className="text-center py-8 font-unkempt text-lg">No game history available</div>
          )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={
              "w-6 h-6 rounded-lg bg-[#FFFFFF33] flex items-center justify-center hover:cursor-pointer" +
              (offset == 0 ? " opacity-50" : "")
            }
            onClick={() => (offset > 0 ? setOffset((a) => a - 1) : null)}
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
            {offset + 1}
          </div>
          <div
            className={
              "w-6 h-6 rounded-lg bg-[#FFFFFF33] flex items-center justify-center hover:cursor-pointer" +
              (offset == pages - 1 ? " opacity-50" : "")
            }
            onClick={() => (offset < pages - 1 ? setOffset((a) => a + 1) : null)}
          >
            <Image
              src="/icons/arrow-right.svg"
              alt="next"
              width={6}
              height={12}
            />
          </div>
        </div>
        </>
      )}
    </main>
  )
}