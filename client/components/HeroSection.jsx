import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { motion } from "framer-motion";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function HeroSection() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setIsAuthenticating(true);

    try {
      // Step 1: Connect Wallet if not connected
      if (!isConnected) {
        const connector = connectors[0]; // Assuming first connector (e.g., MetaMask)
        if (!connector) {
          throw new Error("No wallet connector available");
        }

        toast.dark("Connect Your Wallet", { autoClose: 2000 });
        await connect({ connector });
      }

      // Step 2: Authenticate with GitHub (only if wallet is connected)
      if (isConnected) {
        const provider = new GithubAuthProvider();
        toast.info("Initiating GitHub authentication...");
        const result = await signInWithPopup(auth, provider);
        const githubUser = result.user;

        toast.success(`Welcome, ${githubUser.displayName || "Developer"}! Authentication complete.`);

        // After successful authentication, redirect to dashboard
        navigate("/dashboard"); // Adjust path as needed
      } else {
        console.error("Wallet not connected");
        
      }
    } catch (error) {
      console.error("Authentication error:", error);

      // Specific error handling
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

  return (
    <section className="relative bg-[#0f0f0f] text-white min-h-screen flex items-center overflow-hidden font-lexend">
      {/* Background Illustration */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path
            d="M0 400C300 600 600 200 900 400S1200 600 1440 400V900H0Z"
            fill="url(#gradient)"
          />
          <circle cx="1200" cy="100" r="150" fill="#ff9211" opacity="0.1" />
          <circle cx="200" cy="700" r="200" fill="#ff9211" opacity="0.05" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="900">
              <stop offset="0%" stopColor="#ff9211" />
              <stop offset="100%" stopColor="#0f0f0f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between relative z-10 h-full py-16">
        {/* Left Content */}
        <motion.div
          className="lg:w-1/2 flex flex-col justify-center text-center lg:text-left space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-5xl lg:text-7xl font-rubik font-extrabold leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent">
              Empower
            </span>{" "}
            Your Code on Core
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 max-w-md lg:max-w-lg mx-auto lg:mx-0 leading-relaxed font-lexend">
            Stake tokens on the Core blockchain, contribute to GitHub, and earn rewards as a top developer. Our AI validates your contributions to rank the top 5 contributors monthly, distributing staked yields as rewards.
          </p>
          <div className="flex justify-center lg:justify-start gap-6">
            <motion.button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-xl hover:bg-[#e0820f] transition-all duration-300 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? "Authenticating..." : "Get Started"}
            </motion.button>
          </div>
        </motion.div>

        {/* Right Illustration */}
        <motion.div
          className="lg:w-1/2 flex justify-center mt-12 lg:mt-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="relative w-96 h-96 lg:w-[500px] lg:h-[500px]">
            <motion.svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="100" cy="100" r="90" fill="none" stroke="#ff9211" strokeWidth="3" opacity="0.15" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#ff9211" strokeWidth="2" opacity="0.3" />
              <path
                d="M60 140 L140 60 M60 60 L140 140"
                stroke="#ff9211"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </motion.svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="text-2xl lg:text-3xl font-rubik font-extrabold text-[#ff9211] bg-[#0f0f0f]/90 px-8 py-4 rounded-xl shadow-lg border border-[#ff9211]/30"
                initial={{ y: 20, opacity: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              >
                Core <span className="text-white">Devs</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}