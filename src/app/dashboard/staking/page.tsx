"use client";

import Button from "@/components/button";
import StakeCard from "@/components/stakeCard";
import StakedCard from "@/components/stakedCard";
import { useDispatch, useSelector } from "react-redux";
import { setStaking } from "@/redux/staking/stake";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/loader";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import {
  NEXUS_GAMING_ABI,
  NEXUS_GAMING_ADDRESS,
} from "@/app/contracts/contract";
import { BigNumberish, formatUnits, parseUnits } from "ethers";
import { QueryObserverResult } from "@tanstack/react-query";
import { setUserAccount } from "@/redux/connection/userAccount";
import { userAccountType } from "@/app/page";
import { trackEvent } from "@/utils/analytics";
import { somniaTestnet } from "wagmi/chains";

export default function Staking() {
  const { address, isConnected } = useAccount();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"stake" | "staking">("stake");
  const [loading, setLoading] = useState(true);
  const [stakesTab, setStakesTab] = useState<"active" | "withdrawn">("active");
  const [canStake, setCanStake] = useState<boolean>(true);
  const { staking } = useSelector(
    (state: { staking: { staking: number } }) => state.staking
  );
  const { stake_id } = useSelector(
    (state: { stake_id: { stake_id: number } }) => state.stake_id
  );
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const { writeContractAsync: createStaking } = useWriteContract();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  const {
    data: availableStakes,
    isSuccess: isAvailableStakesSuccess,
  }: {
    data:
      | undefined
      | {
          id: number;
          stakingDays: number;
          apy: number;
          active: boolean;
        }[];
    isSuccess: boolean;
  } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getAllStakingPlans",
    chainId: somniaTestnet.id,
    query: {
      enabled: isConnected,
    },
  });

  const {
    data: userStakings,
    isSuccess: isUserStakingsSuccess,
  }: {
    data:
      | undefined
      | {
          userAddress: `0x${string}`;
          planId: number;
          amount: number;
          apy: number;
          stakingDays: number;
          earning: number;
          startDate: number;
          endDate: number;
          claimed: boolean;
          active: boolean;
        }[];
    isSuccess: boolean;
  } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getUserStakings",
    chainId: somniaTestnet.id,
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  });

  /*  const { data: userStakingCount, isSuccess: isUserStakingCountSuccess }: {
      data: undefined | number,
      isSuccess: boolean,
    } = useReadContract({
      address: NEXUS_GAMING_ADDRESS as `0x${string}`,
      abi: NEXUS_GAMING_ABI,
      functionName: "getUserStakingCount",
      chainId: somniaTestnet.id,
      args: [address],
      query: {
        enabled: isConnected && !!address,
      },
    }) */

  useEffect(() => {
    if (isAvailableStakesSuccess) {
      setLoading(false);
    }
  }, [isAvailableStakesSuccess]);

  useEffect(() => {
    if (
      userStakings &&
      userStakings.filter((item) => item.active).length >= 5
    ) {
      setCanStake(false);
    }
  }, [isUserStakingsSuccess]);

  const {
    data: nexBalance,
    refetch: refetchPumpazBalance,
    isSuccess: isPumpazBalanceSuccess,
  }: {
    data: undefined | BigNumberish;
    refetch: () => Promise<
      QueryObserverResult<BigNumberish | undefined, Error>
    >;
    isSuccess: boolean;
  } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "balanceOf",
    chainId: somniaTestnet.id,
    args: [address],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted);
  };

  const convertCoin = (coin: number): bigint => {
    return parseUnits(coin.toString(), 18);
  };

  // const revertCoin = (coin: bigint): number => {
  //   const int = parseUnits(coin.toString(), 0)
  //   return parseFloat(int);
  // };

  const handleCreateStaking = async (id: number, amount: number) => {
    if (!canStake) {
      toast.message("Can't have more than 5 active stakes");
      return;
    }

    setStatus("staking");
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

      try {
        trackEvent({
          action: "stake_attempt",
          category: "Staking",
          label: "Stake",
          value: amount * 100,
        });
      } catch (error) {
        console.error("An error occured while tracking stake attempt: ", error);
      }

      await createStaking({
        address: NEXUS_GAMING_ADDRESS as `0x${string}`,
        abi: NEXUS_GAMING_ABI,
        functionName: "createStaking",
        args: [id, convertCoin(amount)],
      });

      try {
        trackEvent({
          action: "stake_success",
          category: "Staking",
          label: "Stake",
          value: amount * 100,
        });
      } catch (error) {
        console.error("An error occured while tracking stake success: ", error);
      }

      toast.success(`Successfully staked ${amount} NEX`);

      await refetchPumpazBalance();
      setTimeout(() => {
        if (isPumpazBalanceSuccess && nexBalance) {
          const formatted = formatBigNumber(nexBalance, 18);
          const account = {
            ...userAccount,
            balance: formatted,
          };

          dispatch(setUserAccount(account));
        }
      }, 1000);
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Staking Failed. Please try again");
    } finally {
      setStatus("stake");
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Header */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
            <span className="text-orange-500 text-2xl">💰</span>
          </div>
          <div>
            <h2 className="font-mono font-bold text-lg sm:text-xl text-white">
              NEX Staking
            </h2>
            <p className="text-gray-400 text-sm">Earn rewards by staking</p>
          </div>
        </div>
        <div className="mb-12">
          <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Stake & Earn
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl">
            Lock your NEX • Earn high APY • Compound your wealth
          </p>
        </div>
      </div>

      {/* Main Staking Section */}
      <div className="container mx-auto max-w-6xl px-4">
        <div className="bg-black border border-orange-500/20 rounded-lg p-6 mb-8">
          <div className="relative">
            {/* Staking Input Section */}
            <div className="mb-8">
              <h2 className="font-mono text-2xl font-bold text-white mb-4">
                Start Staking
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Enter the amount you want to stake and choose your plan
              </p>

              <div className="max-w-2xl space-y-6">
                {/* Amount Input */}
                <div className="relative">
                  <label className="block text-white font-mono text-sm mb-2">
                    Stake Amount (NEX)
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Enter amount to stake"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        dispatch(setStaking(e.target.value));
                      }}
                      type="number"
                      className="w-full bg-black border border-orange-500/20 rounded-lg p-4 font-mono text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Stake Button */}
                <div className="relative">
                  <Button
                    content={status === "stake" ? "Stake Now" : "Staking..."}
                    className={
                      "w-full border-0 text-white font-mono text-sm py-3 rounded-lg transition-all duration-300" +
                      (staking && stake_id != 0
                        ? " bg-orange-500 hover:bg-orange-600"
                        : " bg-gray-700 text-gray-400 pointer-events-none") +
                      (status === "staking"
                        ? " animate-pulse pointer-events-none"
                        : "")
                    }
                    onClick={() => handleCreateStaking(stake_id, staking)}
                  />
                </div>

                {/* Info Display */}
                {staking && stake_id != 0 && (
                  <div className="bg-black/50 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-gray-400 font-mono text-sm">
                      Staking: <span className="text-white">{staking} NEX</span>{" "}
                      | Plan ID: <span className="text-white">{stake_id}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="flex justify-center mb-8">
                <LoadingSpinner className="w-8 h-8 text-orange-500" />
              </div>
            )}

            {/* Staking Plans */}
            {availableStakes && (
              <div className="mt-12">
                <div className="mb-8">
                  <h3 className="font-mono text-xl font-bold text-white mb-2">
                    Choose Your Staking Plan
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Select the duration that suits your investment strategy
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableStakes.map((option, idx) => (
                    <StakeCard
                      duration={option.stakingDays}
                      apy={option.apy}
                      key={idx}
                      id={option.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Stakes Section */}
      {isUserStakingsSuccess && userStakings && userStakings?.length > 0 && (
        <div className="container mx-auto max-w-6xl px-4 mb-8">
          <div className="bg-black border border-orange-500/20 rounded-lg p-6">
            <div className="relative">
              <div className="mb-8">
                <h2 className="font-mono text-2xl font-bold text-white mb-2">
                  Your Stakes
                </h2>
                <p className="text-gray-400 text-sm">
                  Manage your active and completed stakes
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="mb-8">
                <div className="inline-flex bg-black border border-orange-500/20 rounded-lg p-1">
                  <button
                    className={
                      "px-4 py-2 rounded-md font-mono text-sm transition-colors" +
                      (stakesTab === "active"
                        ? " bg-orange-500 text-white"
                        : " text-gray-400 hover:text-white")
                    }
                    onClick={() => setStakesTab("active")}
                  >
                    Active Stakes
                  </button>
                  <button
                    className={
                      "px-4 py-2 rounded-md font-mono text-sm transition-colors" +
                      (stakesTab === "withdrawn"
                        ? " bg-orange-500 text-white"
                        : " text-gray-400 hover:text-white")
                    }
                    onClick={() => setStakesTab("withdrawn")}
                  >
                    Withdrawn
                  </button>
                </div>
              </div>

              {/* Stakes Grid */}
              <div className="space-y-4">
                {stakesTab === "active" ? (
                  userStakings.filter((item) => item.active).length === 0 ? (
                    <div className="text-center py-8 bg-black/50 border border-orange-500/20 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">
                        No active stakes yet
                      </p>
                      <p className="text-gray-500 text-xs">
                        Start staking above to earn rewards
                      </p>
                    </div>
                  ) : (
                    userStakings
                      .map((item, idx) => ({ item, idx }))
                      .filter(({ item }) => item.active)
                      .map(({ item: stake, idx: idx }) => (
                        <StakedCard
                          key={idx}
                          id={idx}
                          amount={formatBigNumber(stake.amount, 18)}
                          apy={stake.apy}
                          days={stake.stakingDays}
                          earning={formatBigNumber(stake.earning, 18)}
                          status={stake.active ? "active" : "completed"}
                          end_date={stake.endDate}
                        />
                      ))
                  )
                ) : userStakings.filter((item) => item.claimed).length === 0 ? (
                  <div className="text-center py-8 bg-black/50 border border-orange-500/20 rounded-lg">
                    <p className="text-gray-400 text-sm mb-2">
                      No withdrawn stakes yet
                    </p>
                    <p className="text-gray-500 text-xs">
                      Complete your stakes to see them here
                    </p>
                  </div>
                ) : (
                  userStakings
                    .filter((item) => item.claimed)
                    .map((stake, id) => (
                      <StakedCard
                        key={id}
                        id={stake.planId}
                        amount={formatBigNumber(stake.amount, 18)}
                        apy={stake.apy}
                        days={stake.stakingDays}
                        earning={formatBigNumber(stake.earning, 18)}
                        status={"withdrawn"}
                        end_date={stake.endDate}
                      />
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
