import { motion } from "framer-motion";

export function HowItWorksSection() {
  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
    }),
    hover: { scale: 1.05, boxShadow: "0 0 20px rgba(255, 146, 17, 0.5)" },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.h2
          className="text-4xl sm:text-5xl font-rubik font-extrabold text-center mb-12 bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🎯 How It Works?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { step: "1️⃣", title: "Stake CORE Tokens", desc: "Stake an initial amount to enter the reward ecosystem." },
            { step: "2️⃣", title: "Contribute on GitHub", desc: "Work on open-source projects, submit PRs, and build." },
            { step: "3️⃣", title: "AI-Based Scoring", desc: "Our AI evaluates contributions weekly based on impact & quality." },
            { step: "4️⃣", title: "Top 5 Earn Rewards", desc: "Staked CORE yields interest, distributed to the best contributors." },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-[#ff9211]/30 p-6 rounded-xl text-center"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover="hover"
            >
              <span className="text-3xl mb-4 block">{item.step}</span>
              <h3 className="text-xl font-rubik font-semibold text-[#ff9211] mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}