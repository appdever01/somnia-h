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
import gsap from "gsap";
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
      state.userAccount
  );
  const { prediction } = useSelector(
    (state: { dicePredictor: { prediction: "lower" | "equal" | "higher" } }) =>
      state.dicePredictor
  );
  const { stake } = useSelector(
    (state: { diceStake: { stake: number } }) => state.diceStake
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

  const formatBigNumber = (
    value: ethersUtils.BigNumberish,
    decimals: number
  ): number => {
    const formatted = ethersUtils.formatUnits(value, decimals);
    return parseFloat(formatted);
  };

  const {
    data: STTBalance,
    refetch: refetchSTTBalance,
  }: {
    data:
      | undefined
      | {
          value: ethersUtils.BigNumberish;
          decimals: number;
        };
    refetch: () => Promise<
      QueryObserverResult<
        | {
            value: ethersUtils.BigNumberish;
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

  const handleRollDice = async (
    selection: "lower" | "equal" | "higher",
    amount: number
  ) => {
    if (!address || !isConnected) return;

    setRolling(true);

    try {
      trackEvent({
        action: "dice_roll_attempt",
        category: "Game",
        label: selection,
        value: amount * 100,
      });
    } catch (error) {
      console.error(
        "An error occured while tracking dice roll attempt: ",
        error
      );
    }

    try {
      const rollResult = await rollDice(selection, amount.toString());

      if (!rollResult.success) {
        toast.error("An error occured. Transaction execution reverted");
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
            action: "dice_roll_result",
            category: "Game",
            label: `${selection}_${rollResult.result.won ? "win" : "loss"}_${
              rollResult.result.outcome
            }`,
            value: rollResult.result.won
              ? Number(rollResult.result.payout) * 100
              : amount * 100,
          });
        } catch (error) {
          console.error(
            "An error occured while tracking dice roll result: ",
            error
          );
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

        if (
          rollResult.result &&
          rollResult.result.won &&
          rollResult.result.payout &&
          rollResult.result.houseCharge
        ) {
          toast.success(
            `${
              Number(rollResult.result.payout) -
              Number(rollResult.result.houseCharge)
            } STT will be added to your wallet`
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
    } catch (error) {
      console.error("An error occured: ", error);
      setRolling(false);
      toast.error("Oops. Bad roll");
    }
  };

  useEffect(() => {
    if (!dice.current || !dice2.current) return;

    // Initial random rotations
    const randomRotations = {
      x: Math.random() * 1080 - 540,
      y: Math.random() * 1080 - 540,
      z: Math.random() * 1080 - 540,
    };

    // Rolling animation
    gsap.to([dice.current, dice2.current], {
      rotateX: `+=${randomRotations.x}`,
      rotateY: `+=${randomRotations.y}`,
      rotateZ: `+=${randomRotations.z}`,
      duration: 2,
      ease: "power2.inOut",
      onComplete: () => {
        // Final positions based on outcomes
        const getFinalRotation = (value: number) => {
          switch (value) {
            case 1:
              return { x: 0, y: 0 };
            case 2:
              return { x: -90, y: 0 };
            case 3:
              return { x: 0, y: 90 };
            case 4:
              return { x: 0, y: -90 };
            case 5:
              return { x: 90, y: 0 };
            case 6:
              return { x: 180, y: 0 };
            default:
              return { x: 0, y: 0 };
          }
        };

        const final1 = getFinalRotation(outcome1);
        const final2 = getFinalRotation(outcome2);

        gsap.to(dice.current, {
          rotateX: final1.x,
          rotateY: final1.y,
          rotateZ: 0,
          duration: 1,
          ease: "power2.out",
        });

        gsap.to(dice2.current, {
          rotateX: final2.x,
          rotateY: final2.y,
          rotateZ: 0,
          duration: 1,
          ease: "power2.out",
        });
      },
    });
  }, [startRolling, outcome1, outcome2]);

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
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold">Dice</h1>
            <p className="text-gray-400 text-sm">Predict the sum and roll</p>
          </div>
          <button
            className="border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 px-4 py-2 rounded font-mono text-sm"
            onClick={() => router.push("/dashboard/dice/history")}
          >
            History
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Dice visuals */}
          <div className="border border-orange-500/20 rounded-lg p-6">
            <div className="flex items-center justify-center gap-12">
              <Die />
              <span className="text-orange-500 text-3xl">+</span>
              <Die />
            </div>
            {gameStatus === "rolling" && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                Rolling...
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="border border-orange-500/20 rounded-lg p-6">
            {gameStatus === "predict" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono font-bold mb-2">Prediction</h3>
                  <div className="space-y-2">
                    <div
                      className={
                        (prediction === "higher"
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/40 "
                          : "text-gray-300 ") +
                        "border border-orange-500/20 rounded p-3 cursor-pointer"
                      }
                      onClick={() => dispatch(higher())}
                    >
                      Higher than 7
                    </div>
                    <div
                      className={
                        (prediction === "equal"
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/40 "
                          : "text-gray-300 ") +
                        "border border-orange-500/20 rounded p-3 cursor-pointer"
                      }
                      onClick={() => dispatch(equal())}
                    >
                      Exactly 7
                    </div>
                    <div
                      className={
                        (prediction === "lower"
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/40 "
                          : "text-gray-300 ") +
                        "border border-orange-500/20 rounded p-3 cursor-pointer"
                      }
                      onClick={() => dispatch(lower())}
                    >
                      Lower than 7
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono font-bold mb-2">Stake</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {cases.map((item, id) => (
                      <button
                        key={id}
                        className={
                          (item.amount === stake
                            ? "bg-orange-500/10 text-orange-500 border-orange-500/40 "
                            : "text-gray-300 ") +
                          "border border-orange-500/20 rounded px-3 py-2 text-sm"
                        }
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
                        {item.amount} STT
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Custom amount
                  </label>
                  <input
                    placeholder="Enter amount (STT)"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      dispatch(stakeInput(e.target.value));
                    }}
                    type="number"
                    className="w-full bg-transparent border border-orange-500/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500/40"
                  />
                </div>

                <Button
                  content={!rolling ? "Roll Dice" : "Rolling..."}
                  className={
                    (prediction && stake
                      ? "bg-orange-500 text-white hover:bg-orange-600 "
                      : "bg-gray-700 text-gray-400 pointer-events-none ") +
                    "w-full border-0 py-2.5 rounded font-mono text-sm transition-all duration-300"
                  }
                  onClick={() => handleRollDice(prediction, stake)}
                />
                {prediction && stake && (
                  <p className="text-xs text-gray-400">
                    Prediction:{" "}
                    <span className="text-orange-500 capitalize">
                      {prediction}
                    </span>{" "}
                    • Stake: {stake} STT
                  </p>
                )}
              </div>
            )}

            {gameStatus === "rolling" && (
              <div className="text-center text-gray-400">Rolling...</div>
            )}

            {gameStatus === "result" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Target</div>
                    <div className="text-5xl text-orange-500 font-mono">7</div>
                  </div>
                  <div className="h-12 w-px bg-orange-500/20" />
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Result</div>
                    <div className="text-5xl text-orange-500 font-mono">
                      {outcome}
                    </div>
                  </div>
                </div>
                <div className="border border-orange-500/20 rounded p-4 text-center text-sm">
                  {result === "win" ? (
                    <span className="text-green-500">
                      Win • Net reward: {Number(winnings) - Number(houseCharge)}{" "}
                      STT
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Loss • Better luck next time
                    </span>
                  )}
                </div>
                <Button
                  content={result === "win" ? "Roll Again" : "Try Again"}
                  className="w-full bg-orange-500 text-white hover:bg-orange-600 border-0 py-2.5 rounded font-mono text-sm transition-all duration-300"
                  onClick={() => setGameStatus("predict")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
