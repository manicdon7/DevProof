import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { getAuth, GithubAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

export function JoinSection() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser); // Debug log
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out"); // Debug log
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log("GitHub login successful"); // Debug log
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  };

  // Ref for scroll trigger
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Header animation
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Text animation
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8, ease: "easeOut" } },
  };

  // Button animation variants
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0 0 20px rgba(255, 146, 17, 0.5)", transition: { duration: 0.3 } },
    tap: { scale: 0.98 },
  };

  // Accent line animation
  const lineVariants = {
    hidden: { width: 0 },
    visible: { width: "120px", transition: { duration: 1, ease: "easeOut", delay: 0.6 } },
  };

  console.log("Current user state:", user); // Debug log to check state

  return (
    <motion.section
      ref={ref}
      className="relative bg-[#0f0f0f] text-white py-12 sm:py-16 lg:py-20 overflow-hidden font-lexend"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <rect width="1440" height="900" fill="url(#gradient)" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1440" y2="900">
              <stop offset="0%" stopColor="#ff9211" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10 text-center">
        {/* Header */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-rubik font-extrabold mb-4 bg-gradient-to-r from-[#ff9211] via-[#ff5500] to-[#e0820f] bg-clip-text text-transparent"
          variants={headerVariants}
        >
          Become Part of the DevProof Ecosystem
        </motion.h2>

        {/* Accent Line */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-[#ff9211] to-[#e0820f] mx-auto mb-6 sm:mb-8"
          variants={lineVariants}
        />

        {/* Description */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed"
          variants={textVariants}
        >
          Stake CORE tokens, contribute to open-source projects, and earn rewards on the Core Blockchain network.
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 max-w-lg mx-auto">
          <motion.a
            href="/staketoken"
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg text-sm sm:text-base w-full sm:w-auto"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
          >
            Start Staking
          </motion.a>
          {!user && (
            <motion.button
              onClick={handleGithubLogin}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-transparent border border-[#ff9211] text-[#ff9211] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#ff9211]/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.66-1.67-1.61-2.12-1.61-2.12-1.315-.895.1-.88.1-.88 1.465.065 2.235 1.505 2.235 1.505 1.32 2.065 3.445 1.47 4.285 1.125.135-.88.52-1.47.95-1.805-3.335-.375-6.84-1.67-6.84-7.385 0-1.63.585-2.965 1.54-4.015-.155-.375-.67-1.895.145-3.955 0 0 1.255-.405 4.11 1.53 1.19-.33 2.465-.495 3.735-.5 1.27.005 2.545.17 3.735.5 2.855-1.935 4.11-1.53 4.11-1.53.815 2.06.3 3.58.145 3.955.955 1.05 1.54 2.385 1.54 4.015 0 5.72-3.51 7.01-6.855 7.385.54.465 1.02 1.385 1.02 2.79 0 2.015-.015 3.64-.015 4.135 0 .315.215.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Login
            </motion.button>
          )}
        </div>

        {/* Logout Button (shown when logged in)
        {user && (
          <motion.div
            className="mt-4 sm:mt-6"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={handleLogout}
              className="px-6 py-2 sm:px-8 sm:py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 text-sm sm:text-base w-full sm:w-auto max-w-xs mx-auto"
              whileHover="hover"
              whileTap="tap"
            >
              Logout
            </motion.button>
          </motion.div>
        )} */}
      </div>
    </motion.section>
  );
}