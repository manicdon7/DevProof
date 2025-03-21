import { useState, useEffect } from "react";
import {
  Bug,
  Brush,
  Database,
  FileCode,
  Lock,
  Zap,
  GitMerge,
  Shield,
  BookOpen,
  CreditCard,
  X,
} from "lucide-react";

const tasks = [
  {
    id: 1,
    title: "Hello World Message",
    description:
      "Write a Solidity contract with a function `sayHello()` that returns the string 'Hello, World!'. I need this function in your contract.",
    expectedFunction: "sayHello",
    icon: Bug,
  },
];

export default function TaskSubmission() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    contractAddress: "",
    abi: "",
    contract: "",
    walletAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState(null);
  const [fromAddress, setFromAddress] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setResult(null);
    setStatus(null);
    setFromAddress(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setResult(null);
    setStatus(null);
    setFromAddress(null);
  };

  const validateContractAddress = (address) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      return "Invalid Ethereum address format. Must be 0x followed by 40 hex characters.";
    }
    return null;
  };

  const checkContractWithAI = async (contractCode, taskDescription) => {
    const prompt = `Verify if this Solidity contract meets the following requirement: "${taskDescription}". Return response in JSON format: {"verified": boolean}. Contract code: ${contractCode}`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`AI API request failed with status: ${response.status}`);
      }
      const rawText = await response.text();
      console.log("Raw AI Response:", rawText);
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        const data = JSON.parse(cleanedText);
        console.log("Parsed AI Response:", data);
        if (data && typeof data.verified === "boolean") {
          return data.verified;
        } else {
          console.warn("AI response format invalid, expected {'verified': boolean}");
          return false;
        }
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Cleaned Text:", cleanedText);
        return false;
      }
    } catch (error) {
      console.error("Error checking contract with AI:", error);
      return false;
    }
  };

  // Updated fetchContractInfo to construct URL instead of fetching
  const fetchContractInfo = (contractAddress) => {
    const explorerUrl = `https://scan.test2.btcs.network/address/${contractAddress}#transactions`;
    console.log("Constructed Explorer URL:", explorerUrl);
    return explorerUrl;
  };

  const handleSubmit = async () => {
    const newErrors = {};
    setResult(null);
    setStatus(null);
    setFromAddress(null);

    if (!formData.contractAddress.trim()) {
      newErrors.contractAddress = "Contract address is required.";
    } else {
      const addressError = validateContractAddress(formData.contractAddress);
      if (addressError) newErrors.contractAddress = addressError;
    }

    if (!formData.abi.trim()) {
      newErrors.abi = "ABI is required.";
    }

    if (!formData.contract.trim()) {
      newErrors.contract = "Contract source code is required.";
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = "Wallet address is required.";
    } else {
      const addressError = validateContractAddress(formData.walletAddress);
      if (addressError) newErrors.walletAddress = addressError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsVerifying(true);

    try {
      let abi;
      try {
        abi = JSON.parse(formData.abi);
      } catch (e) {
        throw new Error("Invalid ABI JSON format.");
      }

      const { expectedFunction } = selectedTask;
      const functionAbi = abi.find(
        (item) => item.type === "function" && item.name === expectedFunction
      );
      if (!functionAbi) {
        throw new Error(`Function "${expectedFunction}" not found in ABI.`);
      }

      const isContractValid = await checkContractWithAI(
        formData.contract,
        selectedTask.description
      );
      if (!isContractValid) {
        throw new Error(
          "Contract does not meet the task requirements according to AI verification."
        );
      }

      // Use the updated fetchContractInfo to get the URL
      const explorerLink = fetchContractInfo(formData.contractAddress);
      
      setStatus({ verified: true, eligibleForReward: true });
      setResult(
        `Task verified! Function "${expectedFunction}" found in ABI and contract meets requirements. Wallet: ${formData.walletAddress}. Check transactions at: ${explorerLink}`
      );
    } catch (error) {
      console.error("Verification error:", error);
      setResult(`Error: ${error.message}`);
      setStatus({ verified: false, eligibleForReward: false });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({ contractAddress: "", abi: "", contract: "", walletAddress: "" });
    setErrors({});
    setResult(null);
    setStatus(null);
    setFromAddress(null);
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const SkeletonCard = () => (
    <div className="p-6 bg-[#1a1a1a] border border-[#ff9211]/20 rounded-xl h-64 w-full animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-[#ff9211]/40 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-[#ff9211]/40 rounded w-3/4"></div>
          <div className="h-4 bg-[#ff9211]/40 rounded w-full"></div>
          <div className="h-4 bg-[#ff9211]/40 rounded w-5/6"></div>
        </div>
      </div>
      <div className="mt-6 h-10 bg-[#ff9211]/40 rounded-lg w-full"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white flex flex-col font-sans overflow-hidden">
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a]">
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#ff9211] to-[#e0820f] bg-clip-text text-transparent tracking-tight animate-fade-in">
            Task Verification
          </h1>
          <p className="mt-2 sm:mt-3 text-gray-300 text-base sm:text-lg md:text-xl max-w-md mx-auto">
            Verify your Solidity tasks on CORE Testnet with ease.
          </p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {isLoading
            ? Array(6)
                .fill()
                .map((_, i) => <SkeletonCard key={i} />)
            : tasks.map((task) => (
                <article
                  key={task.id}
                  className="p-6 bg-[#1a1a1a] border border-[#ff9211]/20 rounded-xl h-64 flex flex-col justify-between shadow-md hover:shadow-[#ff9211]/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up"
                >
                  <div className="flex items-start space-x-4">
                    <task.icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#ff9211] flex-shrink-0 animate-pulse-slow" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                        {task.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#ff9211]/70 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTaskSelect(task)}
                    className="mt-4 w-full py-2 sm:py-3 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-semibold rounded-lg hover:from-[#e0820f] hover:to-[#d0760e] focus:outline-none focus:ring-4 focus:ring-[#ff9211]/50 transition-all duration-300 transform hover:scale-105"
                  >
                    Verify Task
                  </button>
                </article>
              ))}
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f0f]/95 z-50 transition-opacity duration-500 ease-in-out">
          <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-2xl w-full max-w-lg border border-[#ff9211]/40 shadow-2xl shadow-[#ff9211]/20 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#ff9211]/50 scrollbar-track-[#141414] animate-modal-in">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 bg-[#ff9211]/60 rounded-full hover:bg-[#ff9211] transition-all duration-200 transform hover:rotate-90"
            >
              <X className="w-5 h-5 text-[#0f0f0f]" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#ff9211] tracking-tight animate-fade-in">
                {selectedTask?.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#ff9211]/70 mt-2 animate-fade-in-delay">
                {selectedTask?.description}
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <label
                  htmlFor="contractAddress"
                  className="block text-xs sm:text-sm font-medium text-[#ff9211]/80 mb-2"
                >
                  Contract Address
                </label>
                <input
                  id="contractAddress"
                  type="text"
                  name="contractAddress"
                  placeholder="0x..."
                  value={formData.contractAddress}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-[#141414] border ${
                    errors.contractAddress
                      ? "border-[#ff9211]/60"
                      : "border-[#ff9211]/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9211] focus:border-[#ff9211] transition-all duration-300`}
                  disabled={isVerifying}
                />
                {errors.contractAddress && (
                  <p className="text-[#ff9211]/60 text-xs mt-1 animate-fade-in">
                    {errors.contractAddress}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="abi"
                  className="block text-xs sm:text-sm font-medium text-[#ff9211]/80 mb-2"
                >
                  ABI (JSON)
                </label>
                <textarea
                  id="abi"
                  name="abi"
                  placeholder='[{"type":"function", "name":"sayHello", "inputs":[],"outputs":[{"type":"string"}],"stateMutability":"pure"}]'
                  value={formData.abi}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-[#141414] border ${
                    errors.abi ? "border-[#ff9211]/60" : "border-[#ff9211]/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9211] focus:border-[#ff9211] transition-all duration-300 h-28 resize-none`}
                  disabled={isVerifying}
                />
                {errors.abi && (
                  <p className="text-[#ff9211]/60 text-xs mt-1 animate-fade-in">
                    {errors.abi}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="contract"
                  className="block text-xs sm:text-sm font-medium text-[#ff9211]/80 mb-2"
                >
                  Contract Source Code (Solidity)
                </label>
                <textarea
                  id="contract"
                  name="contract"
                  placeholder="pragma solidity ^0.8.0;\ncontract HelloWorld {\n  function sayHello() public pure returns (string memory) {\n    return 'Hello, World!';\n  }\n}"
                  value={formData.contract}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-[#141414] border ${
                    errors.contract ? "border-[#ff9211]/60" : "border-[#ff9211]/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9211] focus:border-[#ff9211] transition-all duration-300 h-36 resize-none`}
                  disabled={isVerifying}
                />
                {errors.contract && (
                  <p className="text-[#ff9211]/60 text-xs mt-1 animate-fade-in">
                    {errors.contract}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="walletAddress"
                  className="block text-xs sm:text-sm font-medium text-[#ff9211]/80 mb-2"
                >
                  Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  name="walletAddress"
                  placeholder="0x..."
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-[#141414] border ${
                    errors.walletAddress
                      ? "border-[#ff9211]/60"
                      : "border-[#ff9211]/30"
                  } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9211] focus:border-[#ff9211] transition-all duration-300`}
                  disabled={isVerifying}
                />
                {errors.walletAddress && (
                  <p className="text-[#ff9211]/60 text-xs mt-1 animate-fade-in">
                    {errors.walletAddress}
                  </p>
                )}
              </div>

              {result && (
                <div className="text-xs sm:text-sm text-[#ff9211]/80 mt-4 bg-[#141414] p-4 rounded-lg border border-[#ff9211]/20 animate-slide-in">
                  <p>
                    {result.includes("Task verified") ? (
                      <>
                        {result.split("Check")[0]}
                        <a
                          href={result.split("at: ")[1]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff9211] hover:underline font-semibold"
                        >
                          Check Transactions on CORE Testnet Explorer
                        </a>
                      </>
                    ) : (
                      result
                    )}
                  </p>
                  {status && (
                    <div className="mt-3 space-y-2">
                      <p className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Status:{" "}
                        <span
                          className={
                            status.verified
                              ? "text-[#ff9211] font-semibold"
                              : "text-red-400"
                          }
                        >
                          {status.verified ? "Verified" : "Not Verified"}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Reward Eligibility:{" "}
                        <span
                          className={
                            status.eligibleForReward
                              ? "text-[#ff9211] font-semibold"
                              : "text-red-400"
                          }
                        >
                          {status.eligibleForReward ? "Eligible" : "Not Eligible"}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sticky bottom-0 bg-[#1a1a1a] py-4 -mx-6 sm:-mx-8 px-6 sm:px-8 border-t border-[#ff9211]/20">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isVerifying}
                  className={`flex-1 py-3 bg-gradient-to-r from-[#ff9211] to-[#e0820f] text-[#0f0f0f] font-semibold rounded-lg hover:from-[#e0820f] hover:to-[#d0760e] focus:outline-none focus:ring-4 focus:ring-[#ff9211]/50 transition-all duration-300 transform hover:scale-105 ${
                    isVerifying ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Inputs"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-[#1a1a1a] text-[#ff9211] border border-[#ff9211]/40 font-semibold rounded-lg hover:bg-[#ff9211]/10 focus:outline-none focus:ring-4 focus:ring-[#ff9211]/50 transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="p-4 sm:p-6 text-center text-gray-400 text-xs sm:text-sm bg-[#1a1a1a]/80">
        <p>
          Questions?{" "}
          <a
            href="mailto:dev.proof.reward@gmail.com"
            className="text-[#ff9211] hover:underline transition-colors duration-200"
          >
            Reach out to support
          </a>
        </p>
        <p className="mt-1 sm:mt-2">© 2025 DevProof - Powered by CORE Testnet</p>
      </footer>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-[#ff9211]/10 rounded-full blur-3xl animate-pulse opacity-20" />
        <div className="absolute bottom-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-[#e0820f]/10 rounded-full blur-3xl animate-pulse opacity-20" />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-delay {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pulse-slow {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-modal-in {
          animation: modal-in 0.4s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-[#ff9211]\/50::-webkit-scrollbar-thumb {
          background: rgba(255, 146, 17, 0.5);
          border-radius: 4px;
        }
        .scrollbar-track-[#141414]::-webkit-scrollbar-track {
          background: #141414;
        }
      `}</style>
    </div>
  );
}