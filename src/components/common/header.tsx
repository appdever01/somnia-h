"use client";

import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setMenuOpen } from "@/redux/menu/status";
import ConnectButton from "../connectButton";
import {
  useAccount,
  useBalance,
  useReadContract,
  useChainId,
  useSwitchChain,
} from "wagmi";
import Wallet from "../wallet";
import { setUserAccount } from "@/redux/connection/userAccount";
import { BigNumberish, formatUnits, parseUnits } from "ethers";
import { somniaTestnet } from "wagmi/chains";
import { setPageLoading } from "@/redux/loader/pageLoader";
import { toast } from "sonner";
import { userAccountType } from "@/app/page";
import { QueryObserverResult } from "@tanstack/react-query";
import { getTokenBalance } from "@/app/api/contractApi";
import {
  SOMNIA_PUMPAZ_ABI,
  SOMNIA_PUMPAZ_ADDRESS,
} from "@/app/contracts/contract";

export default function Header() {
  const [isPending, startTransition] = useTransition();
  const [isOwner, setIsOwner] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const { menuOpen } = useSelector(
    (state: { menuOpen: { menuOpen: boolean } }) => state.menuOpen
  );
  const menuTl = useRef<gsap.core.Timeline | null>(null);
  const hamburgerTl = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) return;

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
  }, [isConnected]);

  // Check if user is owner
  const { data: contractOwner } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
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

  useEffect(() => {
    if (isPending) {
      dispatch(setPageLoading(true));
    } else {
      dispatch(setPageLoading(false));
    }
  }, [isPending, dispatch]);

  useEffect(() => {
    if (!isConnected || !address) return;

    getPumpazBalance();
    refetchSTTBalance();
  }, [isConnected, address]);

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

  useEffect(() => {
    if ((userAccount && !userAccount.balance) || userAccount.balance === "")
      return;
    if (userAccount && userAccount.address == "") {
      getAddressInfo();
    }
    if (userAccount && userAccount.stt_balance === "") {
      getSTTBalance();
    }
  }, [userAccount, STTBalance]);

  useEffect(() => {
    if (!STTBalance) return;

    setAccount();
  }, [STTBalance]);

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted);
  };

  const getAddressInfo = () => {
    if (!isConnected || !address) return;

    const account = { ...userAccount };

    if (address) account.address = address;
    if (connector && connector.name) account.walletName = connector.name;

    dispatch(setUserAccount(account));
  };

  const getSTTBalance = () => {
    try {
      if (STTBalance) {
        const formattedSTT = formatBigNumber(
          STTBalance.value,
          STTBalance.decimals
        );

        const account = { ...userAccount };
        if (formattedSTT) account.stt_balance = Number(formattedSTT);
        dispatch(setUserAccount(account));
      }
    } catch (error) {
      console.error("Failed to fetch STT balance: ", error);
    }
    return null;
  };

  const getPumpazBalance = async () => {
    try {
      if (address) {
        const result = await getTokenBalance();
        const pump = parseUnits(result, 18);
        const formattedPumpaz = formatBigNumber(pump, 18);

        const account = { ...userAccount };
        if (formattedPumpaz) account.balance = Number(formattedPumpaz);
        dispatch(setUserAccount(account));
      }
    } catch (error) {
      console.error("Failed to fetch Pumpaz balance: ", error);
    }
    return null;
  };

  const setAccount = async () => {
    if (!isConnected || !address) return;
    try {
      toast.message("Getting user account details");
      if (
        (userAccount && !userAccount.stt_balance) ||
        userAccount.stt_balance == 0
      )
        getSTTBalance();
      if ((userAccount && !userAccount.address) || userAccount.address == "")
        getAddressInfo();
    } catch (error) {
      console.error("set user account error: ", error);
    }
  };

  useGSAP(() => {
    menuTl.current = gsap.timeline({ paused: true });
    hamburgerTl.current = gsap.timeline({ paused: true });

    if (menuTl.current != null) {
      menuTl.current
        .to(".menucont", {
          zIndex: 40,
          duration: 0.05,
        })
        .to(
          ".menu",
          {
            scale: 1,
            ease: "back.out",
            duration: 0.3,
          },
          0
        );
    }

    if (hamburgerTl.current != null) {
      hamburgerTl.current
        .to(".hamLines", {
          scaleX: 0,
          transformOrigin: "center",
          duration: 0.14,
          ease: "back.in",
        })
        .to(".line1", {
          rotate: "-45deg",
          translateY: "8px",
          duration: 0.01,
        })
        .to(
          ".line3",
          {
            rotate: "45deg",
            translateY: "-8px",
            duration: 0.01,
          },
          0.14
        )
        .to(".outerLines", {
          scaleX: 2,
          duration: 0.15,
          ease: "back.out",
        });
    }
  }, []);

  const toggleMenu = () => {
    if (!menuOpen && menuTl.current != null && hamburgerTl.current != null) {
      menuTl.current.restart();
      hamburgerTl.current.restart();
      setTimeout(() => {
        dispatch(setMenuOpen(true));
      }, 500);
    } else if (
      menuOpen &&
      menuTl.current != null &&
      hamburgerTl.current != null
    ) {
      menuTl.current.reverse();
      hamburgerTl.current.reverse();
      dispatch(setMenuOpen(false));
    }
  };

  const navigate = (route: string) => {
    if (isConnected) {
      startTransition(() => {
        router.push(`/dashboard/${route}`);
      });
    } else {
      startTransition(() => {
        router.push("/empty-state");
      });
    }
  };

  return (
    <>
      <header className="bg-black/90 backdrop-blur-sm py-4 flex justify-between items-center w-screen fixed top-0 left-0 z-50 border-b border-orange-500/10">
        <div className="container mx-auto max-w-6xl px-4 flex justify-between items-center">
          <div
            className="flex items-center gap-1 hover:cursor-pointer"
            onClick={() => router.push("/")}
          >
            <p className="font-mono text-orange-500 text-sm sm:text-base lg:text-xl font-bold tracking-wider">
              NEXUS GAMING
            </p>
          </div>
          <div
            className="w-6 h-6 flex flex-col items-center justify-around hover:cursor-pointer lg:hidden"
            onClick={toggleMenu}
          >
            <div className="w-5 h-[2px] rounded-sm bg-orange-500 hamLines outerLines line1"></div>
            <div className="w-5 h-[2px] rounded-sm bg-orange-500 hamLines"></div>
            <div className="w-5 h-[2px] rounded-sm bg-orange-500 hamLines outerLines line3"></div>
          </div>
          <nav className="flex items-center gap-6 max-lg:hidden">
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => startTransition(() => router.push("/"))}
            >
              Home
            </div>
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => {
                navigate("dice");
              }}
            >
              Dice game
            </div>
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => {
                navigate("coin");
              }}
            >
              Coin flip
            </div>
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => {
                navigate("staking");
              }}
            >
              Staking
            </div>
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => {
                navigate("farm");
              }}
            >
              Farming
            </div>
            <div
              className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
              onClick={() => {
                navigate("leaderboard");
              }}
            >
              Leaderboard
            </div>
            {isOwner && (
              <div
                className="text-gray-400 hover:text-orange-500 font-medium text-sm transition-colors duration-200 hover:cursor-pointer"
                onClick={() => {
                  navigate("admin");
                }}
              >
                Admin
              </div>
            )}
            {/* <div
          className="w-fit text-white bg-foreground border-foreground font-love hover:cursor-pointer"
          onClick={() => {
            navigate("refer");
          }}
        >
          Invite Friends
        </div> */}
          </nav>
          {!isConnected ? (
            <div className="max-lg:hidden">
              <ConnectButton className="border-white text-white" />
            </div>
          ) : (
            <div className="max-lg:hidden">
              <Wallet />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
