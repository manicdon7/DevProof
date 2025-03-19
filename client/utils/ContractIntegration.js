import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { useEffect, useState } from "react";
import StakingArtifact from "../json/abi/Staking.json";
import RewardArtifact from "../json/abi/RewardDistribution.json";
import YieldArtifact from "../json/abi/YieldPool.json";

const StakingAbi = StakingArtifact.abi;
const RewardAbi = RewardArtifact.abi;
const YieldAbi = YieldArtifact.abi;

const stakingContractAddress = "0x8f90426F741B7CbF71954048Fe1c975749B17f3c";
const rewardContractAddress = "0x9B9446e6d0CDcf773d74E954F4cD61ee213aAc17";
const yieldContractAddress = "0xA87e632f680A458b9eFb319a2448bC45E6C52117";

const EXPECTED_CHAIN_ID = 1114;

export function useContracts() {
  const { address, isConnected } = useAccount();
  const { data: walletClient, isLoading: walletClientLoading, error: walletClientError } = useWalletClient();

  const [contractState, setContractState] = useState({
    provider: null,
    signer: null,
    stakingContract: null,
    stakingContractRead: null,
    rewardContract: null,
    rewardContractRead: null,
    yieldContract: null,
    isConnected: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializeContracts = async () => {
      if (!isConnected || !address || !ethers.isAddress(address)) {
        setContractState((prev) => ({
          ...prev,
          isConnected: false,
          isLoading: false,
          error: null,
        }));
        return;
      }

      if (walletClientLoading) {
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: true,
          error: null,
        }));
        return;
      }

      if (walletClientError) {
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          error: `Wallet client error: ${walletClientError.message}`,
        }));
        return;
      }

      if (!walletClient) {
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          error: "Wallet client not available. Please reconnect your wallet.",
        }));
        return;
      }

      const currentChainId = walletClient.chain?.id;
      if (currentChainId !== EXPECTED_CHAIN_ID) {
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          error: `Please switch to tCORE testnet (Chain ID: ${EXPECTED_CHAIN_ID}). Current chain: ${currentChainId}`,
        }));
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(walletClient.transport, {
          chainId: EXPECTED_CHAIN_ID,
          name: "tCORE Testnet",
        });
        const signer = await provider.getSigner();

        const stakingContract = new ethers.Contract(stakingContractAddress, StakingAbi, signer);
        const stakingContractRead = new ethers.Contract(stakingContractAddress, StakingAbi, provider);
        const rewardContract = new ethers.Contract(rewardContractAddress, RewardAbi, signer);
        const rewardContractRead = new ethers.Contract(rewardContractAddress, RewardAbi, provider);
        const yieldContract = new ethers.Contract(yieldContractAddress, YieldAbi, signer);

        await stakingContractRead.getTotalStaked();
        console.log("Contracts initialized for address:", address);

        setContractState({
          provider,
          signer,
          address,
          stakingContract,
          stakingContractRead,
          rewardContract,
          rewardContractRead,
          yieldContract,
          isConnected: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error initializing contracts:", error);
        setContractState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          error: error.message,
        }));
      }
    };

    initializeContracts();
  }, [address, isConnected, walletClient, walletClientLoading, walletClientError]);

  console.log("useContracts state:", {
    isConnected: contractState.isConnected,
    isLoading: contractState.isLoading,
    error: contractState.error,
    hasProvider: !!contractState.provider,
    hasSigner: !!contractState.signer,
    stakingContract: !!contractState.stakingContract,
    address,
  });

  return contractState;
}

function ensureContractReady(contract, isConnected, signer, provider, address, requiresSigner = true) {
  if (!isConnected) throw new Error("Wallet must be connected.");
  if (!contract) throw new Error("Contract not initialized.");
  if (requiresSigner && !signer) throw new Error("Signer not available.");
  if (!provider) throw new Error("Provider not available.");
  if (requiresSigner && (!address || !ethers.isAddress(address))) throw new Error("Invalid or missing address.");
}

export async function stakeTokens(contract, amount, isConnected, signer, provider, fallbackAddress) {
  ensureContractReady(contract, isConnected, signer, provider, fallbackAddress);
  try {
    const stakeAmount = ethers.parseEther(amount);
    const balance = await provider.getBalance(fallbackAddress);
    if (balance < stakeAmount) throw new Error("Insufficient tCORE balance.");
    const tx = await contract.stake({ value: stakeAmount, gasLimit: 500000 });
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Stake error:", error);
    throw error;
  }
}

export async function unstakeTokens(contract, amount, isConnected, signer, provider) {
  ensureContractReady(contract, isConnected, signer, provider, await signer.getAddress());
  try {
    const stakeAmount = ethers.parseEther(amount);
    const tx = await contract.unstake(stakeAmount, { gasLimit: 500000 });
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Unstake error:", error);
    throw error;
  }
}

export async function claimRewards(contract, isConnected, signer, provider) {
  ensureContractReady(contract, isConnected, signer, provider, await signer.getAddress());
  try {
    // Directly call the contract method
    const tx = await contract.claimReward();
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Claim rewards error:", error);
    throw error;
  }
}

export async function getUserStake(contract, userAddress, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider, userAddress, false);
  try {
    const userStake = await contract.stakes(userAddress);
    return {
      amount: userStake.amount,
      lastStakedTime: userStake.lastStakedTime,
    };
  } catch (error) {
    console.error("Get user stake error:", error);
    throw error;
  }
}

export async function refreshStakeInfo(contract, userAddress, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider, userAddress, false);
  try {
    const stakeInfo = await getUserStake(contract, userAddress, isConnected, provider);
    const balance = await provider.getBalance(userAddress);
    return {
      stakeInfo,
      walletBalance: ethers.formatEther(balance),
    };
  } catch (error) {
    console.error("Refresh stake info error:", error);
    throw error;
  }
}

export async function getTotalStaked(contract, isConnected, provider, address) {
  ensureContractReady(contract, isConnected, null, provider, address, false);
  try {
    const totalStaked = await contract.getTotalStaked();
    return ethers.formatEther(totalStaked);
  } catch (error) {
    console.error("Get total staked error:", error);
    throw error;
  }
}

export async function getRewardBalance(rewardContractRead, userAddress, isConnected, provider) {
  ensureContractReady(rewardContractRead, isConnected, null, provider, userAddress, false);
  try {
    // Check if getPendingRewards exists; adjust based on your RewardDistribution ABI
    let rewards;
    try {
      rewards = await rewardContractRead.getPendingRewards(userAddress);
    } catch (e) {
      console.warn("getPendingRewards not found, falling back to contract balance:", e);
      rewards = await provider.getBalance(rewardContractAddress);
    }
    return ethers.formatEther(rewards);
  } catch (error) {
    console.error("Get reward balance error:", error);
    throw error;
  }
}