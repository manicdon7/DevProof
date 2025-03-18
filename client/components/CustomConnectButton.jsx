import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi"; // Only keep useDisconnect since it's used
import { motion } from "framer-motion";

export default function CustomConnectButton() {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div>
            {!ready ? (
              <span className="text-gray-500">Loading...</span>
            ) : !connected ? (
              <motion.button
                onClick={openConnectModal}
                className="px-6 py-3 bg-[#ff9211] text-[#0f0f0f] font-semibold rounded-full shadow-lg hover:bg-[#e0820f] transition-all duration-300 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Connect Wallet
              </motion.button>
            ) : (
              <div className="flex items-center gap-4">
                {/* Chain Info */}
                <motion.button
                  onClick={openChainModal}
                  className="px-4 py-2 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 rounded-full hover:bg-[#1a1a1a] transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {chain.iconUrl && (
                    <img src={chain.iconUrl} alt={chain.name} className="w-5 h-5 rounded-full" />
                  )}
                  {chain.name}
                </motion.button>

                {/* Account Info & Disconnect */}
                <motion.div
                  className="px-6 py-3 bg-[#0f0f0f] text-[#ff9211] border border-[#ff9211]/50 rounded-full flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="truncate max-w-[120px]">
                    {account.displayName || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="text-[#ff9211] hover:text-[#e0820f] transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}