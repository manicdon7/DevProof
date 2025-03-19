import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  useContracts,
  stakeTokens,
  unstakeTokens,
  claimRewards,
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
    yieldContract,
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
  const [COREBalance, setCOREBalance] = useState(null);
  const [totalStaked, setTotalStaked] = useState(null);
  const [weeklyRewards, setWeeklyRewards] = useState(null);
  const [yieldPoolValue, setYieldPoolValue] = useState(null);
  const [penaltyInfo, setPenaltyInfo] = useState(null);
  const [txInfo, setTxInfo] = useState(null);

  const ensureWalletConnected = () => {
    if (!isConnected || !address) {
      // toast.error("Please connect your wallet.");
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
    if (!stakingContract || !signer || !provider || !stakingContractRead || !rewardContractRead || !yieldContract) {
      toast.error("Contracts, signer, or provider not initialized. Please reconnect your wallet.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!ensureWalletConnected()) return;

      try {
        const balance = await provider.getBalance(address);
        setCOREBalance(ethers.formatEther(balance));

        const userStake = await getUserStake(stakingContractRead, address, isConnected, provider);
        const stakedAmount = ethers.formatEther(userStake.amount);
        setStakeDetails({
          amount: stakedAmount,
          lastStakedTime: Number(userStake.lastStakedTime),
        });

        const total = await getTotalStaked(stakingContractRead, isConnected, provider);
        setTotalStaked(total);

        const reward = await getRewardBalance(stakingContractRead, address, isConnected, provider); // Use stakingContractRead
        setWeeklyRewards(reward);

        try {
          const yieldValue = await provider.getBalance(yieldContract.target);
          setYieldPoolValue(ethers.formatEther(yieldValue));
        } catch (err) {
          console.warn("Yield pool value fetch failed:", err);
          setYieldPoolValue("0");
        }

        if (BigInt(userStake.amount) > 0n) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeSinceStake = currentTime - Number(userStake.lastStakedTime);
          const minStakePeriod = Number(await stakingContractRead.MIN_STAKE_PERIOD());
          if (timeSinceStake < minStakePeriod) {
            const penaltyRate = await stakingContractRead.PENALTY_RATE();
            const penalty = (BigInt(userStake.amount) * BigInt(penaltyRate)) / 10000n;
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
  }, [stakingContractRead, rewardContractRead, yieldContract, address, isConnected, provider, contractsLoading]);

  const showTxInfo = (message, hash) => {
    setTxInfo({ message, hash });
    setTimeout(() => setTxInfo(null), 5000); // Hide after 5 seconds
  };

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
      toast.success(`Successfully staked ${amount} CORE!`);
      showTxInfo(`Staked ${amount} CORE`, receipt.hash);
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
        `Warning: Unstaking now incurs a ${penaltyInfo.penaltyRate}% penalty (${penaltyInfo.penalty} CORE). Wait ${penaltyInfo.daysLeft} day(s) for no penalty. Proceed?`
      );
      if (!confirmUnstake) return;
    }

    setLoading(true);
    try {
      const receipt = await unstakeTokens(stakingContract, amount, isConnected, signer, provider, address);
      toast.success(`Successfully unstaked ${amount} CORE!`);
      showTxInfo(`Unstaked ${amount} CORE`, receipt.hash);
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

    if (!weeklyRewards || parseFloat(weeklyRewards) <= 0) {
      toast.info("No rewards available to claim.");
      return;
    }

    setLoading(true);
    try {
      const receipt = await claimRewards(stakingContract, isConnected, signer, provider, address);
      toast.success(`Rewards claimed: ${weeklyRewards} CORE!`);
      showTxInfo(`Claimed ${weeklyRewards} CORE`, receipt.hash);
      await refreshData();
    } catch (error) {
      console.error("Claiming rewards error:", error);
      if (error.code === "ACTION_REJECTED") {
        toast.info("Transaction rejected by user.");
      } else if (error.message.includes("Insufficient pool balance")) {
        toast.error("Claim failed: Insufficient reward pool balance. Contact support.");
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
      setCOREBalance(ethers.formatEther(balance));

      const userStake = await getUserStake(stakingContractRead, address, isConnected, provider);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: Number(userStake.lastStakedTime),
      });

      const total = await getTotalStaked(stakingContractRead, isConnected, provider);
      setTotalStaked(total);

      const reward = await getRewardBalance(stakingContractRead, address, isConnected, provider);
      setWeeklyRewards(reward);

      try {
        const yieldValue = await provider.getBalance(yieldContract.target);
        setYieldPoolValue(ethers.formatEther(yieldValue));
      } catch (err) {
        console.warn("Could not get yield pool value:", err);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse bg-gray-600 h-6 w-24 rounded-md"></div>
  );

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white font-lexend py-12">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl font-rubik font-bold text-[#ff9211] drop-shadow-lg">
            CORE Staking Hub
          </h1>
          <p className="text-gray-300 mt-2 text-lg">
            Maximize your CORE earnings with secure staking on the CORE Testnet.
          </p>
        </div>

        {/* Transaction Info Popup */}
        {txInfo && (
          <div className="fixed top-4 right-4 bg-[#1c1c1c] p-4 rounded-lg shadow-lg border border-[#ff9211]/30 animate-fade-in">
            <p className="text-gray-300">{txInfo.message}</p>
            <p className="text-[#ff9211] text-sm mt-1">
              Tx Hash: {txInfo.hash.slice(0, 6)}...{txInfo.hash.slice(-4)}
            </p>
          </div>
        )}

        {/* Main Dashboard */}
        {contractsLoading ? (
          <div className="text-center text-gray-400 text-xl animate-pulse">Loading contracts...</div>
        ) : error ? (
          <div className="text-center text-[#ff9211] text-xl">Error: {error}</div>
        ) : !isConnected || !address ? (
          <div className="text-center text-gray-300 text-xl animate-fade-in">
            Please connect your wallet to access the staking dashboard.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel: Actions */}
            <div className="lg:col-span-1 bg-[#1c1c1c] p-6 rounded-xl shadow-2xl border border-[#ff9211]/20 animate-slide-up">
              <h2 className="text-2xl font-rubik font-semibold text-[#ff9211] mb-6">Stake Your CORE</h2>
              <div className="space-y-6">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (CORE)"
                  className="w-full px-4 py-3 bg-[#141414] text-white border border-[#ff9211]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 transition-all duration-300"
                  disabled={loading}
                />
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleStake}
                    className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-lg shadow-md hover:bg-[#e0820f] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Stake Now"}
                  </button>
                  <button
                    onClick={handleUnstake}
                    className="px-6 py-3 bg-transparent text-[#ff9211] border border-[#ff9211] font-rubik font-semibold rounded-lg hover:bg-[#ff9211]/10 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Unstake"}
                  </button>
                  <button
                    onClick={handleClaimRewards}
                    className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-lg shadow-md hover:bg-[#e0820f] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !weeklyRewards || parseFloat(weeklyRewards) <= 0}
                  >
                    {loading ? "Processing..." : "Claim Rewards"}
                  </button>
                </div>
              </div>
              {penaltyInfo?.penaltyApplies && (
                <div className="mt-4 text-yellow-400 text-sm animate-fade-in">
                  <p>⚠️ Penalty: {penaltyInfo.penalty} CORE ({penaltyInfo.penaltyRate}%)</p>
                  <p>Penalty-free in {penaltyInfo.daysLeft} day(s)</p>
                </div>
              )}
            </div>

            {/* Right Panel: Stats */}
            <div className="lg:col-span-2 bg-[#1c1c1c] p-6 rounded-xl shadow-2xl border border-[#ff9211]/20 animate-slide-up delay-100">
              <h2 className="text-2xl font-rubik font-semibold text-[#ff9211] mb-6">Staking Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#141414] p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <p className="text-gray-400 text-sm">Wallet Balance</p>
                  <div className="text-[#ff9211] text-xl font-semibold">
                    {COREBalance !== null ? (
                      `${parseFloat(COREBalance).toFixed(4)} CORE`
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <p className="text-gray-400 text-sm">Your Staked Amount</p>
                  <div className="text-[#ff9211] text-xl font-semibold">
                    {stakeDetails ? (
                      `${parseFloat(stakeDetails.amount).toFixed(4)} CORE`
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                  {stakeDetails?.lastStakedTime > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Last Staked: {new Date(stakeDetails.lastStakedTime * 1000).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="bg-[#141414] p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <p className="text-gray-400 text-sm">Total Staked in Pool</p>
                  <div className="text-[#ff9211] text-xl font-semibold">
                    {totalStaked !== null ? (
                      `${parseFloat(totalStaked).toFixed(4)} CORE`
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <p className="text-gray-400 text-sm">Available Rewards</p>
                  <div className="text-[#ff9211] text-xl font-semibold">
                    {weeklyRewards !== null ? (
                      `${parseFloat(weeklyRewards).toFixed(4)} CORE`
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414] p-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <p className="text-gray-400 text-sm">Yield Pool Value</p>
                  <div className="text-[#ff9211] text-xl font-semibold">
                    {yieldPoolValue !== null ? (
                      `${parseFloat(yieldPoolValue).toFixed(4)} CORE`
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Content Sections */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Staking Benefits */}
          <div className="bg-[#1c1c1c] p-6 rounded-xl shadow-2xl border border-[#ff9211]/20 animate-slide-up delay-200">
            <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-4">Why Stake CORE?</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">✔</span> Earn passive rewards weekly
              </li>
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">✔</span> Secure your tokens on the CORE Testnet
              </li>
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">✔</span> Contribute to network stability
              </li>
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#1c1c1c] p-6 rounded-xl shadow-2xl border border-[#ff9211]/20 animate-slide-up delay-300">
            <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-4">Quick Stats</h3>
            <div className="text-gray-300 space-y-2">
              <p>Network: CORE Testnet (Chain ID: 1114)</p>
              <p>Minimum Stake Period: {penaltyInfo ? `${penaltyInfo.daysLeft} days` : "N/A"}</p>
              <p>Reward Rate: 5% (example rate)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm animate-fade-in">
          <p>
            Need assistance?{" "}
            <a href="mailto:dev.proof.reward@gmail.com" className="text-[#ff9211] hover:underline">
              Contact Support
            </a>
          </p>
          <p className="mt-2">© 2025 CORE Staking Platform. All rights reserved.</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </section>
  );
};

export default Stake;