"use client";

import { useDispatch, useSelector } from "react-redux";
import { userAccountType } from "@/app/page";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { setFarmTime } from "@/redux/farm/farm";
import { setUserAccount } from "@/redux/connection/userAccount";
import { toast } from "sonner";
import { getTokenBalance } from "@/app/api/contractApi";
import { BigNumberish, formatUnits, parseUnits } from "ethers";

export type NFTData = {
  name: string;
  id: string;
  animation_url: string;
};

export default function Harvest() {
  const { address, isConnected } = useAccount();
  const [nftData, setNftData] = useState<NFTData[]>([]);
  const [nftCount, setNftCount] = useState<number>(0);
  const [timer, setTimer] = useState(0);
  const [harvesting, setHarvesting] = useState<
    "harvest" | "harvesting" | "harvested"
  >("harvest");
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  const getNftData = async () => {
    if (address) {
      try {
        const res = await fetch("/api/nfts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: address }),
        });

        const nftDatas = await res.json();
        if (nftDatas.token_instances) {
          setNftData(nftDatas.token_instances);
        }
        if (nftDatas.amount && nftDatas.amount > 0) {
          setNftCount(Number(nftDatas.amount));
        }
      } catch (error) {
        console.error("Failed to fetch NFT data:", error);
        toast.error("Failed to load NFTs. Please try again.");
      }
    }
  };

  useEffect(() => {
    getNftData();
  }, [isConnected, address]); //eslint-disable-line react-hooks/exhaustive-deps

  function formatIpfsUrl(ipfsUrl: string): string {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  useEffect(() => {
    const getHarvestTime = async () => {
      if (address) {
        try {
          const res = await fetch("/api/nfts/nft-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: address }),
          });
          if (res.status !== 200) return;
          const result = await res.json();
          const current_time = Math.ceil(new Date().getTime() / 1000);
          const next_claim_string = result.next_allowed_claim;
          const next_claim_time = new Date(next_claim_string);
          const next_claim_milliseconds = next_claim_time.getTime();
          const next_claim = next_claim_milliseconds / 1000;
          const remaining_time = next_claim - current_time;
          if (remaining_time > 0) {
            dispatch(setFarmTime(remaining_time));
            setTimer(remaining_time);
            setHarvesting("harvested");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to get Harvest status");
        }
      }
    };

    getHarvestTime();
  }, [isConnected, address]); //eslint-disable-line react-hooks/exhaustive-deps

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted);
  };

  const getNexBalance = async () => {
    try {
      if (address) {
        const result = await getTokenBalance();
        const pump = parseUnits(result, 18);
        const formattedPumpaz = formatBigNumber(pump, 18);

        const account = { ...userAccount };
        if (formattedPumpaz) account.balance = Number(formattedPumpaz);
        dispatch(setUserAccount(account));
      }
    } catch (error) {
      console.error("Failed to fetch NEX balance: ", error);
    }
    return null;
  };

  const harvestToken = async () => {
    if (address && harvesting === "harvest") {
      try {
        setHarvesting("harvesting");
        const res = await fetch("/api/nfts/claim-nft-reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: address }),
        });
        if (res.status != 200) {
          setHarvesting("harvest");
          toast.error("Failed to Harvest. Try again");
          return;
        }
        toast.success(`Successfully Harvested ${nftCount * 200} NEX!`);
        dispatch(setFarmTime(28799));
        setTimer(28799);
        setHarvesting("harvested");
        setTimeout(async () => {
          getNexBalance();
        }, 3000);
      } catch (err) {
        console.error(err);
        setHarvesting("harvest");
        toast.error("Failed to Harvest. Try again");
      }
    }
  };

  useEffect(() => {
    if (timer <= 0) {
      setHarvesting("harvest");
      return;
    }

    setHarvesting("harvested");

    const interval = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <main className="w-full min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Header */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-2xl">🌾</span>
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg sm:text-xl text-white">
              NEX Farm
            </h2>
            <p className="text-gray-400 text-sm">Earn rewards with NFTs</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col gap-8 lg:w-1/2">
          {/* Farm Card */}
          <div className="bg-black border border-orange-500/20 rounded-lg p-6">
            <div className="flex flex-col gap-6">
              <h2 className="font-mono text-xl font-bold text-white">
                My Farm
              </h2>
              {nftData && (
                <p className="text-gray-400 text-sm">
                  {nftCount == 0
                    ? "No NFTs, no NEX! Grab one to start harvesting."
                    : `You're set! Farm ${nftCount * 200} NEX every 8 hours.`}
                </p>
              )}
              <Button
                content={
                  harvesting === "harvest"
                    ? "Farm Now"
                    : harvesting === "harvested"
                    ? `Farm in ${formatTime(timer)}`
                    : "Farming..."
                }
                className={
                  "w-full font-mono text-sm py-3 rounded-lg transition-colors " +
                  (nftCount == 0
                    ? "bg-gray-700 text-gray-400 pointer-events-none"
                    : harvesting === "harvested"
                    ? "bg-gray-700 text-gray-400 pointer-events-none"
                    : harvesting === "harvesting"
                    ? "bg-orange-500 text-white animate-pulse pointer-events-none"
                    : "bg-orange-500 text-white hover:bg-orange-600")
                }
                onClick={harvestToken}
              />
            </div>
          </div>

          {/* Get NFT Card */}
          <div className="bg-black border border-orange-500/20 rounded-lg p-6">
            <div className="flex flex-col gap-6">
              <h3 className="font-mono text-xl font-bold text-white">
                Get NEX NFT
              </h3>
              <p className="text-gray-400 text-sm">
                Purchase an NFT to start earning rewards
              </p>
              <a
                href="https://rarible.fun/somniatestnet/collections/0xa9328313424afb38597814724ad3b66ba2c0ae3c"
                className="w-full"
              >
                <Button
                  content="View Collection"
                  className="w-full bg-orange-500 text-white hover:bg-orange-600 font-mono text-sm py-3 rounded-lg transition-colors"
                />
              </a>
            </div>
          </div>
        </div>

        {/* NFTs Grid */}
        <div className="lg:w-1/2">
          <div className="bg-black border border-orange-500/20 rounded-lg p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-mono text-xl font-bold text-white">
                  My NFTs
                </h2>
                <span className="text-gray-400 font-mono text-sm">
                  {nftCount} NFTs
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 max-h-[32rem] overflow-y-auto no-scrollbar">
                {Array.from({
                  length:
                    nftCount <= 9
                      ? 9
                      : nftData.length && nftData.length > 0
                      ? Math.ceil(nftData.length / 3) * 3
                      : 9,
                }).map((item, id) => (
                  <div
                    key={id}
                    className="aspect-square rounded-lg bg-black/50 border border-orange-500/10 overflow-hidden"
                  >
                    {nftData && nftData[id] && (
                      <video
                        src={formatIpfsUrl(nftData[id].animation_url)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
