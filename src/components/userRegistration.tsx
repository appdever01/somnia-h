"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useDispatch, useSelector } from "react-redux";
import { setUserAccount } from "@/redux/connection/userAccount";
import {
  NEXUS_GAMING_ABI,
  NEXUS_GAMING_ADDRESS,
} from "@/app/contracts/contract";
import { toast } from "sonner";
import { userAccountType } from "@/app/page";
import { somniaTestnet } from "wagmi/chains";

export default function UserRegistration() {
  const { address, isConnected } = useAccount();
  const dispatch = useDispatch();
  const { userAccount } = useSelector(
    (state: { userAccount: { userAccount: userAccountType } }) =>
      state.userAccount
  );
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: isUserRegistered,
    isSuccess: isCheckSuccess,
    isError: isCheckError,
    error: checkError,
  } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "isUserRegistered",
    args: [address],
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Get user info if registered
  const {
    data: userInfo,
    isSuccess: isUserInfoSuccess,
  }: {
    data:
      | undefined
      | {
          userAddress: string;
          referralCode: string;
          referredBy: string;
          points: number;
          isRegistered: boolean;
          hasVerifiedAddress: boolean;
          validAddress: boolean;
        };
    isSuccess: boolean;
  } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getUserInfo",
    chainId: somniaTestnet.id,
    query: {
      enabled: !!address && isConnected && isUserRegistered === true,
    },
  });

  // Register user
  const {
    writeContractAsync: registerUser,
    isPending,
    isError: isRegisterError,
    error: registerError,
  } = useWriteContract();

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
        chainId: somniaTestnet.id,
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
      if (
        userInfo &&
        typeof userInfo === "object" &&
        "points" in userInfo &&
        updatedUserAccount.address &&
        updatedUserAccount.address != ""
      ) {
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
      contractAddress: NEXUS_GAMING_ADDRESS,
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
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-black border border-orange-500/20 rounded-lg max-w-md w-full p-8">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-block text-orange-500/60 font-mono text-sm px-3 py-1 rounded-full border border-orange-500/20">
                One-Time Registration
              </div>
              <h2 className="text-2xl font-mono font-bold text-white">
                Welcome to Nexus!
              </h2>
              <p className="text-gray-400 font-mono text-sm">
                Create your account to start playing
              </p>
            </div>

            <div className="bg-black/50 border border-orange-500/10 rounded p-4 flex items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-orange-500"
              >
                <path d="M21 12v-2a2 2 0 0 0-2-2h-4l-3-3-3 3H5a2 2 0 0 0-2 2v2" />
                <path d="M7 12v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8" />
                <path d="M12 12v4" />
                <path d="M12 2v4" />
              </svg>
              <span className="text-gray-400 font-mono text-sm">
                Secure blockchain registration required
              </span>
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading || isPending}
              className={`w-full bg-orange-500 hover:bg-orange-600 text-black px-6 py-2.5 rounded font-mono text-sm transition-colors duration-200 flex items-center justify-center gap-2 ${
                isLoading || isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading || isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {isRegisterError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-left">
                <p className="text-red-500 font-mono text-sm">
                  {registerError?.message ||
                    "Registration failed. Please try again."}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 font-mono">
              By registering, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
