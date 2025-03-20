import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { useEffect, useState } from "react";
import StakingArtifact from "../json/abi/Staking.json";
import RewardArtifact from "../json/abi/RewardDistribution.json";
import YieldArtifact from "../json/abi/YieldPool.json";

const StakingAbi = StakingArtifact.abi;
const RewardAbi = RewardArtifact.abi;
const YieldAbi = YieldArtifact.abi;

const stakingContractAddress = "0x7027CEBe8b8004a0cA0E0bbDdB4533B418CaAA59";
const rewardContractAddress = "0xEFdEAA2Ae3B7c81cC93854CC9bfe78AecDCfE668";
const yieldContractAddress = "0xbb9a09cB0E0bE4A5b5AD4B46b8C98c3461180Eb8";

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
        try {
          await walletClient.switchChain(EXPECTED_CHAIN_ID);
        } catch (error) {
          setContractState((prev) => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            error: `Switch to tCORE testnet (Chain ID: ${EXPECTED_CHAIN_ID}).`,
          }));
          return;
        }
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

  return contractState;
}

function ensureContractReady(contract, isConnected, signer, provider, address, requiresSigner = true) {
  if (!isConnected) throw new Error("Wallet must be connected.");
  if (!contract) throw new Error("Contract not initialized.");
  if (requiresSigner && !signer) throw new Error("Signer not available.");
  if (!provider) throw new Error("Provider not available.");
  if (requiresSigner && (!address || !ethers.isAddress(address))) throw new Error("Invalid or missing address.");
}

export async function stakeTokens(contract, githubUsername, isConnected, signer, provider, address, options = {}) {
  ensureContractReady(contract, isConnected, signer, provider, address);
  try {
    const tx = await contract.stake(githubUsername, { 
      value: options.value || ethers.parseEther("0.01"), 
      gasLimit: 500000 
    });
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Stake error:", error);
    throw error;
  }
}

export async function unstakeTokens(contract, isConnected, signer, provider, address, amount) {
  if (!contract || !isConnected || !signer || !provider || !address || !amount) {
    throw new Error("Invalid parameters: Ensure contract, connection, signer, provider, address, and amount are provided.");
  }

  try {
    const tx = await contract.connect(signer).unstake(amount, { gasLimit: 500000 });
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Unstaking failed:", error);
    throw new Error(`Unstaking failed: ${error.message || error}`);
  }
}

export async function distributeTopContributors(contract, isConnected, signer, provider, address, topUsers, rewards) {
  if (!contract || !isConnected || !signer || !provider || !address || !topUsers || !rewards) {
    throw new Error("Invalid parameters: Ensure all required parameters are provided.");
  }
  if (topUsers.length !== rewards.length) {
    throw new Error("Mismatched arrays: topUsers and rewards must have the same length.");
  }

  try {
    console.log("Distributing to:", topUsers);
    console.log("Rewards (wei):", rewards.map(r => r.toString()));
    console.log("Yield Pool address:", await contract.yieldPool());

    const tx = await contract.connect(signer).distributeTopContributors(topUsers, rewards, { gasLimit: 1000000 });
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Raw receipt:", receipt);
    if (!receipt || !receipt.transactionHash) {
      throw new Error("Invalid receipt: transactionHash missing");
    }
    console.log("Transaction confirmed:", receipt.transactionHash);
    return receipt;
  } catch (error) {
    console.error("Distribute top contributors error:", error);
    throw new Error(`Distribution failed: ${error.message || error}`);
  }
}

export async function getUserStake(contract, userAddress, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider, userAddress, false);
  try {
    const userStake = await contract.stakes(userAddress);
    return {
      amount: ethers.formatEther(userStake.amount),
      lastStakedTime: userStake.lastStakedTime.toString(),
      githubUsername: userStake.githubUsername,
    };
  } catch (error) {
    console.error("Get user stake error:", error);
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

export async function getRewardBalance(rewardContractRead, isConnected, provider) {
  ensureContractReady(rewardContractRead, isConnected, null, provider, rewardContractAddress, false);
  try {
    const rewards = await rewardContractRead.getRewardBalance();
    return ethers.formatEther(rewards);
  } catch (error) {
    console.error("Get reward balance error:", error);
    throw error;
  }
}