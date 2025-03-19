import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useContracts, stakeTokens, unstakeTokens, claimRewards, getUserStake } from "../utils/ContractIntegration";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const Stake = () => {
  const { stakingContract, stakingContractRead, signer, provider, address, isConnected, isLoading: contractsLoading, error } = useContracts();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [stakeDetails, setStakeDetails] = useState(null);
  const [tcoreBalance, setTcoreBalance] = useState(null);

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
    if (!stakingContract || !signer || !signer.account?.address || !provider) {
      toast.error("Staking contract, signer, or provider not initialized. Please reconnect your wallet.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected || !address || !provider || !stakingContractRead) return;

      try {
        const userAddress = address; // Use address from useAccount for consistency
        console.log("Fetching data for address:", userAddress);

        if (!userAddress) {
          throw new Error("User address is not available.");
        }

        const balance = await provider.getBalance({ address: userAddress });
        console.log("Raw balance:", balance.toString());
        setTcoreBalance(ethers.formatEther(balance));

        const userStake = await getUserStake(stakingContractRead, userAddress, isConnected, provider);
        setStakeDetails({
          amount: ethers.formatEther(userStake.amount),
          lastStakedTime: userStake.lastStakedTime.toString(),
        });
      } catch (err) {
        console.error("Fetch data error:", err);
        toast.error(`Failed to fetch data: ${err.message}`);
      }
    };

    if (isConnected && !contractsLoading && stakingContractRead && address && provider) {
      fetchData();
    }
  }, [stakingContractRead, address, isConnected, provider, contractsLoading]);

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
      toast.success(`Staked ${amount} tCORE! Tx: ${receipt.hash.slice(0, 6)}...`);

      const userAddress = signer.account.address;
      const balance = await provider.getBalance({ address: userAddress });
      setTcoreBalance(ethers.formatEther(balance));
      const userStake = await getUserStake(stakingContractRead, userAddress, isConnected, provider);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: userStake.lastStakedTime.toString(),
      });

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

    setLoading(true);
    try {
      const receipt = await unstakeTokens(stakingContract, amount, isConnected, signer, provider);
      toast.success(`Unstaked ${amount} tCORE! Tx: ${receipt.hash.slice(0, 6)}...`);

      const userAddress = signer.account.address;
      const balance = await provider.getBalance({ address: userAddress });
      setTcoreBalance(ethers.formatEther(balance));
      const userStake = await getUserStake(stakingContractRead, userAddress, isConnected, provider);
      setStakeDetails({
        amount: ethers.formatEther(userStake.amount),
        lastStakedTime: userStake.lastStakedTime.toString(),
      });

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

    setLoading(true);
    try {
      const receipt = await claimRewards(stakingContract, isConnected, signer, provider);
      toast.success(`Rewards claimed! Tx: ${receipt.hash.slice(0, 6)}...`);
    } catch (error) {
      console.error("Claiming rewards error:", error);
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
        ) : !isConnected || !address ? (
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
              Connected: <span className="text-[#ff9211]">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Loading..."}</span>
            </p>
            <p className="text-center text-gray-300 mb-8">
              tCORE Balance: <span className="text-[#ff9211]">{tcoreBalance !== null ? `${tcoreBalance} tCORE` : "Loading..."}</span>
              <br />
              Staked Amount: <span className="text-[#ff9211]">{stakeDetails ? `${stakeDetails.amount} tCORE` : "Loading..."}</span>
            </p>

            <div className="space-y-6">
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