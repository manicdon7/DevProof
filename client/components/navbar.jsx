import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import CustomConnectButton from "../components/CustomConnectButton";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const { email, displayName } = currentUser;

        await sendRegistrationEmail(email, displayName);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const sendRegistrationEmail = async (email, name) => {
    try {
      const response = await fetch(
        "https://dev-proof-backend.vercel.app/api/send-registration-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        }
      );

      const data = await response.json();
      if (data.success) console.log("Email sent successfully:", data.message);
      else console.error("Failed to send email:", data.message);
    } catch (error) {
      console.error("Error sending registration email:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    Cookies.remove("address");
    sessionStorage.removeItem("oauthAccessToken");
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="p-4 bg-[#0f0f0f] shadow-lg sticky top-0 z-50 font-lexend">
      <div className="container flex items-center justify-between h-16 mx-auto">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 text-lg font-rubik font-semibold"
        >
          <img
            src="https://res.cloudinary.com/dvgpzftnf/image/upload/v1742374889/eagle-logo_smlzzj.jpg"
            alt="DevProof Logo"
            className="w-10 h-10"
          />
          <span className="bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent">
            DevProof
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8">
          {["Home", "Dashboard", "Stake", "Leaderboard"].map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right Section */}
        <div className="hidden lg:flex items-center space-x-6">
          <CustomConnectButton />
          {user && (
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-[#ff9211]/50 hover:border-[#ff9211] transition-all duration-300 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={
                    user?.photoURL ||
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#ff9211]/50 rounded-lg shadow-xl py-2"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#ff9211] hover:text-[#0f0f0f] transition-all duration-300 font-rubik font-medium"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="p-2 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#ff9211] rounded-md"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#ff9211]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      {/* Mobile Menu */}
      <nav
        className={`lg:hidden flex flex-col items-center bg-[#0f0f0f] p-4 space-y-4 shadow-xl ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {["Home", "Dashboard", "Stake", "Leaderboard"].map((item) => (
          <a
            key={item}
            href={`/${item.toLowerCase()}`}
            className="text-white hover:text-[#ff9211] transition-colors duration-300 font-lexend font-medium w-full text-center py-2 hover:bg-[#1a1a1a] rounded-md"
          >
            {item}
          </a>
        ))}
        <div className="flex flex-col items-center space-y-4 w-full">
          <CustomConnectButton />
          {user && (
            <div className="relative">
              <motion.button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-[#ff9211]/50 hover:border-[#ff9211] transition-all duration-300 focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={
                    user?.photoURL ||
                    "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </motion.button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-[#1a1a1a] border border-[#ff9211]/50 rounded-lg shadow-xl py-2"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#ff9211] hover:text-[#0f0f0f] transition-all duration-300 font-rubik font-medium"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
