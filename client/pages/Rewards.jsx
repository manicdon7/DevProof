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
} from "lucide-react"; // Install: npm i lucide-react

const tasks = [
  {
    id: 1,
    title: "Hello World Message",
    description:
      "Write a Solidity contract with a function `sayHello()` that returns the string 'Hello, World!'. I need this function in your contract.",
    icon: Bug,
  },
  {
    id: 2,
    title: "Simple Counter",
    description:
      "Create a Solidity contract with a function `increment()` that increases a public counter by 1. I need this function in your contract.",
    icon: Brush,
  },
  {
    id: 3,
    title: "Store a Number",
    description:
      "Build a Solidity contract with a function `setNumber(uint256 _value)` that stores a number in a public variable. I need this function in your contract.",
    icon: Database,
  },
  {
    id: 4,
    title: "Check Balance",
    description:
      "Develop a Solidity contract with a function `getBalance()` that returns the contract’s ETH balance. I need this function in your contract.",
    icon: FileCode,
  },
  {
    id: 5,
    title: "Toggle a Flag",
    description:
      "Write a Solidity contract with a function `toggle()` that flips a public boolean flag. I need this function in your contract.",
    icon: Lock,
  },
  {
    id: 6,
    title: "Double a Value",
    description:
      "Create a Solidity contract with a function `double(uint256 _input)` that returns the input multiplied by 2. I need this function in your contract.",
    icon: Zap,
  },
  {
    id: 7,
    title: "Set Owner",
    description:
      "Build a Solidity contract with a function `setOwner(address _newOwner)` that updates a public owner address. I need this function in your contract.",
    icon: GitMerge,
  },
  {
    id: 8,
    title: "Lock Funds",
    description:
      "Develop a Solidity contract with a function `lock()` that prevents withdrawals until a condition is met. I need this function in your contract.",
    icon: Shield,
  },
  {
    id: 9,
    title: "Greet User",
    description:
      "Write a Solidity contract with a function `greet(string memory _name)` that returns a greeting with the input name. I need this function in your contract.",
    icon: BookOpen,
  },
  {
    id: 10,
    title: "Transfer Tokens",
    description:
      "Create a Solidity contract with a function `transfer(address _to, uint256 _amount)` that moves ERC-20-like tokens. I need this function in your contract.",
    icon: CreditCard,
  },
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

  // Simulate loading for skeleton
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // 1.5s delay
    return () => clearTimeout(timer);
  }, []);

  // Open modal with selected task
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate and submit form
  const handleSubmit = () => {
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

    console.log("Task Submitted:", { task: selectedTask, ...formData });
    setFormData({ contractAddress: "", abi: "", walletAddress: "" });
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Close modal with reset
  const handleCloseModal = () => {
    setFormData({ contractAddress: "", abi: "", walletAddress: "" });
    setErrors({});
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Skeleton Loader Component
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
      {/* Task List */}
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
                    Submit Solution
                  </button>
                </article>
              ))}
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-85 z-50">
          <div className="bg-gray-800 p-8 rounded-xl w-full max-w-lg border border-orange-700 shadow-2xl relative">
            {/* Close Button */}
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

            <form className="space-y-6">
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

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                >
                  Submit
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
