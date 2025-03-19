import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Utility to combine class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function HowItWorksSection() {
  // Ref to track when the section enters the viewport
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" }); // Trigger 100px before fully in view

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 0 25px rgba(255, 146, 17, 0.4)",
      transition: { duration: 0.3 },
    },
  };

  // Line animation for the step number
  const lineVariants = {
    hidden: { width: 0 },
    visible: { width: "50%", transition: { duration: 0.6, ease: "easeOut", delay: 0.4 } },
  };

  // Header animation
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <motion.section
      ref={ref}
      className="relative bg-[#0f0f0f] text-white py-20 overflow-hidden font-lexend"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path
            d="M0 400C300 600 600 200 900 400S1200 600 1440 400V900H0Z"
            fill="url(#gradient)"
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
          className="text-4xl sm:text-5xl lg:text-6xl font-rubik font-extrabold text-center mb-14 bg-gradient-to-r from-[#ff9211] via-[#ff5500] to-[#e0820f] bg-clip-text text-transparent"
          variants={headerVariants}
        >
          How It Works
        </motion.h2>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            {
              step: "Step 1",
              title: "Stake CORE Tokens",
              desc: "Enter the reward ecosystem by staking CORE tokens, securing your place in a decentralized network.",
            },
            {
              step: "Step 2",
              title: "Contribute on GitHub",
              desc: "Engage with open-source projects, submitting pull requests and building impactful solutions.",
            },
            {
              step: "Step 3",
              title: "AI-Based Scoring",
              desc: "Our AI evaluates your contributions weekly, measuring impact and quality with precision.",
            },
            {
              step: "Step 4",
              title: "Earn Rewards",
              desc: "Top contributors receive yields from staked CORE, distributed transparently every week.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className={cn(
                "relative bg-[#1a1a1a]/90 backdrop-blur-md border border-[#ff9211]/20 p-6 rounded-xl overflow-hidden",
                "transition-all duration-300 hover:bg-[#252525]/90"
              )}
              variants={cardVariants}
              custom={index}
              whileHover="hover"
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff9211]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

              {/* Step Number */}
              <div className="relative mb-4">
                <span className="text-lg font-rubik font-medium text-[#ff9211] tracking-wide">{item.step}</span>
                <motion.div
                  className="absolute left-0 right-0 mx-auto h-[2px] bg-[#ff9211]"
                  variants={lineVariants}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-rubik font-semibold text-white mb-3">{item.title}</h3>

              {/* Description */}
              <p className="text-gray-300 text-base leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}