"use client"

import Button from "./button";
import { useAccount, useWriteContract, useChainId, useSwitchChain } from "wagmi";
import { NEXUS_GAMING_ABI, NEXUS_GAMING_ADDRESS } from "@/app/contracts/contract";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setMintTime } from "@/redux/mint/mint";
import { useDispatch, useSelector } from "react-redux";
// import { QueryObserverResult } from "@tanstack/react-query";
import { getTokenBalance, getClaimHistory } from "@/app/api/contractApi";
import { userAccountType } from "@/app/page";
import { BigNumberish, formatUnits, parseUnits } from 'ethers';
import { setUserAccount } from "@/redux/connection/userAccount";
import { trackEvent } from "@/utils/analytics";
import { somniaTestnet } from "wagmi/chains";

export default function Mint(props: {
  bg: string;
  text: string;
  border: string;
  width?: string;
  className?: string;
}) {
  const [mintState, setMintState] = useState<"mint" | "minting" | "minted">("mint");
  const [canClaim, setCanClaim] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>();
  const { mintTime } = useSelector(
    (state: { mintTime: { mintTime: number } }) => state.mintTime,
  );
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
  );
  const { address, isConnected } = useAccount();
  const dispatch = useDispatch();
  const { writeContractAsync: claimTokens } = useWriteContract();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) return;

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
  }, [isConnected])

  const handleGetClaimHistory = async () => {
    try {
      const result = await getClaimHistory();
      if (result.nextClaimTime) {
        setNextClaimTime(result.nextClaimTime)
      }
    } catch (error) {
      console.error("An error occured: ", error);
      toast.error("Failed to get next claim time");
    }
  }


  // useEffect(() => {
  //   handleClaimStatus();
  // }, [isConnected, address, isClaimStatusSuccess, claimStatus]);

  useEffect(() => {
    handleGetClaimHistory();
  }, [isConnected]);

  useEffect(() => {
    if (!nextClaimTime) return;

    const nextClaimTimeStamp = nextClaimTime.getTime();
    const nextClaimTImeStampInSeconds = Number(nextClaimTimeStamp) / 1000;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const timeRemaining = nextClaimTImeStampInSeconds - currentTimeInSeconds;

    dispatch(setMintTime(Number(nextClaimTImeStampInSeconds)));

    if (timeRemaining > 0) {
      setCanClaim(false);
      setTimeLeft(timeRemaining);
      setMintState("minted");
    } else {
      setCanClaim(true);
      setTimeLeft(0);
      setMintState("mint");
    }
  }, [nextClaimTime, dispatch]);

  useEffect(() => {
    if (mintTime > 0) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const timeRemaining = mintTime - currentTimeInSeconds;

      if (timeRemaining > 0) {
        setTimeLeft(timeRemaining);
        setMintState("minted");
        setCanClaim(false);
      } else {
        setTimeLeft(0);
        setMintState("mint");
        setCanClaim(true);
      }
    }
  }, [mintTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanClaim(true);
      setMintState("mint");
      return;
    }

    const interval = setInterval(() => {
      const newTimeLeft = timeLeft - 1;
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        setCanClaim(true);
        setMintState("mint");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  };

  const getNexusBalance = async () => {
    try {
      if (address) {
        const result = await getTokenBalance();
        const pump = parseUnits(result, 18);
        const formattedNexus = formatBigNumber(pump, 18);

        const account = { ...userAccount };
        if (formattedNexus) account.balance = Number(formattedNexus);
        dispatch(setUserAccount(account))
      }
    } catch (error) {
      console.error("Failed to fetch NEXUS balance: ", error);
    }
    return null;
  }

  const handleClaimToken = async () => {
    if (!address || !canClaim) return;

    setMintState("minting");

    try {
      trackEvent({
        action: 'claim_token_attempt',
        category: 'Mint',
        label: "Claim Token",
        value: 1000 * 100,
      });
    } catch (error) {
      console.error("An error occured while tracking claim token attempt: ", error)
    }

    try {
      await claimTokens({
        address: NEXUS_GAMING_ADDRESS as `0x${string}`,
        abi: NEXUS_GAMING_ABI,
        functionName: "claimTokens",
        args: [],
        chainId: somniaTestnet.id,
      });

      try {
        trackEvent({
          action: 'claim_token_success',
          category: 'Mint',
          label: "Claim Token",
          value: 1000 * 100,
        });
      } catch (error) {
        console.error("An error occured while tracking claim token success: ", error)
      }

      toast.success("Claim Successful!");
      setMintState("minted");
      handleGetClaimHistory();
      getNexusBalance();
    } catch (error) {
      console.error("Claim failed:", error);
      toast.error("Claim failed. Please try again.");
      setMintState("mint");
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${secs}s`;
  };




  if (mintState === "minted" || !canClaim) {
    return (
      <Button
        content={`Claim again in ${formatTime(timeLeft)}`}
        className={`bg-${props.bg} text-${props.text} border-${props.border} w-${props.width} ${props.className} opacity-70 cursor-not-allowed`}
        onClick={() => {}}
      />
    );
  }

  return (
    <Button
      content={mintState === "minting" ? "Claiming..." : "Claim NEXUS"}
      className={`bg-${props.bg} text-${props.text} border-${props.border} w-${props.width} ${props.className} ${mintState === "minting" ? "animate-pulse pointer-events-none" : ""}`}
      onClick={handleClaimToken}
    />
  );
}