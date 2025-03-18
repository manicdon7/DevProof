import { motion } from "framer-motion";

export function WhyChooseSection() {
  return (
    <section className="relative bg-[#0f0f0f] text-white py-16 font-lexend">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <motion.h2
          className="text-4xl sm:text-5xl font-rubik font-extrabold text-center mb-12 text-[#ff9211]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          🔥 Why Choose DevProof?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "✅", title: "AI-Powered Fairness", desc: "No bias, just real impact." },
            { icon: "✅", title: "Blockchain Security", desc: "Transparent & decentralized staking." },
            { icon: "✅", title: "Sustainable Earnings", desc: "Your stake grows while you code." },
            { icon: "✅", title: "Recognition & Rewards", desc: "Get paid for your contributions." },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h4 className="text-lg font-rubik font-semibold text-gray-200">{item.title}</h4>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}