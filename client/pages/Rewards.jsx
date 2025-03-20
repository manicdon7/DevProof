import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  AlertCircle,
  Loader2,
  Award,
  CheckCircle,
  Unlink,
} from "lucide-react";

const GITHUB_ORG = "coredao-org";
const BASE_URL = "https://api.github.com";
const API_BASE_URL = "http://localhost:5000"; // Update for production

const useGitHubIssues = (token) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all repos from the organization
      const repoResponse = await axios.get(
        `${BASE_URL}/orgs/${GITHUB_ORG}/repos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          timeout: 10000,
        }
      );

      const repos = repoResponse.data;
      const issuePromises = repos.map((repo) =>
        axios.get(`${BASE_URL}/repos/${GITHUB_ORG}/${repo.name}/issues`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
          params: { state: "all", per_page: 100 }, // Fetch all issues (open, closed)
        })
      );

      const issueResponses = await Promise.all(issuePromises);
      const allIssues = await Promise.all(
        issueResponses.flatMap((response, index) =>
          response.data.map(async (issue) => {
            const isPullRequest = !!issue.pull_request;
            let isMerged = false;
            const contributor = issue.user.login;
            let isConnected = false;

            // If it's a PR, check merge status
            if (isPullRequest) {
              const prResponse = await axios.get(issue.pull_request.url, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              });
              isMerged = !!prResponse.data.merged_at;

              // If merged, check DB connection
              if (isMerged) {
                try {
                  const dbResponse = await axios.get(
                    `${API_BASE_URL}/api/checkUser?username=${contributor}`
                  );
                  isConnected = dbResponse.data.isConnected || false;
                } catch (err) {
                  console.error(`Error checking ${contributor} in DB:`, err);
                }
              }
            }

            return {
              id: issue.id,
              title: issue.title,
              url: issue.html_url,
              repoName: repos[index].name,
              repoUrl: repos[index].html_url,
              createdAt: issue.created_at,
              state: issue.state,
              isPullRequest,
              isMerged,
              contributor,
              isConnected, // True only if PR is merged and user is in DB
            };
          })
        )
      );

      setIssues(
        allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch issues. Please try again."
      );
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchIssues();
  }, [token, fetchIssues]);

  return { issues, loading, error, refetch: fetchIssues };
};

const IssuesPage = () => {
  const GITHUB_TOKEN = sessionStorage.getItem("oauthAccessToken");
  const { issues, loading, error, refetch } = useGitHubIssues(GITHUB_TOKEN);
  const [rewardMessage, setRewardMessage] = useState("");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const handleReward = async (contributor) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/sendReward`,
        { username: contributor, rewardType: "points", amount: 5 },
        {
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
        }
      );
      setRewardMessage(
        `Rewarded ${contributor} with ${response.data.amount} points!`
      );
      setTimeout(() => setRewardMessage(""), 3000);
    } catch (err) {
      setRewardMessage(
        `Failed to reward ${contributor}: ${
          err.response?.data?.message || err.message
        }`
      );
      setTimeout(() => setRewardMessage(""), 3000);
      console.error("Reward error:", err);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-6 font-sans">
      {/* Header Section */}
      <header className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-orange-400 flex items-center gap-3 tracking-tight">
          <Github className="w-8 h-8 text-orange-400" /> Issues & PRs Dashboard
        </h1>
        <button
          onClick={refetch}
          disabled={loading}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-orange-500/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Refreshing
            </span>
          ) : (
            "Refresh"
          )}
        </button>
      </header>

      {/* Reward Feedback */}
      {rewardMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-8 max-w-2xl mx-auto text-center text-sm font-medium text-orange-300 bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg shadow-md"
        >
          {rewardMessage}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-orange-400 w-10 h-10" />
            <span className="ml-4 text-lg font-medium text-white/80">
              Loading Issues...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="text-orange-400 w-12 h-12 mb-4" />
            <p className="text-lg font-medium text-white/90">{error}</p>
            <button
              onClick={refetch}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all duration-200 shadow-md"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {issues.length === 0 ? (
              <motion.p
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="text-center text-lg font-medium text-white/80"
              >
                No issues or PRs found in {GITHUB_ORG} repositories.
              </motion.p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {issues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`p-5 bg-gray-800/50 border rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:bg-gray-800/70 ${
                      issue.isPullRequest && issue.isMerged
                        ? "border-orange-500/50"
                        : "border-gray-700/50"
                    }`}
                  >
                    <a
                      href={issue.repoUrl}
                      className="text-orange-400 text-lg font-semibold hover:underline tracking-tight"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {issue.repoName}
                    </a>
                    <p className="mt-2 text-white/90 text-sm line-clamp-2">
                      <a
                        href={issue.url}
                        className="hover:text-orange-300 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {issue.title}
                      </a>
                    </p>
                    <p className="mt-1 text-white/60 text-xs">
                      Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        issue.isPullRequest && issue.isMerged
                          ? "text-green-400"
                          : issue.isPullRequest
                          ? "text-yellow-400"
                          : "text-white/60"
                      }`}
                    >
                      Status:{" "}
                      {issue.isPullRequest
                        ? issue.isMerged
                          ? "Merged"
                          : "PR Open"
                        : "Issue"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white/90 text-sm font-medium">
                          {issue.contributor}
                        </span>
                        {issue.isPullRequest && issue.isMerged && (
                          <>
                            {issue.isConnected ? (
                              <CheckCircle
                                className="w-5 h-5 text-green-400"
                                title="Connected to Database"
                              />
                            ) : (
                              <Unlink
                                className="w-5 h-5 text-gray-500"
                                title="Not Connected"
                              />
                            )}
                          </>
                        )}
                      </div>
                      {issue.isPullRequest &&
                        issue.isMerged &&
                        issue.isConnected && (
                          <button
                            onClick={() => handleReward(issue.contributor)}
                            className="p-2 bg-orange-500/10 rounded-full hover:bg-orange-500/30 transition-all duration-200 group relative"
                            title={`Reward ${issue.contributor} with 5 points`}
                          >
                            <Award className="w-5 h-5 text-orange-400 group-hover:text-orange-300" />
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              Reward
                            </span>
                          </button>
                        )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default IssuesPage;
