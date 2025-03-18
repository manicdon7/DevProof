import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useContracts, stakeTokens, unstakeTokens, claimRewards, getUserStake } from "../utils/ContractIntegration";
import { useWalletClient } from "wagmi";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Stake = () => {
  const { stakingContract, address, isConnected, isLoading: contractsLoading, error } = useContracts();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stakeDetails, setStakeDetails] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);

  // Ensure wallet is connected before performing actions
  const ensureWalletConnected = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to perform this action.");
      return false;
    }
    if (contractsLoading) {
      toast.info("Contracts are still loading...");
      return false;
    }
    if (error) {
      toast.error(`Contract error: ${error}`);
      return false;
    }
    if (!stakingContract || !walletClient) {
      toast.error("Staking contract or wallet client not initialized.");
      return false;
    }
    return true;
  };

  // Fetch staking token balance and user stake on mount or address change
  useEffect(() => {
    const fetchData = async () => {
      if (!ensureWalletConnected()) return;

      try {
        // Get staking token contract
        const stakingTokenAddress = await stakingContract.stakingToken();
        const tokenAbi = [
          "function balanceOf(address) view returns (uint256)",
          "function approve(address,uint256) returns (bool)",
          "function allowance(address,address) view returns (uint256)",
        ];
        const stakingToken = new ethers.Contract(stakingTokenAddress, tokenAbi, walletClient);

        // Fetch token balance
        const balance = await stakingToken.balanceOf(address);
        setTokenBalance(ethers.formatEther(balance));

        // Fetch user stake
        const userStake = await getUserStake(stakingContract, address, isConnected);
        setStakeDetails({
          amount: ethers.formatEther(userStake.amount),
          lastStakedTime: userStake.lastStakedTime.toString(),
        });
      } catch (err) {
        toast.error(`Failed to fetch data: ${err.message}`);
      }
    };

    fetchData();
  }, [stakingContract, address, isConnected, walletClient]);

  const handleStake = async () => {
    if (!ensureWalletConnected() || !amount) {
      if (!amount) toast.warn("Please enter an amount to stake.");
      return;
    }
    setLoading(true);
    try {
      const stakeAmount = ethers.parseEther(amount);
      toast.info(`Staking amount: ${ethers.formatEther(stakeAmount)} tokens`);

      // Get staking token contract
      const stakingTokenAddress = await stakingContract.stakingToken();
      const tokenAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function approve(address,uint256) returns (bool)",
        "function allowance(address,address) view returns (uint256)",
      ];
      const stakingToken = new ethers.Contract(stakingTokenAddress, tokenAbi, walletClient);

      // Check balance
      const balance = await stakingToken.balanceOf(address);
      if (balance < stakeAmount) {
        toast.error("Insufficient token balance to stake.");
        setLoading(false);
        return;
      }

      // Check and approve allowance
      const stakingAddress = stakingContract.target;
      const allowance = await stakingToken.allowance(address, stakingAddress);
      if (allowance < stakeAmount) {
        toast.info("Approving staking contract to spend tokens...");
        const approveTx = await stakingToken.approve(stakingAddress, stakeAmount);
        await approveTx.wait();
        toast.success(`Approval successful, tx hash: ${approveTx.hash}`);
      } else {
        toast.info("Sufficient allowance already exists.");
      }

      // Stake tokens
      toast.info("Staking tokens...");
      const tx = await stakeTokens(stakingContract, amount, isConnected);
      toast.info("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      toast.success(`Staked ${amount} tokens successfully! Tx: ${receipt.hash.slice(0, 6)}...`);

      // Update stake details
      const userStake = await getUserStake(stakingContract, address, isConnected);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: userStake.lastStakedTime.toString(),
      });
      setTokenBalance(ethers.formatEther(await stakingToken.balanceOf(address)));
      setAmount("");
    } catch (error) {
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
    setLoading(true);
    try {
      const unstakeAmount = ethers.parseEther(amount);
      toast.info(`Unstaking amount: ${ethers.formatEther(unstakeAmount)} tokens`);

      // Unstake tokens
      const tx = await unstakeTokens(stakingContract, amount, isConnected);
      toast.info("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      toast.success(`Unstaked ${amount} tokens successfully! Tx: ${receipt.hash.slice(0, 6)}...`);

      // Update stake details and balance
      const stakingTokenAddress = await stakingContract.stakingToken();
      const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const stakingToken = new ethers.Contract(stakingTokenAddress, tokenAbi, walletClient);
      const userStake = await getUserStake(stakingContract, address, isConnected);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: userStake.lastStakedTime.toString(),
      });
      setTokenBalance(ethers.formatEther(await stakingToken.balanceOf(address)));
      setAmount("");
    } catch (error) {
      toast.error(`Unstaking failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!ensureWalletConnected()) return;
    setLoading(true);
    try {
      toast.info("Claiming rewards...");
      const tx = await claimRewards(stakingContract, isConnected);
      toast.info("Waiting for transaction to be mined...");
      const receipt = await tx.wait();
      toast.success(`Rewards claimed successfully! Tx: ${receipt.hash.slice(0, 6)}...`);
    } catch (error) {
      toast.error(`Claiming rewards failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center font-lexend">
      <div className="container mx-auto px-6 py-12">
        {contractsLoading ? (
          <p className="text-center text-gray-400">Loading contracts...</p>
        ) : error ? (
          <p className="text-center text-[#ff9211]">Error: {error}</p>
        ) : !isConnected ? (
          <p className="text-center text-gray-300 text-lg">
            Please connect your wallet to access the staking dashboard.
          </p>
        ) : (
          <motion.div
            className="max-w-xl mx-auto bg-[#1a1a1a] p-8 rounded-xl shadow-xl border border-[#ff9211]/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-rubik font-bold text-center mb-6 text-[#ff9211]">
              Staking Dashboard
            </h2>
            <p className="text-center text-gray-300 mb-4">
              Connected: <span className="text-[#ff9211]">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </p>
            <p className="text-center text-gray-300 mb-8">
              Token Balance: <span className="text-[#ff9211]">{tokenBalance || "Loading..."} tokens</span>
              <br />
              Staked Amount: <span className="text-[#ff9211]">{stakeDetails ? stakeDetails.amount : "Loading..."} tokens</span>
            </p>

            <div className="space-y-6">
              {/* Input Field */}
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-[#0f0f0f] text-white border border-[#ff9211]/50 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff9211] placeholder-gray-500"
                  disabled={loading}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={handleStake}
                  className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Stake"}
                </motion.button>

                <motion.button
                  onClick={handleUnstake}
                  className="px-6 py-3 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 font-rubik font-semibold rounded-full hover:bg-[#1a1a1a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Unstake"}
                </motion.button>

                <motion.button
                  onClick={handleClaimRewards}
                  className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Claim Rewards"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Stake;