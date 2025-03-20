import React from "react";
import { motion } from "framer-motion";

// Static leaderboard data (replace with dynamic data later if needed)
const leaderboardData = [
  { rank: 1, githubId: "CodeMasterX", score: 150, reward: 25.5 },
  { rank: 2, githubId: "OpenSourceNinja", score: 120, reward: 20.0 },
  { rank: 3, githubId: "DevWizard", score: 95, reward: 15.75 },
  { rank: 4, githubId: "BugBlaster", score: 80, reward: 12.0 },
  { rank: 5, githubId: "GitHero", score: 60, reward: 9.5 },
  { rank: 6, githubId: "CodeCraftsman", score: 45, reward: 7.0 },
  { rank: 7, githubId: "RepoRuler", score: 30, reward: 4.5 },
  { rank: 8, githubId: "PullRequestPro", score: 25, reward: 3.8 },
  { rank: 9, githubId: "IssueSlayer", score: 20, reward: 3.0 },
  { rank: 10, githubId: "CommitKing", score: 15, reward: 2.2 },
];

const LeaderBoard = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-lexend p-6 overflow-hidden">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-rubik font-bold bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent">
          DevProof Leaderboard
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Check out the top open-source contributors on DevProof! Stake CORE,
          earn points, and claim your rewards on the CORE Testnet. 🚀
        </p>
      </motion.div>

      {/* Leaderboard Table */}
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#ff9211]/20 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-[#ff9211]/20 to-[#e0820f]/20 text-[#ff9211] font-semibold text-lg">
          <div className="text-center">Rank</div>
          <div>GitHub ID</div>
          <div className="text-center">Score</div>
          <div className="text-center">Reward (CORE)</div>
        </div>

        {/* Table Rows */}
        {leaderboardData.map((entry, index) => (
          <motion.div
            key={entry.githubId}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`grid grid-cols-4 gap-4 p-4 border-b border-[#ff9211]/10 hover:bg-[#ff9211]/10 transition-all duration-300 ${
              index === 0 ? "bg-[#ff9211]/20" : ""
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-center flex items-center justify-center">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0
                    ? "bg-[#ff9211] text-[#0f0f0f]"
                    : index === 1
                    ? "bg-[#e0820f] text-[#0f0f0f]"
                    : index === 2
                    ? "bg-[#d17b0e] text-[#0f0f0f]"
                    : "bg-[#1c1c1c] text-[#ff9211]"
                }`}
              >
                {entry.rank}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={`https://github.com/${entry.githubId}.png?size=40`}
                alt={`${entry.githubId} avatar`}
                className="w-8 h-8 rounded-full border border-[#ff9211]/50"
                onError={(e) =>
                  (e.target.src =
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png")
                }
              />
              <span>{entry.githubId}</span>
            </div>
            <div className="text-center">{entry.score}</div>
            <div className="text-center text-[#ff9211] font-medium">
              {entry.reward.toFixed(2)} CORE
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Call-to-Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="text-center mt-12"
      >
        <p className="text-gray-400 mb-4">
          Want to climb the ranks? Start contributing to open-source projects
          and stake your CORE tokens now!
        </p>
        <a
          href="/staketoken"
          className="inline-block px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full hover:bg-[#e0820f] transition-all duration-300"
        >
          Stake Now
        </a>
      </motion.div>

      {/* Background Glow Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff9211]/10 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
};

export default LeaderBoard;