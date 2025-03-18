import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { motion } from "framer-motion";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import RotatingText from "../components/RotatingText.jsx"; // Ensure correct path

export function HeroSection() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setIsAuthenticating(true);
    try {
      if (!isConnected) {
        const connector = connectors[0];
        if (!connector) throw new Error("No wallet connector available");
        toast.dark("Connect Your Wallet", { autoClose: 2000 });
        await connect({ connector });
      }
      if (isConnected) {
        const provider = new GithubAuthProvider();
        toast.info("Initiating GitHub authentication...");
        const result = await signInWithPopup(auth, provider);
        const githubUser = result.user;
        toast.success(`Welcome, ${githubUser.displayName || "Developer"}! Authentication complete.`);
        navigate("/dashboard");
      } else {
        console.error("Wallet not connected");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked. Please allow popups and try again.");
      } else if (error.message.includes("connector")) {
        toast.error("Wallet connection failed. Please try again.");
      } else {
        toast.error(`Authentication failed: ${error.message}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 0 20px rgba(255, 146, 17, 0.5)", transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
    pulse: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  return (
    <section className="relative bg-[#0f0f0f] text-white min-h-screen flex items-center overflow-hidden font-lexend">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M0 400C300 600 600 200 900 400S1200 600 1440 400V900H0Z" fill="url(#gradient)" />
          <motion.circle
            cx="1200"
            cy="100"
            r="150"
            fill="#ff9211"
            opacity="0.15"
            animate={{ r: [150, 160, 150], opacity: [0.15, 0.2, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx="200"
            cy="700"
            r="200"
            fill="#ff9211"
            opacity="0.1"
            animate={{ r: [200, 210, 200], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="900">
              <stop offset="0%" stopColor="#ff9211" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between relative z-10 min-h-screen py-12 gap-8 lg:gap-12">
        <motion.div
          className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left space-y-6 lg:space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-rubik font-extrabold leading-tight tracking-tight"
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <motion.span custom={0} variants={textVariants} className="bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent">
              Code.
            </motion.span>{" "}
            <motion.span custom={1} variants={textVariants}>Stake.</motion.span>{" "}
            <motion.span custom={2} variants={textVariants}>Earn.</motion.span>{" "}
            <motion.span custom={3} variants={textVariants} className="text-[#ff9211] text-2xl sm:text-3xl lg:text-4xl">
              🚀
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-md mx-auto lg:mx-0 leading-relaxed font-lexend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
          >
            <span className="font-semibold text-[#ff9211]">Rewarding Open Source Excellence</span> on Core Blockchain!
          </motion.p>
          <motion.p
            className="text-md sm:text-lg lg:text-xl text-gray-400 max-w-lg mx-auto lg:mx-0 font-lexend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          >
            Stake tokens, contribute to GitHub, and earn rewards. Our AI ranks the top 5 developers monthly, sharing staked yields.
          </motion.p>
          <div className="flex justify-center lg:justify-start gap-4 sm:gap-6">
            <motion.button
              onClick={handleGetStarted}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 text-md sm:text-lg"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              animate="pulse"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Authenticating..." : "Get Started"}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="w-full lg:w-1/2 flex justify-center mt-12 lg:mt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px]">
            <motion.svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              {/* Core Blockchain outer ring */}
              <motion.circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="url(#blockchainGradient)"
                strokeWidth="3"
                strokeDasharray="5,3"
                animate={{
                  rotate: [0, 360],
                  strokeDashoffset: [0, 100]
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Staking pool circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="75"
                fill="none"
                stroke="#ff9211"
                strokeWidth="2"
                opacity="0.5"
                strokeDasharray="8,4,1,4"
                animate={{
                  strokeDashoffset: [0, -50],
                  filter: ["drop-shadow(0 0 2px rgba(255, 146, 17, 0.2))", "drop-shadow(0 0 8px rgba(255, 146, 17, 0.6))"]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                  times: [0, 1]
                }}
              />

              {/* GitHub contribution circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="60"
                fill="none"
                stroke="#00ffaa"
                strokeWidth="1.5"
                opacity="0.4"
                animate={{
                  r: [60, 64, 60],
                  opacity: [0.4, 0.6, 0.4],
                  filter: ["drop-shadow(0 0 1px rgba(0, 255, 170, 0.3))", "drop-shadow(0 0 5px rgba(0, 255, 170, 0.7))"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Stakers nodes */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                <motion.circle
                  key={`stake-${index}`}
                  cx={100 + 92 * Math.cos(angle * Math.PI / 180)}
                  cy={100 + 92 * Math.sin(angle * Math.PI / 180)}
                  r="4"
                  fill="#ff9211"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                    filter: ["drop-shadow(0 0 0px #ff9211)", "drop-shadow(0 0 3px #ff9211)"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                />
              ))}

              {/* Top 5 contributors (GitHub) */}
              {[0, 72, 144, 216, 288].map((angle, index) => (
                <motion.circle
                  key={`contributor-${index}`}
                  cx={100 + 60 * Math.cos(angle * Math.PI / 180)}
                  cy={100 + 60 * Math.sin(angle * Math.PI / 180)}
                  r={5 - index * 0.5}  // Size based on contributor ranking
                  fill="#00ffaa"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.4
                  }}
                />
              ))}

              {/* GitHub commit patterns (code contribution) */}
              <motion.rect
                x="85" y="85"
                width="30" height="30"
                fill="none"
                stroke="#00ffaa"
                strokeWidth="1.5"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.9, 0.6],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Code contribution patterns */}
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.rect
                  key={`code-contrib-${index}`}
                  x={85 + index * 3}
                  y={85 + index * 3}
                  width={30 - index * 6}
                  height={30 - index * 6}
                  fill="none"
                  stroke="#4a9eff"
                  strokeWidth="0.8"
                  strokeDasharray={`${index + 1},${index + 1}`}
                  animate={{
                    rotate: [0, 360],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 8 + index * 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}

              {/* Yield/Reward flows: Staking to Core */}
              {[0, 1, 2, 3].map((index) => (
                <motion.circle
                  key={`stake-flow-${index}`}
                  cx="100"
                  cy="100"
                  r="2"
                  fill="#ff9211"
                  animate={{
                    cx: [100 + 92 * Math.cos((index * 90) * Math.PI / 180), 100],
                    cy: [100 + 92 * Math.sin((index * 90) * Math.PI / 180), 100],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 2,
                    repeatDelay: 1
                  }}
                />
              ))}

              {/* Reward flows: Core to Contributors */}
              {[0, 72, 144, 216, 288].map((angle, index) => (
                <motion.circle
                  key={`reward-flow-${index}`}
                  cx="100"
                  cy="100"
                  r="2.5"
                  fill="#00ffaa"
                  animate={{
                    cx: [100, 100 + 60 * Math.cos(angle * Math.PI / 180)],
                    cy: [100, 100 + 60 * Math.sin(angle * Math.PI / 180)],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2 + index * 1.2,
                    repeatDelay: 2
                  }}
                />
              ))}

              {/* AI scoring connections */}
              {[0, 72, 144, 216, 288].map((angle, index) => (
                <motion.path
                  key={`ai-scoring-${index}`}
                  d={`M100,100 Q${100 + 30 * Math.cos((angle - 20) * Math.PI / 180)},${100 + 30 * Math.sin((angle - 20) * Math.PI / 180)} ${100 + 60 * Math.cos(angle * Math.PI / 180)},${100 + 60 * Math.sin(angle * Math.PI / 180)}`}
                  stroke="#4a9eff"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0"
                  animate={{
                    opacity: [0, 0.7, 0],
                    pathLength: [0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.8,
                    repeatDelay: 1
                  }}
                />
              ))}

              {/* Yield generation pulses */}
              {[0, 1, 2].map((index) => (
                <motion.circle
                  key={`yield-pulse-${index}`}
                  cx="100"
                  cy="100"
                  r="5"
                  fill="none"
                  stroke="#ff9211"
                  strokeWidth="1"
                  opacity="0"
                  animate={{
                    r: [5, 40],
                    opacity: [0.8, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: index * 3 + 1
                  }}
                />
              ))}

              {/* AI scoring pulses */}
              {[0, 1].map((index) => (
                <motion.circle
                  key={`ai-pulse-${index}`}
                  cx="100"
                  cy="100"
                  r="5"
                  fill="none"
                  stroke="#4a9eff"
                  strokeWidth="1"
                  opacity="0"
                  animate={{
                    r: [5, 50],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: index * 4 + 2
                  }}
                />
              ))}

              {/* GitHub commit grid pattern visualization */}
              <motion.g>
                {[0, 1, 2, 3, 4].map((row) =>
                  [0, 1, 2, 3, 4].map((col) => (
                    <motion.rect
                      key={`commit-${row}-${col}`}
                      x={87 + col * 5.5}
                      y={87 + row * 5.5}
                      width="4"
                      height="4"
                      rx="1"
                      fill="#00ffaa"
                      opacity="0.2"
                      animate={{
                        opacity: [0.2, row === col ? 0.9 : Math.random() > 0.6 ? 0.7 : 0.2, 0.2],
                        fill: row === col ? "#00ffaa" : Math.random() > 0.7 ? "#4a9eff" : "#00ffaa"
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: row * 0.3 + col * 0.2,
                        repeatDelay: Math.random()
                      }}
                    />
                  ))
                )}
              </motion.g>

              {/* Core ecosystem token */}
              <motion.circle
                cx="100"
                cy="100"
                r="12"
                fill="url(#coreGradient)"
                animate={{
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 2px rgba(255, 146, 17, 0.7))", "drop-shadow(0 0 8px rgba(255, 146, 17, 0.9))"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Gradients */}
              <defs>
                <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#ff9211" />
                  <stop offset="60%" stopColor="#ff7b11" />
                  <stop offset="100%" stopColor="#ff5500" />
                  <animate attributeName="fx" values="35%;65%;35%" dur="8s" repeatCount="indefinite" />
                  <animate attributeName="fy" values="35%;65%;35%" dur="8s" repeatCount="indefinite" />
                </radialGradient>

                <linearGradient id="blockchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff9211" />
                  <stop offset="50%" stopColor="#ffb700" />
                  <stop offset="100%" stopColor="#ff9211" />
                  <animate attributeName="x1" values="0%;100%;0%" dur="10s" repeatCount="indefinite" />
                  <animate attributeName="y1" values="0%;100%;0%" dur="10s" repeatCount="indefinite" />
                </linearGradient>
              </defs>
            </motion.svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <RotatingText
                texts={["Stake to Reward", "Top Contributors", "GitHub Rewards", "Core Yield", "AI Scoring"]}
                ClassName="text-xl sm:text-2xl lg:text-3xl font-rubik font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff9211] via-[#ff5500] to-[#00ffaa] px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-xl border border-[#ff9211]/30 backdrop-blur-sm bg-black/20"
                staggerFrom="center"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.05}
                splitLevelClassName="overflow-hidden"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                rotationInterval={3000}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}