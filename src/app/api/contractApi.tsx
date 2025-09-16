import { ethers, parseUnits } from "ethers";
import type * as ethersUtils from "ethers";
import { NEXUS_GAMING_ABI, NEXUS_GAMING_ADDRESS } from "../contracts/contract";
import { somniaTestnet } from "wagmi/chains";
// import { Log } from "ethers";

// Add ethereum to window type
declare global {
  interface Window {
    ethereum?: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

// types

interface FlipHistory {
  player: string;
  amount: ethersUtils.BigNumberish;
  guess: boolean;
  side: boolean;
  won: boolean;
  payout: ethersUtils.BigNumberish;
  createdAt: ethersUtils.BigNumberish;
}

interface DiceHistory {
  player: string;
  amount: ethersUtils.BigNumberish;
  dice1: ethersUtils.BigNumberish;
  dice2: ethersUtils.BigNumberish;
  outcome: ethersUtils.BigNumberish;
  won: boolean;
  winnings: ethersUtils.BigNumberish;
  houseCharge: ethersUtils.BigNumberish;
  createdAt: ethersUtils.BigNumberish;
}

// Create provider - in Next.js, we'll check for browser provider or use a fallback
const getProvider = () => {
  // For client-side (browser)
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }

  // For server-side or fallback
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
};

// Get signer function
const getSigner = async () => {
  const provider = getProvider();

  // For client-side, get the connected wallet's signer
  if (provider instanceof ethers.BrowserProvider) {
    try {
      await provider.send("eth_requestAccounts", []);
      return provider.getSigner();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  }

  throw new Error("No signer available");
};

// Get contract instance
const getContract = async (withSigner = true) => {
  try {
    if (withSigner) {
      const signer = await getSigner();
      return new ethers.Contract(
        NEXUS_GAMING_ADDRESS,
        NEXUS_GAMING_ABI,
        signer
      );
    } else {
      const provider = getProvider();
      return new ethers.Contract(
        NEXUS_GAMING_ADDRESS,
        NEXUS_GAMING_ABI,
        provider
      );
    }
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
};

export const getTokenBalance = async (): Promise<string> => {
  try {
    const contract = await getContract();
    const balance = await contract.checkBalance();
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

export const getReferralDetails = async (): Promise<{
  referralCode: string;
  referredUsers: number;
  earning: number;
}> => {
  try {
    const contract = await getContract();
    const [referralCode, referredUsers, earning] =
      await contract.getReferralDetails();

    return {
      referralCode,
      referredUsers: Number(referredUsers),
      earning: Number(earning),
    };
  } catch (error) {
    console.error("Error getting referral details:", error);
    return { referralCode: "", referredUsers: 0, earning: 0 };
  }
};

export const getLeaderboard = async (
  limit: number = 100
): Promise<{
  addresses: string[];
  points: number[];
}> => {
  try {
    const contract = await getContract(false);
    const [addresses, points] = await contract.getLeaderboard(limit);

    return {
      addresses: Array.from(addresses),
      points: points.map((p: ethersUtils.BigNumberish) => Number(p)),
    };
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return { addresses: [], points: [] };
  }
};

export const getUserRank = async (): Promise<number> => {
  try {
    const contract = await getContract();
    const rank = await contract.getUserRank();
    return Number(rank);
  } catch (error) {
    console.error("Error getting user rank:", error);
    return 0;
  }
};

export const getUserPoints = async (
  address: `0x${string}`
): Promise<number> => {
  try {
    const contract = await getContract();
    const points = await contract.getUserPoints(address);
    return Number(points);
  } catch (error) {
    console.error("Error getting user points: ", error);
    return 0;
  }
};

export const rollDice = async (
  selection: "higher" | "lower" | "equal",
  amount: string
): Promise<{
  success: boolean;
  result?: {
    won: boolean;
    dice1: number;
    dice2: number;
    outcome: number;
    payout: string;
    houseCharge: string;
  };
  message?: string;
}> => {
  try {
    const contract = await getContract();
    // Make sure amount is a valid number before parsing
    const amountInWei = parseUnits(amount.toString(), 18);

    const tx = await contract.rollDice(selection, { value: amountInWei });
    const receipt = await tx.wait();

    // Extract dice result from event
    const event = receipt.logs.find((log: any) => {
      //eslint-disable-line @typescript-eslint/no-explicit-any
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        return parsedLog && parsedLog.name === "DiceFinished";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = contract.interface.parseLog({
        topics: event.topics,
        data: event.data,
      });
      if (parsedEvent && parsedEvent.args && parsedEvent.args.diceData) {
        const diceData = parsedEvent.args.diceData;

        return {
          success: true,
          result: {
            won: diceData.result,
            dice1: Number(diceData.dice1),
            dice2: Number(diceData.dice2),
            outcome: Number(diceData.outcome),
            payout: diceData.result ? ethers.formatEther(diceData.payout) : "0",
            houseCharge: diceData.result
              ? ethers.formatEther(diceData.houseCharge)
              : "0",
          },
        };
      }
    }

    return { success: true };
  } catch (error: any) {
    //eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error rolling dice:", error);
    return {
      success: false,
      message: error.message || "Failed to roll dice",
    };
  }
};

export const getUserDiceHistory = async (
  offset: number = 0,
  limit: number = 10
): Promise<DiceHistory[]> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const address = await signer.getAddress();

    return await contract.getUserDiceHistory(address, offset, limit);
  } catch (error) {
    console.error("Error getting user dice history:", error);
    return [];
  }
};

export const getUserDiceCount = async (): Promise<number> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const address = await signer.getAddress();

    const count = await contract.getUserDiceCount(address);
    return Number(count);
  } catch (error) {
    console.error("Error getting user dice count:", error);
    return 0;
  }
};

export const flipCoin = async (
  side: "heads" | "tails",
  amount: string
): Promise<{
  success: boolean;
  result?: {
    won: boolean;
    userGuess: string;
    coinSide: string;
    payout: string;
  };
  message?: string;
}> => {
  try {
    const hexChainId = "0x" + somniaTestnet.id.toString(16);
    const provider = getProvider();
    const network = await provider.getNetwork();
    console.log("Network chainID: ", Number(network.chainId));
    console.log("SomniaId: ", somniaTestnet.id);
    if (Number(network.chainId) !== somniaTestnet.id) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
        console.log("Switched to Somnia Testnet");
      } catch (error: any) {
        //eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("An error occured switching: ", error);
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexChainId,
                  chainName: "Somnia Testnet",
                  nativeCurrency: {
                    name: "Somnia Token",
                    symbol: "STT",
                    decimals: 18,
                  },
                  rcpUrls: ["https://dream-rpc.somnia.network/"],
                  blockExplorerUrls: [
                    "https://shannon-explorer.somnia.network/",
                  ],
                },
              ],
            });

            //switch again after successful add
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: hexChainId }],
            });
            console.log("Switched to Somnia Testnet");
          } catch (error) {
            console.error("Failed to add network: ", error);
          }
        } else {
          console.log("Failed to switch to Somnia Testnet");
        }
      }
    }
    const contract = await getContract();
    // Make sure amount is a valid number before parsing
    const amountInWei = ethers.parseEther(amount.toString());

    const tx = await contract.flip(side, { value: amountInWei });
    const receipt = await tx.wait();

    // Extract flip result from event
    const event = receipt.logs.find((log: any) => {
      //eslint-disable-line @typescript-eslint/no-explicit-any
      try {
        const parsedLog = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        return parsedLog && parsedLog.name === "FlipFinished";
      } catch {
        return false;
      }
    });

    if (event) {
      const parsedEvent = contract.interface.parseLog({
        topics: event.topics,
        data: event.data,
      });
      if (parsedEvent && parsedEvent.args && parsedEvent.args.flipData) {
        const flipData = parsedEvent.args.flipData;

        return {
          success: true,
          result: {
            won: flipData.result,
            userGuess: flipData.guess ? "heads" : "tails",
            coinSide: flipData.side ? "heads" : "tails",
            payout: flipData.result ? ethers.formatEther(flipData.payout) : "0",
          },
        };
      }
    }

    return { success: true };
  } catch (error: any) {
    //eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error flipping coin:", error);
    return {
      success: false,
      message: error.message || "Failed to flip coin",
    };
  }
};

export const getUserFlipHistory = async (
  offset: number = 0,
  limit: number = 10
): Promise<FlipHistory[]> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const address = await signer.getAddress();

    return await contract.getUserFlipHistory(address, offset, limit);
  } catch (error) {
    console.error("Error getting user flip history:", error);
    return [];
  }
};

export const getUserFlipCount = async (): Promise<number> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const address = await signer.getAddress();

    const count = await contract.getUserFlipCount(address);
    return Number(count);
  } catch (error) {
    console.error("Error getting user flip count:", error);
    return 0;
  }
};

export const getClaimHistory = async (): Promise<{
  totalClaimed: string;
  nextClaimTime: Date | null;
}> => {
  try {
    const contract = await getContract();
    const signer = await getSigner();
    const address = await signer.getAddress();

    const [amount, nextClaimTimestamp] = await contract.getClaimHistory(
      address
    );

    const totalClaimed = ethers.formatEther(amount);
    let nextClaimTime = null;

    if (nextClaimTimestamp.toString() !== "0") {
      nextClaimTime = new Date(Number(nextClaimTimestamp) * 1000);
    }

    return { totalClaimed, nextClaimTime };
  } catch (error) {
    console.error("Error getting claim history:", error);
    return { totalClaimed: "0", nextClaimTime: null };
  }
};
