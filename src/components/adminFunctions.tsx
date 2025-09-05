import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SOMNIA_PUMPAZ_ABI, SOMNIA_PUMPAZ_ADDRESS } from '@/app/contracts/contract';
import { toast } from 'sonner';
import { parseUnits } from 'ethers';

export default function AdminFunctions() {
  // State for form inputs
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  // Contract write hooks
  const { data: txHash, isPending, writeContract } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess } = 
    useWaitForTransactionReceipt({
      hash: txHash,
    });
    
  // Track successful transactions to avoid duplicate toasts
  const [lastSuccessTx, setLastSuccessTx] = useState<string | null>(null);
  
  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isSuccess && txHash && lastSuccessTx !== txHash) {
      // Track this transaction to avoid duplicate toasts
      setLastSuccessTx(txHash);
      
      // Show success toast
      toast.success('Transaction completed successfully');
    }
  }, [isSuccess, txHash, lastSuccessTx]);
    

    
  // Handle ownership transfer
  const handleTransferOwnership = async () => {
    if (!newOwnerAddress) {
      toast.error('Please enter a new owner address');
      return;
    }
    
    try {
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'transferOwnership',
        args: [newOwnerAddress],
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error('Failed to transfer ownership');
    }
  };
  
  // Handle cancel ownership transfer
  const handleCancelOwnershipTransfer = async () => {
    try {
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'cancelOwnershipTransfer',
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error cancelling ownership transfer:', error);
      toast.error('Failed to cancel ownership transfer');
    }
  };
  
  // Handle deposit tokens for claims
  const handleDepositTokens = async () => {
    if (!depositAmount) {
      toast.error('Please enter a deposit amount');
      return;
    }
    
    try {
      // Convert amount to ethers (18 decimals)
      const amountInWei = parseUnits(depositAmount.toString(), 18);
      
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'depositTokensForClaims',
        args: [amountInWei],
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error depositing tokens:', error);
      toast.error('Failed to deposit tokens');
    }
  };
  
  // Handle add points
  const handleAddPoints = async () => {
    if (!userAddress || !pointsAmount) {
      toast.error('Please enter a user address and points amount');
      return;
    }
    
    try {
      const pointsInWei = pointsAmount;
      
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'addPoints',
        args: [userAddress, pointsInWei],
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };
  
  // Handle withdraw STT
  const handleWithdrawSTT = async () => {
    if (!withdrawAmount) {
      toast.error('Please enter a withdraw amount');
      return;
    }
    
    try {
      // Convert withdraw amount to ethers (18 decimals)
      const withdrawInWei = parseUnits(withdrawAmount.toString(), 18);
      
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'withdrawSTT',
        args: [withdrawInWei],
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error withdrawing STT:', error);
      toast.error('Failed to withdraw STT');
    }
  };
  
  // Handle withdraw all STT
  const handleWithdrawAllSTT = async () => {
    try {
      writeContract({
        address: SOMNIA_PUMPAZ_ADDRESS as `0x${string}`,
        abi: SOMNIA_PUMPAZ_ABI,
        functionName: 'withdrawAllSTT',
      });
      // Success toast will be shown after transaction confirmation
    } catch (error) {
      console.error('Error withdrawing all STT:', error);
      toast.error('Failed to withdraw all STT');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Ownership Management */}
      <div className="bg-[#FFFFFF22] rounded-lg p-6">
        <h3 className="font-rubik text-lg text-white mb-4">Ownership Management</h3>
        
        <div className="mb-4">
          <label className="block font-unkempt text-white mb-2">New Owner Address</label>
          <input
            type="text"
            value={newOwnerAddress}
            onChange={(e) => setNewOwnerAddress(e.target.value)}
            className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
            placeholder="0x..."
          />
          <button
            onClick={handleTransferOwnership}
            disabled={isPending || isConfirming}
            className="bg-[#09378c] hover:bg-[#0a4aad] transition-colors text-white py-2 px-4 rounded-md font-unkempt mt-2 w-full"
          >
            {isPending || isConfirming ? 'Processing...' : 'Transfer Ownership'}
          </button>
        </div>
        
        <button
          onClick={handleCancelOwnershipTransfer}
          disabled={isPending || isConfirming}
          className="bg-[#8c0937] hover:bg-[#ad0a4a] transition-colors text-white py-2 px-4 rounded-md font-unkempt w-full"
        >
          {isPending || isConfirming ? 'Processing...' : 'Cancel Ownership Transfer'}
        </button>
      </div>
      
      {/* Token Management */}
      <div className="bg-[#FFFFFF22] rounded-lg p-6">
        <h3 className="font-rubik text-lg text-white mb-4">Token Management</h3>
        
        <div className="mb-4">
          <label className="block font-unkempt text-white mb-2">Deposit Amount (PUMPAZ)</label>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
            placeholder="1000"
          />
          <button
            onClick={handleDepositTokens}
            disabled={isPending || isConfirming}
            className="bg-[#09378c] hover:bg-[#0a4aad] transition-colors text-white py-2 px-4 rounded-md font-unkempt mt-2 w-full"
          >
            {isPending || isConfirming ? 'Processing...' : 'Deposit Tokens for Claims'}
          </button>
        </div>
      </div>
      
      {/* User Management */}
      <div className="bg-[#FFFFFF22] rounded-lg p-6">
        <h3 className="font-rubik text-lg text-white mb-4">User Management</h3>
        
        <div className="mb-4">
          <label className="block font-unkempt text-white mb-2">User Address</label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
            placeholder="0x..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-unkempt text-white mb-2">Points Amount</label>
          <input
            type="number"
            value={pointsAmount}
            onChange={(e) => setPointsAmount(e.target.value)}
            className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
            placeholder="1000"
          />
          <button
            onClick={handleAddPoints}
            disabled={isPending || isConfirming}
            className="bg-[#09378c] hover:bg-[#0a4aad] transition-colors text-white py-2 px-4 rounded-md font-unkempt mt-2 w-full"
          >
            {isPending || isConfirming ? 'Processing...' : 'Add Points to User'}
          </button>
        </div>
      </div>
      
      {/* STT Withdrawal */}
      <div className="bg-[#FFFFFF22] rounded-lg p-6">
        <h3 className="font-rubik text-lg text-white mb-4">STT Withdrawal</h3>
        
        <div className="mb-4">
          <label className="block font-unkempt text-white mb-2">Withdraw Amount (STT)</label>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
            placeholder="1000"
          />
          <button
            onClick={handleWithdrawSTT}
            disabled={isPending || isConfirming}
            className="bg-[#09378c] hover:bg-[#0a4aad] transition-colors text-white py-2 px-4 rounded-md font-unkempt mt-2 w-full"
          >
            {isPending || isConfirming ? 'Processing...' : 'Withdraw STT'}
          </button>
        </div>
        
        <button
          onClick={handleWithdrawAllSTT}
          disabled={isPending || isConfirming}
          className="bg-[#8c0937] hover:bg-[#ad0a4a] transition-colors text-white py-2 px-4 rounded-md font-unkempt w-full"
        >
          {isPending || isConfirming ? 'Processing...' : 'Withdraw All STT'}
        </button>
      </div>
    </div>
  );
} 