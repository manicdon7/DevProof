import { motion } from "framer-motion";

export function JoinSection() {
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 0 25px rgba(255, 146, 17, 0.7)", transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
    pulse: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        <motion.h2
          className="text-4xl sm:text-5xl font-rubik font-extrabold mb-8 bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🚀 Join the DevProof Ecosystem Today!
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          💡 Start staking, coding & earning on the Core Blockchain
        </motion.p>
        <div className="flex justify-center gap-6">
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            animate="pulse"
          >
            🔗 Stake Now
          </motion.button>
          <motion.button
            className="px-8 py-4 bg-transparent border border-[#ff9211] text-[#ff9211] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#ff9211]/10"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            💻 Connect GitHub
          </motion.button>
        </div>
      </div>
    </section>
  );
}