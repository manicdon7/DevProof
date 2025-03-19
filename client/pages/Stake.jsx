import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  useContracts,
  stakeTokens,
  unstakeTokens,
  getUserStake,
  getTotalStaked,
  getRewardBalance,
} from "../utils/ContractIntegration";
import { toast } from "react-toastify";

const Stake = () => {
  const {
    stakingContract,
    stakingContractRead,
    rewardContractRead,
    signer,
    provider,
    address,
    isConnected,
    isLoading: contractsLoading,
    error,
  } = useContracts();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stakeDetails, setStakeDetails] = useState(null);
  const [tcoreBalance, setTcoreBalance] = useState(null);
  const [totalStaked, setTotalStaked] = useState(null);
  const [weeklyRewards, setWeeklyRewards] = useState(null);
  const [yieldPoolValue, setYieldPoolValue] = useState(null);
  const [penaltyInfo, setPenaltyInfo] = useState(null);

  const ensureWalletConnected = () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet.");
      return false;
    }
    if (contractsLoading) {
      toast.info("Contracts are loading...");
      return false;
    }
    if (error) {
      toast.error(`Contract error: ${error}`);
      return false;
    }
    if (!stakingContract || !signer || !provider || !stakingContractRead || !rewardContractRead) {
      toast.error("Contracts, signer, or provider not initialized. Please reconnect your wallet.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!ensureWalletConnected()) return;

      try {
        // Fetch wallet balance
        const balance = await provider.getBalance(address);
        setTcoreBalance(ethers.formatEther(balance));

        // Fetch user stake
        const userStake = await getUserStake(stakingContractRead, address, isConnected, provider);
        const stakedAmount = ethers.formatEther(userStake.amount);
        setStakeDetails({
          amount: stakedAmount,
          lastStakedTime: Number(userStake.lastStakedTime),
        });

        // Fetch total staked
        const total = await getTotalStaked(stakingContractRead, isConnected, provider);
        setTotalStaked(total);

        // Fetch rewards balance
        const reward = await getRewardBalance(rewardContractRead, address, isConnected, provider);
        setWeeklyRewards(reward);

        // Fetch yield pool value (placeholder contract address)
        try {
          const yieldValue = await provider.getBalance("0xA87e632f680A458b9eFb319a2448bC45E6C52117");
          setYieldPoolValue(ethers.formatEther(yieldValue));
        } catch (err) {
          console.warn("Yield pool value not available:", err);
          setYieldPoolValue("0");
        }

        // Penalty calculation
        if (userStake.amount > 0n) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeSinceStake = currentTime - Number(userStake.lastStakedTime);
          const minStakePeriod = Number(await stakingContractRead.MIN_STAKE_PERIOD());
          if (timeSinceStake < minStakePeriod) {
            const penaltyRate = await stakingContractRead.PENALTY_RATE();
            const penalty = (userStake.amount * penaltyRate) / 10000n;
            const daysLeft = Math.ceil((minStakePeriod - timeSinceStake) / 86400);
            setPenaltyInfo({
              penalty: ethers.formatEther(penalty),
              penaltyRate: Number(penaltyRate) / 100,
              daysLeft,
              penaltyApplies: true,
            });
          } else {
            setPenaltyInfo(null);
          }
        } else {
          setPenaltyInfo(null);
        }
      } catch (err) {
        console.error("Fetch data error:", err);
        toast.error(`Failed to fetch data: ${err.message}`);
      }
    };

    fetchData();
  }, [stakingContractRead, rewardContractRead, address, isConnected, provider, contractsLoading]);

  const handleStake = async () => {
    if (!ensureWalletConnected() || !amount) {
      if (!amount) toast.warn("Please enter an amount to stake.");
      return;
    }

    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      toast.warn("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const receipt = await stakeTokens(stakingContract, amount, isConnected, signer, provider, address);
      toast.success(`Successfully staked ${amount} tCORE! Tx: ${receipt.hash.slice(0, 6)}...`);
      await refreshData();
      setAmount("");
    } catch (error) {
      console.error("Staking error:", error);
      toast.error(`Staking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!ensureWalletConnected() || !amount) {
      if (!amount) toast.warn("Please enter an amount to unstake.");
      return;
    }

    const unstakeAmount = parseFloat(amount);
    if (isNaN(unstakeAmount) || unstakeAmount <= 0) {
      toast.warn("Please enter a valid amount greater than 0.");
      return;
    }

    if (penaltyInfo?.penaltyApplies) {
      const confirmUnstake = window.confirm(
        `Warning: Unstaking now incurs a ${penaltyInfo.penaltyRate}% penalty (${penaltyInfo.penalty} tCORE). Wait ${penaltyInfo.daysLeft} day(s) for no penalty. Proceed?`
      );
      if (!confirmUnstake) return;
    }

    setLoading(true);
    try {
      const receipt = await unstakeTokens(stakingContract, amount, isConnected, signer, provider);
      toast.success(`Successfully unstaked ${amount} tCORE! Tx: ${receipt.hash.slice(0, 6)}...`);
      await refreshData();
      setAmount("");
    } catch (error) {
      console.error("Unstaking error:", error);
      toast.error(`Unstaking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!ensureWalletConnected()) return;

    // if (!weeklyRewards || parseFloat(weeklyRewards) <= 0) {
    //   toast.info("No rewards available to claim.");
    //   return;
    // }

    setLoading(true);
    try {
      // Assuming stakingContract has a claimReward method
      const tx = await stakingContract.claimReward();
      toast.info(`Claim transaction submitted: ${tx.hash.slice(0, 6)}...`);
      const receipt = await tx.wait();
      toast.success(`Rewards claimed! Tx: ${receipt.hash.slice(0, 6)}...`);
      await refreshData();
    } catch (error) {
      console.error("Claiming rewards error:", error);
      if (error.code === "ACTION_REJECTED") {
        toast.info("Transaction rejected by user.");
      } else if (error.message.includes("No rewards")) {
        toast.error("No rewards available to claim.");
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient gas to claim rewards.");
      } else {
        toast.error(`Claim failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!ensureWalletConnected()) return;

    try {
      const balance = await provider.getBalance(address);
      setTcoreBalance(ethers.formatEther(balance));

      const userStake = await getUserStake(stakingContractRead, address, isConnected, provider);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: Number(userStake.lastStakedTime),
      });

      const total = await getTotalStaked(stakingContractRead, isConnected, provider);
      setTotalStaked(total);

      const reward = await getRewardBalance(rewardContractRead, address, isConnected, provider);
      setWeeklyRewards(reward);

      try {
        const yieldValue = await provider.getBalance("0xA87e632f680A458b9eFb319a2448bC45E6C52117");
        setYieldPoolValue(ethers.formatEther(yieldValue));
      } catch (err) {
        console.warn("Could not get yield pool value:", err);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
  );

  return (
    <section className="min-h-screen bg-[#0f0f0f] text-white font-lexend flex flex-col">
      <div className="flex-grow container mx-auto px-6 py-12">
        {contractsLoading ? (
          <p className="text-center text-gray-400 text-xl">Loading contracts...</p>
        ) : error ? (
          <p className="text-center text-[#ff9211] text-xl">Error: {error}</p>
        ) : !isConnected || !address ? (
          <p className="text-center text-gray-300 text-xl">
            Please connect your wallet to access the staking dashboard.
          </p>
        ) : (
          <div className="w-full bg-[#1a1a1a] p-8 rounded-xl shadow-xl border border-[#ff9211]/30">
            <h2 className="text-4xl font-rubik font-bold text-center mb-8 text-[#ff9211]">
              tCORE Staking Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Left Panel: Wallet & Stake Info */}
              <div className="bg-[#141414] p-6 rounded-lg border border-[#ff9211]/20">
                <p className="text-gray-300 text-sm mb-2">
                  Connected: <span className="text-[#ff9211]">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">tCORE Balance</p>
                    <p className="text-[#ff9211] text-2xl font-semibold">
                      {tcoreBalance !== null ? (
                        `${parseFloat(tcoreBalance).toFixed(4)} tCORE`
                      ) : (
                        <SkeletonLoader />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Your Staked Amount</p>
                    <p className="text-[#ff9211] text-2xl font-semibold">
                      {stakeDetails ? (
                        `${parseFloat(stakeDetails.amount).toFixed(4)} tCORE`
                      ) : (
                        <SkeletonLoader />
                      )}
                    </p>
                    {stakeDetails?.lastStakedTime > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        Last Staked: {new Date(stakeDetails.lastStakedTime * 1000).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {penaltyInfo?.penaltyApplies && (
                    <div className="text-yellow-400 text-sm mt-2">
                      <p>⚠️ Penalty: {penaltyInfo.penalty} tCORE ({penaltyInfo.penaltyRate}%)</p>
                      <p>Penalty-free in {penaltyInfo.daysLeft} day(s)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel: Pool & Rewards Info */}
              <div className="bg-[#141414] p-6 rounded-lg border border-[#ff9211]/20">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Staked in Pool</p>
                    <p className="text-[#ff9211] text-2xl font-semibold">
                      {totalStaked !== null ? (
                        `${parseFloat(totalStaked).toFixed(4)} tCORE`
                      ) : (
                        <SkeletonLoader />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Available Rewards</p>
                    <p className="text-[#ff9211] text-2xl font-semibold">
                      {weeklyRewards !== null ? (
                        `${parseFloat(weeklyRewards).toFixed(4)} tCORE`
                      ) : (
                        <SkeletonLoader />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Yield Pool Value</p>
                    <p className="text-[#ff9211] text-2xl font-semibold">
                      {yieldPoolValue !== null ? (
                        `${parseFloat(yieldPoolValue).toFixed(4)} tCORE`
                      ) : (
                        <SkeletonLoader />
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (tCORE)"
                  className="w-full px-4 py-3 bg-[#0f0f0f] text-white border border-[#ff9211]/50 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 text-center"
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleStake}
                  className="px-8 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Stake"}
                </button>
                <button
                  onClick={handleUnstake}
                  className="px-8 py-3 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 font-rubik font-semibold rounded-full hover:bg-[#1a1a1a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Unstake"}
                </button>
                <button
                  onClick={handleClaimRewards}
                  className="px-8 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !weeklyRewards || parseFloat(weeklyRewards) <= 0}
                >
                  {loading ? "Processing..." : "Claim Rewards"}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-10 text-center text-gray-400 text-sm">
              <p>Staking on tCORE Testnet (Chain ID: 1114)</p>
              <p className="mt-2">
                Need help?{" "}
                <a href="mailto:dev.proof.reward@gmail.com" className="text-[#ff9211] hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Stake;