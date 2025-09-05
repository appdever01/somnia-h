import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from '@/app/contracts/contract';
import { LoadingSpinner } from './loader';
import { toast } from 'sonner';
import { somniaTestnet } from 'wagmi/chains';

interface StakingPlan {
  id: number;
  stakingDays: number;
  apy: number;
  active: boolean;
}

interface ContractStakingPlan {
  id: bigint;
  stakingDays: bigint;
  apy: bigint;
  active: boolean;
}

export default function AdminStakingPlans() {
  const [loading, setLoading] = useState(true);
  const [stakingPlans, setStakingPlans] = useState<StakingPlan[]>([]);
  const [stakingDays, setStakingDays] = useState('');
  const [apy, setApy] = useState('');

  // Contract write hooks
  const { data: txHash, isPending, writeContract } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Get all staking plans
  const { data: allPlans, refetch: refetchPlans } = useReadContract({
    address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
    abi: SOMNIA_PUMPAZ_ABI,
    functionName: "getAllStakingPlans",
    chainId: somniaTestnet.id,
  });

  useEffect(() => {
    if (allPlans && Array.isArray(allPlans)) {
      const plans = allPlans.map((plan: ContractStakingPlan) => ({
        id: Number(plan.id),
        stakingDays: Number(plan.stakingDays),
        apy: Number(plan.apy),
        active: plan.active
      }));
      setStakingPlans(plans);
      setLoading(false);
    }
  }, [allPlans]);

  useEffect(() => {
    if (isConfirmed) {
      refetchPlans();
    }
  }, [isConfirmed, refetchPlans]);

  // Handle add staking plan
  const handleAddStakingPlan = async () => {
    if (!stakingDays || !apy) {
      toast.error('Please enter staking days and APY');
      return;
    }
    
    try {
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'addStakingPlan',
        args: [BigInt(stakingDays), BigInt(apy)],
      });
      toast.success('Adding new staking plan');
      setStakingDays('');
      setApy('');
    } catch (error) {
      console.error('Error adding staking plan:', error);
      toast.error('Failed to add staking plan');
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-8">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF22] rounded-lg p-4">
        <h3 className="font-rubik text-lg text-white mb-4">Current Staking Plans</h3>
        
        {stakingPlans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#FFFFFF44]">
                  <th className="text-left py-2 font-unkempt">ID</th>
                  <th className="text-left py-2 font-unkempt">Days</th>
                  <th className="text-left py-2 font-unkempt">APY (%)</th>
                  <th className="text-left py-2 font-unkempt">Status</th>
                </tr>
              </thead>
              <tbody>
                {stakingPlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-[#FFFFFF22]">
                    <td className="py-2 font-unkempt">{plan.id}</td>
                    <td className="py-2 font-unkempt">{plan.stakingDays}</td>
                    <td className="py-2 font-unkempt">{plan.apy}</td>
                    <td className="py-2 font-unkempt">
                      <span className={`px-2 py-1 rounded-full text-xs ${plan.active ? 'bg-green-900' : 'bg-red-900'}`}>
                        {plan.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-unkempt text-white">No staking plans found</p>
        )}
      </div>
      
      <div className="bg-[#FFFFFF22] rounded-lg p-4 mt-4">
        <h3 className="font-rubik text-lg text-white mb-4">Add New Staking Plan</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-unkempt text-white mb-2">Staking Days</label>
            <input
              type="number"
              value={stakingDays}
              onChange={(e) => setStakingDays(e.target.value)}
              className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
              placeholder="30"
            />
          </div>
          
          <div>
            <label className="block font-unkempt text-white mb-2">APY (%)</label>
            <input
              type="number"
              value={apy}
              onChange={(e) => setApy(e.target.value)}
              className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
              placeholder="10"
            />
          </div>
        </div>
        
        <button
          onClick={handleAddStakingPlan}
          disabled={isPending || isConfirming || !stakingDays || !apy}
          className={`bg-[#09378c] text-white py-2 px-4 rounded-md font-unkempt mt-4 w-full ${
            isPending || isConfirming || !stakingDays || !apy
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-[#0a4aad] transition-colors'
          }`}
        >
          {isPending || isConfirming ? 'Processing...' : 'Add Staking Plan'}
        </button>
      </div>
    </div>
  );
} 