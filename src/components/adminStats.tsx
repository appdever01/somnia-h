import { useState, useEffect } from 'react';
import { useReadContract, useAccount, usePublicClient } from 'wagmi';
import { BigNumberish, formatUnits } from 'ethers';
import { NEXUS_GAMING_ABI, NEXUS_GAMING_ADDRESS } from '@/app/contracts/contract';
import StatCard from './statCard';
import { LoadingSpinner } from './loader';
import { somniaTestnet } from 'wagmi/chains';




export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNexusMinted: '0',
    contractBalance: '0',
    tokenBalance: '0',
    stakingPlans: 0,
    leaderboardTopUsers: [] as { address: string, points: number }[],
    // New game statistics
    walletsClaimedCount: 0,
    nexusClaimed: '0',
    walletsPlayedDiceCount: 0,
    diceGamesPlayedCount: 0,
    nexusWonOnDice: '0',
    nexusWageredOnDice: '0',
    walletsPlayedFlipCount: 0,
    flipGamesPlayedCount: 0,
    nexusWonOnFlip: '0',
    nexusWageredOnFlip: '0',
    // Staking statistics
    stakingsCount: 0,
    stakingsActiveCount: 0,
    stakingsClaimedCount: 0,
    stakingsInactiveCount: 0,
    nexusStaked: '0',
    nexusWithdrawnFromStaking: '0',
    stakingsEarnings: '0'
  });

  // Get total registered users
  const { data: totalUsers } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getTotalUsers",
    chainId: somniaTestnet.id,
  });

  // Get contract STT balance
  const { data: contractBalance } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getSTTBalance",
    chainId: somniaTestnet.id,
  });

  // Get token balance
  const { data: tokenBalance } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getTokenBalance",
    chainId: somniaTestnet.id,
  });

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "totalSupply",
    chainId: somniaTestnet.id,
  });

  // Get active staking plans
  const { data: activeStakingPlans } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getActiveStakingPlans",
    chainId: somniaTestnet.id,
  });

  // Get leaderboard (top 5 users)
  const { data: leaderboard } = useReadContract({
    address: NEXUS_GAMING_ADDRESS as `0x${string}`,
    abi: NEXUS_GAMING_ABI,
    functionName: "getLeaderboard",
    args: [5],
    chainId: somniaTestnet.id,
  });
  
  // Get account and public client
  const { address } = useAccount();
  const publicClient = usePublicClient({
    chainId: somniaTestnet.id
  });
  
  // Define the type for game statistics
  type GameStatistics = {
    [key: number]: bigint | string;
    walletsClaimedCount?: bigint;
    nexusMinted?: bigint;
    nexusClaimed?: bigint;
    walletsPlayedDiceCount?: bigint;
    diceGamesPlayedCount?: bigint;
    nexusWonOnDice?: bigint;
    nexusWageredOnDice?: bigint;
    walletsPlayedFlipCount?: bigint;
    flipGamesPlayedCount?: bigint;
    nexusWonOnFlip?: bigint;
    nexusWageredOnFlip?: bigint;
    // Staking statistics
    stakingsCount?: bigint;
    stakingsActiveCount?: bigint;
    stakingsClaimedCount?: bigint;
    stakingsInactiveCount?: bigint;
    nexusStaked?: bigint;
    nexusWithdrawnFromStaking?: bigint;
    stakingsEarnings?: bigint;
  };
  
  // Function to get game statistics using wagmi's publicClient
  const getGameStatistics = async (): Promise<GameStatistics | null> => {
    if (!address || !publicClient) return null;
    
    try {
      // Call getAllStatistics function using publicClient
      const result = await publicClient.readContract({
        address: NEXUS_GAMING_ADDRESS as `0x${string}`,
        abi: NEXUS_GAMING_ABI,
        functionName: 'getAllStatistics',
        account: address
      });
      
      const stats: GameStatistics = {};
      
      // Map array indices to named properties
      if (result && typeof result === 'object') {
        
        const arrayLike = result as Record<number, bigint | string>;
        
        // Map based on the expected order from the contract
        stats.walletsClaimedCount = BigInt(arrayLike[0] || 0);
        stats.nexusMinted = BigInt(arrayLike[1] || 0);
        stats.nexusClaimed = BigInt(arrayLike[2] || 0);
        stats.walletsPlayedDiceCount = BigInt(arrayLike[3] || 0);
        stats.diceGamesPlayedCount = BigInt(arrayLike[4] || 0);
        stats.nexusWonOnDice = BigInt(arrayLike[5] || 0);
        stats.nexusWageredOnDice = BigInt(arrayLike[6] || 0);
        stats.walletsPlayedFlipCount = BigInt(arrayLike[7] || 0);
        stats.flipGamesPlayedCount = BigInt(arrayLike[8] || 0);
        stats.nexusWonOnFlip = BigInt(arrayLike[9] || 0);
        stats.nexusWageredOnFlip = BigInt(arrayLike[10] || 0);
        
        // Staking statistics
        stats.stakingsCount = BigInt(arrayLike[11] || 0);
        stats.stakingsActiveCount = BigInt(arrayLike[12] || 0);
        stats.stakingsClaimedCount = BigInt(arrayLike[13] || 0);
        stats.stakingsInactiveCount = BigInt(arrayLike[14] || 0);
        stats.nexusStaked = BigInt(arrayLike[15] || 0);
        stats.nexusWithdrawnFromStaking = BigInt(arrayLike[16] || 0);
        stats.stakingsEarnings = BigInt(arrayLike[17] || 0);
      }
      
      return stats;
    } catch (error) {
      console.error("Error getting game statistics:", error);
      return null;
    }
  };
  
  // Function to directly fetch contract and token balances
  const getContractBalances = async (): Promise<{contractBalance: bigint, tokenBalance: bigint} | null> => {
    if (!address || !publicClient) return null;
    
    try {
      // Get STT balance
      let sttBalance: bigint;
      try {
        sttBalance = await publicClient.readContract({
          address: NEXUS_GAMING_ADDRESS as `0x${string}`,
          abi: NEXUS_GAMING_ABI,
          functionName: 'getSTTBalance',
          account: address
        }) as bigint;
      } catch (e) {
        console.error("Error fetching STT balance:", e);
        sttBalance = BigInt(0);
      }
      
      // Get token balance
      let tokenBal: bigint;
      try {
        tokenBal = await publicClient.readContract({
          address: NEXUS_GAMING_ADDRESS as `0x${string}`,
          abi: NEXUS_GAMING_ABI,
          functionName: 'getTokenBalance',
          account: address
        }) as bigint;
      } catch (e) {
        console.error("Error fetching token balance:", e);
        tokenBal = BigInt(0);
      }
      
      console.log("Direct STT Balance:", sttBalance);
      console.log("Direct Token Balance:", tokenBal);
      
      return {
        contractBalance: sttBalance,
        tokenBalance: tokenBal
      };
    } catch (error) {
      console.error("Error getting contract balances:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Debug logs for contract balance
        console.log("Contract Balance Raw:", contractBalance);
        console.log("Token Balance Raw:", tokenBalance);
        
        // Get direct balances
        const balances = await getContractBalances();
        
        // Process leaderboard data if available
        let leaderboardData: { address: string, points: number }[] = [];
        if (leaderboard && Array.isArray(leaderboard) && leaderboard.length >= 2) {
          const addresses = leaderboard[0] as string[];
          const points = leaderboard[1] as BigNumberish[];
          
          if (addresses && points && addresses.length === points.length) {
            leaderboardData = addresses.map((address, index) => ({
              address,
              points: Number(points[index])
            }));
          }
        }

        // Get game statistics directly
        const gameStatistics = await getGameStatistics();        
        // Process game statistics
        const gameStats = {
          // Number values
          walletsClaimedCount: gameStatistics?.walletsClaimedCount ? Number(gameStatistics.walletsClaimedCount) : 0,
          walletsPlayedDiceCount: gameStatistics?.walletsPlayedDiceCount ? Number(gameStatistics.walletsPlayedDiceCount) : 0,
          diceGamesPlayedCount: gameStatistics?.diceGamesPlayedCount ? Number(gameStatistics.diceGamesPlayedCount) : 0,
          walletsPlayedFlipCount: gameStatistics?.walletsPlayedFlipCount ? Number(gameStatistics.walletsPlayedFlipCount) : 0,
          flipGamesPlayedCount: gameStatistics?.flipGamesPlayedCount ? Number(gameStatistics.flipGamesPlayedCount) : 0,
          stakingsCount: gameStatistics?.stakingsCount ? Number(gameStatistics.stakingsCount) : 0,
          stakingsActiveCount: gameStatistics?.stakingsActiveCount ? Number(gameStatistics.stakingsActiveCount) : 0,
          stakingsClaimedCount: gameStatistics?.stakingsClaimedCount ? Number(gameStatistics.stakingsClaimedCount) : 0,
          stakingsInactiveCount: gameStatistics?.stakingsInactiveCount ? Number(gameStatistics.stakingsInactiveCount) : 0,
          
          // BigInt values that need to be formatted
          nexusMinted: gameStatistics?.nexusMinted ? formatUnits(gameStatistics.nexusMinted as BigNumberish, 18) : '0',
          nexusClaimed: gameStatistics?.nexusClaimed ? formatUnits(gameStatistics.nexusClaimed as BigNumberish, 18) : '0',
          nexusWonOnDice: gameStatistics?.nexusWonOnDice ? formatUnits(gameStatistics.nexusWonOnDice as BigNumberish, 18) : '0',
          nexusWageredOnDice: gameStatistics?.nexusWageredOnDice ? formatUnits(gameStatistics.nexusWageredOnDice as BigNumberish, 18) : '0',
          nexusWonOnFlip: gameStatistics?.nexusWonOnFlip ? formatUnits(gameStatistics.nexusWonOnFlip as BigNumberish, 18) : '0',
          nexusWageredOnFlip: gameStatistics?.nexusWageredOnFlip ? formatUnits(gameStatistics.nexusWageredOnFlip as BigNumberish, 18) : '0',
          nexusStaked: gameStatistics?.nexusStaked ? formatUnits(gameStatistics.nexusStaked as BigNumberish, 18) : '0',
          nexusWithdrawnFromStaking: gameStatistics?.nexusWithdrawnFromStaking ? formatUnits(gameStatistics.nexusWithdrawnFromStaking as BigNumberish, 18) : '0',
          stakingsEarnings: gameStatistics?.stakingsEarnings ? formatUnits(gameStatistics.stakingsEarnings as BigNumberish, 18) : '0'
        };
        
        setStats({
          totalUsers: totalUsers ? Number(totalUsers) : 0,
          totalNexusMinted: totalSupply ? formatUnits(totalSupply as BigNumberish, 18) : '0',
          contractBalance: balances?.contractBalance ? formatUnits(balances.contractBalance as BigNumberish, 18) : '0',
          tokenBalance: balances?.tokenBalance ? formatUnits(balances.tokenBalance as BigNumberish, 18) : '0',
          stakingPlans: activeStakingPlans && Array.isArray(activeStakingPlans) ? activeStakingPlans.length : 0,
          leaderboardTopUsers: leaderboardData,
          // Game statistics
          walletsClaimedCount: gameStats.walletsClaimedCount,
          nexusClaimed: gameStats.nexusClaimed,
          walletsPlayedDiceCount: gameStats.walletsPlayedDiceCount,
          diceGamesPlayedCount: gameStats.diceGamesPlayedCount,
          nexusWonOnDice: gameStats.nexusWonOnDice,
          nexusWageredOnDice: gameStats.nexusWageredOnDice,
          walletsPlayedFlipCount: gameStats.walletsPlayedFlipCount,
          flipGamesPlayedCount: gameStats.flipGamesPlayedCount,
          nexusWonOnFlip: gameStats.nexusWonOnFlip,
          nexusWageredOnFlip: gameStats.nexusWageredOnFlip,
          // Staking statistics
          stakingsCount: gameStats.stakingsCount,
          stakingsActiveCount: gameStats.stakingsActiveCount,
          stakingsClaimedCount: gameStats.stakingsClaimedCount,
          stakingsInactiveCount: gameStats.stakingsInactiveCount,
          nexusStaked: gameStats.nexusStaked,
          nexusWithdrawnFromStaking: gameStats.nexusWithdrawnFromStaking,
          stakingsEarnings: gameStats.stakingsEarnings
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    if (address && publicClient) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [totalUsers, contractBalance, tokenBalance, totalSupply, activeStakingPlans, leaderboard, address, publicClient]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-8">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }
  
  if (!address) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-white font-unkempt text-lg">Please connect your wallet to view admin statistics.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Registered Users" 
          value={stats.totalUsers.toLocaleString()}
        />
        <StatCard 
          title="NEXUS Minted" 
          value={parseFloat(stats.totalNexusMinted).toLocaleString()}
        />
        <StatCard 
          title="Contract STT Balance" 
          value={parseFloat(stats.contractBalance).toLocaleString()}
        />
        <StatCard 
          title="Token Balance" 
          value={parseFloat(stats.tokenBalance).toLocaleString()}
        />
        <StatCard 
          title="Active Staking Plans" 
          value={stats.stakingPlans.toString()}
        />
        <StatCard 
          title="Wallets Claimed NEXUS" 
          value={stats.walletsClaimedCount.toLocaleString()}
        />
        <StatCard 
          title="NEXUS Claimed" 
          value={parseFloat(stats.nexusClaimed).toLocaleString()}
        />
      </div>
      
      {/* Dice Game Stats */}
      <div className="mt-8">
        <h3 className="font-rubik text-lg text-white mb-4">Dice Game Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Wallets Played Dice" 
            value={stats.walletsPlayedDiceCount.toLocaleString()}
          />
          <StatCard 
            title="Dice Games Played" 
            value={stats.diceGamesPlayedCount.toLocaleString()}
          />
          <StatCard 
            title="STT Won on Dice" 
            value={parseFloat(stats.nexusWonOnDice).toLocaleString()}
          />
          <StatCard 
            title="STT Wagered on Dice" 
            value={parseFloat(stats.nexusWageredOnDice).toLocaleString()}
          />
        </div>
      </div>
      
      {/* Coin Flip Stats */}
      <div className="mt-8">
        <h3 className="font-rubik text-lg text-white mb-4">Coin Flip Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Wallets Played Flip" 
            value={stats.walletsPlayedFlipCount.toLocaleString()}
          />
          <StatCard 
            title="Flip Games Played" 
            value={stats.flipGamesPlayedCount.toLocaleString()}
          />
          <StatCard 
            title="STT Won on Flip" 
            value={parseFloat(stats.nexusWonOnFlip).toLocaleString()}
          />
          <StatCard 
            title="STT Wagered on Flip" 
            value={parseFloat(stats.nexusWageredOnFlip).toLocaleString()}
          />
        </div>
      </div>
      
      {/* Staking Stats */}
      <div className="mt-8">
        <h3 className="font-rubik text-lg text-white mb-4">Staking Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Stakings" 
            value={stats.stakingsCount.toLocaleString()}
          />
          <StatCard 
            title="Active Stakings" 
            value={stats.stakingsActiveCount.toLocaleString()}
          />
          <StatCard 
            title="Claimed Stakings" 
            value={stats.stakingsClaimedCount.toLocaleString()}
          />
          <StatCard 
            title="Inactive Stakings" 
            value={stats.stakingsInactiveCount.toLocaleString()}
          />
          <StatCard 
            title="NEXUS Staked" 
            value={parseFloat(stats.nexusStaked).toLocaleString()}
          />
          <StatCard 
            title="NEXUS Withdrawn from Staking" 
            value={parseFloat(stats.nexusWithdrawnFromStaking).toLocaleString()}
          />
          <StatCard 
            title="Total Staking Earnings" 
            value={parseFloat(stats.stakingsEarnings).toLocaleString()}
          />
        </div>
      </div>

      {stats.leaderboardTopUsers.length > 0 && (
        <div className="mt-8">
          <h3 className="font-rubik text-lg text-white mb-4">Top Users (Leaderboard)</h3>
          <div className="bg-[#FFFFFF22] rounded-lg p-4">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-[#FFFFFF44]">
                  <th className="text-left py-2 font-unkempt">Rank</th>
                  <th className="text-left py-2 font-unkempt">Address</th>
                  <th className="text-right py-2 font-unkempt">Points</th>
                </tr>
              </thead>
              <tbody>
                {stats.leaderboardTopUsers.map((user, index) => (
                  <tr key={index} className="border-b border-[#FFFFFF22]">
                    <td className="py-2 font-unkempt">{index + 1}</td>
                    <td className="py-2 font-unkempt">{user.address.substring(0, 6)}...{user.address.substring(user.address.length - 4)}</td>
                    <td className="py-2 text-right font-unkempt">{user.points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 