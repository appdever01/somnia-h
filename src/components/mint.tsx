"use client"

import Button from "./button";
import { useAccount, useWriteContract, useChainId, useSwitchChain } from "wagmi";
import { NEXUS_GAMING_ABI, NEXUS_GAMING_ABI } from "@/app/contracts/contract";
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
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [socialTasksCompleted, setSocialTasksCompleted] = useState<boolean>(false);
  const [checkingTasks, setCheckingTasks] = useState<boolean>(false);
  const [showTaskPopup, setShowTaskPopup] = useState<boolean>(false);
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
  const router = useRouter();
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

  // const { data: claimStatus, refetch: refetchClaimStatus, isSuccess: isClaimStatusSuccess }: {
  //   data: undefined | [boolean, number],
  //   refetch: () => Promise<QueryObserverResult<[boolean, number] | undefined, Error>>,
  //   isSuccess: boolean,
  // } = useReadContract({
  //   address: NEXUS_GAMING_ADDRESS as `0x${string}`,
  //   abi: NEXUS_GAMING_ABI,
  //   functionName: "getClaimStatus",
  //   args: [address],
  //   chainId: somniaTestnet.id,
  //   query: {
  //     enabled: !!address && isConnected,
  //   },
  // });

  const checkSocialTasks = async () => {
    if (!address) return;
    setCheckingTasks(true);
    
    try {
      const res = await fetch('/api/tasks/can-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }),
      });
      
      const data = await res.json();
      if (data.data.hasClaimed === true) {
        setSocialTasksCompleted(true);
      } else {
        // setShowTaskPopup(true);
        setSocialTasksCompleted(false);
      }
    } catch (err) {
      console.error("Error checking social tasks status:", err);
      setSocialTasksCompleted(false);
    } finally {
      setCheckingTasks(false);
    }
  };

  // Close popup
  const closePopup = () => {
    setShowTaskPopup(false);
  };

  // Navigate to tasks page
  const goToTasks = () => {
    router.push("/dashboard/tasks");
    setShowTaskPopup(false);
  };

  // const handleClaimStatus = async () => {
  //   await refetchClaimStatus();

  //   if (isClaimStatusSuccess && claimStatus) {
  //     setCanClaim(claimStatus[0]);
  //     dispatch(setMintTime(Number(claimStatus[1])));
  //   }
  // }

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

  useEffect(() => {
    if (isConnected && address) {
      checkSocialTasks();
    }
  }, [isConnected, address]);

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
    const modifiedTimeStamp = nextClaimTImeStampInSeconds + 32400;

    dispatch(setMintTime(Number(modifiedTimeStamp)));

    if (modifiedTimeStamp > 0) {
      setCanClaim(false);
    } else if (modifiedTimeStamp <= 0) {
      setCanClaim(true);
    }
  }, [nextClaimTime]);

  useEffect(() => {
    if (mintTime > 0) {
      setTimeLeft(mintTime);
      setMintState("minted");
    }
  }, [mintTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  };

  const getPumpazBalance = async () => {
    try {
      if (address) {
        const result = await getTokenBalance();
        const pump = parseUnits(result, 18);
        const formattedPumpaz = formatBigNumber(pump, 18);

        const account = { ...userAccount };
        if (formattedPumpaz) account.balance = Number(formattedPumpaz);
        dispatch(setUserAccount(account))
      }
    } catch (error) {
      console.error("Failed to fetch Pumpaz balance: ", error);
    }
    return null;
  }

  const handleClaimToken = async () => {
    if (!address || !canClaim) return;
    
    if (!socialTasksCompleted) {
      toast.info("Please complete social tasks first");
      router.push("/dashboard/tasks");
      return;
    }

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
      getPumpazBalance();
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

  const navigateToTasks = () => {
    router.push("/dashboard/tasks");
  };

  // Render the popup if showTaskPopup is true
  const renderTaskPopup = () => {
    if (!showTaskPopup) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md p-8 mx-4 overflow-hidden rounded-xl bg-[#9c1cb6] border-2 border-[#d434ff] shadow-xl animate-fadeIn shadow-[#d434ff]/20">
          {/* Close button */}
          <button 
            onClick={closePopup} 
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* Popup content */}
          <div className="flex flex-col items-center text-center">
            {/* Icon/Image */}
            <div className="relative w-24 h-24 mb-6">
              <Image
                src="/images/pumpaz.webp"
                alt="Pumpaz"
                width={96}
                height={96}
                className="rounded-full border-2 border-[#d434ff] shadow-lg shadow-[#d434ff]/30"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#d434ff] rounded-full flex items-center justify-center text-white font-bold">
                +
              </div>
            </div>
            
            {/* Title */}
            <h2 className="font-love text-white text-2xl sm:text-3xl mb-3">Complete Tasks</h2>
            
            {/* Description */}
            <p className="font-unkempt text-white/90 mb-6 text-sm sm:text-base">
              Follow us on X and join our Discord to earn 500 Points and unlock $PUMPAZ token claims.
            </p>
            
            {/* Rewards display */}
            <div className="flex items-center justify-center gap-6 mb-6 w-full">
              <div className="flex flex-col items-center gap-2 bg-[#8a19a0] p-4 rounded-lg w-1/2 border border-[#d434ff]">
                <div className="w-10 h-10 rounded-full bg-[#d434ff] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 19V5"></path>
                    <path d="M10 19V9"></path>
                    <path d="M14 19V13"></path>
                    <path d="M18 19V17"></path>
                  </svg>
                </div>
                <span className="text-white text-sm font-love">500 Points</span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-[#8a19a0] p-4 rounded-lg w-1/2 border border-[#d434ff]">
                <div className="w-10 h-10 rounded-full bg-[#d434ff] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <span className="text-white text-sm font-love">Daily Claim</span>
              </div>
            </div>
            
            {/* Social links */}
            <div className="flex items-center justify-center gap-4 mb-6 w-full">
              <a 
                href="https://twitter.com/SomniaPumpaz" 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 bg-black hover:bg-black/80 p-3 rounded-lg w-1/2 transition-all duration-300 border border-[#d434ff]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="text-white text-sm font-love">Follow X</span>
              </a>
              <a 
                href="https://discord.gg/somniapumpaz" 
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 bg-[#8a19a0] hover:bg-[#7d1792] p-3 rounded-lg w-1/2 transition-all duration-300 border border-[#d434ff]"
              >
                <svg width="20" height="20" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#ffffff"/>
                </svg>
                <span className="text-white text-sm font-love">Join Discord</span>
              </a>
            </div>
            
            {/* Action button */}
            <button 
              onClick={goToTasks}
              className="w-full py-4 px-6 bg-[#d434ff] hover:bg-[#e54aff] text-white rounded-lg font-love transition-all duration-300 border border-white/30 text-lg"
            >
              Complete Tasks Now
            </button>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-[#d434ff]/20 blur-xl"></div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-[#d434ff]/20 blur-xl"></div>
        </div>
      </div>
    );
  };

  if (!socialTasksCompleted && mintState !== "minting") {
    return (
      <>
        {renderTaskPopup()}
        <Button 
          content={checkingTasks ? "Checking Tasks..." : "Complete Tasks to Claim"} 
          className={`bg-${props.bg} text-${props.text} border-${props.border} w-${props.width} ${props.className} hover:bg-blue-600 ${checkingTasks ? "animate-pulse" : ""}`} 
          onClick={checkingTasks ? () => {} : navigateToTasks} 
        />
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </>
    );
  }

  if (mintState === "minted") {
    return (
      <>
        {renderTaskPopup()}
        <Button 
          content={checkingTasks ? "Checking Tasks..." : `Claim again in ${formatTime(timeLeft)}`} 
          className={`bg-${props.bg} text-${props.text} border-${props.border} w-${props.width} ${props.className} opacity-70 cursor-not-allowed ${checkingTasks ? "animate-pulse" : ""}`} 
          onClick={() => {}} 
        />
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      {renderTaskPopup()}
      <Button 
        content={mintState === "minting" ? "Claiming..." : checkingTasks ? "Checking Tasks..." : "Claim PUMPAZ"} 
        className={`bg-${props.bg} text-${props.text} border-${props.border} w-${props.width} ${props.className} ${(mintState === "minting" || checkingTasks) ? "animate-pulse pointer-events-none" : ""}`} 
        onClick={handleClaimToken} 
      />
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}