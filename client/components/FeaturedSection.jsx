import { motion } from "framer-motion";

export function FeaturedSection() {
  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-rubik font-extrabold mb-8 text-[#ff9211]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🌟 Featured On
        </motion.h2>
        <motion.div
          className="flex justify-center gap-8 text-gray-300 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          <span className="text-lg">📰 Core Blockchain</span>
          <span className="text-lg">🏆 Web3 Innovators</span>
          <span className="text-lg">🔥 Open Source Legends</span>
        </motion.div>
      </div>
    </section>
  );
}