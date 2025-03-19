import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Utility to combine class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function LeaderboardSection() {
  // Sample leaderboard data
  const leaderboardData = [
    { rank: 1, name: "CodeMaster", score: 95 },
    { rank: 2, name: "GitWizard", score: 88 },
    { rank: 3, name: "CoreDev", score: 82 },
    { rank: 4, name: "AIContributor", score: 79 },
    { rank: 5, name: "OpenSourceHero", score: 75 },
  ];

  // Ref for scroll trigger
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" }); // Trigger 100px before fully in view

  // Header animation
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Row animation
  const rowVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  // Particle animation for background
  const particleVariants = {
    animate: {
      y: [0, -20, 0],
      opacity: [0.1, 0.3, 0.1],
      transition: {
        duration: Math.random() * 2 + 2, // Random between 2-4s
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      className="relative bg-[#0f0f0f] text-white py-20 overflow-hidden font-lexend"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Dynamic Particle Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <rect width="1440" height="900" fill="url(#gradient)" opacity="0.5" />
          <motion.circle cx="200" cy="150" r="20" fill="#ff9211" variants={particleVariants} animate="animate" />
          <motion.circle cx="500" cy="700" r="15" fill="#e0820f" variants={particleVariants} animate="animate" initial={{ y: 10 }} />
          <motion.circle cx="800" cy="300" r="25" fill="#ff9211" variants={particleVariants} animate="animate" initial={{ y: -5 }} />
          <motion.circle cx="1200" cy="600" r="18" fill="#e0820f" variants={particleVariants} animate="animate" initial={{ y: 15 }} />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="900">
              <stop offset="0%" stopColor="#ff9211" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-rubik font-extrabold text-center mb-14 bg-gradient-to-r from-[#ff9211] via-[#ff5500] to-[#e0820f] bg-clip-text text-transparent"
          variants={headerVariants}
        >
          Weekly Top Contributors
        </motion.h2>

        {/* Leaderboard Container */}
        <motion.div
          className="bg-[#1a1a1a]/90 backdrop-blur-md border border-[#ff9211]/20 rounded-xl p-6 max-w-4xl mx-auto shadow-[0_0_15px_rgba(255,146,17,0.2)]"
          variants={containerVariants}
        >
          {/* Intro Text */}
          <p className="text-center text-gray-300 mb-8 text-lg font-rubik">
            AI ranks the best developers based on contribution quality
          </p>

          {/* Leaderboard Rows */}
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-gray-400 font-rubik font-medium pb-2 border-b border-[#ff9211]/30">
              <span className="col-span-2 text-center">Rank</span>
              <span className="col-span-6">Contributor</span>
              <span className="col-span-4 text-center">Score</span>
            </div>
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={index}
                className={cn(
                  "grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-all duration-300",
                  index === 0 ? "bg-gradient-to-r from-[#ff9211]/20 to-[#e0820f]/10" : "bg-[#0f0f0f]/50 hover:bg-[#252525]/50"
                )}
                variants={rowVariants}
                custom={index}
                whileHover={{ scale: 1.02 }}
              >
                <span className="col-span-2 text-center text-[#ff9211] font-semibold text-lg">
                  {entry.rank}
                </span>
                <span className="col-span-6 text-white font-rubik">{entry.name}</span>
                <span className="col-span-4 text-center text-gray-300">
                  <span className="inline-block bg-[#ff9211]/20 text-[#ff9211] px-2 py-1 rounded-full text-sm">
                    {entry.score}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-300 mt-8 text-lg font-rubik">
            Top 5 receive staking rewards every week!
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}