# 🎮 Nexus Gaming - Web3 Gaming Platform

A blockchain-powered gaming platform built on **Somnia Testnet** featuring provably fair games, NFT farming, staking rewards, and social engagement systems.

## 🌟 Features

### 🎲 Gaming Suite
- **Dice Games**: Roll dice with higher/lower/equal predictions
- **Coin Flip**: Classic heads or tails betting
- **Provably Fair**: All games use blockchain verification for fairness

### 💰 DeFi Features
- **Token Claiming**: Daily $NEXUS token rewards
- **Staking System**: Stake tokens to earn passive income
- **NFT Farming**: Cultivate and harvest rare NFTs for profits

### 🏆 Social & Competitive
- **Leaderboard**: Track top players and their achievements
- **Social Tasks**: Earn rewards by following on X and joining Discord
- **Referral System**: Invite friends and earn bonuses (coming soon)

### 🔧 Platform Features
- **Web3 Wallet Integration**: Connect with MetaMask and other wallets
- **Multi-chain Support**: Built on Somnia Testnet
- **Real-time Analytics**: Track your gaming performance
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.1.8 with React 18
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Animations**: GSAP for smooth UI transitions
- **TypeScript**: Full type safety

### Blockchain Integration
- **Web3 Library**: Wagmi v2 + Viem v2
- **Wallet Connection**: ConnectKit
- **Smart Contracts**: Ethers.js v6
- **Network**: Somnia Testnet

### Additional Tools
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Icons**: React Icons
- **Package Manager**: PNPM

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PNPM (recommended) or npm
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexus-gaming-testnet
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables in `.env.local`

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

```bash
pnpm build
pnpm start
# Production server runs on port 3007
```

## 🎮 How to Play

### 1. Connect Your Wallet
- Click "Connect Wallet" and select your preferred wallet
- Make sure you're connected to Somnia Testnet
- The app will automatically switch networks if needed

### 2. Claim Daily Tokens
- Complete social tasks (follow on X, join Discord)
- Claim your daily $NEXUS tokens
- Tokens are subject to a 24-hour cooldown

### 3. Play Games

#### Dice Game
- Choose your prediction: Higher, Lower, or Equal
- Set your bet amount (1, 5, 10, 15, 20, or 50 STT)
- Roll the dice and win based on your prediction
- View your game history and statistics

#### Coin Flip
- Choose Heads or Tails
- Place your bet
- Flip the coin and win 2x your bet if correct
- Track your wins and losses

### 4. Staking & Rewards
- Stake your $NEXUS tokens to earn passive income
- Choose from different staking plans
- View your staked amounts and pending rewards
- Compound or withdraw your earnings

### 5. Leaderboard & Competition
- Check the leaderboard to see top players
- View player statistics and achievements
- Compete for the highest scores and earnings

## 🔗 Smart Contract Integration

### Contract Address
**Somnia Testnet**: `0xB0C8776460172b9bdf78fa9976cde7a19b68879e`

### Key Functions
- `claimTokens()`: Claim daily $NEXUS rewards
- `rollDice(prediction)`: Play dice game with ETH
- `flip(side)`: Play coin flip with ETH
- `stake(amount)`: Stake tokens for rewards
- `getUserPoints(address)`: Get player statistics

### Network Details
- **Chain ID**: Somnia Testnet
- **Native Token**: STT (Somnia Test Token)
- **Gas Fees**: Minimal transaction costs

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes and contract interactions
│   ├── contracts/           # Smart contract ABI and addresses
│   ├── dashboard/           # Game pages and features
│   │   ├── admin/          # Admin panel
│   │   ├── coin/           # Coin flip game
│   │   ├── dice/           # Dice game
│   │   ├── leaderboard/    # Player rankings
│   │   ├── refer/          # Referral system
│   │   ├── staking/        # Token staking
│   │   └── tasks/          # Social tasks
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── redux/                  # State management
├── utils/                  # Utility functions
└── styles/                # Global styles
```

## 🎨 Key Components

### Gaming Components
- `<Coin />`: Animated coin flip component
- `<Die />`: 3D dice with physics simulation
- `<Mint />`: Token claiming interface

### UI Components
- `<Button />`: Themed button component
- `<LoadingSpinner />`: Loading states
- `<Header />`: Navigation and wallet connection

### Smart Contract Integration
- `contractApi.tsx`: Web3 contract interactions
- Automated network switching
- Error handling and transaction management

## 🔒 Security Features

- **Provably Fair Gaming**: All game outcomes are verifiable on-chain
- **Smart Contract Auditing**: Contract code is transparent and auditable
- **Secure Wallet Integration**: Non-custodial wallet connections
- **Rate Limiting**: Protection against spam and abuse
- **Type Safety**: Full TypeScript implementation

## 📊 Analytics & Tracking

The platform includes comprehensive analytics:
- Game performance tracking
- User engagement metrics
- Transaction monitoring
- Error logging and debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and this README
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord for support and discussions

## 🚧 Roadmap

- [ ] Mobile app development
- [ ] Additional game types
- [ ] Tournament system
- [ ] Advanced NFT marketplace
- [ ] Cross-chain functionality
- [ ] Governance token features

## ⚠️ Disclaimer

This is a testnet application for educational and testing purposes. Do not use real funds or rely on this for production trading. All tokens and transactions are on testnet only.

---

**Built with ❤️ for the Web3 gaming community**

*Powered by Somnia Testnet | Made with Next.js & Tailwind CSS*
