"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from "@/app/contracts/contract";
import { LoadingSpinner } from "@/components/loader";
import AdminStats from "@/components/adminStats";
import AdminFunctions from "@/components/adminFunctions";
import AdminUsers from "@/components/adminUsers";
import AdminStakingPlans from "@/components/adminStakingPlans";
import { somniaTestnet } from "wagmi/chains";

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    if (!isConnected) {
      router.replace("/empty-state");
      return;
    }

    if (contractOwner && address) {
      const ownerAddress = contractOwner as string;
      const isUserOwner = ownerAddress.toLowerCase() === address.toLowerCase();
      
      if (!isUserOwner) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    }
  }, [contractOwner, address, isConnected, router]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col gap-8 px-5 lg:px-24 py-8 mb-12">
      <h1 className="font-rubik text-2xl leading-none text-white mb-6 text-center sm:text-3xl lg:text-5xl">
        Admin Panel
      </h1>
      
      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-8">
        <h2 className="font-rubik text-xl text-white mb-6">Platform Statistics</h2>
        <AdminStats />
      </div>

      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-8">
        <h2 className="font-rubik text-xl text-white mb-6">Admin Functions</h2>
        <AdminFunctions />
      </div>
      
      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-8">
        <h2 className="font-rubik text-xl text-white mb-6">User Management</h2>
        <AdminUsers />
      </div>
      
      <div className="bg-[#FFFFFF33] rounded-lg w-full p-4 sm:bg-[#12121233] lg:p-8">
        <h2 className="font-rubik text-xl text-white mb-6">Staking Plans</h2>
        <AdminStakingPlans />
      </div>
    </main>
  );
} 