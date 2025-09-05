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
    <main className="w-full flex flex-col gap-4 px-5 mb-24 lg:px-24">
      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 max-w-7xl lg:bg-[#12121233] lg:p-16">
        <h1 className="font-rubik text-2xl leading-8 text-center sm:text-3xl lg:text-5xl mb-6">
          PUMPAZ STAKING
        </h1>
        <div className="rounded-[0.25rem] bg-foreground px-4 py-12 lg:px-16 lg:py-24">
          <div className="flex flex-col gap-8 items-center">
            <div className="flex flex-col gap-4 sm:w-[18rem] items-center lg:w-[31.25rem]">
              <input
                placeholder="Enter amount to stake"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  dispatch(setStaking(e.target.value));
                }}
                type="number"
                className="rounded-[0.25rem] w-full border border-[#09378c] focus:border-2 text-white bg-foreground p-4 font-unkempt no-spinner text-[10px] sm:text-sm lg:text-xl leading-3 appearance-none focus:outline-none hover:appearance-none focus:appearance-none"
              />
              <Button
                content={status === "stake" ? "Stake" : "Staking..."}
                className={
                  "bg-background w-full border-background sm:max-lg:!py-3" +
                  (staking && stake_id != 0
                    ? ""
                    : " opacity-50 hover:cursor-not-allowed pointer-events-none") +
                  (status === "staking"
                    ? " animate-pulse pointer-events-none"
                    : "")
                }
                onClick={() => handleCreateStaking(stake_id, staking)}
              />
            </div>
            {loading && (
              <LoadingSpinner className="w-12 h-12 sm:w-24 sm:h-24 text-white" />
            )}
            {availableStakes &&
              <div className="grid grid-cols-2 gap-4 w-fit sm:grid-cols-3">
                {availableStakes.map((option, idx) => (
                  <StakeCard
                    duration={option.stakingDays}
                    apy={option.apy}
                    key={idx}
                    id={option.id}
                  />
                ))}
              </div>
            }

          </div>
        </div>
      </div>

      {isUserStakingsSuccess && userStakings && userStakings?.length > 0 ? (
        <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 max-w-7xl lg:bg-[#12121233] lg:p-16">
          <div className="rounded-[0.25rem] bg-foreground px-4 py-12 lg:px-16 lg:py-24">
            <p className="font-rubik text-bluetheme mb-8 sm:text-xl lg:text-4xl">
              YOUR STAKES
            </p>
            <div className="flex gap-6 items-center mb-6">
              <p
                className={
                  "font-love text-white text-sm sm:text-lg lg:text-2xl py-1 px-1 hover:cursor-pointer" +
                  (stakesTab === "active" ? " border-b-2 border-b-blueground" : "")
                }
                onClick={() => setStakesTab("active")}
              >
                Active
              </p>
              <p
                className={
                  "font-love text-white text-sm sm:text-lg lg:text-2xl py-1 px-1 hover:cursor-pointer" +
                  (stakesTab === "withdrawn"
                    ? " border-b-2 border-b-blueground"
                    : "")
                }
                onClick={() => setStakesTab("withdrawn")}
              >
                Withdrawn
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {stakesTab === "active" ? (
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
              ) : userStakings.filter((item) => item.claimed)
                .length == 0 ? (
                <p className="font-unkempt text-white text-center sm:text-2xl">
                  No withdrawn stakes yet
                </p>
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
      ) : null}
    </main>
  );
}
