import { useAccount } from "wagmi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import GithubProvider from "../components/GithubProvider";
import {
  calculateStats,
  fetchAllReviews,
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
  const [TotalScore, setTotalscore] = useState(null);
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

  useEffect(() => {
    function sum() {
      const score =
        profitYield * 5 +
        userData.followers * 2 +
        commitStats?.totalCommits * 10 +
        repos.star * 5 +
        pr.mergedPrCount * 20 +
        Issue.closed * 5 +
        review * 7;

      setTotalscore(score);
    }
    sum();
  });
  const [review, setReview] = useState(null);
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

    const getReviews = async () => {
      try {
        if (user?.reloadUserInfo?.screenName) {
          const res = await fetchAllReviews(
            user.reloadUserInfo.screenName,
            token
          );
          setReview(res.length);
        }
      } catch (error) {
        console.error("Error in getReviews:", error);
      }
    };

    getReviews();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-15 animate-subtlePulse"></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="w-80 h-80 bg-orange-500/20 rounded-full blur-3xl absolute top-20 left-20 animate-glow"></div>
        <div className="w-80 h-80 bg-orange-600/20 rounded-full blur-3xl absolute bottom-20 right-20 animate-glow-slow"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-6 relative z-10">
        <div className="bg-black/85 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-orange-500/40 hover:border-orange-500/70 transition-all duration-500">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-12 border-b border-orange-500/30 pb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center ring-4 ring-orange-500/50 group-hover:ring-orange-400 transition-all duration-300 overflow-hidden">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-5xl text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                    {user?.displayName?.[0] || "U"}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                Tier: Gold
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-4xl font-extrabold text-orange-400 flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                {user?.displayName || "User"}
                <span className="text-sm font-medium text-black bg-orange-400 px-4 py-1 rounded-full shadow-md">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </h2>
              <div className="mt-4 flex gap-6 justify-center sm:justify-start text-gray-300">
                <p>
                  Points:{" "}
                  <span className="font-semibold text-orange-400">
                    {TotalScore || 0}
                  </span>
                </p>
                <p>
                  Rank:{" "}
                  <span className="font-semibold text-orange-400">#42</span>
                </p>
                <p>
                  Joined:{" "}
                  <span className="font-semibold text-orange-400">
                    {user?.created_at?.slice(0, 4) || "N/A"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">📚</span> Repositories
                <span className="text-xs text-orange-500">+5 pts/repo</span>
              </h3>
              <p className="text-4xl font-bold text-orange-400 mt-2">
                {repos.repos ? repos.repos.length : 0}
              </p>
              <div className="text-xs text-gray-400 mt-3 space-y-1">
                <p>
                  Public:{" "}
                  {repos.repos
                    ? repos.repos.filter((repo) => !repo.fork).length
                    : 0}
                </p>
                <p>
                  Forks:{" "}
                  {repos.repos
                    ? repos.repos.filter((repo) => repo.fork).length
                    : 0}
                </p>
                <p>Total Stars: {repos.star}</p>
              </div>
            </div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">👥</span> Social
                <span className="text-xs text-orange-500">+10/+3 pts</span>
              </h3>
              <p className="text-4xl font-bold text-orange-400 mt-2">
                {userData ? userData.followers : "0"}
              </p>
              <div className="text-xs text-gray-400 mt-3 space-y-1">
                <p>Followers: {userData ? userData.followers : "0"}</p>
                <p>Following: {userData ? userData.following : "0"}</p>
                <p>
                  New:{" "}
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
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">💾</span> Commits
                <span className="text-xs text-orange-500">+2/+5 pts</span>
              </h3>
              <p className="text-4xl font-bold text-orange-400 mt-2">
                {commitStats?.totalCommits || 0}
              </p>
              <div className="text-xs text-gray-400 mt-3 space-y-1">
                {commitStats ? (
                  <>
                    <p>Total: {commitStats?.totalCommits}</p>
                    <p>This Year: {commitStats?.commitsThisYear}</p>
                    <p>Avg/Day: {commitStats?.avgPerDay.toFixed(2)}</p>
                    <p>Largest: {commitStats?.largestCommit}</p>
                    <p>External: {commitStats?.externalCommits}</p>
                  </>
                ) : (
                  <p className="text-orange-500 animate-pulse">Loading...</p>
                )}
              </div>
            </div>
          </div>

          {/* Contribution Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">⭐</span> Stars
                <span className="text-xs text-orange-500">+15 pts</span>
              </h3>
              <p className="text-3xl font-semibold text-orange-400 mt-2">
                {repos.star}
              </p>
              <p className="text-xs text-gray-400 mt-1">Given: {star}</p>
            </div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">📝</span> PRs
                <span className="text-xs text-orange-500">+20/+25 pts</span>
              </h3>
              <p className="text-3xl font-semibold text-orange-400 mt-2">
                {pr.totalPrCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Merged: {pr.mergedPrCount}
              </p>
            </div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">🐛</span> Issues
                <span className="text-xs text-orange-500">+10/+15 pts</span>
              </h3>
              <p className="text-3xl font-semibold text-orange-400 mt-2">
                {Issue.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Opened: {Issue.openissue}
              </p>
              <p className="text-xs text-gray-400">Closed: {Issue.closed}</p>
            </div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-2xl border border-orange-500/20 hover:border-orange-400 hover:shadow-orange-500/30 shadow-lg transition-all duration-300">
              <h3 className="text-sm text-gray-400 flex items-center gap-2">
                <span className="text-orange-400">📦</span> Packages
                <span className="text-xs text-orange-500">+30 pts</span>
              </h3>
              <p className="text-3xl font-semibold text-orange-400 mt-2">8</p>
              <div className="text-xs text-gray-400 mt-1 space-y-1">
                <p>Downloads: 1.2K</p>
                <p>Dependents: 15</p>
              </div>
            </div>
          </div>

          {/* Detailed Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 shadow-lg">
              <h3 className="text-sm text-orange-400 mb-4 font-semibold">
                Code Stats
              </h3>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Lines of Code</span>
                  <span className="font-semibold">45,672</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Code Reviews</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Top Language</span>
                  <span className="font-semibold">JavaScript (62%)</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Test Coverage</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Total Contributions</span>
                  <span className="font-semibold">1,892</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 shadow-lg">
              <h3 className="text-sm text-orange-400 mb-4 font-semibold">
                Activity Highlights
              </h3>
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Most Active Repo</span>
                  <span className="font-semibold truncate">
                    project-awesome
                  </span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Longest Streak</span>
                  <span className="font-semibold">45 days</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Organizations</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Gists</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                  <span>Discussions</span>
                  <span className="font-semibold">18</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 shadow-lg mb-12">
            <h3 className="text-sm text-orange-400 mb-4 font-semibold">
              Points Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Repositories ({profitYield})</span>
                <span className="font-semibold">{profitYield * 5}</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Followers ({userData ? userData.followers : 0})</span>
                <span className="font-semibold">
                  {userData ? userData.followers * 2 : 0}
                </span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Commits ({commitStats?.totalCommits})</span>
                <span className="font-semibold">
                  {commitStats?.totalCommits * 10}
                </span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Stars ({repos.star})</span>
                <span className="font-semibold">{repos.star * 5}</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>PRs Merged ({pr.mergedPrCount})</span>
                <span className="font-semibold">{pr.mergedPrCount * 20}</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Packages (8)</span>
                <span className="font-semibold">240</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Issues Closed ({Issue.closed})</span>
                <span className="font-semibold">{Issue.closed * 5}</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Code Reviews ({review})</span>
                <span className="font-semibold">{review * 7}</span>
              </div>
              <div className="flex justify-between font-bold text-white">
                <span>Total Points</span>
                <span className="text-orange-400">{TotalScore}</span>
              </div>
            </div>
          </div>

          {/* GitHub Insights */}
          <div className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 shadow-lg">
            <h3 className="text-sm text-orange-400 mb-4 font-semibold">
              GitHub Insights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Total Watchers</span>
                <span className="font-semibold">95</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Open Issues</span>
                <span className="font-semibold">14</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Total Forks</span>
                <span className="font-semibold">150</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Current Streak</span>
                <span className="font-semibold">12 days</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Top Repo Stars</span>
                <span className="font-semibold">120</span>
              </div>
              <div className="flex justify-between hover:text-orange-400 transition-colors duration-200">
                <span>Last Updated</span>
                <span className="font-semibold">Mar 15, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      {!user && isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-lg z-50 animate-slideIn">
          <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-orange-500/50 relative transform transition-all duration-300 hover:scale-105">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-orange-400 transition-colors duration-300"
              onClick={() => setIsPopupOpen(false)}
            >
              <span className="text-2xl">×</span>
            </button>
            <h2 className="text-2xl font-bold text-center mb-6 text-orange-400 tracking-wide animate-fadeIn">
              Welcome to Your Dashboard
            </h2>
            <p className="text-sm text-gray-300 mb-6 text-center">
              Log in with GitHub to ignite your stats!
            </p>
            <ul className="text-sm text-gray-400 list-none mb-6 space-y-2">
              <li className="flex items-center gap-2 animate-slideIn delay-100">
                <span className="text-orange-400">🔥</span> Secure
                Authentication
              </li>
              <li className="flex items-center gap-2 animate-slideIn delay-200">
                <span className="text-orange-400">🔥</span> Track Your Progress
              </li>
              <li className="flex items-center gap-2 animate-slideIn delay-300">
                <span className="text-orange-400">🔥</span> Access Anywhere
              </li>
            </ul>
            <GithubProvider />
            <p className="text-xs text-center text-gray-500 mt-6">
              By logging in, you agree to our{" "}
              <a href="#" className="text-orange-400 hover:underline">
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
