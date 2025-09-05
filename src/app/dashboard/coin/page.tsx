"use client"

import Coin from '@/components/coin';
import gsap from "gsap";
import { useEffect, useState } from "react";
import Button from '@/components/button';
import { useDispatch, useSelector } from 'react-redux';
import { heads, tails } from '@/redux/coinFlip/coinPrediction';
import {
  one,
  five,
  ten,
  fifteen,
  twenty,
  fifty,
  stakeInput,
} from "@/redux/coinFlip/coinStake";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { BigNumberish, formatUnits } from "ethers";
import { QueryObserverResult } from "@tanstack/react-query";
import { userAccountType } from "@/app/page";
import { setUserAccount } from "@/redux/connection/userAccount";
import { toast } from "sonner";
import { flipCoin } from "@/app/api/contractApi";
import { somniaTestnet } from "wagmi/chains";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/utils/analytics";

export default function CoinFlip() {
  const { address, isConnected } = useAccount();
  const [outcome, setOutcome] = useState<string>("heads");
  const [value, setValue] = useState("");
  const [gameStatus, setGameStatus] = useState<"flip" | "flipping" | "flipped">("flip");
  const [flipping, setFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "lose">("win");
  const [winnings, setWinnings] = useState<string>();
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
  );
  const { prediction } = useSelector(
    (state: { flipPrediction: { prediction: "heads" | "tails" } }) => state.flipPrediction,
  );
  const { stake } = useSelector(
    (state: { flipStake: { stake: number } }) => state.flipStake,
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  }

  const { data: STTBalance, refetch: refetchSTTBalance }: {
    data: undefined | {
      value: BigNumberish,
      decimals: number,
    },
    refetch: () => Promise<QueryObserverResult<{
      value: BigNumberish,
      decimals: number,
    } | undefined, Error>>,
  } = useBalance({
    address,
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    }
  });

  const handleFlipCoin = async (side: "heads" | "tails", amount: number) => {
    if (!address || !isConnected) return;

    setFlipping(true);

    try {
      trackEvent({
        action: 'coin_flip_attempt',
        category: 'Game',
        label: side,
        value: amount * 100,
      });
    } catch (error) {
      console.error("An error occured while tracking coin flip attempt: ", error)
    }

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

      const flipResult = await flipCoin(side, amount.toString());

      if (flipResult.success && flipResult.result) {
        setOutcome(flipResult.result.coinSide);
        setResult(flipResult.result.won ? "win" : "lose");
        setWinnings(flipResult.result.payout);

        try {
          trackEvent({
            action: 'coin_flip_result',
            category: 'Game',
            label: `${side}_${flipResult.result.won ? 'win' : 'loss'}`,
            value: flipResult.result.won ? Number(flipResult.result.payout) * 100 : amount * 100,
          });
        } catch (error) {
          console.error("An error occured while tracking coin flip result: ", error)
        }

        setFlipping(false);
        if (window) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        };
        setGameStatus("flipping");

        gsap.to(".coin", {
          rotateY: "+=1440",
          rotateX: "+=720",
          rotateZ: "+=360",
          duration: 4,
          ease: "power4.in",
          onComplete: () => {
            gsap.to(".coin", {
              rotateY: flipResult.result && flipResult.result.coinSide === "heads" ? 0 : 180,
              rotateX: 0,
              rotateZ: 0,
              duration: 2,
              ease: "power4.out",
              onComplete: () => setGameStatus("flipped"),
            });
          }
        })

        setTimeout(() => {
          setGameStatus("flipped");

          if (flipResult.result && flipResult.result.won && flipResult.result.payout) {
            toast.success(`${flipResult.result.payout} STT will be added to your wallet`);
          }

          refetchSTTBalance()
          setTimeout(() => {
            if (STTBalance) {
              const formatted = formatBigNumber(STTBalance.value, STTBalance.decimals);
              const account = {
                ...userAccount,
                stt_balance: formatted,
              };

              dispatch(setUserAccount(account));
            }
          }, 2000)
        }, 7000);
      }
    } catch (error) {
      console.error("An error occured: ", error)
      setFlipping(false)
      toast.error("Oops. Bad flip")
    }
  };

  const cases = [
    {
      amount: 0.01,
    },
    {
      amount: 0.02,
    },
    {
      amount: 0.05,
    },
    {
      amount: 0.1,
    },
    {
      amount: 0.2,
    },
    {
      amount: 0.5,
    },
  ];

  return (
    <main className="w-full flex flex-col gap-4 px-5 lg:px-24 max-sm:mb-12 relative">
      <div className="w-full flex justify-end mb-4">
        <button
          className="font-unkempt text-sm sm:text-base lg:text-lg bg-black text-[#007BFF] px-6 py-2 border border-[#007BFF] hover:bg-[#1a1a1a] transition-colors duration-300 rounded-md hover:cursor-pointer"
          onClick={() => router.push("/dashboard/coin/history")}
        >
          VIEW HISTORY
        </button>
      </div>
      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-16 mb-8 flex flex-col items-center gap-6">
        <h1 className="font-rubik text-2xl leading-none text-foreground mb-6 text-center sm:text-3xl lg:text-5xl">
          Coin Flip
        </h1>
        <Coin />
        <div className="rounded-[0.25rem] bg-foreground px-4 py-12 relative w-full mt-8">
          {gameStatus === "flip" ? (
            <div className="flex flex-col gap-8 items-center">
              <p className="font-love text-white text-center mb-4 sm:text-2xl lg:text-4xl">
                Heads or Tails?
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div
                  className={
                    "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer" +
                    (prediction === "heads" ? " !bg-[rgba(39,89,197,1)]" : "")
                  }
                  onClick={() => dispatch(heads())}
                >
                  <p className="font-unkempt text-white text-xs sm:text-base lg:text-xl">
                    Heads
                  </p>
                </div>
                <div
                  className={
                    "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 w-full rounded-lg text-center border border-[#09378c] hover:cursor-pointer" +
                    (prediction === "tails" ? " !bg-[rgba(39,89,197,1)]" : "")
                  }
                  onClick={() => dispatch(tails())}
                >
                  <p className="font-unkempt text-white text-xs sm:text-base lg:text-xl">
                    Tails
                  </p>
                </div>
              </div>
              <div className='flex flex-col gap-6'>
                <div className='grid grid-cols-3 w-fit gap-4'>
                  {cases.map((item, id) => (
                    <div
                      className={
                        "bg-[rgba(200,28,220,0.13)] hover:bg-[rgba(200,28,220,0.33)] duration-300 hover:cursor-pointer p-4 rounded-lg text-center border border-[#530853]" +
                        (item.amount === stake ? " !bg-[rgba(200,28,220,1)]" : "")
                      }
                      key={id}
                      onClick={() =>
                        dispatch(
                          item.amount == 0.01
                            ? one()
                            : item.amount == 0.02
                              ? five()
                              : item.amount == 0.05
                                ? ten()
                                : item.amount == 0.1
                                  ? fifteen()
                                  : item.amount == 0.2
                                    ? twenty()
                                    : fifty(),
                        )
                      }
                    >
                      <p className="font-unkempt text-white text-xs text-nowrap sm:text-base lg:text-xl">
                        {item.amount} STT
                      </p>
                    </div>
                  ))}
                </div>
                <input
                  placeholder="Choose amount"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    dispatch(stakeInput(e.target.value));
                  }}
                  type="number"
                  className="rounded-[0.25rem] border w-full focus:border-2 bg-foreground p-4 font-unkempt text-[10px] sm:text-sm lg:text-xl text-white leading-3 appearance-none focus:outline-none border-[#09378c] no-spinner"
                />
              </div>
              <Button
                content={!flipping ? "Flip" : "Flipping..."}
                onClick={() => handleFlipCoin(prediction, stake)}
                className={
                  "bg-background w-40 border-background" +
                  (prediction && stake
                    ? " opacity-100 hover:cursor-pointer"
                    : " opacity-50 pointer-events-none hover:cursor-not-allowed") +
                  (flipping ? " animate-pulse pointer-events-none" : "")
                }
              />
            </div>
          ) : gameStatus === "flipping" ? (
            <p className="font-love text-white mb-8 sm:text-2xl lg:text-4xl">
              Flipping...
            </p>
          ) : (
            <div
              className={
                "flex flex-col max-sm:items-center sm:flex-row sm:justify-center sm:gap-16 lg:gap-40 items-center gap-[18px] relative top-0 py-12 left-0 z-10 bg-foreground w-full rounded-[0.25rem]" +
                (gameStatus === "flipped"
                  ? " "
                  : " opacity-0 pointer-events-none")
              }
            >
              <div className="flex items-center gap-4 sm:flex-col sm:gap-9 lg:gap-14">
                <div className='flex flex-col gap-4 items-center'>
                  <p className='font-unkempt text-background'>Your prediction</p>
                  <div className="max-lg:w-20 max-lg:h-20 relative">
                    {prediction === "tails" ? (
                      <Coin className='tail_result origin-top max-lg:relative max-lg:right-12' />
                    ) : (
                      <Coin className="max-lg:scale-50 origin-top-left" />
                    )}
                  </div>
                </div>
                <div className="w-7 h-[2px] bg-white sm:hidden relative top-5 right-2"></div>
                <div className='flex flex-col gap-4 items-center'>
                  <p className='font-unkempt text-background'>Result</p>
                  <div className="max-lg:w-20 max-lg:h-20 relative">
                    {outcome === "tails" ? (
                      <Coin className='tail_result origin-top-left lg:origin-top max-lg:relative max-lg:left-20' />
                    ) : (
                      <Coin className='max-lg:scale-50 origin-top-left' />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:gap-8 items-center">
                {result === "win" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-icon lucide-circle w-32 h-32 drop-shadow-lg"><circle cx="12" cy="12" r="10" />
                    <defs>
                      <linearGradient id="gradient1">
                        <stop offset="0%" stopColor='#09378c' />
                        <stop offset="100%" stopColor='#2759c5' />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x w-32 h-32 drop-shadow-lg"><path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    <defs>
                      <linearGradient id="gradient2">
                        <stop offset="0%" stopColor='#09378c' />
                        <stop offset="100%" stopColor='#2759c5' />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                <div className="flex flex-col gap-4 items-center">
                  <p className="font-love text-white sm:text-xl lg:text-4xl">
                    {result === "win" ? "You Won!" : "You Lost!"}
                  </p>
                  {result === "win" ? (
                    <div className="flex flex-col gap-1">
                      <p className="font-unkempt text-white text-sm sm:text-lg lg:text-xl">
                        You won:{" "}
                        <span className="text-background">{winnings}</span>
                      </p>
                      <p className="font-unkempt text-white text-sm sm:text-lg lg:text-xl">
                        Your reward will be added to your wallet
                      </p>
                    </div>
                  ) : null}
                  <Button
                    content={"Flip again"}
                    className="bg-white border-white"
                    onClick={() => setGameStatus("flip")}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}