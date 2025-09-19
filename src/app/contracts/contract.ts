export const NEXUS_GAMING_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "StringsInsufficientHexLength",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "result",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "guess",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice2",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outcome",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "houseCharge",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          }
        ],
        "indexed": false,
        "internalType": "struct NexusGaming.Dice",
        "name": "diceData",
        "type": "tuple"
      }
    ],
    "name": "DiceFinished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "diceIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      }
    ],
    "name": "DiceRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "bool",
            "name": "result",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "guess",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "side",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct NexusGaming.Flip",
        "name": "flipData",
        "type": "tuple"
      }
    ],
    "name": "FlipFinished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "flipIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "won",
        "type": "bool"
      }
    ],
    "name": "FlipRecorded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PointsAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PointsRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "referee",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      }
    ],
    "name": "ReferralReward",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "stakingIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "earning",
        "type": "uint256"
      }
    ],
    "name": "StakingClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "stakingIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "StakingCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stakingDays",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "apy",
        "type": "uint256"
      }
    ],
    "name": "StakingPlanAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      }
    ],
    "name": "StakingPlanDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "planId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stakingDays",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "apy",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "name": "StakingPlanUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalClaimed",
        "type": "uint256"
      }
    ],
    "name": "TokensClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "referralCode",
        "type": "string"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "DiceData",
    "outputs": [
      {
        "internalType": "bool",
        "name": "result",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "guess",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dice1",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dice2",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outcome",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "houseCharge",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "claimed",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_points",
        "type": "uint256"
      }
    ],
    "name": "addPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_stakingDays",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_apy",
        "type": "uint256"
      }
    ],
    "name": "addStakingPlan",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "claimStaking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_planId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "createStaking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_planId",
        "type": "uint256"
      }
    ],
    "name": "deleteStakingPlan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "depositTokensForClaims",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "side",
        "type": "string"
      }
    ],
    "name": "flip",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveStakingPlans",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.StakingPlan[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllStakingPlans",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.StakingPlan[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllStatistics",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "walletsClaimedCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusMinted",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusClaimed",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "walletsPlayedDiceCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "diceGamesPlayedCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusWonOnDice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusWageredOnDice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "walletsPlayedFlipCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "flipGamesPlayedCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusWonOnFlip",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusWageredOnFlip",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "stakingsCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "stakingsActiveCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "stakingsClaimedCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "stakingsInactiveCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusStaked",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "nexusWithdrawnFromStaking",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "stakingsEarnings",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getClaimHistory",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getClaimStatus",
    "outputs": [
      {
        "internalType": "bool",
        "name": "canClaim",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "timeLeft",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getClaimableStakings",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getDiceHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice2",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outcome",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "winnings",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "houseCharge",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct NexusGaming.DiceHistory",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_offset",
        "type": "uint256"
      }
    ],
    "name": "getDiceLeaderboard",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "players",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "games",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalBets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalWins",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "winRates",
        "type": "uint256[]"
      },
      {
        "internalType": "int256[]",
        "name": "netProfits",
        "type": "int256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalVolumes",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getFlipHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "guess",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "side",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct NexusGaming.FlipHistory",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_offset",
        "type": "uint256"
      }
    ],
    "name": "getFlipLeaderboard",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "players",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "games",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalBets",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalWins",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "winRates",
        "type": "uint256[]"
      },
      {
        "internalType": "int256[]",
        "name": "netProfits",
        "type": "int256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "totalVolumes",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "getLeaderboard",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReferralDetails",
    "outputs": [
      {
        "internalType": "string",
        "name": "referralCode",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "referredUsers",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "earning",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_page",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_pageSize",
        "type": "uint256"
      }
    ],
    "name": "getRegisteredUsers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSTTBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "getStakingDetails",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "planId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "earning",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endDate",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.UserStaking",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_planId",
        "type": "uint256"
      }
    ],
    "name": "getStakingPlan",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.StakingPlan",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserActiveStakings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "planId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "earning",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endDate",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.UserStaking[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserDiceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "offset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getUserDiceHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice1",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "dice2",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outcome",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "winnings",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "houseCharge",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct NexusGaming.DiceHistory[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserFlipCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "offset",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limit",
        "type": "uint256"
      }
    ],
    "name": "getUserFlipHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "guess",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "side",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "won",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct NexusGaming.FlipHistory[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_isDice",
        "type": "bool"
      }
    ],
    "name": "getUserGameStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "games",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "wins",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalBet",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalWin",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "winRate",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "netProfit",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "referralCode",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "referredBy",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "points",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRegistered",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "hasVerifiedAddress",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "validAddress",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.UserInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserPoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUserRank",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserReferralCode",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserStakingCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "getUserStakings",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "userAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "planId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "apy",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "stakingDays",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "earning",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "startDate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "endDate",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "claimed",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct NexusGaming.UserStaking[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "isUserRegistered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_referralCode",
        "type": "string"
      }
    ],
    "name": "registerUser",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_points",
        "type": "uint256"
      }
    ],
    "name": "removePoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "selection",
        "type": "string"
      }
    ],
    "name": "rollDice",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "transferNexusToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_planId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_stakingDays",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_apy",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_active",
        "type": "bool"
      }
    ],
    "name": "updateStakingPlan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userDiceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userFlipCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userStakingCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "verifyUserAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawAllSTT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawSTT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

export const NEXUS_GAMING_ADDRESS: string =
  "0xB0C8776460172b9bdf78fa9976cde7a19b68879e";
