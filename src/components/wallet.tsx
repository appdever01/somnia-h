"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDispatch, useSelector } from "react-redux";
import { setUserAccount } from "@/redux/connection/userAccount";
import { userAccountType } from "@/app/page";
import { useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { somniaTestnet } from "wagmi/chains";
import { toast } from "sonner"; 

export default function Wallet() {
  const [opened, setOpened] = useState(false);
  const dropdownTl = useRef<gsap.core.Timeline | null>(null);
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
  );
  const dispatch = useDispatch();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  const isWrongNetwork = chainId !== somniaTestnet.id;

  useGSAP(() => {
    dropdownTl.current = gsap.timeline({ paused: true });
    if (dropdownTl.current != null) {
      dropdownTl.current
        .to(".dropdown-wallet", {
          scale: 1,
          ease: "back.out",
          duration: 0.3,
        })
        .to(
          ".dropdown-arrow-wallet",
          {
            scale: 0,
            ease: "back.in",
            duration: 0.14,
          },
          0,
        )
        .to(
          ".dropdown-arrow-wallet",
          {
            rotate: "180deg",
            duration: 0.01,
          },
          0.14,
        )
        .to(
          ".dropdown-arrow-wallet",
          {
            scale: 1,
            ease: "back.out",
            duration: 0.15,
          },
          0.14,
        );
    }
  }, [userAccount]);

  const toggleDropdown = () => {
    if (!opened && dropdownTl.current != null) {
      dropdownTl.current.restart();
      setOpened(true);
    } else if (opened && dropdownTl.current != null) {
      dropdownTl.current.reverse();
      setOpened(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      dispatch(setUserAccount({
        address: "",
        balance: "",
        stt_balance: "",
        walletName: "",
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      if (switchChain) {
       switchChain({ chainId: somniaTestnet.id });
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network. Please try again.");
    }
  };

  const truncatedAddress = userAccount.address ? 
    `${userAccount.address.slice(0, 4)}...${userAccount.address.slice(-4)}` : 
    "";

  if (!userAccount.address) {
    return null;
  }

  return (
    <div className="bg-foreground p-4 rounded-2xl flex items-center gap-4 shad max-lg:mt-40 w-fit lg:border-2 border-white">
      {isWrongNetwork ? (
        <button
          onClick={handleSwitchNetwork}
          className="text-red-500 font-unkempt text-xs bg-red-100 px-2 py-1 rounded-lg hover:bg-red-200"
        >
          Switch to Somnia Testnet
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-unkempt text-xs text-white">
              {userAccount.stt_balance ? Number(userAccount.stt_balance).toFixed(4) : '0'} STT
            </p>
            <p className="font-unkempt text-xs text-white">
              {userAccount.balance ? Number(userAccount.balance).toFixed(4) : '0'} PUMPAZ
            </p>
          </div>
          <div className="flex items-center gap-1 relative">
            <Image src="/icons/wallet.svg" alt="wallet" width={24} height={24} />
            <span
              className="font-unkempt text-xs text-white"
              title={userAccount.address ? userAccount.address : ""}
            >
              {truncatedAddress}
            </span>
            <Image
              src="/icons/arrow-down.svg"
              alt="dropdown"
              width={24}
              height={24}
              className="dropdown-arrow-wallet origin-center hover:cursor-pointer"
              onClick={toggleDropdown}
            />
            <div
              className="absolute -right-4 -bottom-10 bg-white text-xs font-unkempt p-2 rounded-lg dropdown-wallet scale-0 origin-center hover:cursor-pointer"
              onClick={handleDisconnect}
            >
              Disconnect wallet
            </div>
          </div>
        </>
      )}
    </div>
  );
}
