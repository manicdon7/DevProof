import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import GithubProvider from "../components/GithubProvider";
import CustomConnectButton from "../components/CustomConnectButton";
import { motion } from "framer-motion";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("GitHub login error:", error);
    }
  };

  return (
    <header className="p-4 bg-[#0f0f0f] shadow-lg sticky top-0 z-50 font-lexend">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <a href="#" className="flex items-center gap-2 text-lg font-rubik font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 32 32"
            className="w-8 h-8 text-[#ff9211]"
          >
            <path d="M27.912 7.289l-10.324-5.961c-0.455-0.268-1.002-0.425-1.588-0.425s-1.133 0.158-1.604 0.433l0.015-0.008-10.324 5.961c-0.955 0.561-1.586 1.582-1.588 2.75v11.922c0.002 1.168 0.635 2.189 1.574 2.742l0.016 0.008 10.322 5.961c0.455 0.267 1.004 0.425 1.59 0.425 0.584 0 1.131-0.158 1.602-0.433l-0.014 0.008 10.322-5.961c0.955-0.561 1.586-1.582 1.588-2.75v-11.922c-0.002-1.168-0.633-2.189-1.573-2.742z"></path>
          </svg>
          <span className="text-white bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent">
            DevProof
          </span>
        </a>

        <nav className="hidden lg:flex space-x-8">
          <a
            href="#"
            className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium tracking-wide"
          >
            Home
          </a>
          <a
            href="#"
            className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium tracking-wide"
          >
            About
          </a>
          <a
            href="#"
            className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium tracking-wide"
          >
            Services
          </a>
          <a
            href="#"
            className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium tracking-wide"
          >
            Contact
          </a>
        </nav>

        <div className="hidden lg:flex items-center space-x-6">
          <CustomConnectButton />
          {user ? (
            <motion.button
              onClick={handleLogout}
              className="px-6 py-2 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full hover:bg-[#e0820f] transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          ) : (
            <motion.button
              onClick={handleGithubLogin}
              className="px-6 py-2 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 rounded-full hover:bg-[#1a1a1a] transition-all duration-300 flex items-center gap-2 shadow-md font-rubik font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.66-1.67-1.61-2.12-1.61-2.12-1.315-.895.1-.88.1-.88 1.465.065 2.235 1.505 2.235 1.505 1.32 2.065 3.445 1.47 4.285 1.125.135-.88.52-1.47.95-1.805-3.335-.375-6.84-1.67-6.84-7.385 0-1.63.585-2.965 1.54-4.015-.155-.375-.67-1.895.145-3.955 0 0 1.255-.405 4.11 1.53 1.19-.33 2.465-.495 3.735-.5 1.27.005 2.545.17 3.735.5 2.855-1.935 4.11-1.53 4.11-1.53.815 2.06.3 3.58.145 3.955.955 1.05 1.54 2.385 1.54 4.015 0 5.72-3.51 7.01-6.855 7.385.54.465 1.02 1.385 1.02 2.79 0 2.015-.015 3.64-.015 4.135 0 .315.215.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Login
            </motion.button>
          )}
        </div>

        <button
          className="p-2 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#ff9211] rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-[#ff9211]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <nav
        className={`lg:hidden flex flex-col items-center bg-[#0f0f0f] p-4 space-y-4 shadow-xl ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <a
          href="#"
          className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium w-full text-center py-2 hover:bg-[#1a1a1a] rounded-md"
        >
          Home
        </a>
        <a
          href="#"
          className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium w-full text-center py-2 hover:bg-[#1a1a1a] rounded-md"
        >
          About
        </a>
        <a
          href="#"
          className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium w-full text-center py-2 hover:bg-[#1a1a1a] rounded-md"
        >
          Services
        </a>
        <a
          href="#"
          className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium w-full text-center py-2 hover:bg-[#1a1a1a] rounded-md"
        >
          Contact
        </a>
        <div className="flex flex-col space-y-4 w-full">
          {user ? (
            <motion.button
              onClick={handleLogout}
              className="px-6 py-2 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full hover:bg-[#e0820f] transition-all duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          ) : (
            <motion.button
              onClick={handleGithubLogin}
              className="px-6 py-2 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 rounded-full hover:bg-[#1a1a1a] transition-all duration-300 flex items-center gap-2 justify-center shadow-md font-rubik font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.66-1.67-1.61-2.12-1.61-2.12-1.315-.895.1-.88.1-.88 1.465.065 2.235 1.505 2.235 1.505 1.32 2.065 3.445 1.47 4.285 1.125.135-.88.52-1.47.95-1.805-3.335-.375-6.84-1.67-6.84-7.385 0-1.63.585-2.965 1.54-4.015-.155-.375-.67-1.895.145-3.955 0 0 1.255-.405 4.11 1.53 1.19-.33 2.465-.495 3.735-.5 1.27.005 2.545.17 3.735.5 2.855-1.935 4.11-1.53 4.11-1.53.815 2.06.3 3.58.145 3.955.955 1.05 1.54 2.385 1.54 4.015 0 5.72-3.51 7.01-6.855 7.385.54.465 1.02 1.385 1.02 2.79 0 2.015-.015 3.64-.015 4.135 0 .315.215.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Login
            </motion.button>
          )}
        </div>
      </nav>
    </header>
  );
}