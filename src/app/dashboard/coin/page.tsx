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
    <main className="w-full min-h-screen flex flex-col px-0 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-16 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-12 w-20 h-20 bg-blue-300/20 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/3 left-1/5 w-16 h-16 bg-purple-300/20 rounded-full animate-pulse" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute bottom-24 right-1/4 w-28 h-28 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-300/10 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full flex justify-between items-center p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <span className="text-2xl">🪙</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg sm:text-xl">Coin Master</h2>
            <p className="text-white/70 text-sm">Heads or Tails</p>
          </div>
        </div>
        <button
          className="font-unkempt text-sm sm:text-base bg-white/90 backdrop-blur-sm text-blue-600 px-4 sm:px-6 py-2 sm:py-3 border border-white/20 hover:bg-white transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:cursor-pointer transform hover:scale-105"
          onClick={() => router.push("/dashboard/coin/history")}
        >
          📈 History
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-rubik text-4xl sm:text-5xl lg:text-7xl xl:text-8xl leading-none mb-4 text-center text-white drop-shadow-2xl">
            🪙 COIN ARENA
          </h1>
          <p className="text-white/80 text-lg sm:text-xl lg:text-2xl font-light">
            Choose your side • Flip the coin • Win instantly
          </p>
        </div>

        {/* Coin Container */}
        <div className="w-full max-w-6xl mx-auto mb-12">
          <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center mb-8">
                <div className="relative">
                  <div className="absolute -inset-8 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative transform transition-transform duration-300 hover:scale-110">
                    <Coin />
                  </div>
                </div>
              </div>

              {/* Game Status Display */}
              {gameStatus === "flipping" && (
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white font-medium text-lg">🪙 Flipping the coin...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="rounded-3xl bg-white/95 backdrop-blur-md px-6 sm:px-8 lg:px-12 py-8 sm:py-12 relative w-full shadow-2xl border border-white/20">
          {gameStatus === "flip" ? (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                  🪙 Choose Your Side
                </h2>
                <p className="text-gray-600 text-lg">Will it be heads or tails?</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full">
                {/* Prediction Section */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">🎯 Your Prediction</h3>
                    <p className="text-gray-600">Pick your lucky side!</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={
                        "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                        (prediction === "heads"
                          ? " bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-400 text-white shadow-2xl scale-105"
                          : " bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 shadow-lg")
                      }
                      onClick={() => dispatch(heads())}
                    >
                      <div className="relative z-10">
                        <div className="text-4xl mb-3">🗺️</div>
                        <p className="font-bold text-xl sm:text-2xl">
                          HEADS
                        </p>
                        <p className="text-sm opacity-75 mt-1">The face side</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </div>

                    <div
                      className={
                        "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                        (prediction === "tails"
                          ? " bg-gradient-to-r from-purple-500 to-violet-600 border-purple-400 text-white shadow-2xl scale-105"
                          : " bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 shadow-lg")
                      }
                      onClick={() => dispatch(tails())}
                    >
                      <div className="relative z-10">
                        <div className="text-4xl mb-3">🥕</div>
                        <p className="font-bold text-xl sm:text-2xl">
                          TAILS
                        </p>
                        <p className="text-sm opacity-75 mt-1">The back side</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </div>
                  </div>
                </div>

                {/* Stake Section */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">💰 Your Stake</h3>
                    <p className="text-gray-600">How much do you want to bet?</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {cases.map((item, id) => (
                      <div
                        className={
                          "group relative overflow-hidden rounded-xl p-4 text-center border-2 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                          (item.amount === stake
                            ? " bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-xl scale-105"
                            : " bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700 hover:from-gray-100 hover:to-gray-200 shadow-md")
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
                        <div className="relative z-10">
                          <div className="text-2xl mb-1">🪙</div>
                          <p className="font-bold text-sm">
                            {item.amount} STT
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {/* Custom Amount Input */}
                <div className="relative">
                  <label className="block text-gray-700 font-bold mb-3 text-center">
                    🏦 Custom Amount
                  </label>
                  <div className="relative">
                    <input
                      placeholder="Enter custom amount (STT)"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        dispatch(stakeInput(e.target.value));
                      }}
                      type="number"
                      className="w-full rounded-2xl border-2 focus:border-3 bg-gradient-to-r from-gray-50 to-white p-4 pl-12 font-medium text-lg text-gray-800 leading-normal appearance-none focus:outline-none border-gray-300 focus:border-indigo-500 no-spinner shadow-lg transition-all duration-300 focus:shadow-xl"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                      🪙
                    </div>
                  </div>
                </div>

                {/* Flip Button */}
                <div className="relative">
                  <Button
                    content={!flipping ? "🪙 FLIP THE COIN!" : "🪙 Flipping..."}
                    onClick={() => handleFlipCoin(prediction, stake)}
                    className={
                      "relative overflow-hidden w-full border-0 text-white font-bold py-6 text-xl sm:text-2xl rounded-2xl shadow-2xl transform transition-all duration-300 group" +
                      (prediction && stake
                        ? " bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-800 hover:cursor-pointer hover:scale-105 hover:shadow-3xl"
                        : " bg-gray-400 opacity-50 pointer-events-none cursor-not-allowed") +
                      (flipping ? " animate-pulse pointer-events-none" : "")
                    }
                  />
                  {prediction && stake && !flipping && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none rounded-2xl"></div>
                  )}
                </div>

                {/* Game Info */}
                {prediction && stake && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-blue-800 font-medium">
                      🪙 Prediction: <span className="font-bold uppercase">{prediction}</span> | 💰 Stake: <span className="font-bold">{stake} STT</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : gameStatus === "flipping" ? (
            <div className="flex flex-col items-center gap-8 py-12">
              <div className="relative">
                <div className="text-6xl sm:text-8xl animate-spin">🪙</div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              </div>
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 animate-pulse">
                  Flipping the Coin...
                </h3>
                <p className="text-gray-600 text-lg">The fate is being decided! 🍀</p>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          ) : (
            /* Results Overlay */
            <div
              className={
                "absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/98 backdrop-blur-lg rounded-3xl transition-all duration-500 transform" +
                (gameStatus === "flipped"
                  ? " opacity-100 scale-100"
                  : " opacity-0 scale-95 pointer-events-none")
              }
            >
              {/* Celebration Animation */}
              {result === "win" && gameStatus === "flipped" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-20 right-16 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-32 right-20 w-4 h-4 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                </div>
              )}

              {/* Result Display */}
              <div className="text-center space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-3">
                      <span className="text-2xl">🎯</span>
                      <span className="font-bold text-gray-700">Your Prediction</span>
                    </div>
                    <div className="mb-4">
                      {prediction === "tails" ? (
                        <Coin className='tail_result scale-75' />
                      ) : (
                        <Coin className="scale-75" />
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600 uppercase">
                      {prediction}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-[3px] sm:w-[3px] sm:h-16 bg-gradient-to-r sm:bg-gradient-to-b from-blue-400 to-purple-600 rounded-full"></div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-3">
                      <span className="text-2xl">🪙</span>
                      <span className="font-bold text-gray-700">Result</span>
                    </div>
                    <div className="mb-4">
                      {outcome === "tails" ? (
                        <Coin className='tail_result scale-75' />
                      ) : (
                        <Coin className='scale-75' />
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 uppercase">
                      {outcome}
                    </div>
                  </div>
                </div>

                {/* Win/Loss Icon and Message */}
                <div className="space-y-4">
                  {result === "win" ? (
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                        <div className="text-6xl">🎆</div>
                      </div>
                      <div className="absolute -inset-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center shadow-2xl">
                        <div className="text-6xl">😢</div>
                      </div>
                      <div className="absolute -inset-8 bg-gradient-to-r from-red-400 to-rose-600 rounded-full blur-xl opacity-30"></div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-4xl sm:text-5xl font-bold">
                      {result === "win" ? (
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          🎉 JACKPOT!
                        </span>
                      ) : (
                        <span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                          💫 Better Luck Next Time
                        </span>
                      )}
                    </h3>

                    {result === "win" ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-700">
                          <span className="text-2xl">💰</span>
                          <span className="text-xl font-bold">You won: {winnings} STT</span>
                        </div>
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-green-600 text-sm mt-1">
                            🚀 Reward will be added to your wallet
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
                        <p className="text-gray-600 text-lg">
                          💪 Don't give up! Every flip is a new chance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    content={result === "win" ? "🎆 Flip Again & Win More!" : "🪙 Try Your Luck Again"}
                    className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-800 border-0 text-white font-bold py-4 px-8 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    onClick={() => setGameStatus("flip")}
                  />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  )
}