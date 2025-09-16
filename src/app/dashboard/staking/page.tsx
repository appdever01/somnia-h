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
import { useAccount, useReadContract, useWriteContract, useChainId, useSwitchChain } from "wagmi";
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from "@/app/contracts/contract";
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
    (state: { staking: { staking: number } }) => state.staking,
  );
  const { stake_id } = useSelector(
    (state: { stake_id: { stake_id: number } }) => state.stake_id,
  );
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
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

  const { data: availableStakes, isSuccess: isAvailableStakesSuccess }: {
    data: undefined | {
      id: number,
      stakingDays: number,
      apy: number,
      active: boolean
    }[],
    isSuccess: boolean,
  } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "getAllStakingPlans",
    chainId: somniaTestnet.id,
    query: {
      enabled: isConnected,
    },
  })

  const { data: userStakings, isSuccess: isUserStakingsSuccess }: {
    data: undefined | {
      userAddress: `0x${string}`,
      planId: number,
      amount: number,
      apy: number,
      stakingDays: number,
      earning: number,
      startDate: number,
      endDate: number,
      claimed: boolean,
      active: boolean,
    }[],
    isSuccess: boolean,
  } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "getUserStakings",
    chainId: somniaTestnet.id,
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  })

  /*  const { data: userStakingCount, isSuccess: isUserStakingCountSuccess }: {
      data: undefined | number,
      isSuccess: boolean,
    } = useReadContract({
      address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
      abi: SOMNIA_PUMPAZ_ABI,
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
    if (userStakings && userStakings.filter((item) => item.active).length >= 5) {
      setCanStake(false)
    }
  }, [isUserStakingsSuccess]);

  const { data: pumpazBalance, refetch: refetchPumpazBalance, isSuccess: isPumpazBalanceSuccess }: {
    data: undefined | BigNumberish,
    refetch: () => Promise<QueryObserverResult<BigNumberish | undefined, Error>>,
    isSuccess: boolean
  } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "balanceOf",
    chainId: somniaTestnet.id,
    args: [address],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  }

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

      try {
        trackEvent({
          action: 'stake_attempt',
          category: 'Staking',
          label: "Stake",
          value: amount * 100,
        });
      } catch (error) {
        console.error("An error occured while tracking stake attempt: ", error)
      }

      await createStaking({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: "createStaking",
        args: [id, convertCoin(amount)],
      })

      try {
        trackEvent({
          action: 'stake_success',
          category: 'Staking',
          label: "Stake",
          value: amount * 100,
        });
      } catch (error) {
        console.error("An error occured while tracking stake success: ", error)
      }

      toast.success(`Successfully staked ${amount} PUMPAZ`)

      await refetchPumpazBalance()
      setTimeout(() => {
        if (isPumpazBalanceSuccess && pumpazBalance) {
          const formatted = formatBigNumber(pumpazBalance, 18);
          const account = {
            ...userAccount,
            balance: formatted,
          };

          dispatch(setUserAccount(account));
        }
      }, 1000)
    } catch (error) {
      console.error("An error occured: ", error)
      toast.error("Staking Failed. Please try again")
    } finally {
      setStatus("stake");
    }
  }

  return (
    <main className="w-full min-h-screen flex flex-col px-0 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-16 left-12 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 right-16 w-24 h-24 bg-emerald-300/20 rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
          <div className="absolute bottom-1/3 left-1/6 w-20 h-20 bg-teal-300/20 rounded-full animate-pulse" style={{animationDelay: '2.1s'}}></div>
          <div className="absolute bottom-20 right-1/5 w-36 h-36 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '0.7s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-cyan-300/10 rounded-full animate-ping" style={{animationDelay: '3.2s'}}></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>
            <div className="text-left">
              <h2 className="text-white font-bold text-2xl sm:text-3xl">PUMPAZ Staking</h2>
              <p className="text-white/70 text-lg">Earn rewards by staking</p>
            </div>
          </div>
          <h1 className="font-rubik text-4xl sm:text-5xl lg:text-7xl xl:text-8xl leading-none mb-4 text-center text-white drop-shadow-2xl">
            💰 STAKE & EARN
          </h1>
          <p className="text-white/80 text-lg sm:text-xl lg:text-2xl font-light">
            Lock your PUMPAZ • Earn high APY • Compound your wealth
          </p>
        </div>
      </div>

      {/* Main Staking Section */}
      <div className="relative z-10 w-full flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            <div className="relative z-10">
              {/* Staking Input Section */}
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  🌱 Start Staking
                </h2>
                <p className="text-white/80 text-lg mb-8">Enter the amount you want to stake and choose your plan</p>

                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Amount Input */}
                  <div className="relative">
                    <label className="block text-white font-bold mb-3 text-left">
                      💰 Stake Amount (PUMPAZ)
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
                        className="w-full rounded-2xl border-2 focus:border-3 bg-white/90 backdrop-blur-sm p-4 pl-12 font-medium text-lg text-gray-800 leading-normal appearance-none focus:outline-none border-white/30 focus:border-emerald-400 no-spinner shadow-lg transition-all duration-300 focus:shadow-xl"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                        💰
                      </div>
                    </div>
                  </div>

                  {/* Stake Button */}
                  <div className="relative">
                    <Button
                      content={status === "stake" ? "💰 STAKE NOW!" : "💰 Staking..."}
                      className={
                        "relative overflow-hidden w-full border-0 text-white font-bold py-6 text-xl sm:text-2xl rounded-2xl shadow-2xl transform transition-all duration-300 group" +
                        (staking && stake_id != 0
                          ? " bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-700 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-800 hover:cursor-pointer hover:scale-105 hover:shadow-3xl"
                          : " bg-gray-400 opacity-50 pointer-events-none cursor-not-allowed") +
                        (status === "staking" ? " animate-pulse pointer-events-none" : "")
                      }
                      onClick={() => handleCreateStaking(stake_id, staking)}
                    />
                    {staking && stake_id != 0 && status !== "staking" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none rounded-2xl"></div>
                    )}
                  </div>

                  {/* Info Display */}
                  {staking && stake_id != 0 && (
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 text-center">
                      <p className="text-white font-medium">
                        💰 Staking: <span className="font-bold">{staking} PUMPAZ</span> | ⏰ Plan ID: <span className="font-bold">{stake_id}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading Spinner */}
              {loading && (
                <div className="flex justify-center mb-8">
                  <LoadingSpinner className="w-16 h-16 text-white" />
                </div>
              )}

              {/* Staking Plans */}
              {availableStakes && (
                <div className="mt-12">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      ⏰ Choose Your Staking Plan
                    </h3>
                    <p className="text-white/80 text-lg">Select the duration that suits your investment strategy</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* User Stakes Section */}
      {isUserStakingsSuccess && userStakings && userStakings?.length > 0 && (
        <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    📈 Your Stakes
                  </h2>
                  <p className="text-white/80 text-lg">Manage your active and completed stakes</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 border border-white/30">
                    <div className="flex gap-2">
                      <button
                        className={
                          "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105" +
                          (stakesTab === "active"
                            ? " bg-emerald-500 text-white shadow-lg"
                            : " text-white/70 hover:text-white hover:bg-white/10")
                        }
                        onClick={() => setStakesTab("active")}
                      >
                        🟢 Active Stakes
                      </button>
                      <button
                        className={
                          "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105" +
                          (stakesTab === "withdrawn"
                            ? " bg-emerald-500 text-white shadow-lg"
                            : " text-white/70 hover:text-white hover:bg-white/10")
                        }
                        onClick={() => setStakesTab("withdrawn")}
                      >
                        🟡 Withdrawn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stakes Grid */}
                <div className="space-y-4">
                  {stakesTab === "active" ? (
                    userStakings.filter(item => item.active).length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">💼</div>
                        <p className="text-white/70 text-xl">No active stakes yet</p>
                        <p className="text-white/50 text-lg mt-2">Start staking above to earn rewards!</p>
                      </div>
                    ) : (
                      userStakings.map((item, idx) => ({ item, idx }))
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
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-white/70 text-xl">No withdrawn stakes yet</p>
                      <p className="text-white/50 text-lg mt-2">Complete your stakes to see them here</p>
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
        </div>
      )}
    </main>
  );
}
