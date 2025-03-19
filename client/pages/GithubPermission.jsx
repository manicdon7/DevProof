import { useState } from "react";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase.config";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export function TermsAndConditions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      toast.info("Initiating GitHub authentication...");
      const result = await signInWithPopup(auth, provider);
      const githubUser = result.user;
      toast.success(`Welcome, ${githubUser.displayName || "Developer"}!`);

      sessionStorage.setItem("connected", "true");

      Cookies.set("address", githubUser.uid);

      navigate("/dashboard");
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error("Popup blocked. Please allow popups and try again.");
      } else {
        toast.error(`Sign-in failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#1a1a1a] max-w-lg w-full p-8 rounded-2xl shadow-xl border border-[#ff9211]/50"
      >
        <h1 className="text-3xl font-bold text-[#ff9211] mb-6 text-center font-rubik">
          Terms & Conditions
        </h1>

        <div className="text-gray-300 text-sm space-y-4 mb-8 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff9211] scrollbar-track-[#0f0f0f]">
          <p>
            Welcome to DevProof! By signing in, you agree to the following
            terms:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              You’ll connect your GitHub account to authenticate and access our
              dope features.
            </li>
            <li>
              We’ll use your GitHub data (like repos and profile) to calculate
              your stats—nothing shady, just the good stuff.
            </li>
            <li>
              You're responsible for keeping your account secure. Don’t share
              your creds, bro!
            </li>
            <li>
              We’re not liable if GitHub's API goes down or if your cat spills
              coffee on your rig.
            </li>
            <li>
              These terms can change, and we’ll let you know if they do. Stay
              chill and check back.
            </li>
          </ul>
          <p>
            Questions? Hit us up at{" "}
            <a
              href="mailto:support@devproof.com"
              className="text-[#ff9211] hover:underline"
            >
              support@devproof.com
            </a>
            .
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5 accent-[#ff9211] rounded focus:ring-[#ff9211] cursor-pointer"
          />
          <label
            htmlFor="agree"
            className="text-gray-300 text-sm font-medium font-lexend cursor-pointer"
          >
            I agree to the Terms & Conditions
          </label>
        </div>

        <motion.button
          onClick={handleGithubSignIn}
          disabled={!agreed}
          className={`w-full px-6 py-3 rounded-full flex items-center justify-center gap-2 font-rubik font-medium text-lg transition-all duration-300 shadow-md ${
            agreed
              ? "bg-[#ff9211] text-[#0f0f0f] hover:bg-[#e0820f]"
              : "bg-[#1a1a1a] text-gray-500 border border-[#ff9211]/30 cursor-not-allowed"
          }`}
          whileHover={agreed ? { scale: 1.05 } : {}}
          whileTap={agreed ? { scale: 0.95 } : {}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.66-1.67-1.61-2.12-1.61-2.12-1.315-.895.1-.88.1-.88 1.465.065 2.235 1.505 2.235 1.505 1.32 2.065 3.445 1.47 4.285 1.125.135-.88.52-1.47.95-1.805-3.335-.375-6.84-1.67-6.84-7.385 0-1.63.585-2.965 1.54-4.015-.155-.375-.67-1.895.145-3.955 0 0 1.255-.405 4.11 1.53 1.19-.33 2.465-.495 3.735-.5 1.27.005 2.545.17 3.735.5 2.855-1.935 4.11-1.53 4.11-1.53.815 2.06.3 3.58.145 3.955.955 1.05 1.54 2.385 1.54 4.015 0 5.72-3.51 7.01-6.855 7.385.54.465 1.02 1.385 1.02 2.79 0 2.015-.015 3.64-.015 4.135 0 .315.215.69.825.57C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </motion.button>
      </motion.div>
    </div>
  );
}
