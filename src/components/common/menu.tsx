"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import Button from "../button";
import ConnectButton from "../connectButton";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setMenuOpen } from "@/redux/menu/status";
// import Mint from "../mint";
import { setUserAccount } from "@/redux/connection/userAccount";
import { userAccountType } from "@/app/page";
import {
  NEXUS_GAMING_ABI,
  NEXUS_GAMING_ADDRESS,
} from "@/app/contracts/contract";
import { somniaTestnet } from "wagmi/chains";

export default function Menu() {
  const [opened, setOpened] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [, startTransition] = useTransition();
  const { menuOpen } = useSelector(
    (state: { menuOpen: { menuOpen: boolean } }) => state.menuOpen
  );
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const dropdownTl = useRef<gsap.core.Timeline | null>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const hamburgerTl = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Check if user is owner
  const { data: contractOwner } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "owner",
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  useEffect(() => {
    if (contractOwner && address) {
      const ownerAddress = contractOwner as string;
      setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());
    }
  }, [contractOwner, address]);

  useGSAP(() => {
    menuTl.current = gsap.timeline({ paused: true });
    hamburgerTl.current = gsap.timeline({ paused: true });

    if (menuTl.current != null) {
      menuTl.current
        .to(".menu", {
          scale: 0,
          ease: "back.in",
          duration: 0.3,
        })
        .to(".menucont", {
          zIndex: -10,
          duration: 0.05,
        });
    }

    if (hamburgerTl.current != null) {
      hamburgerTl.current
        .to(".outerLines", {
          scaleX: 0,
          transformOrigin: "center",
          duration: 0.14,
          ease: "back.in",
        })
        .to(".line1", {
          rotate: "0deg",
          translateY: "0",
          duration: 0.01,
        })
        .to(
          ".line3",
          {
            rotate: "0deg",
            translateY: "0",
            duration: 0.01,
          },
          0.14
        )
        .to(".hamLines", {
          scaleX: 1,
          duration: 0.15,
          ease: "back.out",
        });
    }
  }, []);

  useGSAP(() => {
    dropdownTl.current = gsap.timeline({ paused: true });
    if (dropdownTl.current != null) {
      dropdownTl.current
        .to(".dropdown", {
          scale: 1,
          ease: "back.out",
          duration: 0.3,
        })
        .to(
          ".dropdown-arrow",
          {
            scale: 0,
            ease: "back.in",
            duration: 0.14,
          },
          0
        )
        .to(
          ".dropdown-arrow",
          {
            rotate: "180deg",
            duration: 0.01,
          },
          0.14
        )
        .to(
          ".dropdown-arrow",
          {
            scale: 1,
            ease: "back.out",
            duration: 0.15,
          },
          0.14
        );
    }
  }, [menuOpen]);

  const toggleDropdown = () => {
    if (!opened && dropdownTl.current != null) {
      dropdownTl.current.restart();
      setOpened(true);
    } else if (opened && dropdownTl.current != null) {
      dropdownTl.current.reverse();
      setOpened(false);
    }
  };

  const toggleMenu = () => {
    if (menuOpen && menuTl.current != null && hamburgerTl.current != null) {
      menuTl.current.restart();
      hamburgerTl.current.restart();
      dispatch(setMenuOpen(false));
    }
  };

  const navigate = (route: string) => {
    if (userAccount.address) {
      startTransition(() => {
        router.push(`/dashboard/${route}`);
      });
    } else {
      startTransition(() => {
        router.push("/empty-state");
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      dispatch(
        setUserAccount({
          address: "",
          balance: "",
          stt_balance: "",
          walletName: "",
        })
      );
      toggleDropdown();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-background flex items-center justify-center fixed top-0 left-0 mt-10 mb-10 -z-10 menucont">
      <div className="rounded-b-lg w-[335px] sm:w-[30rem] bg-[#FFFFFF33] scale-0 origin-center mt-16 menu">
        {!isConnected ? (
          <div className="bg-foreground flex items-center justify-center w-full h-24 rounded-t-lg relative">
            <ConnectButton className="border-white text-white" />
          </div>
        ) : (
          <div className="bg-foreground flex items-center justify-between w-full p-5 rounded-t-lg">
            <div className="flex items-center gap-1 justify-between">
              <Image
                src="/images/nexus.webp"
                alt="logo"
                width={36}
                height={36}
              />
              <div className="bg-[#202020] p-2 rounded-lg gap-1 flex items-center relative">
                <p className="font-unkempt text-xs w-12 truncate text-white">
                  {userAccount.address ? userAccount.address : ""}
                </p>
                <Image
                  src="/icons/arrow-down.svg"
                  alt="dropdown"
                  width={24}
                  height={24}
                  className="dropdown-arrow origin-center"
                  onClick={toggleDropdown}
                />
                <div
                  className="absolute -right-10 -bottom-6 bg-white text-xs font-unkempt p-2 rounded-lg dropdown scale-0 origin-center hover:cursor-pointer"
                  onClick={handleDisconnect}
                >
                  Disconnect wallet
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center w-20 gap-1">
              <p className="text-center font-love text-white leading-4">
                My Balance
              </p>
              <p className="font-unkempt text-xs text-white text-nowrap">
                {userAccount.balance
                  ? Number(userAccount.balance).toFixed(4)
                  : 0}{" "}
                NEXUS
              </p>
              <p className="font-unkempt text-xs text-white text-nowrap">
                {userAccount.stt_balance
                  ? Number(userAccount.stt_balance).toFixed(4)
                  : 0}{" "}
                STT
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full px-8 py-10 overflow-y-scroll max-h-[30rem]">
          {/* <Mint bg="" text="foreground" border="" className="bg-[rgba(39,89,197,0.13)] hover:bg-[rgba(39,89,197,0.33)] duration-300 border-bluetheme text-nowrap" /> */}
          <Button
            content="Home"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              startTransition(() => router.push("/"));
              toggleMenu();
            }}
          />
          <Button
            content="Tasks"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("tasks");
              toggleMenu();
            }}
          />
          <Button
            content="Dice game"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("dice");
              toggleMenu();
            }}
          />
          <Button
            content="Coin flip"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("coin");
              toggleMenu();
            }}
          />
          <Button
            content="Staking"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("staking");
              toggleMenu();
            }}
          />
          <Button
            content="Leaderboard"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("leaderboard");
              toggleMenu();
            }}
          />
          <a
            href="https://somnianexus.gitbook.io/somnianexus-docs"
            target="_blank"
          >
            <Button
              content="Docs"
              className="w-full text-white bg-foreground border-foreground"
              onClick={() => {
                toggleMenu();
              }}
            />
          </a>
          {isOwner && (
            <Button
              content="Admin Panel"
              className="w-full text-white bg-foreground border-foreground"
              onClick={() => {
                navigate("admin");
                toggleMenu();
              }}
            />
          )}
          {/* <Button
            content="Invite Friends"
            className="w-full text-white bg-foreground border-foreground"
            onClick={() => {
              navigate("refer");
              toggleMenu();
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}
