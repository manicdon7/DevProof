import { ethers, Contract } from "ethers";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import StakingArtifact from "../json/abi/Staking.json";
import RewardArtifact from "../json/abi/RewardDistribution.json";
import YieldArtifact from "../json/abi/YieldPool.json";

// Extract the ABI arrays from the Hardhat artifacts
const StakingAbi = StakingArtifact.abi;
const RewardAbi = RewardArtifact.abi;
const YieldAbi = YieldArtifact.abi;

const stakingContractAddress = "0x665cbba08eF854F342A3E3F4B7470d6B0807943E";
const rewardContractAddress = "0x1c08eCc79C5954F023d4F5e3f1392c6f76b41FF3";
const yieldContractAddress = "0x8BFA062Cba288668D46958288cF0F4B43bC8D92a";

/**
 * Hook to initialize contracts using wagmi, ensuring wallet connection and signer availability
 */
export function useContracts() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient, isLoading: walletClientLoading } = useWalletClient();

  // If wallet isn’t connected, return a minimal state
  if (!isConnected) {
    console.warn("Wallet not connected. Contracts cannot be initialized.");
    return { isConnected: false, isLoading: false };
  }

  // If wallet client is loading, return a loading state
  if (walletClientLoading) {
    return { isConnected: true, isLoading: true };
  }

  // If walletClient isn’t available after loading, return an error state
  if (!walletClient) {
    console.error("Wallet client (signer) not available after loading.");
    return { isConnected: true, isLoading: false, error: "Signer not found" };
  }

  // Use publicClient as provider and walletClient as signer
  const provider = publicClient;
  const signer = walletClient;

  // Initialize contracts with the signer
  const stakingContract = new Contract(stakingContractAddress, StakingAbi, signer);
  const rewardContract = new Contract(rewardContractAddress, RewardAbi, signer);
  const yieldContract = new Contract(yieldContractAddress, YieldAbi, signer);

  return {
    provider,
    signer,
    address,
    stakingContract,
    rewardContract,
    yieldContract,
    isConnected: true,
    isLoading: false,
  };
}

/**
 * Utility function to ensure wallet connection and contract availability
 */
function ensureContractReady(contract, isConnected) {
  if (!isConnected) {
    throw new Error("Wallet must be connected to perform this action.");
  }
  if (!contract) {
    throw new Error("Contract not initialized. Ensure wallet is connected and signer is available.");
  }
}

/**
 * Stake tokens in the staking contract
 */
export async function stakeTokens(contract, amount, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const tx = await contract.stake(ethers.parseEther(amount), { gasLimit: 500000 });
    await tx.wait();
    console.log("Staking successful");
    return tx;
  } catch (error) {
    console.error("Error staking tokens:", error);
    throw error;
  }
}

/**
 * Unstake tokens from the staking contract
 */
export async function unstakeTokens(contract, amount, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const tx = await contract.unstake(ethers.parseEther(amount), { gasLimit: 500000 });
    await tx.wait();
    console.log("Unstaking successful");
    return tx;
  } catch (error) {
    console.error("Error unstaking tokens:", error);
    throw error;
  }
}

/**
 * Claim rewards from the reward contract
 */
export async function claimRewards(contract, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const tx = await contract.claimReward({ gasLimit: 500000 });
    await tx.wait();
    console.log("Rewards claimed successfully");
    return tx;
  } catch (error) {
    console.error("Error claiming rewards:", error);
    throw error;
  }
}

/**
 * Get total staked tokens in the staking contract (read-only, uses provider)
 */
export async function getTotalStaked(contract, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const totalStaked = await contract.getTotalStaked();
    return totalStaked;
  } catch (error) {
    console.error("Error getting total staked:", error);
    throw error;
  }
}

/**
 * Get the user's stake amount
 */
export async function getUserStake(contract, userAddress, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const stake = await contract.stakes(userAddress);
    return stake;
  } catch (error) {
    console.error("Error getting user stake:", error);
    throw error;
  }
}

/**
 * Get the user's reward balance
 */
export async function getRewardBalance(contract, userAddress, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const balance = await contract.rewardBalance(userAddress);
    return balance;
  } catch (error) {
    console.error("Error getting reward balance:", error);
    throw error;
  }
}

/**
 * Set the reward rate for the reward contract
 */
export async function setRewardRate(contract, newRate, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const tx = await contract.setRewardRate(newRate, { gasLimit: 500000 });
    await tx.wait();
    console.log("Reward rate updated");
    return tx;
  } catch (error) {
    console.error("Error setting reward rate:", error);
    throw error;
  }
}

/**
 * Set the yield rate for the yield contract
 */
export async function setYieldRate(contract, newRate, isConnected) {
  ensureContractReady(contract, isConnected);
  try {
    const tx = await contract.setYieldRate(newRate, { gasLimit: 500000 });
    await tx.wait();
    console.log("Yield rate updated");
    return tx;
  } catch (error) {
    console.error("Error setting yield rate:", error);
    throw error;
  }
}