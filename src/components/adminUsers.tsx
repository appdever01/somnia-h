import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { NEXUS_GAMING_ABI, NEXUS_GAMING_ADDRESS } from '@/app/contracts/contract';
import { LoadingSpinner } from './loader';
import { toast } from 'sonner';
import { somniaTestnet } from 'wagmi/chains';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('');
  const pageSize = 10;

  // Contract write hooks
  const { data: txHash, isPending, writeContract } = useWriteContract();
  
  // Wait for transaction receipt
  const { isLoading: isConfirming } = 
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Get registered users
  const { data: registeredUsers } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getRegisteredUsers",
    args: [BigInt(currentPage), BigInt(pageSize)],
    chainId: somniaTestnet.id,
  });

  // Get total users
  const { data: totalUsers } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getTotalUsers",
    chainId: somniaTestnet.id,
  });

  useEffect(() => {
    if (registeredUsers) {
      setUsers(registeredUsers as string[]);
      setLoading(false);
    }
  }, [registeredUsers]);

  // Handle add points
  const handleAddPoints = async () => {
    if (!selectedUser || !pointsToAdd) {
      toast.error('Please select a user and enter points amount');
      return;
    }
    
    try {
      writeContract({
        address: NEXUS_GAMING_ADDRESS as `0x${string}`,
        abi: NEXUS_GAMING_ABI,
        functionName: 'addPoints',
        args: [selectedUser, BigInt(pointsToAdd)],
        chainId: somniaTestnet.id,
      });
      toast.success(`Adding ${pointsToAdd} points to user ${selectedUser.substring(0, 6)}...${selectedUser.substring(selectedUser.length - 4)}`);
      setPointsToAdd('');
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (totalUsers && (currentPage + 1) * pageSize < Number(totalUsers)) {
      setCurrentPage(currentPage + 1);
      setLoading(true);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setLoading(true);
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
        <h3 className="font-rubik text-lg text-white mb-4">Registered Users</h3>
        
        {users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-[#FFFFFF44]">
                    <th className="text-left py-2 font-unkempt">Address</th>
                    <th className="text-right py-2 font-unkempt">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b border-[#FFFFFF22]">
                      <td className="py-2 font-unkempt">
                        {user.substring(0, 6)}...{user.substring(user.length - 4)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-[#09378c] hover:bg-[#0a4aad] transition-colors text-white py-1 px-2 rounded-md font-unkempt text-xs mr-2"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`bg-[#09378c] text-white py-1 px-3 rounded-md font-unkempt text-sm ${
                  currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0a4aad] transition-colors'
                }`}
              >
                Previous
              </button>
              <span className="font-unkempt text-white">
                Page {currentPage + 1} {totalUsers ? `of ${Math.ceil(Number(totalUsers) / pageSize)}` : ''}
              </span>
              <button
                onClick={handleNextPage}
                disabled={totalUsers ? (currentPage + 1) * pageSize >= Number(totalUsers) : true}
                className={`bg-[#09378c] text-white py-1 px-3 rounded-md font-unkempt text-sm ${
                  totalUsers && (currentPage + 1) * pageSize >= Number(totalUsers)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#0a4aad] transition-colors'
                }`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="font-unkempt text-white">No users found</p>
        )}
      </div>
      
      {selectedUser && (
        <div className="bg-[#FFFFFF22] rounded-lg p-4 mt-4">
          <h3 className="font-rubik text-lg text-white mb-4">Selected User: {selectedUser.substring(0, 6)}...{selectedUser.substring(selectedUser.length - 4)}</h3>
          
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block font-unkempt text-white mb-2">Points to Add</label>
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                className="w-full bg-[#FFFFFF33] text-white p-2 rounded-md font-unkempt"
                placeholder="1000"
              />
            </div>
            <button
              onClick={handleAddPoints}
              disabled={isPending || isConfirming || !pointsToAdd}
              className={`bg-[#09378c] text-white py-2 px-4 rounded-md font-unkempt ${
                isPending || isConfirming || !pointsToAdd
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#0a4aad] transition-colors'
              }`}
            >
              {isPending || isConfirming ? 'Processing...' : 'Add Points'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 