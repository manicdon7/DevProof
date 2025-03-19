import { ethers } from "ethers";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { parseAbi } from "viem";
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
  const { address, isConnected, connector } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient, isLoading: walletClientLoading, error: walletClientError } = useWalletClient();

  console.log("useContracts state:", {
    isConnected,
    walletClientLoading,
    walletClientExists: !!walletClient,
    walletClientError,
    connector: connector?.name,
    address,
    chainId: walletClient ? walletClient.chain?.id : "unknown",
  });

  if (!Array.isArray(StakingAbi) || !Array.isArray(RewardAbi) || !Array.isArray(YieldAbi)) {
    console.error("Invalid ABI format:", { StakingAbi, RewardAbi, YieldAbi });
    return { isConnected: false, isLoading: false, error: "Invalid contract ABI format" };
  }

  if (!isConnected || !address) {
    console.warn("Wallet not connected or address not available.");
    return { isConnected: false, isLoading: false, error: null };
  }

  if (walletClientLoading) {
    console.log("Wallet client still loading...");
    return { isConnected: true, isLoading: true, error: null };
  }

  if (walletClientError) {
    console.error("Wallet client error:", walletClientError);
    return { isConnected: true, isLoading: false, error: `Wallet client error: ${walletClientError.message}` };
  }

  if (!walletClient) {
    console.error("Wallet client not available after loading.", { connector: connector?.name, address });
    return { isConnected: true, isLoading: false, error: "Wallet client (signer) not available. Please reconnect your wallet." };
  }

  const currentChainId = walletClient.chain?.id;
  if (currentChainId !== EXPECTED_CHAIN_ID) {
    console.error("Chain mismatch:", { currentChainId, expectedChainId: EXPECTED_CHAIN_ID });
    return {
      isConnected: true,
      isLoading: false,
      error: `Please switch to tCORE testnet (Chain ID: ${EXPECTED_CHAIN_ID}). Current chain: ${currentChainId}`,
    };
  }

  try {
    const provider = publicClient; // viem PublicClient
    const signer = walletClient;   // viem WalletClient

    const stakingContract = new ethers.Contract(stakingContractAddress, StakingAbi, signer);
    const stakingContractRead = new ethers.Contract(stakingContractAddress, StakingAbi, provider); // For read-only
    const rewardContract = new ethers.Contract(rewardContractAddress, RewardAbi, signer);
    const yieldContract = new ethers.Contract(yieldContractAddress, YieldAbi, signer);

    console.log("Contracts initialized for address:", address);
    return {
      provider,
      signer,
      address,
      stakingContract,
      stakingContractRead, // Added for read-only operations
      rewardContract,
      yieldContract,
      isConnected: true,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error initializing contracts:", error);
    return { isConnected: true, isLoading: false, error: error.message };
  }
}

function ensureContractReady(contract, isConnected, signer, provider, address, requiresSigner = true) {
  if (!isConnected) throw new Error("Wallet must be connected.");
  if (!contract) throw new Error("Contract not initialized.");
  if (requiresSigner && (!signer || !signer.account?.address)) throw new Error("Signer not available or invalid.");
  if (!provider) throw new Error("Provider not available.");
  if (!address) throw new Error("Address not available.");
}

export async function stakeTokens(contract, amount, isConnected, signer, provider, fallbackAddress) {
  ensureContractReady(contract, isConnected, signer, provider, fallbackAddress, true);

  try {
    let userAddress = signer.account.address || fallbackAddress;
    console.log("Staking from address:", userAddress);

    if (!userAddress || typeof userAddress !== "string") {
      throw new Error("Invalid user address: " + userAddress);
    }

    const stakeAmount = ethers.parseEther(amount);
    console.log("Staking amount:", ethers.formatEther(stakeAmount), "tCORE2");

    console.log("Checking balance for address:", userAddress);
    const balance = await provider.getBalance({ address: userAddress });
    console.log("Wallet tCORE2 balance:", ethers.formatEther(balance), "tCORE2");

    if (balance < stakeAmount) {
      throw new Error("Insufficient tCORE balance to stake.");
    }

    console.log("Staking tokens...");
    const stakeTx = await contract.stake({ value: stakeAmount, gasLimit: 500000 });
    console.log("Waiting for transaction to be mined...");
    const receipt = await stakeTx.wait();
    console.log("Tokens staked! Transaction hash:", receipt.hash);

    const userStake = await contract.stakes(userAddress);
    console.log("Staked amount:", ethers.formatEther(userStake.amount), "tCORE");
    console.log("Last staked time:", userStake.lastStakedTime.toString());

    return receipt;
  } catch (error) {
    console.error("Error staking tokens:", error);
    throw error;
  }
}

export async function getUserStake(contract, userAddress, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider, userAddress, false);

  try {
    const stakingAbi = parseAbi([
      "function stakes(address) view returns (uint256 amount, uint256 lastStakedTime)",
    ]);
    const userStake = await provider.readContract({
      address: stakingContractAddress,
      abi: stakingAbi,
      functionName: "stakes",
      args: [userAddress],
    });
    console.log("Raw userStake from Viem:", userStake); // Debug raw response
    return {
      amount: userStake[0], // BigInt from Viem
      lastStakedTime: userStake[1], // BigInt from Viem
    };
  } catch (error) {
    console.error("Error fetching user stake:", error);
    throw error;
  }
}

export async function unstakeTokens(contract, amount, isConnected, signer, provider) {
  ensureContractReady(contract, isConnected, signer, provider);
  try {
    const stakeAmount = ethers.parseEther(amount);
    console.log("Unstaking amount:", ethers.formatEther(stakeAmount), "tCORE");

    const userAddress = signer.account.address;
    const userStake = await contract.stakes(userAddress);
    if (userStake.amount < stakeAmount) {
      throw new Error("Insufficient staked amount to unstake.");
    }

    console.log("Unstaking tokens...");
    const unstakeTx = await contract.unstake(stakeAmount, { gasLimit: 500000 });
    console.log("Waiting for transaction to be mined...");
    const receipt = await unstakeTx.wait();
    console.log("Unstaking successful! Transaction hash:", receipt.hash);

    return receipt;
  } catch (error) {
    console.error("Error unstaking tokens:", error);
    throw error;
  }
}

export async function claimRewards(contract, isConnected, signer, provider) {
  ensureContractReady(contract, isConnected, signer, provider);
  try {
    console.log("Claiming rewards...");
    const tx = await contract.claimReward({ gasLimit: 500000 });
    console.log("Waiting for transaction to be mined...");
    const receipt = await tx.wait();
    console.log("Rewards claimed successfully! Transaction hash:", receipt.hash);
    return receipt;
  } catch (error) {
    console.error("Error claiming rewards:", error);
    throw error;
  }
}

export async function getTotalStaked(contract, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider);
  try {
    const totalStaked = await contract.getTotalStaked();
    return totalStaked;
  } catch (error) {
    console.error("Error getting total staked:", error);
    throw error;
  }
}

// RewardDistribution doesn't have a rewardBalance function, so this is not applicable
export async function getRewardBalance(contract, userAddress, isConnected, provider) {
  ensureContractReady(contract, isConnected, null, provider);
  try {
    // Since RewardDistribution doesn't track balances, we can check contract balance as a proxy
    const balance = await provider.getBalance(rewardContractAddress);
    return balance;
  } catch (error) {
    console.error("Error getting reward balance:", error);
    throw error;
  }
}

// // No setRewardRate function exists in RewardDistribution
// export async function setRewardRate(contract, newRate, isConnected, signer, provider) {
//   throw new Error("setRewardRate is not supported by the RewardDistribution contract.");
// }

// // No setYieldRate function exists in YieldPool
// export async function setYieldRate(contract, newRate, isConnected, signer, provider) {
//   throw new Error("setYieldRate is not supported by the YieldPool contract.");
// }