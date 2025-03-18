import { useAccount } from "wagmi";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import GithubProvider from "../components/Github";

export default function DashBoard() {
  const { address } = useAccount();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsPopupOpen(!currentUser);
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubscribe();
    };
  }, [auth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">
        {address || "No Wallet Connected"}
      </div>

      {!user && isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
              onClick={() => setIsPopupOpen(false)}
            >
              ❌
            </button>

            <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
              Welcome to the Dashboard
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              To access all features, please log in using your GitHub account.
            </p>

            <ul className="text-sm text-gray-700 list-disc list-inside mb-4">
              <li>Secure authentication</li>
              <li>Save your progress</li>
              <li>Access from anywhere</li>
            </ul>

            <GithubProvider />

            <p className="text-xs text-center text-gray-500 mt-4">
              By logging in, you agree to our{" "}
              <a href="#" className="text-blue-500 hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
