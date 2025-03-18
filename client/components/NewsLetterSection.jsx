import { motion } from "framer-motion";

export function NewsletterSection() {
  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 0 25px rgba(255, 146, 17, 0.7)", transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl font-rubik font-extrabold mb-8 text-[#ff9211]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          📩 Stay Updated!
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        >
          📧 Join our newsletter & never miss a reward update!
        </motion.p>
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 rounded-l-full bg-[#1a1a1a] border border-[#ff9211]/30 text-gray-300 focus:outline-none"
          />
          <motion.button
            className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-r-full"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Subscribe
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}