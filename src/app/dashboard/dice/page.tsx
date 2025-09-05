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
      <main className="w-full flex flex-col gap-4 px-5 lg:px-24 max-sm:mb-12 relative">
        <div className="w-full flex justify-end mb-4">
          <button
            className="font-unkempt text-sm sm:text-base lg:text-lg bg-black text-[#FFD700] px-6 py-2 border border-[#FFD700] hover:bg-[#1a1a1a] transition-colors duration-300 rounded-md hover:cursor-pointer"
            onClick={() => router.push("/dashboard/dice/history")}
          >
            VIEW HISTORY
          </button>
        </div>
        <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-16 mb-8 flex flex-col items-center gap-6">
          <h1 className="font-rubik text-2xl leading-none mb-6 text-center sm:text-3xl lg:text-5xl">
            Dice Game
          </h1>
          <div className="px-2 grid grid-cols-2 w-full sm:w-fit gap-5 sm:gap-20">
            <Die />
            <Die />
          </div>
          <div
            className={
              "rounded-[0.25rem] bg-foreground px-4 py-12 relative w-full mt-8" +
              (gameStatus === "result" ? ` min-h-96` : "")
            }
          >
            <div className="flex flex-col gap-8 items-center">
              {gameStatus === "predict" ? (
                <div className="flex flex-col gap-8 items-center">
                  <p className="font-love text-white text-center mb-4 sm:text-2xl lg:text-4xl">
                    Choose Case
                  </p>
                  <div className="flex gap-6">
                    <div className="grid grid-cols-1 gap-1 w-1/3">
                      <div
                        className={
                          "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer" +
                          (prediction === "higher" ? " !bg-[rgba(39,89,197,1)]" : "")
                        }
                        onClick={() => dispatch(higher())}
                      >
                        <p className="font-unkempt text-white text-xs sm:text-base lg:text-xl">
                          Higher
                        </p>
                      </div>
                      <div
                        className={
                          "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer" +
                          (prediction === "equal" ? " !bg-[rgba(39,89,197,1)]" : "")
                        }
                        onClick={() => dispatch(equal())}
                      >
                        <p className="font-unkempt text-white text-xs sm:text-base lg:text-xl">
                          Equal
                        </p>
                      </div>
                      <div
                        className={
                          "bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 p-4 rounded-lg text-center border border-[#09378c] hover:cursor-pointer" +
                          (prediction === "lower" ? " !bg-[rgba(39,89,197,1)]" : "")
                        }
                        onClick={() => dispatch(lower())}
                      >
                        <p className="font-unkempt text-white text-xs sm:text-base lg:text-xl">
                          Lower
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-1 w-full">
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
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      placeholder="Choose amount"
                      value={value}
                      onChange={(e) => {
                        setValue(e.target.value);
                        dispatch(stakeInput(e.target.value));
                      }}
                      type="number"
                      className="rounded-[0.25rem] border focus:border-2 bg-foreground p-4 font-unkempt text-[10px] sm:text-sm lg:text-xl text-white leading-3 appearance-none focus:outline-none border-[#09378c] no-spinner"
                    />
                    <Button
                      content={!rolling ? "Roll" : "Rolling..."}
                      className={
                        "bg-background w-full border-background" +
                        (prediction && stake
                          ? " opacity-100 hover:cursor-pointer"
                          : " opacity-50 pointer-events-none hover:cursor-not-allowed") +
                        (rolling ? " animate-pulse pointer-events-none" : "")
                      }
                      onClick={() => handleRollDice(prediction, stake)}
                    />
                  </div>
                </div>
              ) : gameStatus === "rolling" ? (
                <p className="font-love text-white mb-8 sm:text-2xl lg:text-4xl">
                  Rolling...
                </p>
              ) : null}
            </div>
            <div
              className={
                "flex flex-col max-sm:items-center sm:flex-row sm:justify-center sm:gap-16 lg:gap-40 items-center gap-[18px] absolute top-0 py-12 left-0 z-10 bg-foreground w-full rounded-[0.25rem]" +
                (gameStatus === "result"
                  ? " "
                  : " opacity-0 pointer-events-none")
              }
            >
              <div className="flex items-center gap-4 sm:flex-col sm:gap-9 lg:gap-14">
                <p className="font-love text-background text-5xl sm:text-8xl lg:text-[9.375rem]">
                  7
                </p>
                <div className="w-7 h-[2px] bg-white sm:hidden"></div>
                <p className="font-love text-white text-5xl sm:text-8xl lg:text-[9.375rem]">
                  {outcome}
                </p>
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
                        House charge:{" "}
                        <span className="text-background">-{houseCharge}</span>
                      </p>
                      <p className="font-unkempt text-white text-sm sm:text-lg lg:text-xl">
                        Your reward will be added to your wallet
                      </p>
                    </div>
                  ) : null}
                  <Button
                    content={"Roll dice again"}
                    className="bg-white border-white"
                    onClick={() => setGameStatus("predict")}
                  />
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
