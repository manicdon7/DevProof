# Dev Proof

## Overview
Dev Proof is a blockchain-based platform that tracks and rewards developers for their contributions on GitHub. It utilizes smart contracts to fairly distribute rewards based on contribution quality, using a weekly leaderboard system. Developers can stake Core tokens, earn rewards, and yield additional benefits based on their contributions.

## Features
- Weekly GitHub contribution tracking
- Fair reward distribution using Core tokens
- Staking mechanism with MetaMask integration
- Leaderboard ranking system
- AI-powered commit verification using Pollinations API
- Email notifications for updates
- Chatbot support for developer queries

## Technologies Used
- **Frontend:** Vite, React.js, TailwindCSS, JavaScript
- **Backend:** Node.js, Firebase, Hardhat
- **Blockchain:** Solidity, Ether.js
- **APIs:** GitHub REST API, Pollinations API
- **Authentication:** GitHub OAuth
- **Email Notifications:** NodeMailer

## Project Links
- **Frontend Repo:** [DevProof](https://github.com/manicdon7/DevProof/tree/main)
- **Smart Contracts Repo:** [DevProof Contracts](https://github.com/manicdon7/devproof-contracts)
- **Deployed Frontend:** [Dev Proof App](https://dev-proof.vercel.app/)
- **Deployed Backend:** [Dev Proof Backend](https://dev-proof-backend.vercel.app/)
- **Demo Video Playlist:** [YouTube](https://www.youtube.com/playlist?list=PLF-Pa-PLv0lrG_wJL9pVhvAFUuqLZXps5)

## How It Works
1. Developers connect their GitHub and MetaMask wallets.
2. They stake Core tokens to participate in the weekly reward system.
3. GitHub contributions are analyzed using the Pollinations API.
4. Points are assigned based on contribution quality and quantity.
5. The top contributors are ranked on a leaderboard and rewarded accordingly.
6. Yielding mechanism allows for additional rewards over time.

## Challenges Faced
- Ensuring fair reward distribution while avoiding spam and low-quality contributions.
- Managing GitHub API rate limits for efficient data fetching.
- Optimizing smart contracts to reduce gas fees.
- Implementing security measures to prevent fraudulent activities.

## Future Plans
- Expanding support for additional version control platforms.
- Introducing more staking options and reward mechanisms.
- Enhancing security with advanced fraud detection.
- Improving AI algorithms for better commit evaluation.

## Team Members
- **Manikandan**
- **Naveen Rajan**
- **Ganesh**

## Getting Started
### Prerequisites
- Node.js installed
- MetaMask wallet setup
- GitHub account

### Installation
```sh
# Clone the frontend repo
git clone https://github.com/manicdon7/DevProof.git
cd DevProof
npm install
npm run dev

# Clone the smart contract repo
git clone https://github.com/manicdon7/devproof-contracts.git
cd devproof-contracts
npm install
npx hardhat compile
```

### Running Locally
1. Start the frontend:
   ```sh
   npm run dev
   ```
2. Deploy smart contracts:
   ```sh
   npx hardhat run scripts/deploy.js --network <network-name>
   ```
3. Start backend services if needed.

## License
This project is licensed under the MIT License.
