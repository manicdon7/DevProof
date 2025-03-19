import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Utility to combine class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function WhyChooseSection() {
  // Ref for scroll trigger
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" }); // Trigger 100px before fully in view

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
    }),
  };

  // Line animation for separators
  const lineVariants = {
    hidden: { width: 0 },
    visible: { width: "100%", transition: { duration: 0.6, ease: "easeOut", delay: 0.4 } },
  };

  // Header animation
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  // Background particle animation
  const particleVariants = {
    animate: {
      y: [0, -15, 0],
      opacity: [0.1, 0.25, 0.1],
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
          <motion.circle cx="150" cy="200" r="20" fill="#ff9211" variants={particleVariants} animate="animate" />
          <motion.circle cx="400" cy="650" r="15" fill="#e0820f" variants={particleVariants} animate="animate" initial={{ y: 10 }} />
          <motion.circle cx="700" cy="350" r="25" fill="#ff9211" variants={particleVariants} animate="animate" initial={{ y: -5 }} />
          <motion.circle cx="1100" cy="500" r="18" fill="#e0820f" variants={particleVariants} animate="animate" initial={{ y: 15 }} />
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
          Why Choose DevProof?
        </motion.h2>

        {/* List with Separators */}
        <div className="space-y-10 grid grid-cols-2">
          {[
            {
              title: "AI-Powered Fairness",
              desc: "Unbiased evaluation of your contributions, driven by advanced AI for true impact recognition.",
            },
            {
              title: "Blockchain Security",
              desc: "Stake with confidence on a transparent, decentralized network built for trust.",
            },
            {
              title: "Sustainable Earnings",
              desc: "Grow your stake while coding, creating a steady stream of rewards over time.",
            },
            {
              title: "Recognition & Rewards",
              desc: "Get paid and celebrated for your open-source excellence, week after week.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="relative flex items-start space-x-4 max-w-3xl mx-auto"
              variants={itemVariants}
              custom={index}
            >
              {/* Glowing Dot */}
              <div className="flex-shrink-0 w-3 h-3 bg-[#ff9211] rounded-full mt-2 glow-effect" />

              {/* Content */}
              <div className="flex-1">
                <h4 className="text-xl font-rubik font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-gray-300 text-base leading-relaxed">{item.desc}</p>
                {index < 3 && (
                  <motion.div
                    className="h-[1px] bg-gradient-to-r from-[#ff9211]/50 to-transparent mt-6"
                    variants={lineVariants}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CSS for Glow Effect */}
      <style jsx>{`
        .glow-effect {
          box-shadow: 0 0 10px rgba(255, 146, 17, 0.7), 0 0 20px rgba(255, 146, 17, 0.4);
        }
      `}</style>
    </motion.section>
  );
}