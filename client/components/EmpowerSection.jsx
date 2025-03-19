import { motion } from "framer-motion";
import SpotlightCard from "./SpotlightCard";

// Utility to combine class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function EmpowerSection() {
  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
    }),
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  // Glowing circle animation
  const glowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.1, 0.2, 0.1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white py-20 overflow-hidden font-lexend">
      {/* Background Gradient and Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path
            d="M0 400C300 600 600 200 900 400S1200 600 1440 400V900H0Z"
            fill="url(#gradient)"
          />
          <motion.circle
            cx="200"
            cy="200"
            r="150"
            fill="#ff9211"
            variants={glowVariants}
            animate="animate"
          />
          <motion.circle
            cx="1200"
            cy="700"
            r="200"
            fill="#ff9211"
            variants={glowVariants}
            animate="animate"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="900">
              <stop offset="0%" stopColor="#ff9211" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-rubik font-extrabold text-center mb-12 bg-gradient-to-r from-[#ff9211] via-[#ff5500] to-[#e0820f] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🔹 Empowering Developers with Blockchain & AI
        </motion.h2>

        {/* Intro Text */}
        <motion.p
          className="text-lg sm:text-xl lg:text-2xl text-gray-300 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        >
          At <span className="font-semibold text-[#ff9211]">DevProof</span>, we’re revolutionizing open-source contribution by blending the power of <strong>Core Blockchain</strong> and <strong>AI-driven insights</strong>. Stake, code, and earn — all while building the future!
        </motion.p>

        {/* Features List with Spotlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              // emoji: "🔗",
              title: "Blockchain-Based Rewards",
              desc: "Stake CORE tokens and unlock a decentralized reward system that values your open-source impact.",
            },
            {
              // emoji: "💻",
              title: "GitHub Contributions",
              desc: "Push code, submit PRs, and watch your efforts translate into tangible earnings on the Core Blockchain.",
            },
            {
              // emoji: "🤖",
              title: "AI-Powered Fairness",
              desc: "Our advanced AI scores your contributions weekly, ensuring transparency and rewarding true excellence.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover="hover"
              className="w-full"
            >
              <SpotlightCard
                className="bg-[#1a1a1a]/80 backdrop-blur-md border-[#ff9211]/30 p-6 text-center h-full flex flex-col justify-center"
                spotlightColor="rgba(255, 146, 17, 0.3)"
              >
                <span className="text-4xl mb-4 block text-[#ff9211]">{item.emoji}</span>
                <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-3">{item.title}</h3>
                <p className="text-gray-300 text-base">{item.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          <p className="text-lg text-gray-400 mb-6">
            Ready to stake your claim in the open-source revolution?
          </p>
          <motion.a
            href="/get-started"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 146, 17, 0.7)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            🚀 Join the Movement
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}