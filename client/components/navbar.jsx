import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import GithubProvider from "./Github";

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

  return (
    <header className="p-4 bg-white shadow-md dark:bg-gray-900 dark:text-gray-100">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <a href="#" className="flex items-center gap-2 text-lg font-bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 32 32"
            className="w-8 h-8 text-violet-600"
          >
            <path d="M27.912 7.289l-10.324-5.961c-0.455-0.268-1.002-0.425-1.588-0.425s-1.133 0.158-1.604 0.433l0.015-0.008-10.324 5.961c-0.955 0.561-1.586 1.582-1.588 2.75v11.922c0.002 1.168 0.635 2.189 1.574 2.742l0.016 0.008 10.322 5.961c0.455 0.267 1.004 0.425 1.59 0.425 0.584 0 1.131-0.158 1.602-0.433l-0.014 0.008 10.322-5.961c0.955-0.561 1.586-1.582 1.588-2.75v-11.922c-0.002-1.168-0.633-2.189-1.573-2.742z"></path>
          </svg>
          DevProof
        </a>

        <nav className="hidden lg:flex space-x-6">
          <a
            href="#"
            className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
          >
            Home
          </a>
          <a
            href="#"
            className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
          >
            About
          </a>
          <a
            href="#"
            className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
          >
            Services
          </a>
          <a
            href="#"
            className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
          >
            Contact
          </a>
        </nav>

        <div className="hidden lg:flex items-center space-x-4 gap-4">
          <ConnectButton chainStatus="icon" />
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Logout
            </button>
          ) : (
            <GithubProvider />
          )}
        </div>

        <button
          className="p-2 lg:hidden focus:outline-none focus:ring-2 focus:ring-violet-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-gray-800 dark:text-gray-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>

      <nav
        className={`lg:hidden flex flex-col items-center bg-white dark:bg-gray-900 p-4 space-y-4 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <a
          href="#"
          className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
        >
          Home
        </a>
        <a
          href="#"
          className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
        >
          About
        </a>
        <a
          href="#"
          className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
        >
          Services
        </a>
        <a
          href="#"
          className="text-gray-700 dark:text-gray-300 hover:text-violet-600 transition"
        >
          Contact
        </a>
        <div className="flex flex-col space-y-2 w-full">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-black text-white rounded-md"
            >
              Logout
            </button>
          ) : (
            <GithubProvider />
          )}
        </div>
      </nav>
    </header>
  );
}
