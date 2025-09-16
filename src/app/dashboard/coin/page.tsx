"use client";

import Coin from "@/components/coin";
import gsap from "gsap";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { useDispatch, useSelector } from "react-redux";
import { heads, tails } from "@/redux/coinFlip/coinPrediction";
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
  const [gameStatus, setGameStatus] = useState<"flip" | "flipping" | "flipped">(
    "flip"
  );
  const [flipping, setFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<"win" | "lose">("win");
  const [winnings, setWinnings] = useState<string>();
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const { prediction } = useSelector(
    (state: { flipPrediction: { prediction: "heads" | "tails" } }) =>
      state.flipPrediction
  );
  const { stake } = useSelector(
    (state: { flipStake: { stake: number } }) => state.flipStake
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
    return parseFloat(formatted);
  };

  const {
    data: STTBalance,
    refetch: refetchSTTBalance,
  }: {
    data:
      | undefined
      | {
          value: BigNumberish;
          decimals: number;
        };
    refetch: () => Promise<
      QueryObserverResult<
        | {
            value: BigNumberish;
            decimals: number;
          }
        | undefined,
        Error
      >
    >;
  } = useBalance({
    address,
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const handleFlipCoin = async (side: "heads" | "tails", amount: number) => {
    if (!address || !isConnected) return;

    setFlipping(true);

    try {
      trackEvent({
        action: "coin_flip_attempt",
        category: "Game",
        label: side,
        value: amount * 100,
      });
    } catch (error) {
      console.error(
        "An error occured while tracking coin flip attempt: ",
        error
      );
    }

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

      const flipResult = await flipCoin(side, amount.toString());

      if (flipResult.success && flipResult.result) {
        setOutcome(flipResult.result.coinSide);
        setResult(flipResult.result.won ? "win" : "lose");
        setWinnings(flipResult.result.payout);

        try {
          trackEvent({
            action: "coin_flip_result",
            category: "Game",
            label: `${side}_${flipResult.result.won ? "win" : "loss"}`,
            value: flipResult.result.won
              ? Number(flipResult.result.payout) * 100
              : amount * 100,
          });
        } catch (error) {
          console.error(
            "An error occured while tracking coin flip result: ",
            error
          );
        }

        setFlipping(false);
        if (window) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }
        setGameStatus("flipping");

        gsap.to(".coin", {
          rotateY: "+=1440",
          rotateX: "+=720",
          rotateZ: "+=360",
          duration: 4,
          ease: "power4.in",
          onComplete: () => {
            gsap.to(".coin", {
              rotateY:
                flipResult.result && flipResult.result.coinSide === "heads"
                  ? 0
                  : 180,
              rotateX: 0,
              rotateZ: 0,
              duration: 2,
              ease: "power4.out",
              onComplete: () => setGameStatus("flipped"),
            });
          },
        });

        setTimeout(() => {
          setGameStatus("flipped");

          if (
            flipResult.result &&
            flipResult.result.won &&
            flipResult.result.payout
          ) {
            toast.success(
              `${flipResult.result.payout} STT will be added to your wallet`
            );
          }

          refetchSTTBalance();
          setTimeout(() => {
            if (STTBalance) {
              const formatted = formatBigNumber(
                STTBalance.value,
                STTBalance.decimals
              );
              const account = {
                ...userAccount,
                stt_balance: formatted,
              };

              dispatch(setUserAccount(account));
            }
          }, 2000);
        }, 7000);
      }
    } catch (error) {
      console.error("An error occured: ", error);
      setFlipping(false);
      toast.error("Oops. Bad flip");
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
    <main className="w-full min-h-screen bg-black text-white px-4 pt-20">
      {/* Header */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🪙</span>
          </div>
          <div>
            <h1 className="font-rubik text-2xl leading-none text-white mb-1">
              Coin Flip
            </h1>
            <p className="text-zinc-500 text-sm">
              Double your tokens with a flip
            </p>
          </div>
        </div>
        <button
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
          onClick={() => router.push("/dashboard/coin/history")}
        >
          History
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex-1 py-6 flex flex-col items-center">
        {/* Coin Container */}
        <div className="w-full max-w-6xl mx-auto mb-8">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-12">
            <div>
              <div className="flex justify-center items-center mb-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20"></div>
                  <Coin />
                </div>
              </div>

              {/* Game Status Display */}
              {gameStatus === "flipping" && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 bg-zinc-800/80 backdrop-blur px-6 py-3 rounded-xl">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white font-medium">
                      Flipping the coin...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-12">
            {gameStatus === "flip" ? (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="font-rubik text-2xl leading-none text-white mb-2 text-center sm:text-3xl lg:text-4xl">
                    Choose Your Side
                  </h2>
                  <p className="text-zinc-500">Will it be heads or tails?</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full">
                  {/* Prediction Section */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-xl mb-6">
                        <span className="text-lg">🎯</span>
                        <span className="text-white font-medium">
                          Your Prediction
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={
                          "group relative overflow-hidden rounded-xl p-6 text-center cursor-pointer transition-all duration-300" +
                          (prediction === "heads"
                            ? " bg-blue-500/20 border border-blue-500/50 text-white"
                            : " bg-zinc-800 hover:bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white")
                        }
                        onClick={() => dispatch(heads())}
                      >
                        <div className="relative z-10">
                          <div className="text-3xl mb-3">🗺️</div>
                          <p className="font-medium text-lg">HEADS</p>
                          <p className="text-sm opacity-75 mt-1">
                            The face side
                          </p>
                        </div>
                        {prediction === "heads" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                        )}
                      </div>

                      <div
                        className={
                          "group relative overflow-hidden rounded-xl p-6 text-center cursor-pointer transition-all duration-300" +
                          (prediction === "tails"
                            ? " bg-purple-500/20 border border-purple-500/50 text-white"
                            : " bg-zinc-800 hover:bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white")
                        }
                        onClick={() => dispatch(tails())}
                      >
                        <div className="relative z-10">
                          <div className="text-3xl mb-3">🥕</div>
                          <p className="font-medium text-lg">TAILS</p>
                          <p className="text-sm opacity-75 mt-1">
                            The back side
                          </p>
                        </div>
                        {prediction === "tails" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stake Section */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-xl mb-6">
                        <span className="text-lg">💰</span>
                        <span className="text-white font-medium">
                          Your Stake
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {cases.map((item, id) => (
                        <div
                          className={
                            "group relative overflow-hidden rounded-xl p-4 text-center cursor-pointer transition-all duration-300" +
                            (item.amount === stake
                              ? " bg-blue-500/20 border border-blue-500/50 text-white"
                              : " bg-zinc-800 hover:bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white")
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
                                : fifty()
                            )
                          }
                        >
                          <div className="relative z-10">
                            <div className="text-xl mb-1">🪙</div>
                            <p className="font-medium">{item.amount} STT</p>
                          </div>
                          {item.amount === stake && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  {/* Custom Amount Input */}
                  <div className="relative">
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-xl">
                        <span className="text-lg">🏦</span>
                        <span className="text-white font-medium">
                          Custom Amount
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        placeholder="Enter custom amount (STT)"
                        value={value}
                        onChange={(e) => {
                          setValue(e.target.value);
                          dispatch(stakeInput(e.target.value));
                        }}
                        type="number"
                        className="w-full rounded-xl bg-zinc-800 border border-zinc-700 p-4 pl-12 font-medium text-lg text-white placeholder-zinc-500 appearance-none focus:outline-none focus:border-blue-500/50 focus:bg-zinc-800/80 transition-colors"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                        🪙
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  {prediction && stake && (
                    <div className="bg-zinc-800/80 backdrop-blur rounded-xl p-4 text-center mb-6">
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎯</span>
                          <span className="text-zinc-400">Prediction:</span>
                          <span className="text-white font-medium uppercase">
                            {prediction}
                          </span>
                        </div>
                        <div className="w-px h-6 bg-zinc-700"></div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <span className="text-zinc-400">Stake:</span>
                          <span className="text-white font-medium">
                            {stake} STT
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flip Button */}
                  <div className="relative">
                    <Button
                      content={!flipping ? "FLIP THE COIN" : "Flipping..."}
                      onClick={() => handleFlipCoin(prediction, stake)}
                      className={
                        "relative overflow-hidden w-full text-white font-medium py-4 text-lg rounded-xl transition-all duration-300" +
                        (prediction && stake
                          ? " bg-blue-500 hover:bg-blue-600 cursor-pointer"
                          : " bg-zinc-700 opacity-50 pointer-events-none cursor-not-allowed") +
                        (flipping ? " animate-pulse pointer-events-none" : "")
                      }
                    />
                  </div>
                </div>
              </div>
            ) : gameStatus === "flipping" ? (
              <div className="flex flex-col items-center gap-8 py-12">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <div className="text-6xl sm:text-8xl animate-spin">🪙</div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-medium text-white mb-2 animate-pulse">
                    Flipping the Coin...
                  </h3>
                  <p className="text-zinc-400">The fate is being decided</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-500/80 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              /* Results Overlay */
              <div
                className={
                  "absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-lg rounded-2xl transition-all duration-500 transform" +
                  (gameStatus === "flipped"
                    ? " opacity-100 scale-100"
                    : " opacity-0 scale-95 pointer-events-none")
                }
              >
                {/* Celebration Animation */}
                {result === "win" && gameStatus === "flipped" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    <div
                      className="absolute top-20 right-16 w-2 h-2 bg-blue-500/80 rounded-full animate-ping"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute bottom-20 left-1/4 w-4 h-4 bg-blue-500/60 rounded-full animate-ping"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="absolute bottom-32 right-20 w-3 h-3 bg-blue-500/40 rounded-full animate-ping"
                      style={{ animationDelay: "1.5s" }}
                    ></div>
                  </div>
                )}

                {/* Result Display */}
                <div className="text-center space-y-8">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-xl mb-4">
                        <span className="text-lg">🎯</span>
                        <span className="text-white font-medium">
                          Your Prediction
                        </span>
                      </div>
                      <div className="mb-4">
                        {prediction === "tails" ? (
                          <Coin className="tail_result scale-75" />
                        ) : (
                          <Coin className="scale-75" />
                        )}
                      </div>
                      <div className="text-xl font-medium text-blue-500 uppercase">
                        {prediction}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-16 h-px sm:w-px sm:h-16 bg-zinc-800"></div>
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-zinc-800/80 backdrop-blur px-4 py-2 rounded-xl mb-4">
                        <span className="text-lg">🪙</span>
                        <span className="text-white font-medium">Result</span>
                      </div>
                      <div className="mb-4">
                        {outcome === "tails" ? (
                          <Coin className="tail_result scale-75" />
                        ) : (
                          <Coin className="scale-75" />
                        )}
                      </div>
                      <div className="text-xl font-medium text-purple-500 uppercase">
                        {outcome}
                      </div>
                    </div>
                  </div>

                  {/* Win/Loss Message */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl sm:text-4xl font-medium text-white mb-2">
                        {result === "win" ? "You Won! 🎉" : "Try Again 💫"}
                      </h3>
                      {result === "win" ? (
                        <div className="bg-zinc-800/80 backdrop-blur rounded-xl p-6">
                          <div className="flex items-center justify-center gap-2 text-white mb-2">
                            <span className="text-xl">💰</span>
                            <span className="text-lg font-medium">
                              You won {winnings} STT
                            </span>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            Reward will be added to your wallet
                          </p>
                        </div>
                      ) : (
                        <div className="bg-zinc-800/80 backdrop-blur rounded-xl p-6">
                          <p className="text-zinc-400">
                            Don't give up! Every flip is a new chance.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      content={result === "win" ? "Flip Again" : "Try Again"}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-8 text-lg rounded-xl transition-colors"
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
  );
}
