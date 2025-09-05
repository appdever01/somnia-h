"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { setUserAccount } from "@/redux/connection/userAccount";
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from "@/app/contracts/contract";
import { toast } from "sonner";
import { userAccountType } from "@/app/page";
import { somniaTestnet } from "wagmi/chains";

export default function UserRegistration() {
  const { address, isConnected } = useAccount();
  const dispatch = useDispatch();
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount,
  );
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: isUserRegistered, isSuccess: isCheckSuccess, isError: isCheckError, error: checkError } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "isUserRegistered",
    args: [address],
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get user info if registered
  const { data: userInfo, isSuccess: isUserInfoSuccess }: {
    data: undefined | {
      userAddress: string,
      referralCode: string,
      referredBy: string,
      points: number,
      isRegistered: boolean,
      hasVerifiedAddress: boolean,
      validAddress: boolean,
    },
    isSuccess: boolean
  } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "getUserInfo",
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected && isUserRegistered === true,
    },
  });

  // Register user
  const { writeContractAsync: registerUser, isPending, isError: isRegisterError, error: registerError } = useWriteContract();

  // Handle user registration
  const handleRegister = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await registerUser({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: "registerUser",
        args: [""],
        chainId: somniaTestnet.id
      });
      
      toast.success("Registration successful!");
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Check registration status
  useEffect(() => {
    if (isCheckSuccess) {
      console.log("User registration check result:", isUserRegistered);
      setIsRegistered(!!isUserRegistered);
    }
    
    if (isCheckError) {
      console.error("Error checking user registration:", checkError);
    }
  }, [isUserRegistered, isCheckSuccess, isCheckError, checkError]);

  // Update user info if registered
  useEffect(() => {
    if (isUserInfoSuccess && userInfo) {
      
      // You can add additional user info to the Redux store here if needed
      // For example, if userInfo contains referral data, points, etc.
      const updatedUserAccount = { ...userAccount };
      
      // Check if userInfo has points property before updating
      if (userInfo && typeof userInfo === 'object' && 'points' in userInfo && updatedUserAccount.address && updatedUserAccount.address != "") {
        updatedUserAccount.points = userInfo.points;
        dispatch(setUserAccount(updatedUserAccount));
      }
    }
  }, [userInfo, isUserInfoSuccess, userAccount]);

  // Log connection status
  useEffect(() => {
    console.log("Wallet connection status:", { 
      address, 
      isConnected,
      contractAddress: SOMNIA_PUMPAZ_ADDRESS
    });
  }, [address, isConnected]);

  if (!isConnected || !address) {
    return null;
  }

  if (isRegistered === null) {
    return <div className="hidden">Checking registration status...</div>;
  }

  if (isRegistered === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-foreground p-6 rounded-lg max-w-md w-full">
          <h2 className="text-white text-xl font-unkempt mb-4">Welcome to Somnia Pumpaz!</h2>
          <p className="text-white mb-6 font-unkempt">Please register to continue.</p>
          
          {/* <div className="mb-4">
            <label className="block text-white text-sm font-unkempt mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full p-2 bg-background text-white rounded border border-[#09378c] font-unkempt"
              placeholder="Enter referral code"
            />
          </div> */}
          
          <button
            onClick={handleRegister}
            disabled={isLoading || isPending}
            className={`w-full bg-[rgba(39,89,197,0.8)] hover:bg-[rgba(39,89,197,1)] text-white py-2 rounded font-unkempt transition-colors ${
              (isLoading || isPending) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading || isPending ? "Registering..." : "Register"}
          </button>
          
          {isRegisterError && (
            <p className="text-red-500 mt-2 text-sm w-full max-h-14 overflow-auto">
              Error: {registerError?.message || "Registration failed"}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
} 