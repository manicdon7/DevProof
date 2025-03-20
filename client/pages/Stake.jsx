import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  useContracts,
  stakeTokens,
  unstakeTokens,
  distributeTopContributors,
  getUserStake,
  getTotalStaked,
  getRewardBalance,
} from "../utils/ContractIntegration";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Stake = () => {
  const navigate = useNavigate();
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

  const storedUserRaw = sessionStorage.getItem("currentUser");
  const [githubUsername, setGithubUsername] = useState(storedUserRaw || "");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stakeDetails, setStakeDetails] = useState(null);
  const [COREBalance, setCOREBalance] = useState(null);
  const [totalStaked, setTotalStaked] = useState(null);
  const [weeklyRewards, setWeeklyRewards] = useState(null);
  const [yieldPoolValue, setYieldPoolValue] = useState(null);
  const [penaltyInfo, setPenaltyInfo] = useState(null);
  const [txInfo, setTxInfo] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [topUsers, setTopUsers] = useState(""); // Input for top users (comma-separated addresses)
  const [rewards, setRewards] = useState(""); // Input for rewards (comma-separated amounts in tCORE)

  const ensureWalletConnected = () => {
    if (!isConnected || !address) {
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
    if (
      !stakingContract ||
      !signer ||
      !provider ||
      !stakingContractRead ||
      !rewardContractRead ||
      !yieldContract
    ) {
      toast.error("Contracts not initialized. Please reconnect your wallet.");
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

        const userStake = await getUserStake(
          stakingContractRead,
          address,
          isConnected,
          provider
        );
        setStakeDetails({
          amount: userStake.amount,
          lastStakedTime: Number(userStake.lastStakedTime),
          githubUsername: userStake.githubUsername,
        });

        if (userStake.githubUsername && userStake.githubUsername !== "") {
          setGithubUsername(userStake.githubUsername);
        }

        const total = await getTotalStaked(
          stakingContractRead,
          isConnected,
          provider
        );
        setTotalStaked(total);

        const reward = await getRewardBalance(
          rewardContractRead,
          isConnected,
          provider
        );
        setWeeklyRewards(reward);

        try {
          const yieldValue = await provider.getBalance(yieldContract.target);
          setYieldPoolValue(ethers.formatEther(yieldValue));
        } catch (err) {
          console.warn("Yield pool value fetch failed:", err);
          setYieldPoolValue("0");
        }

        if (Number(userStake.amount) > 0) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeSinceStake = currentTime - Number(userStake.lastStakedTime);
          const STAKE_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
          if (timeSinceStake < STAKE_PERIOD) {
            let penaltyRate = 5; // PENALTY_PERCENT from contract (5%)
            const penalty =
              (BigInt(ethers.parseEther(userStake.amount)) *
                BigInt(penaltyRate)) /
              BigInt(100);
            const daysLeft = Math.ceil((STAKE_PERIOD - timeSinceStake) / 86400);
            setPenaltyInfo({
              penalty: ethers.formatEther(penalty),
              penaltyRate: penaltyRate,
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
  }, [
    stakingContractRead,
    rewardContractRead,
    yieldContract,
    address,
    isConnected,
    provider,
    contractsLoading,
    refreshTrigger,
  ]);

  const showTxInfo = (message, hash) => {
    setTxInfo({ message, hash });
    setTimeout(() => setTxInfo(null), 5000);
  };

  const handleStake = async () => {
    if (!ensureWalletConnected()) return;

    if (!githubUsername) {
      toast.warn(
        "GitHub username is required. Please enter your GitHub username."
      );
      return;
    }
    const stakeAmount = parseFloat(amount);
    if (!amount || isNaN(stakeAmount) || stakeAmount < 0.01) {
      toast.warn("Please enter a valid amount (minimum 0.01 tCORE).");
      return;
    }

    setLoading(true);
    try {
      const receipt = await stakeTokens(
        stakingContract,
        githubUsername,
        isConnected,
        signer,
        provider,
        address,
        {
          value: ethers.parseEther(amount),
        }
      );
      toast.success(
        `Successfully staked ${amount} tCORE with GitHub: ${githubUsername}!`
      );
      showTxInfo(`Staked ${amount} tCORE`, receipt.transactionHash);

      const storedData = sessionStorage.getItem("dataStore");

      if (storedData) {
        const response = JSON.parse(storedData);

        try {
          const res = await axios.post(
            "https://dev-proof-backend.vercel.app/api/leaderboard",
            {
              wallet: response.wallet,
              username: response.userName,
              score: response.score ?? 0,
            }
          );

          if (res.data) {
            navigate("/leaderboard");
          }
        } catch (error) {
          console.error("Error submitting leaderboard:", error);
        }
      } else {
        console.error("No data found in sessionStorage");
      }

      setAmount("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Staking error:", error);
      toast.error(`Staking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!ensureWalletConnected()) return;

    try {
      if (!stakeDetails || parseFloat(stakeDetails.amount) <= 0) {
        toast.warn("No staked amount to unstake.");
        return;
      }

      if (penaltyInfo?.penaltyApplies) {
        const confirmUnstake = window.confirm(
          `Warning: Unstaking now incurs a ${penaltyInfo.penaltyRate}% penalty (${penaltyInfo.penalty} tCORE). Wait ${penaltyInfo.daysLeft} day(s) for no penalty. Proceed?`
        );
        if (!confirmUnstake) return;
      }

      setLoading(true);

      const amountInWei = ethers.parseEther(stakeDetails.amount);
      console.log(
        "Unstaking with address:",
        address,
        "Amount (wei):",
        amountInWei.toString()
      );
      const receipt = await unstakeTokens(
        stakingContract,
        isConnected,
        signer,
        provider,
        address,
        amountInWei
      );

      toast.success("Successfully unstaked your tCORE!");
      showTxInfo("Unstaked tCORE", receipt.transactionHash);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Unstaking error:", error);
      toast.error(
        `Unstaking failed: ${error.message || error.reason || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDistributeTopContributors = async () => {
    if (!ensureWalletConnected()) return;

    setLoading(true);
    try {
      if (!stakingContract || !signer) {
        throw new Error("Staking contract or signer not initialized.");
      }

      // Parse input fields
      const userArray = topUsers.split(",").map((u) => u.trim());
      const rewardArray = rewards
        .split(",")
        .map((r) => ethers.parseEther(r.trim()));

      if (
        userArray.length === 0 ||
        rewardArray.length === 0 ||
        userArray.length !== rewardArray.length
      ) {
        throw new Error(
          "Invalid input: Ensure top users and rewards match and are non-empty."
        );
      }

      // Validate addresses
      userArray.forEach((user) => {
        if (!ethers.isAddress(user)) {
          throw new Error(`Invalid address: ${user}`);
        }
      });

      // Check if caller is owner
      const owner = await stakingContract.owner();
      console.log("Contract owner:", owner);
      console.log("Current address:", address);
      if (address.toLowerCase() !== owner.toLowerCase()) {
        throw new Error("Only the contract owner can distribute rewards.");
      }

      // Check staking status
      for (const user of userArray) {
        const stake = await stakingContract.stakes(user);
        if (stake.amount === 0n) {
          throw new Error(`User ${user} is not staking`);
        }
      }

      console.log("Distributing to:", userArray);
      console.log(
        "Rewards (wei):",
        rewardArray.map((r) => r.toString())
      );

      const receipt = await distributeTopContributors(
        stakingContract,
        isConnected,
        signer,
        provider,
        address,
        userArray,
        rewardArray
      );
      console.log("Transaction confirmed with hash:", receipt.transactionHash);

      toast.success(
        `Distributed rewards to ${userArray.length} top contributors! Transaction Hash: ${receipt.transactionHash}`
      );
      showTxInfo("Rewards Distributed", receipt.transactionHash);
      setRefreshTrigger((prev) => prev + 1);
      setTopUsers("");
      setRewards("");
    } catch (error) {
      console.error("Distribute top contributors error:", error);
      toast.error(
        `Distribution failed: ${
          error.message || error.reason || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGithubUsernameChange = (e) => {
    setGithubUsername(e.target.value);
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse bg-[#ff9211]/20 h-6 w-24 rounded-full"></div>
  );

  return (
    <section className="min-h-screen bg-[#0f0f0f] text-white font-lexend py-16 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-rubik font-extrabold bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent tracking-tight">
            Stake on DevProof
          </h1>
          <p className="mt-3 text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
            Lock your tCORE and amplify your open-source impact on the CORE
            Testnet.
          </p>
        </motion.div>

        {txInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-[#1a1a1a] p-4 rounded-xl shadow-2xl border border-[#ff9211]/50 z-50"
          >
            <p className="text-gray-200 font-medium">{txInfo.message}</p>
            <a
              href={`https://testnet.coredao.org/tx/${txInfo.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9211] text-sm mt-2 block hover:underline"
            >
              Tx: {txInfo.hash.slice(0, 6)}...{txInfo.hash.slice(-4)}
            </a>
          </motion.div>
        )}

        {contractsLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-16 h-16 border-4 border-[#ff9211]/20 border-t-[#ff9211] rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xl mt-4">
              Stake and Contribute for Rewards...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-[#1a1a1a]/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#ff9211]/40">
            <div className="text-[#ff9211] text-5xl mb-4">⚠️</div>
            <div className="text-center text-[#ff9211] text-xl font-semibold mb-2">
              Contract Error
            </div>
            <p className="text-gray-400 max-w-lg mx-auto">{error}</p>
          </div>
        ) : !isConnected || !address ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-[#1a1a1a]/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#ff9211]/40"
          >
            <div className="text-[#ff9211] text-5xl mb-4">🔌</div>
            <div className="text-gray-300 text-xl font-medium mb-2">
              Wallet Not Connected
            </div>
            <p className="text-gray-400 max-w-lg mx-auto">
              Connect your wallet to stake tCORE and join DevProof.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#ff9211]/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff9211]/10 to-[#e0820f]/10 opacity-50"></div>
              <h2 className="text-3xl font-rubik font-bold text-[#ff9211] mb-6 relative z-10">
                Staking Controls
              </h2>
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={handleGithubUsernameChange}
                    placeholder="Enter your GitHub username"
                    className="w-full px-4 py-3 bg-[#141414] text-gray-200 border border-[#ff9211]/60 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 transition-all duration-300"
                    disabled={
                      loading ||
                      (stakeDetails && parseFloat(stakeDetails.amount) > 0)
                    }
                  />
                  {stakeDetails && parseFloat(stakeDetails.amount) > 0 && (
                    <p className="text-gray-400 text-xs mt-1">
                      GitHub username locked while staking
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Stake Amount (tCORE)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 0.01 tCORE"
                    className="w-full px-4 py-3 bg-[#141414] text-white border border-[#ff9211]/60 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 transition-all duration-300"
                    min="0.01"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Top Users (comma-separated addresses)
                  </label>
                  <input
                    type="text"
                    value={topUsers}
                    onChange={(e) => setTopUsers(e.target.value)}
                    placeholder="0x123..., 0x456..."
                    className="w-full px-4 py-3 bg-[#141414] text-white border border-[#ff9211]/60 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Rewards (comma-separated tCORE amounts)
                  </label>
                  <input
                    type="text"
                    value={rewards}
                    onChange={(e) => setRewards(e.target.value)}
                    placeholder="1.5, 2.0..."
                    className="w-full px-4 py-3 bg-[#141414] text-white border border-[#ff9211]/60 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <motion.button
                    onClick={handleStake}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:from-[#e0820f] hover:to-[#d17b0e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      loading ||
                      !githubUsername ||
                      !amount ||
                      parseFloat(amount) < 0.01
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#0f0f0f] border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Stake tCORE"
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleUnstake}
                    className="px-6 py-3 bg-transparent text-[#ff9211] border-2 border-[#ff9211] font-rubik font-semibold rounded-full hover:bg-[#ff9211]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      loading ||
                      !stakeDetails ||
                      parseFloat(stakeDetails.amount) <= 0
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#ff9211] border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Unstake"
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleDistributeTopContributors}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:from-[#e0820f] hover:to-[#d17b0e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || !topUsers || !rewards}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#0f0f0f] border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Distribute Rewards"
                    )}
                  </motion.button>
                </div>
                {penaltyInfo?.penaltyApplies && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-yellow-400 text-sm bg-[#ff9211]/10 p-3 rounded-lg"
                  >
                    <p>
                      ⚠️ Penalty: {penaltyInfo.penalty} tCORE (
                      {penaltyInfo.penaltyRate}%)
                    </p>
                    <p>Penalty-free in {penaltyInfo.daysLeft} day(s)</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Rest of the JSX remains unchanged */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-7 bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-[#ff9211]/40 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tl from-[#ff9211]/10 to-[#e0820f]/10 opacity-50"></div>
              <h2 className="text-3xl font-rubik font-bold text-[#ff9211] mb-6 relative z-10">
                Staking Dashboard
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                <div className="bg-[#141414]/80 p-5 rounded-xl hover:bg-[#ff9211]/10 transition-all duration-300 group">
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    Wallet Balance
                  </p>
                  <div className="text-[#ff9211] text-lg font-semibold mt-2">
                    {COREBalance !== null ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {parseFloat(COREBalance).toFixed(4)} tCORE
                      </motion.div>
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414]/80 p-5 rounded-xl hover:bg-[#ff9211]/10 transition-all duration-300 group">
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    Staked Amount
                  </p>
                  <div className="text-[#ff9211] text-lg font-semibold mt-2">
                    {stakeDetails ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {parseFloat(stakeDetails.amount).toFixed(4)} tCORE
                      </motion.div>
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                  {stakeDetails?.githubUsername && (
                    <p className="text-gray-500 text-xs mt-1">
                      GitHub: {stakeDetails.githubUsername}
                    </p>
                  )}
                </div>
                <div className="bg-[#141414]/80 p-5 rounded-xl hover:bg-[#ff9211]/10 transition-all duration-300 group">
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    Total Staked
                  </p>
                  <div className="text-[#ff9211] text-lg font-semibold mt-2">
                    {totalStaked !== null ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {parseFloat(totalStaked).toFixed(4)} tCORE
                      </motion.div>
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414]/80 p-5 rounded-xl hover:bg-[#ff9211]/10 transition-all duration-300 group">
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    Rewards Available
                  </p>
                  <div className="text-[#ff9211] text-lg font-semibold mt-2">
                    {weeklyRewards !== null ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {parseFloat(weeklyRewards).toFixed(4)} tCORE
                      </motion.div>
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
                <div className="bg-[#141414]/80 p-5 rounded-xl hover:bg-[#ff9211]/10 transition-all duration-300 group">
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                    Yield Pool
                  </p>
                  <div className="text-[#ff9211] text-lg font-semibold mt-2">
                    {yieldPoolValue !== null ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {parseFloat(yieldPoolValue).toFixed(4)} tCORE
                      </motion.div>
                    ) : (
                      <SkeletonLoader />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
        >
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-[#ff9211]/40">
            <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-4">
              Staking Benefits
            </h3>
            <ul className="text-gray-300 space-y-3 text-sm">
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">→</span> Earn rewards
                based on your contributions
              </li>
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">→</span> Support the CORE
                Testnet ecosystem
              </li>
              <li className="flex items-center">
                <span className="text-[#ff9211] mr-2">→</span> Flexible staking
                with a minimum of 0.01 tCORE
              </li>
            </ul>
          </div>
          <div className="bg-[#1a1a1a]/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-[#ff9211]/40">
            <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-4">
              Explore More
            </h3>
            <div className="text-gray-300 space-y-3 text-sm">
              <p>
                <a href="/dashboard" className="text-[#ff9211] hover:underline">
                  Dashboard
                </a>{" "}
                - Track your progress
              </p>
              <p>
                <a
                  href="/leaderboard"
                  className="text-[#ff9211] hover:underline"
                >
                  Leaderboard
                </a>{" "}
                - Compete with others
              </p>
              <p>Network: tCORE Testnet (Chain ID: 1114)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center text-gray-400 text-sm relative z-10"
        >
          <p>
            Questions?{" "}
            <a
              href="mailto:dev.proof.reward@gmail.com"
              className="text-[#ff9211] hover:underline"
            >
              Reach out to support
            </a>
          </p>
          <p className="mt-2">© 2025 DevProof - Powered by CORE Testnet</p>
        </motion.div>

        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#ff9211]/20 rounded-full blur-3xl animate-pulse opacity-30" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#e0820f]/20 rounded-full blur-3xl animate-pulse opacity-30" />
        </div>
      </div>
      {txInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 bg-[#1a1a1a] p-4 rounded-xl shadow-2xl border border-[#ff9211]/50 z-50"
        >
          <p className="text-gray-200 font-medium">{txInfo.message}</p>
          {txInfo.hash ? (
            <a
              href={`https://scan.test2.btcs.network/tx/${txInfo.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9211] text-sm mt-2 block hover:underline"
            >
              Tx: {txInfo.hash.slice(0, 6)}...{txInfo.hash.slice(-4)}
            </a>
          ) : (
            <p className="text-[#ff9211] text-sm mt-2">
              Transaction hash unavailable
            </p>
          )}
        </motion.div>
      )}
    </section>
  );
};

export default Stake;

const SkeletonLoader = () => (
  <div className="animate-pulse bg-[#ff9211]/20 h-6 w-24 rounded-full"></div>
);
