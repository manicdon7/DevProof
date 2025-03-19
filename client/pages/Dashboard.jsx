import { useAccount } from "wagmi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import GithubProvider from "../components/GithubProvider";
import {
  calculateStats,
  fetchRepoContents,
  fetchStarredRepos,
  fetchUserData,
  fetchUserEvents,
  fetchUserIssues,
  fetchUserPRs,
  fetchUserRepos,
  getCommitStats,
} from "../src/Api/Github";
import { useUserContext } from "../context";
import githubService from "../src/services/githubServices";

export default function DashBoard() {
  const { address } = useAccount();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [commitStats, setCommitStats] = useState(null);
  const [profitYield, setProfitYield] = useState(null);
  const [star, setStar] = useState(null);
  const { Token } = useUserContext();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pr, setPr] = useState({
    mergedPrCount: 0,
    totalPrCount: 0,
  });
  const [Issue, setIssue] = useState({
    total: 0,
    openissue: 0,
    closed: 0,
  });
  const [repos, setRepos] = useState({
    Total: 0,
    repos: 0,
    Fork: 0,
    star: 0,
  });
  const [userData, setUserData] = useState("");

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

  useEffect(() => {
    if (user) {
      const fetchRepo = async () => {
        try {
          const Key = sessionStorage.getItem("oauthAccessToken");
          const repo = await fetchUserRepos(
            user.reloadUserInfo.screenName,
            Key
          );
          const data = {
            Total: repo.Total,
            repos: repo.reposlen,
            Fork: repo.Fork,
            star: repo.star,
          };

          setRepos(data);
        } catch (error) {
          console.error("Error fetching repos:", error);
        }
      };
      fetchRepo();
    }
  }, [user]);

  useEffect(() => {
    let token = null;
    const fetchData = async () => {
      try {
        token = sessionStorage.getItem("oauthAccessToken");
        const data = await fetchUserData(user.reloadUserInfo.screenName, token);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();

    const fetchCommitStats = async () => {
      try {
        const events = await fetchUserEvents(
          user.reloadUserInfo.screenName,
          token
        );
        const commits = getCommitStats(events);
        const stats = calculateStats(commits, user.reloadUserInfo.screenName);

        setCommitStats(stats);
      } catch (error) {
        console.error("Error fetching user events:", error);
        setCommitStats({
          totalCommits: 0,
          commitsThisYear: 0,
          avgPerDay: 0,
          largestCommit: 0,
          externalCommits: 0,
        });
      }
    };

    fetchCommitStats();

    const fetchstarredRepos = async () => {
      const stared = await fetchStarredRepos(
        user?.reloadUserInfo?.screenName,
        token
      );

      if (stared) {
        setStar(stared);
      }
    };

    fetchstarredRepos();

    const fetchPr = async () => {
      if (user?.reloadUserInfo?.screenName) {
        try {
          const res = await fetchUserPRs(user.reloadUserInfo.screenName, token);
          if (res) {
            setPr(res);
          }
        } catch (error) {
          console.error("Error fetching PRs:", error);
        }
      }
    };

    fetchPr();

    const issues = async () => {
      if (user?.reloadUserInfo?.screenName) {
        try {
          const res = await fetchUserIssues(
            user.reloadUserInfo.screenName,
            token
          );
          if (res) {
            setIssue(res);
          }
        } catch (error) {
          console.error("Error fetching PRs:", error);
        }
      }
    };
    issues();

    const ai = async () => {
      if (user?.reloadUserInfo?.screenName) {
        try {
          const service = githubService();
          const repoNames = await service.repo(
            user.reloadUserInfo.screenName,
            token
          );

          if (!Array.isArray(repoNames) || repoNames.length === 0) {
            console.log("No repositories found or invalid data.");
            return;
          }

          let names = [];

          for (const repoName of repoNames) {
            const repoContent = await fetchRepoContents(
              user.reloadUserInfo.screenName,
              repoName,
              token
            );

            if (repoContent) {
              names.push({ repoName, content: repoContent });
            }
          }

          const reposWithMdCount = names.map((repo) => ({
            repoName: repo.repoName,
            content: repo.content,
            mdCount: repo.content.filter((file) => file.name.endsWith(".md"))
              .length,
          }));

          const maxMdCount = Math.max(
            ...reposWithMdCount.map((r) => r.mdCount)
          );

          const reposWithoutMaxMd = reposWithMdCount
            .filter((r) => r.mdCount < maxMdCount)
            .map((r) => ({ repoName: r.repoName, content: r.content }));

          setProfitYield(reposWithoutMaxMd.length);
        } catch (error) {
          console.error("Error fetching repos:", error);
        }
      }
    };

    ai();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 border-b border-gray-200 pb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-blue-200 overflow-hidden">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-500">
                    {user?.displayName?.[0] || "U"}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                Tier: Gold
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {user?.displayName || "User"}
                <span className="text-sm font-normal text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </h2>
              <div className="mt-2 flex gap-4 justify-center sm:justify-start">
                <p className="text-gray-600">
                  Points:{" "}
                  <span className="font-semibold text-green-600">5,678</span>
                </p>
                <p className="text-gray-600">
                  Rank:{" "}
                  <span className="font-semibold text-purple-600">#42</span>
                </p>
                <p className="text-gray-600">
                  Joined:{" "}
                  <span className="font-semibold text-blue-600">
                    {user?.created_at?.slice(0, 4) || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>📚 Repositories</span>
                <span className="text-xs text-green-500">+5 pts/repo</span>
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {repos.repos ? repos.repos.length : 0}
              </p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>
                  Public:
                  {repos.repos
                    ? repos.repos.filter((repo) => !repo.fork).length
                    : 0}
                </p>
                <p>
                  Forks:
                  {repos.repos
                    ? repos.repos.filter((repo) => repo.fork).length
                    : 0}
                </p>
                <p>Total Stars: {repos.star}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>👥 Social</span>
                <span className="text-xs text-green-500">+10/+3 pts</span>
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {userData ? userData.followers : "0"}
              </p>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <p>Followers: {userData ? userData.followers : "0"}</p>
                <p>Following: {userData ? userData.following : "0"}</p>
                <p>
                  New:
                  {userData
                    ? Math.floor(
                        (Date.now() - new Date(userData.created_at)) /
                          (1000 * 60 * 60 * 24 * 30)
                      )
                    : "0"}
                  /mo
                </p>
                <p>Gists: {userData ? userData.public_gists : "0"}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>💾 Commits</span>
                <span className="text-xs text-green-500">+2/+5 pts</span>
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {commitStats?.totalCommits || 0}
              </p>
              {commitStats ? (
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>Total Commits: {commitStats?.totalCommits}</p>
                  <p>This Year: {commitStats?.commitsThisYear}</p>
                  <p>Avg/Day: {commitStats?.avgPerDay.toFixed(2)}</p>
                  <p>Largest: {commitStats?.largestCommit}</p>
                  <p>External: {commitStats?.externalCommits}</p>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>⭐ Stars</span>
                <span className="text-xs text-green-500">+15 pts</span>
              </h3>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {repos.star}
              </p>
              <p className="text-xs text-gray-500 mt-1">Given: {star}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>📝 PRs</span>
                <span className="text-xs text-green-500">+20/+25 pts</span>
              </h3>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {pr.totalPrCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Merged: {pr.mergedPrCount}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>🐛 Issues</span>
                <span className="text-xs text-green-500">+10/+15 pts</span>
              </h3>
              <p className="text-2xl font-semibold text-gray-800 mt-1">
                {Issue.total}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                opened: {Issue.openissue}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Closed: {Issue.closed}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-600 flex items-center gap-1">
                <span>📦 Packages</span>
                <span className="text-xs text-green-500">+30 pts</span>
              </h3>
              <p className="text-2xl font-semibold text-gray-800 mt-1">8</p>
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>Downloads: 1.2K</p>
                <p>Dependents: 15</p>
              </div>
            </div>
          </div>

          {/* Detailed Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm text-gray-600 mb-4">Code Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Lines of Code</span>
                  <span className="font-semibold text-gray-800">45,672</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Code Reviews</span>
                  <span className="font-semibold text-gray-800">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Top Language</span>
                  <span className="font-semibold text-gray-800">
                    JavaScript (62%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Test Coverage</span>
                  <span className="font-semibold text-gray-800">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Contributions</span>
                  <span className="font-semibold text-gray-800">1,892</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-sm text-gray-600 mb-4">
                Activity Highlights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Most Active Repo</span>
                  <span className="font-semibold text-gray-800 truncate">
                    project-awesome
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longest Streak</span>
                  <span className="font-semibold text-gray-800">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Organizations</span>
                  <span className="font-semibold text-gray-800">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gists</span>
                  <span className="font-semibold text-gray-800">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discussions</span>
                  <span className="font-semibold text-gray-800">18</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm text-gray-600 mb-4">Points Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Repositories ({profitYield})
                </span>
                <span className="font-semibold text-green-600">
                  {profitYield * 5}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Followers ({userData ? userData.followers : 0})
                </span>
                <span className="font-semibold text-green-600">
                  {userData ? userData.followers * 2 : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Commits ({commitStats?.totalCommits})
                </span>
                <span className="font-semibold text-green-600">
                  {commitStats?.totalCommits * 10}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stars ({repos.star})</span>
                <span className="font-semibold text-green-600">
                  {repos.star * 5}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  PRs Merged ({pr.mergedPrCount})
                </span>
                <span className="font-semibold text-green-600">
                  {pr.mergedPrCount * 20}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Packages (8)</span>
                <span className="font-semibold text-green-600">240</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Issues Closed ({Issue.closed})
                </span>
                <span className="font-semibold text-green-600">{ Issue.closed * 5 }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Code Reviews (23 × 10)</span>
                <span className="font-semibold text-green-600">230</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total Points</span>
                <span className="text-green-600">5,893</span>
              </div>
            </div>
          </div>

          {/* GitHub Insights */}
          <div className="bg-white p-6 rounded-xl shadow-sm mt-10">
            <h3 className="text-sm text-gray-600 mb-4">GitHub Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Watchers</span>
                <span className="font-semibold text-gray-800">95</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Open Issues</span>
                <span className="font-semibold text-gray-800">14</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Forks</span>
                <span className="font-semibold text-gray-800">150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Streak</span>
                <span className="font-semibold text-gray-800">12 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Top Repo Stars</span>
                <span className="font-semibold text-gray-800">120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-semibold text-gray-800">
                  Mar 15, 2025
                </span>
              </div>
            </div>
          </div>
        </div>
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
              By logging in, you agree to our
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
