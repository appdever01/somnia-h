"use client";

import Button from "@/components/button";
import { equal, higher, lower } from "@/redux/diceGame/dicePrediction";
import {
  fifty,
  five,
  fifteen,
  one,
  stakeInput,
  ten,
  twenty,
} from "@/redux/diceGame/diceStake";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Die from "@/components/die";
import { userAccountType } from "@/app/page";
import { setUserAccount } from "@/redux/connection/userAccount";
import { toast } from "sonner";
import { useAccount, useBalance } from "wagmi";
import * as ethersUtils from "ethers";
import { QueryObserverResult } from "@tanstack/react-query";
import { rollDice } from "@/app/api/contractApi";
import { somniaTestnet } from "wagmi/chains";
import { trackEvent } from "@/utils/analytics";

// type DiceDataType = {
//   result: boolean,
//   amount: number,
//   guess: number,
//   dice1: number,
//   dice2: number,
//   outcome: number,
//   payout: number,
//   houseCharge: number,
//   claimed: number,
//   player: `0x${string}`,
// }

export default function Dice() {
  const { address, isConnected } = useAccount();
  const [value, setValue] = useState("");
  const [gameStatus, setGameStatus] = useState<
    "predict" | "rolling" | "result"
  >("predict");
  const [rolling, setRolling] = useState(false);
  const [startRolling, setStartRolling] = useState(false);
  const [outcome1, setOutcome1] = useState(1); // Fixed initial value
  const [outcome2, setOutcome2] = useState(6); // Fixed initial value
  const [outcome, setOutcome] = useState(0);
  const [result, setResult] = useState("");
  const [winnings, setWinnings] = useState(0);
  const [houseCharge, setHouseCharge] = useState(0);
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
  );
  const { prediction } = useSelector(
    (state: { dicePredictor: { prediction: "lower" | "equal" | "higher" } }) => state.dicePredictor,
  );
  const { stake } = useSelector(
    (state: { diceStake: { stake: number } }) => state.diceStake,
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const dice = useRef<HTMLElement | null>(null);
  const dice2 = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.replace("/empty-state");
    }
  }, [isConnected]); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dice.current = document.querySelectorAll(".dice")[0] as HTMLElement;
    dice2.current = document.querySelectorAll(".dice")[1] as HTMLElement;
  }, []);

  // const convertCoin = (coin: number): bigint => {
  //   return BigInt(Math.round(coin * 10 ** 8));
  // };

  // const revertCoin = (coin: bigint): number => {
  //   return Number(coin) / 10 ** 8;
  // };

  const formatBigNumber = (value: ethersUtils.BigNumberish, decimals: number): number => {
    const formatted = ethersUtils.formatUnits(value, decimals);
    return parseFloat(formatted)
  }

  const { data: STTBalance, refetch: refetchSTTBalance }: {
    data: undefined | {
      value: ethersUtils.BigNumberish,
      decimals: number,
    },
    refetch: () => Promise<QueryObserverResult<{
      value: ethersUtils.BigNumberish,
      decimals: number,
    } | undefined, Error>>,
  } = useBalance({
    address,
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    }
  });

  const handleRollDice = async (selection: "lower" | "equal" | "higher", amount: number) => {
    if (!address || !isConnected) return;

    setRolling(true);

    try {
      trackEvent({
        action: 'dice_roll_attempt',
        category: 'Game',
        label: selection,
        value: amount * 100,
      });
    } catch (error) {
      console.error("An error occured while tracking dice roll attempt: ", error)
    }

    try {
      const rollResult = await rollDice(selection, amount.toString())

      if (!rollResult.success) {
        toast.error("An error occured. Transaction execution reverted")
        setRolling(false);
        return;
      }

      if (rollResult.success && rollResult.result) {
        setOutcome1(rollResult.result.dice1);
        setOutcome2(rollResult.result.dice2);
        setOutcome(rollResult.result.outcome);
        setResult(rollResult.result.won ? "win" : "lose");
        setWinnings(Number(rollResult.result.payout));
        setHouseCharge(Number(rollResult.result.houseCharge));

        try {
          trackEvent({
            action: 'dice_roll_result',
            category: 'Game',
            label: `${selection}_${rollResult.result.won ? 'win' : 'loss'}_${rollResult.result.outcome}`,
            value: rollResult.result.won ? Number(rollResult.result.payout) * 100 : amount * 100,
          });
        } catch (error) {
          console.error("An error occured while tracking dice roll result: ", error)
        }

        setRolling(false);
        if (window) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }
        setStartRolling((a) => !a);
        setGameStatus("rolling");
      }

      setTimeout(() => {
        setGameStatus("result");

        if (rollResult.result && rollResult.result.won && rollResult.result.payout && rollResult.result.houseCharge) {
          toast.success(`${Number(rollResult.result.payout) - Number(rollResult.result.houseCharge)} STT will be added to your wallet`);
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
    } catch (error) {
      console.error("An error occured: ", error)
      setRolling(false)
      toast.error("Oops. Bad roll")
    }
  };

  useEffect(() => {
    if (dice.current) dice.current.style.animation = "rolling 4s";

    if (dice2.current) dice2.current.style.animation = "rolling2 4s";

    setTimeout(() => {
      switch (outcome1) {
        case 1:
          if (dice.current)
            dice.current.style.transform = "rotateX(0deg) rotateY(0deg)";
          break;

        case 6:
          if (dice.current)
            dice.current.style.transform = "rotateX(180deg) rotateY(0deg)";
          break;

        case 2:
          if (dice.current)
            dice.current.style.transform = "rotateX(-90deg) rotateY(0deg)";
          break;

        case 5:
          if (dice.current)
            dice.current.style.transform = "rotateX(90deg) rotateY(0deg)";
          break;

        case 3:
          if (dice.current)
            dice.current.style.transform = "rotateX(0deg) rotateY(90deg)";
          break;

        case 4:
          if (dice.current)
            dice.current.style.transform = "rotateX(0deg) rotateY(-90deg)";
          break;

        default:
          break;
      }

      switch (outcome2) {
        case 1:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(0deg) rotateY(0deg)";
          break;

        case 6:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(180deg) rotateY(0deg)";
          break;

        case 2:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(-90deg) rotateY(0deg)";
          break;

        case 5:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(90deg) rotateY(0deg)";
          break;

        case 3:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(0deg) rotateY(90deg)";
          break;

        case 4:
          if (dice2.current)
            dice2.current.style.transform = "rotateX(0deg) rotateY(-90deg)";
          break;

        default:
          break;
      }

      if (dice.current) dice.current.style.animation = "none";

      if (dice2.current) dice2.current.style.animation = "none";
    }, 4050);
  }, [startRolling]); //eslint-disable-line react-hooks/exhaustive-deps

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
    <>
      <main className="w-full min-h-screen flex flex-col px-0 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 right-20 w-16 h-16 bg-orange-300/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-purple-300/20 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 w-full flex justify-between items-center p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-2xl">🎲</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg sm:text-xl">Dice Master</h2>
              <p className="text-white/70 text-sm">Roll your luck</p>
            </div>
          </div>
          <button
            className="font-unkempt text-sm sm:text-base bg-white/90 backdrop-blur-sm text-orange-600 px-4 sm:px-6 py-2 sm:py-3 border border-white/20 hover:bg-white transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:cursor-pointer transform hover:scale-105"
            onClick={() => router.push("/dashboard/dice/history")}
          >
            📈 History
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-rubik text-4xl sm:text-5xl lg:text-7xl xl:text-8xl leading-none mb-4 text-center text-white drop-shadow-2xl">
              🎲 DICE ARENA
            </h1>
            <p className="text-white/80 text-lg sm:text-xl lg:text-2xl font-light">
              Predict the sum • Roll the dice • Win big
            </p>
          </div>

          {/* Dice Container */}
          <div className="w-full max-w-6xl mx-auto mb-12">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center gap-8 sm:gap-12 lg:gap-20 mb-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Die />
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto border border-white/30">
                      <span className="text-3xl sm:text-4xl text-white">+</span>
                    </div>
                    <p className="text-white/70 text-sm font-medium">SUM</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
                    <Die />
                  </div>
                </div>

                {/* Game Status Display */}
                {gameStatus === "rolling" && (
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white font-medium text-lg">🎲 Rolling the dice...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Game Controls */}
          <div className="w-full max-w-6xl mx-auto">
            <div
              className={
                "rounded-3xl bg-white/95 backdrop-blur-md px-6 sm:px-8 lg:px-12 py-8 sm:py-12 relative w-full shadow-2xl border border-white/20" +
                (gameStatus === "result" ? ` min-h-96` : "")
              }
            >
            <div className="flex flex-col gap-8 items-center">
              {gameStatus === "predict" ? (
                <div className="flex flex-col gap-8 items-center">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                      🎯 Make Your Prediction
                    </h2>
                    <p className="text-gray-600 text-lg">Choose wisely and roll for glory!</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full">
                    {/* Prediction Section */}
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">🔥 Prediction</h3>
                        <p className="text-gray-600">What will the sum be?</p>
                      </div>
                      <div className="space-y-3">
                        <div
                          className={
                            "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                            (prediction === "higher"
                              ? " bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 text-white shadow-2xl scale-105"
                              : " bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 shadow-lg")
                          }
                          onClick={() => dispatch(higher())}
                        >
                          <div className="relative z-10">
                            <div className="text-3xl mb-2">🔺</div>
                            <p className="font-bold text-lg sm:text-xl">
                              Higher than 7
                            </p>
                            <p className="text-sm opacity-75 mt-1">8, 9, 10, 11, 12</p>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </div>

                        <div
                          className={
                            "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                            (prediction === "equal"
                              ? " bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-400 text-white shadow-2xl scale-105"
                              : " bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 shadow-lg")
                          }
                          onClick={() => dispatch(equal())}
                        >
                          <div className="relative z-10">
                            <div className="text-3xl mb-2">🎯</div>
                            <p className="font-bold text-lg sm:text-xl">
                              Exactly 7
                            </p>
                            <p className="text-sm opacity-75 mt-1">Lucky number seven!</p>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </div>

                        <div
                          className={
                            "group relative overflow-hidden rounded-2xl p-6 text-center border-3 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                            (prediction === "lower"
                              ? " bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 text-white shadow-2xl scale-105"
                              : " bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 shadow-lg")
                          }
                          onClick={() => dispatch(lower())}
                        >
                          <div className="relative z-10">
                            <div className="text-3xl mb-2">🔻</div>
                            <p className="font-bold text-lg sm:text-xl">
                              Lower than 7
                            </p>
                            <p className="text-sm opacity-75 mt-1">2, 3, 4, 5, 6</p>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        </div>
                      </div>
                    </div>

                    {/* Stake Section */}
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">💰 Your Stake</h3>
                        <p className="text-gray-600">How much do you want to bet?</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {cases.map((item, id) => (
                          <div
                            className={
                              "group relative overflow-hidden rounded-xl p-4 text-center border-2 cursor-pointer transform transition-all duration-300 hover:scale-105" +
                              (item.amount === stake
                                ? " bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-400 text-white shadow-xl scale-105"
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
                              <p className="font-bold text-sm sm:text-base">
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
                          className="w-full rounded-2xl border-2 focus:border-3 bg-gradient-to-r from-gray-50 to-white p-4 pl-12 font-medium text-lg text-gray-800 leading-normal appearance-none focus:outline-none border-gray-300 focus:border-purple-500 no-spinner shadow-lg transition-all duration-300 focus:shadow-xl"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                          🪙
                        </div>
                      </div>
                    </div>

                    {/* Roll Button */}
                    <div className="relative">
                      <Button
                        content={!rolling ? "🎲 ROLL THE DICE!" : "🎲 Rolling..."}
                        className={
                          "relative overflow-hidden w-full border-0 text-white font-bold py-6 text-xl sm:text-2xl rounded-2xl shadow-2xl transform transition-all duration-300 group" +
                          (prediction && stake
                            ? " bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 hover:cursor-pointer hover:scale-105 hover:shadow-3xl"
                            : " bg-gray-400 opacity-50 pointer-events-none cursor-not-allowed") +
                          (rolling ? " animate-pulse pointer-events-none" : "")
                        }
                        onClick={() => handleRollDice(prediction, stake)}
                      />
                      {prediction && stake && !rolling && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none rounded-2xl"></div>
                      )}
                    </div>

                    {/* Game Info */}
                    {prediction && stake && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="text-blue-800 font-medium">
                          🎲 Prediction: <span className="font-bold capitalize">{prediction} than 7</span> | 💰 Stake: <span className="font-bold">{stake} STT</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : gameStatus === "rolling" ? (
                <div className="flex flex-col items-center gap-8 py-12">
                  <div className="relative">
                    <div className="text-6xl sm:text-8xl animate-bounce">🎲</div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 animate-pulse">
                      Rolling the Dice...
                    </h3>
                    <p className="text-gray-600 text-lg">May luck be on your side! 🍀</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              ) : null}
            </div>
            {/* Results Overlay */}
            <div
              className={
                "absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/98 backdrop-blur-lg rounded-3xl transition-all duration-500 transform" +
                (gameStatus === "result"
                  ? " opacity-100 scale-100"
                  : " opacity-0 scale-95 pointer-events-none")
              }
            >
              {/* Celebration Animation */}
              {result === "win" && gameStatus === "result" && (
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
                      <span className="font-bold text-gray-700">Target</span>
                    </div>
                    <div className="text-6xl sm:text-8xl font-bold text-orange-500 drop-shadow-lg">
                      7
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-[3px] sm:w-[3px] sm:h-16 bg-gradient-to-r sm:bg-gradient-to-b from-orange-400 to-purple-600 rounded-full"></div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-3">
                      <span className="text-2xl">🎲</span>
                      <span className="font-bold text-gray-700">Result</span>
                    </div>
                    <div className="text-6xl sm:text-8xl font-bold text-purple-500 drop-shadow-lg">
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
                          🎉 WINNER!
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
                          <span className="text-xl font-bold">Winnings: {winnings} STT</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <span className="text-xl">🏦</span>
                          <span className="text-lg">House fee: -{houseCharge} STT</span>
                        </div>
                        <div className="pt-2 border-t border-green-200">
                          <p className="text-green-700 font-medium">
                            🎆 Net reward: {Number(winnings) - Number(houseCharge)} STT
                          </p>
                          <p className="text-green-600 text-sm mt-1">
                            🚀 Reward will be added to your wallet
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
                        <p className="text-gray-600 text-lg">
                          💪 Don't give up! Every roll is a new chance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    content={result === "win" ? "🎆 Roll Again & Win More!" : "🎲 Try Your Luck Again"}
                    className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 hover:from-orange-600 hover:via-red-600 hover:to-purple-700 border-0 text-white font-bold py-4 px-8 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    onClick={() => setGameStatus("predict")}
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>
      {/* <footer className="bg-foreground py-16 lg:py-32 flex flex-col items-center gap-8 w-screen">
            <h2 className="font-love text-white text-[2rem] leading-none sm:text-3xl lg:text-5xl">Platform STatistics</h2>
            <div className="px-10 w-full flex flex-col max-w-2xl">
                {statistics.map((item, id) => (
                    <div className="py-6 px-4 border-t border-b flex items-center justify-between" key={id}>
                        <p className="font-love text-white sm:text-xl lg:text-4xl">{item.field}</p>
                        <p className="font-unkempt text-white text-xs sm:text-base lg:text-2xl">{item.stat}</p>
                    </div>
                ))}
            </div>
        </footer> */}
    </>
  );
}
