import { useState, useEffect } from "react";
import { ethers } from "ethers"; // Install: npm i ethers
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
} from "lucide-react"; // Install: npm i lucide-react

const tasks = [
  {
    id: 1,
    title: "Hello World Message",
    description:
      "Write a Solidity contract with a function `sayHello()` that returns the string 'Hello, World!'. I need this function in your contract.",
    expectedFunction: "sayHello",
    icon: Bug,
    args: [],
    isView: true,
  },
  // ... (other tasks unchanged)
];

export default function TaskSubmission() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    contractAddress: "",
    abi: "",
    walletAddress: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setResult(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.contractAddress.trim())
      newErrors.contractAddress = "Contract address is required.";
    if (!formData.abi.trim()) newErrors.abi = "ABI is required.";
    if (!formData.walletAddress.trim())
      newErrors.walletAddress = "Wallet address is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsCalling(true);
    setResult(null);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      let abi;
      try {
        abi = JSON.parse(formData.abi);
        console.log(abi);
      } catch (e) {
        throw new Error("Invalid ABI JSON format. Please check your input.");
      }

      const contract = new ethers.Contract(
        formData.contractAddress,
        abi,
        signer
      );

      const { expectedFunction, args, isView } = selectedTask;

      // Verify function exists in ABI
      const functionAbi = abi.find(
        (item) => item.type === "function" && item.name === expectedFunction
      );
      if (!functionAbi) {
        throw new Error(
          `Function "${expectedFunction}" not found in the provided ABI.`
        );
      }

      // Log for debugging
      console.log("Calling function:", expectedFunction, "with args:", args);

      if (isView) {
        // Call view function
        const response = await contract[expectedFunction](...args);
        console.log("Raw response:", response);
        setResult(`Result: ${response.toString()}`);
      } else {
        // Send transaction
        const tx = await contract[expectedFunction](...args);
        const receipt = await tx.wait();
        setResult(`Transaction successful! Tx Hash: ${receipt.hash}`);
      }

      setFormData({ contractAddress: "", abi: "", walletAddress: "" });
      setErrors({});
    } catch (error) {
      console.error("Error calling contract:", error);
      setResult(
        `Error: ${
          error.message ||
          "Failed to call the function. Check console for details."
        }`
      );
    } finally {
      setIsCalling(false);
    }
  };

  const handleCloseModal = () => {
    setFormData({ contractAddress: "", abi: "", walletAddress: "" });
    setErrors({});
    setResult(null);
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const SkeletonCard = () => (
    <div className="p-6 bg-gray-800 border border-orange-700 rounded-xl h-64 w-full animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-orange-600 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-orange-600 rounded w-3/4"></div>
          <div className="h-4 bg-orange-600 rounded w-full"></div>
          <div className="h-4 bg-orange-600 rounded w-5/6"></div>
        </div>
      </div>
      <div className="mt-6 h-10 bg-orange-600 rounded-lg w-full"></div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col font-sans">
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-black to-gray-950">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {isLoading
            ? Array(10)
                .fill()
                .map((_, i) => <SkeletonCard key={i} />)
            : tasks.map((task) => (
                <article
                  key={task.id}
                  className="p-6 bg-gray-800 border border-orange-700 rounded-xl h-64 flex flex-col justify-between shadow-lg hover:shadow-orange-700/20 transition-shadow duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <task.icon className="w-12 h-12 text-orange-500" />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {task.title}
                      </h3>
                      <p className="text-sm text-orange-300 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTaskSelect(task)}
                    className="mt-4 w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                  >
                    Call Function
                  </button>
                </article>
              ))}
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-85 z-50">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-lg border border-orange-700 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 bg-orange-700 rounded-full hover:bg-orange-600 transition duration-200"
            >
              <X className="w-5 h-5 text-orange-200" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-orange-500">
                {selectedTask?.title}
              </h2>
              <p className="text-sm text-orange-300 mt-2">
                {selectedTask?.description}
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label
                  htmlFor="contractAddress"
                  className="block text-sm font-medium text-orange-300 mb-2"
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
                  className={`w-full p-3 bg-gray-900 border ${
                    errors.contractAddress
                      ? "border-orange-600"
                      : "border-orange-700"
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200`}
                />
                {errors.contractAddress && (
                  <p className="text-orange-600 text-sm mt-1">
                    {errors.contractAddress}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="abi"
                  className="block text-sm font-medium text-orange-300 mb-2"
                >
                  ABI (JSON)
                </label>
                <textarea
                  id="abi"
                  name="abi"
                  placeholder='[{"type":"function"...}]'
                  value={formData.abi}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-gray-900 border ${
                    errors.abi ? "border-orange-600" : "border-orange-700"
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 h-32 resize-none`}
                />
                {errors.abi && (
                  <p className="text-orange-600 text-sm mt-1">{errors.abi}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="walletAddress"
                  className="block text-sm font-medium text-orange-300 mb-2"
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
                  className={`w-full p-3 bg-gray-900 border ${
                    errors.walletAddress
                      ? "border-orange-600"
                      : "border-orange-700"
                  } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200`}
                />
                {errors.walletAddress && (
                  <p className="text-orange-600 text-sm mt-1">
                    {errors.walletAddress}
                  </p>
                )}
              </div>

              {result && (
                <div className="text-sm text-orange-300 mt-4">
                  <p>{result}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isCalling}
                  className={`flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 ${
                    isCalling ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isCalling ? "Calling..." : "Call Function"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-700 text-orange-300 font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
