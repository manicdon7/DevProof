import { motion } from "framer-motion";

export function LeaderboardSection() {
  const leaderboardData = [
    { rank: 1, name: "CodeMaster", score: 95 },
    { rank: 2, name: "GitWizard", score: 88 },
    { rank: 3, name: "CoreDev", score: 82 },
    { rank: 4, name: "AIContributor", score: 79 },
    { rank: 5, name: "OpenSourceHero", score: 75 },
  ];

  const leaderboardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.h2
          className="text-4xl sm:text-5xl font-rubik font-extrabold text-center mb-12 text-[#ff9211]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🏆 Weekly Top Contributors
        </motion.h2>
        <motion.div
          className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#ff9211]/30 p-6 rounded-xl"
          variants={leaderboardVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-center text-gray-300 mb-6">🔝 AI ranks the best developers based on contribution quality</p>
          <div className="space-y-4">
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center p-3 bg-[#0f0f0f]/50 rounded-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <span className="text-lg font-rubik text-[#ff9211]">{entry.rank}. {entry.name}</span>
                <span className="text-gray-300">Score: {entry.score}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-300 mt-6">🏅 Top 5 receive staking rewards every week!</p>
        </motion.div>
      </div>
    </section>
  );
}