# Blockchain-Based Green Hydrogen Credit System

A comprehensive platform for issuing, tracking, and retiring credits for certified green hydrogen production batches with blockchain transparency and IPFS evidence storage.

## 🌟 Features

- **ERC-1155 Smart Contracts**: Multi-token standard for flexible credit management
- **Verifier API**: Automated batch validation and IPFS evidence pinning
- **Producer Interface**: Submit certified hydrogen batches for credit issuance
- **Buyer Marketplace**: Transfer and retire credits with transparent tracking
- **Auditor Panel**: Comprehensive verification and evidence review
- **Interactive Visualizer**: 3D timeline showing credit lifecycle flows
- **Wallet Integration**: MetaMask connection with secure transaction signing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hydrogen-credit-system

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start the development environment
npm run dev
```

### Backend Services

```bash
# Start local blockchain (in one terminal)
cd backend
npm run node

# Deploy contracts (in another terminal)
npm run deploy:local

# Start verifier API
npm run dev

# Run demo script
npm run demo
```

## 🏗️ Architecture

### Smart Contracts (`/backend/contracts`)
- **HydrogenCredits.sol**: ERC-1155 token contract with credit management
- Enforces unique batch hash issuance
- Manages certifier and verifier allowlists
- Handles transfers and retirements with burn events

### Verifier API (`/backend/verifier-api`)
- **Batch Validation**: Schema validation, overlap checking, signature verification
- **IPFS Integration**: Pin evidence documents and retrieve by CID
- **MongoDB Storage**: Index batches for efficient querying

### Frontend (`/src`)
- **Next.js**: React framework with file-based routing
- **Tailwind CSS**: Utility-first styling with custom energy themes
- **Three.js**: 3D visualizations and animated backgrounds
- **GSAP/Anime.js**: Smooth transitions and micro-interactions
- **Framer Motion**: Component animations and page transitions

## 📱 User Interfaces

### Dashboard
- Real-time credit balances and batch statistics
- Recent activity feed with transaction history
- Animated gradient background with floating hydrogen molecules

### Producer Portal
- Batch submission form with file upload
- Real-time validation feedback
- Credit minting progress with success animations

### Buyer Marketplace
- Available credits catalog with filtering
- Transfer interface with recipient validation
- Retirement module with mandatory usage notes

### Auditor Panel
- Comprehensive batch review table
- Evidence document viewer with IPFS links
- Verification status indicators with security checks

### Visualizer
- Interactive 3D network showing credit flows
- Clickable nodes revealing detailed batch information
- Real-time statistics and flow metrics

## 🔧 Configuration

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_VERIFIER_API_URL=http://localhost:3001

# Backend (.env)
PRIVATE_KEY=0x...
MONGODB_URL=mongodb://localhost:27017/hydrogen-credits
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
```

### Smart Contract Deployment

1. Start local Hardhat network: `npm run node`
2. Deploy contracts: `npm run deploy:local`
3. Update frontend with contract address
4. Register initial certifiers and verifiers

## 🎨 Design System

### Color Palette
- **Energy Green**: `#22c55e` - Primary actions and success states
- **Hydrogen Blue**: `#3b82f6` - Secondary actions and information
- **Gradient Backgrounds**: Dark theme with energy-inspired gradients
- **Glass Morphism**: Backdrop blur effects with subtle transparency

### Animations
- **GSAP**: Page transitions and complex animations
- **Anime.js**: Button hover effects and micro-interactions
- **Three.js**: 3D molecular background and flow visualizations
- **Framer Motion**: Component entrance and exit animations

## 🧪 Testing

```bash
# Test smart contracts
cd backend
npm run test

# Run demo script
npm run demo

# Test API endpoints
curl http://localhost:3001/api/health
```

## 🔒 Security Features

- **Row Level Security**: Supabase RLS policies for data protection
- **Digital Signatures**: Cryptographic verification of certifier attestations
- **Unique Batch Hashing**: Prevents double-counting and duplicate issuance
- **Allowlist Management**: On-chain registration of authorized certifiers/verifiers
- **Immutable Evidence**: IPFS storage ensures tamper-proof documentation

## 📊 Monitoring

- Real-time transaction status tracking
- Comprehensive audit logs for all operations
- Evidence integrity verification
- Credit lifecycle analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the demo script examples

---

Built with ⚡ for a sustainable future through transparent green hydrogen credit tracking.