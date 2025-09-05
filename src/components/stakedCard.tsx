"use client";

import Button from "./button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWriteContract, useChainId, useSwitchChain } from "wagmi";
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from "@/app/contracts/contract";
import { somniaTestnet } from "wagmi/chains";

export type StakedCardProps = {
  id: number;
  amount: number;
  apy: number;
  days: number;
  earning: number;
  status: string;
  end_date: number;
};

export default function StakedCard(props: StakedCardProps) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [timer, setTimer] = useState<number>(0)
  const [status, setStatus] = useState<"ongoing" | "matured">("ongoing")
  const { writeContractAsync: claimStaking } = useWriteContract();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // if (props.end_date === "Ended") return;
    const getStakeEndTime = () => {
        try {
          const current_time = Math.ceil(new Date().getTime() / 1000);
          const remaining_time = Number(props.end_date) - current_time;
          if (remaining_time > 0) {
            setTimer(remaining_time);
          } else {
            setStatus("matured")
          }
        } catch (err) {
          console.error(err);
        }
    };

    getStakeEndTime();
  }, [props.end_date]);

  const handleClaimStaking = async () => {
    setWithdrawing(true)
    try {
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

      await claimStaking({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: "claimStaking",
        args: [props.id],
      })

      toast.success("Claim Successful!");
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Claim Failed. Please try again")
    } finally {
      setWithdrawing(false);
    }
  }

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600);

    return `${days}d ${hours}h`;
  };

  return (
    <div className="py-4 px-2 rounded-lg flex flex-col gap-4 bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 border-2 border-[#09378c] sm:p-6 lg:p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-white font-love text-sm sm:text-2xl lg:text-4xl">
            {props.amount} PUMPAZ
          </p>
          <p className="font-unkempt text-[#71E092] sm:text-lg lg:text-2xl">
            {props.apy}% APY
          </p>
        </div>
        <p className="font-unkempt text-white text-xs sm:text-lg lg:text-2xl">
          {props.days} Days = {props.earning} PUMPAZ
        </p>
      </div>
      {props.status === "active" && 
      (<div className="flex items-end justify-between">
        <Button
          content={!withdrawing ? "Withdraw" : "Withdrawing..."}
          className={
            "bg-background border-background w-1/2" +
            (status === "matured"
              ? " opacity-100"
              : " opacity-60 pointer-events-none") +
            (withdrawing ? " animate-pulse pointer-events-none" : "")
          }
          onClick={handleClaimStaking}
        />
        {props.status === "active" && status === "ongoing" && timer ? (
          <div className="flex flex-col items-end gap-1">
            <p className="font-unkempt text-white text-xs sm:text-lg lg:text-2xl">Matures in</p>
            <p className="font-unkempt text-background text-xs sm:text-lg lg:text-2xl">{timer && formatTime(timer)}</p>
          </div>
        ) : props.status === "active" && status === "matured" ? (
          <p className="font-unkempt text-white text-xs sm:text-lg lg:text-2xl">Matured</p>
        ) : null}
      </div>)}
    </div>
  );
}
