import { motion } from "framer-motion";

export function EmpowerSection() {
  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.h2
          className="text-3xl sm:text-4xl font-rubik font-extrabold text-center mb-8 text-[#ff9211]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🔹 Empowering Developers
        </motion.h2>
        <motion.ul
          className="space-y-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          <li>🔹 Empowering developers with blockchain-based rewards!</li>
          <li>🔹 Stake CORE, contribute to GitHub, and get rewarded for your impact.</li>
          <li>🔹 AI-powered scoring for fair & transparent rewards!</li>
        </motion.ul>
      </div>
    </section>
  );
}