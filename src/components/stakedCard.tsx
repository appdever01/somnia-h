"use client";

import Button from "./button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWriteContract, useChainId, useSwitchChain } from "wagmi";
import {
  NEXUS_GAMING_ABI,
  NEXUS_GAMING_ADDRESS,
} from "@/app/contracts/contract";
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
  const [timer, setTimer] = useState<number>(0);
  const [status, setStatus] = useState<"ongoing" | "matured">("ongoing");
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
          setStatus("matured");
        }
      } catch (err) {
        console.error(err);
      }
    };

    getStakeEndTime();
  }, [props.end_date]);

  const handleClaimStaking = async () => {
    setWithdrawing(true);
    try {
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

      await claimStaking({
        address: NEXUS_GAMING_ADDRESS as `0x${string}`,
        abi: NEXUS_GAMING_ABI,
        functionName: "claimStaking",
        args: [props.id],
      });

      toast.success("Claim Successful!");
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Claim Failed. Please try again");
    } finally {
      setWithdrawing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);

    return `${days}d ${hours}h`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl" +
              (props.status === "active" && status === "matured"
                ? " bg-green-100"
                : props.status === "active"
                ? " bg-blue-100"
                : props.status === "withdrawn"
                ? " bg-gray-100"
                : " bg-orange-100")
            }
          >
            {props.status === "active" && status === "matured"
              ? "🎉"
              : props.status === "active"
              ? "⏳"
              : props.status === "withdrawn"
              ? "✅"
              : "💰"}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              {props.amount.toFixed(2)} PUMPAZ
            </h3>
            <p className="text-gray-600 text-sm">{props.days} days stake</p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold" +
              (props.status === "active" && status === "matured"
                ? " bg-green-100 text-green-800"
                : props.status === "active"
                ? " bg-blue-100 text-blue-800"
                : props.status === "withdrawn"
                ? " bg-gray-100 text-gray-800"
                : " bg-orange-100 text-orange-800")
            }
          >
            <span className="text-lg">{props.apy}%</span>
            <span>APY</span>
          </div>
        </div>
      </div>

      {/* Earnings Display */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-700 text-sm font-medium">
              Expected Earnings
            </p>
            <p className="text-emerald-800 text-xl sm:text-2xl font-bold">
              {props.earning.toFixed(4)} PUMPAZ
            </p>
          </div>
          <div className="text-4xl">💎</div>
        </div>
      </div>

      {/* Action Section */}
      {props.status === "active" && (
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <Button
              content={!withdrawing ? "🏦 Withdraw" : "🏦 Withdrawing..."}
              className={
                "w-full border-0 font-bold py-3 text-lg rounded-xl shadow-lg transform transition-all duration-300" +
                (status === "matured"
                  ? " bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 hover:shadow-xl"
                  : " bg-gray-300 text-gray-500 cursor-not-allowed opacity-60") +
                (withdrawing ? " animate-pulse pointer-events-none" : "")
              }
              onClick={handleClaimStaking}
            />
          </div>
          <div className="text-right">
            {status === "ongoing" && timer ? (
              <div>
                <p className="text-gray-600 text-sm">Matures in</p>
                <p className="text-gray-800 font-bold text-lg">
                  {formatTime(timer)}
                </p>
              </div>
            ) : status === "matured" ? (
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <p className="text-green-600 font-bold text-sm">Ready!</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Withdrawn Status */}
      {props.status === "withdrawn" && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <span className="text-xl">✅</span>
            <span className="font-bold">Successfully Withdrawn</span>
          </div>
        </div>
      )}
    </div>
  );
}
