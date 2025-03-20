import { useAccount } from "wagmi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import GithubProvider from "../components/GithubProvider";
import {
  calculateStats,
  fetchAllReviews,
  fetchRepoContents,
  fetchRepoWatchers,
  fetchStarredRepos,
  fetchUserData,
  fetchUserEvents,
  fetchUserIssues,
  fetchUserPRs,
  fetchUserRepos,
  getCommitStats,
  getLastUpdatedForAllRepositories,
  getTotalForksForAllRepositories,
  IssueClassify,
} from "../src/Api/Github";
import githubService from "../src/services/githubServices";
import axios from "axios";

const SkeletonCard = () => (
  <div className="bg-gray-800/50 p-6 rounded-2xl animate-pulse">
    <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-4"></div>
    <div className="h-10 bg-gray-700/50 rounded w-1/2 mb-3"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-700/50 rounded w-full"></div>
      <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
    </div>
  </div>
);

export default function DashBoard() {
  const { address } = useAccount();
  const [TotalScore, setTotalscore] = useState(null);
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [commitStats, setCommitStats] = useState(null);
  const [Latest, setLatest] = useState(null);
  const [profitYield, setProfitYield] = useState(null);
  const [watcher, setwatcher] = useState(0);
  const [specIssue, setSpecissue] = useState(null);
  const [star, setStar] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pr, setPr] = useState({ mergedPrCount: 0, totalPrCount: 0 });
  const [repos, setRepos] = useState({ Total: 0, repos: 0, Fork: 0, star: 0 });
  const [userData, setUserData] = useState("");
  const [review, setReview] = useState(null);
  const [forked, setForked] = useState(null);
  const [Issue, setIssue] = useState({
    total: 0,
    openissue: 0,
    closed: 0,
    specialIssues: {},
  });
  const [dataStatus, setDataStatus] = useState({
    profitYield: false,
    userData: false,
    commitStats: false,
    repos: false,
    pr: false,
    Issue: false,
    review: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allDataReady = Object.values(dataStatus).every((status) => status);
    if (allDataReady) {
      const score =
        (profitYield || 0) * 5 +
        (userData?.followers || 0) * 2 +
        (commitStats?.totalCommits || 0) * 10 +
        (repos.star || 0) * 5 +
        (pr.mergedPrCount || 0) * 20 +
        (Issue.closed || 0) * 5 +
        (review || 0) * 7;

      setTotalscore(score);

      const dataStore = {
        userName: user?.reloadUserInfo?.screenName,
        wallet: sessionStorage.getItem("connected"),
        score: score,
      };

      sessionStorage.setItem("dataStore", JSON.stringify(dataStore));
      const stakeres = sessionStorage.getItem("stake");

      if (stakeres) {
        const storedData = sessionStorage.getItem("dataStore");
        const response = JSON.parse(storedData);

        async function main() {
          try {
            await axios.post(
              "https://dev-proof-backend.vercel.app/api/leaderboard",
              {
                wallet: response.wallet,
                username: response.userName,
                score: response.score ?? 0,
              }
            );
          } catch (error) {
            console.error("Error submitting leaderboard:", error);
          }
        }
        main();
      }
    }
  }, [
    dataStatus,
    profitYield,
    userData,
    commitStats,
    repos,
    pr,
    Issue,
    review,
    user,
    address,
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      console.log("currentUser:", currentUser);
      sessionStorage.setItem(
        "currentUser",
        currentUser?.reloadUserInfo?.screenName || ""
      );
      setIsPopupOpen(!currentUser);
      setIsLoading(false);
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
    if (!user) return;

    let token = sessionStorage.getItem("oauthAccessToken");

    const fetchRepo = async () => {
      try {
        const repo = await fetchUserRepos(
          user.reloadUserInfo.screenName,
          token
        );
        const data = {
          Total: repo.Total,
          repos: repo.reposlen,
          Fork: repo.Fork,
          star: repo.star,
        };
        setRepos(data);
        setDataStatus((prev) => ({ ...prev, repos: true }));
      } catch (error) {
        console.error("Error fetching repos:", error);
        setDataStatus((prev) => ({ ...prev, repos: true }));
      }
    };

    const getLatest = async () => {
      try {
        if (user?.reloadUserInfo?.screenName) {
          const latestUpdatedDate = await getLastUpdatedForAllRepositories(
            user.reloadUserInfo.screenName,
            token
          );
          if (latestUpdatedDate) {
            const date = new Date(latestUpdatedDate);
            setLatest(date.toLocaleString());
          }
        }
      } catch (error) {
        console.error("Error fetching latest update date:", error);
      }
    };

    fetchRepo();
    getLatest();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let token = sessionStorage.getItem("oauthAccessToken");

    const fetchData = async () => {
      try {
        const data = await fetchUserData(user.reloadUserInfo.screenName, token);
        setUserData(data);
        setDataStatus((prev) => ({ ...prev, userData: true }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setDataStatus((prev) => ({ ...prev, userData: true }));
      }
    };

    const fetchCommitStats = async () => {
      try {
        const events = await fetchUserEvents(
          user.reloadUserInfo.screenName,
          token
        );
        const commits = getCommitStats(events);
        const stats = calculateStats(commits, user.reloadUserInfo.screenName);
        setCommitStats(stats);
        setDataStatus((prev) => ({ ...prev, commitStats: true }));
      } catch (error) {
        console.error("Error fetching user events:", error);
        setCommitStats({
          totalCommits: 0,
          commitsThisYear: 0,
          avgPerDay: 0,
          largestCommit: 0,
          externalCommits: 0,
        });
        setDataStatus((prev) => ({ ...prev, commitStats: true }));
      }
    };

    const fetchstarredRepos = async () => {
      try {
        const stared = await fetchStarredRepos(
          user.reloadUserInfo.screenName,
          token
        );
        if (stared) setStar(stared);
      } catch (error) {
        console.error("Error fetching starred repos:", error);
      }
    };

    const getForked = async () => {
      try {
        const res = await getTotalForksForAllRepositories(
          user.reloadUserInfo.screenName,
          token
        );
        setForked(res);
      } catch (error) {
        console.error("Error fetching forks:", error);
      }
    };

    const fetchPr = async () => {
      try {
        const res = await fetchUserPRs(user.reloadUserInfo.screenName, token);
        if (res) {
          setPr(res);
          setDataStatus((prev) => ({ ...prev, pr: true }));
        }
      } catch (error) {
        console.error("Error fetching PRs:", error);
        setDataStatus((prev) => ({ ...prev, pr: true }));
      }
    };

    const issues = async () => {
      try {
        const res = await fetchUserIssues(
          user.reloadUserInfo.screenName,
          token
        );
        if (res?.specialIssues?.length > 0) {
          setIssue(res);
          const resp = await IssueClassify(res.specialIssues);
          setSpecissue(resp.priority);
        }
        setDataStatus((prev) => ({ ...prev, Issue: true }));
      } catch (error) {
        console.error("Error fetching issues:", error);
        setDataStatus((prev) => ({ ...prev, Issue: true }));
      }
    };

    const ai = async () => {
      try {
        const service = githubService();
        const allRepos = [];
        let page = 1;
        const perPage = 100;

        while (true) {
          const repos = await service.repo(
            user.reloadUserInfo.screenName,
            token,
            { page, per_page: perPage }
          );
          if (!Array.isArray(repos) || repos.length === 0) break;
          allRepos.push(...repos);
          if (repos.length < perPage) break;
          page++;
        }

        if (allRepos.length === 0) {
          console.log("No repos found, setting profitYield to 0");
          setProfitYield(0);
          setDataStatus((prev) => ({ ...prev, profitYield: true }));
          return;
        }

        console.log(`Fetched ${allRepos.length} repos`);

        const batchSize = 20;
        const repoContents = [];

        for (let i = 0; i < allRepos.length; i += batchSize) {
          const batch = allRepos.slice(i, i + batchSize);
          const batchPromises = batch.map(async (repoName) => {
            try {
              const repoContent = await fetchRepoContents(
                user.reloadUserInfo.screenName,
                repoName,
                token
              );
              return { repoName, content: repoContent || [] };
            } catch (err) {
              console.warn(
                `Failed to fetch contents for ${repoName}: ${err.message}`
              );
              return { repoName, content: [] };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          repoContents.push(...batchResults);
          console.log(
            `Processed batch ${i / batchSize + 1} of ${Math.ceil(
              allRepos.length / batchSize
            )}`
          );
        }

        const reposWithMdCount = repoContents.map((repo) => ({
          repoName: repo.repoName,
          content: repo.content,
          mdCount: repo.content.filter((file) =>
            file.name?.toLowerCase().endsWith(".md")
          ).length,
        }));

        const maxMdCount = Math.max(
          ...reposWithMdCount.map((r) => r.mdCount),
          0
        );
        const reposWithoutMaxMd = reposWithMdCount
          .filter((r) => r.mdCount < maxMdCount)
          .map((r) => ({ repoName: r.repoName, content: r.content }));

        const profitYieldValue = reposWithoutMaxMd.length;
        console.log(
          `Profit Yield calculated: ${profitYieldValue} from ${allRepos.length} repos`
        );

        setProfitYield(profitYieldValue);
        setDataStatus((prev) => ({ ...prev, profitYield: true }));
      } catch (error) {
        console.error("Critical error in ai function:", error);
        setProfitYield(0);
        setDataStatus((prev) => ({ ...prev, profitYield: true }));
      }
    };

    const getReviews = async () => {
      try {
        const res = await fetchAllReviews(
          user.reloadUserInfo.screenName,
          token
        );
        setReview(res.length);
        setDataStatus((prev) => ({ ...prev, review: true }));
      } catch (error) {
        console.error("Error in getReviews:", error);
        setDataStatus((prev) => ({ ...prev, review: true }));
      }
    };

    const GetWatchers = async () => {
      try {
        const service = githubService();
        const repoNames = await service.repo(
          user.reloadUserInfo.screenName,
          token
        );
        if (!Array.isArray(repoNames) || repoNames.length === 0) return;

        let watchersData = [];
        for (const repoName of repoNames) {
          const repoWatchers = await fetchRepoWatchers(
            user.reloadUserInfo.screenName,
            repoName,
            token
          );
          const watchersCount = repoWatchers?.watchers?.watchers_count;
          if (watchersCount && watchersCount !== 0) {
            watchersData.push({ repoName, watchers: repoWatchers });
          }
        }
        if (watchersData.length > 0) setwatcher(watchersData);
      } catch (error) {
        console.error("Error in GetWatchers:", error);
      }
    };

    fetchData();
    fetchCommitStats();
    fetchstarredRepos();
    getForked();
    fetchPr();
    issues();
    ai();
    getReviews();
    GetWatchers();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] opacity-10 animate-subtlePulse"></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="w-96 h-96 bg-[#f59300]/10 rounded-full blur-3xl absolute top-10 left-10 animate-glow"></div>
        <div className="w-96 h-96 bg-[#f59300]/15 rounded-full blur-3xl absolute bottom-10 right-10 animate-glow-slow"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-6 relative z-10">
        <div className="bg-black/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-[#f59300]/30 hover:border-[#f59300]/60 transition-all duration-500">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-12 border-b border-[#f59300]/20 pb-6">
            {isLoading ? (
              <div className="flex items-center gap-8 w-full animate-pulse">
                <div className="w-32 h-32 rounded-full bg-gray-800/50"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-800/50 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center ring-4 ring-[#f59300]/40 group-hover:ring-[#f59300]/60 transition-all duration-300 overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-5xl text-[#f59300] group-hover:text-[#ffaa33] transition-colors duration-300">
                      {user?.displayName?.[0] || "U"}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-2 -right-2 bg-[#f59300] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                  Tier: Gold
                </span>
              </div>
            )}
            {!isLoading && (
              <div className="text-center sm:text-left">
                <h2 className="text-4xl font-extrabold text-[#f59300] flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                  {user?.displayName || "User"}
                  <span className="text-sm font-medium text-black bg-[#ffaa33] px-4 py-1 rounded-full shadow-md">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </h2>
                <div className="mt-4 flex gap-6 justify-center sm:justify-start text-gray-300">
                  <p>
                    Points:{" "}
                    <span className="font-semibold text-[#ffaa33]">
                      {TotalScore || 0}
                    </span>
                  </p>
                  <p>
                    Rank:{" "}
                    <span className="font-semibold text-[#ffaa33]">#42</span>
                  </p>
                  <p>
                    Joined:{" "}
                    <span className="font-semibold text-[#ffaa33]">
                      {user?.created_at?.slice(0, 4) || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {isLoading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => <SkeletonCard key={i} />)
              : [
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="repos"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">📚</span> Repositories
                      <span className="text-xs text-[#ffaa33]">
                        +5 pts/repo
                      </span>
                    </h3>
                    <p className="text-4xl font-bold text-[#ffaa33] mt-2">
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
                  </div>,
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="social"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">👥</span> Social
                      <span className="text-xs text-[#ffaa33]">+10/+3 pts</span>
                    </h3>
                    <p className="text-4xl font-bold text-[#ffaa33] mt-2">
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
                  </div>,
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="commits"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">💾</span> Commits
                      <span className="text-xs text-[#ffaa33]">+2/+5 pts</span>
                    </h3>
                    <p className="text-4xl font-bold text-[#ffaa33] mt-2">
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
                        <p className="text-[#ffaa33] animate-pulse">
                          Loading...
                        </p>
                      )}
                    </div>
                  </div>,
                ]}
          </div>

          {/* Contribution Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {isLoading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => <SkeletonCard key={i} />)
              : [
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="stars"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">⭐</span> Stars
                      <span className="text-xs text-[#ffaa33]">+15 pts</span>
                    </h3>
                    <p className="text-3xl font-semibold text-[#ffaa33] mt-2">
                      {repos.star}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Given: {star}</p>
                  </div>,
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="prs"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">📝</span> PRs
                      <span className="text-xs text-[#ffaa33]">
                        +20/+25 pts
                      </span>
                    </h3>
                    <p className="text-3xl font-semibold text-[#ffaa33] mt-2">
                      {pr.totalPrCount}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Merged: {pr.mergedPrCount}
                    </p>
                  </div>,
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="issues"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">🐛</span> Issues
                      <span className="text-xs text-[#ffaa33]">
                        +10/+15 pts
                      </span>
                    </h3>
                    <p className="text-3xl font-semibold text-[#ffaa33] mt-2">
                      {Issue.total}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Opened: {Issue.openissue}
                    </p>
                    <p className="text-xs text-gray-400">
                      Closed: {Issue.closed}
                    </p>
                  </div>,
                  <div
                    className="bg-gray-900/60 backdrop-blur-sm p-5 rounded-2xl border border-[#f59300]/20 hover:border-[#f59300]/50 hover:shadow-[#f59300]/20 shadow-lg transition-all duration-300"
                    key="packages"
                  >
                    <h3 className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-[#f59300]">📦</span> Packages
                      <span className="text-xs text-[#ffaa33]">+30 pts</span>
                    </h3>
                    <p className="text-3xl font-semibold text-[#ffaa33] mt-2">
                      8
                    </p>
                    <div className="text-xs text-gray-400 mt-1 space-y-1">
                      <p>Downloads: 1.2K</p>
                      <p>Dependents: 15</p>
                    </div>
                  </div>,
                ]}
          </div>

          {/* Detailed Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 shadow-lg">
                  <h3 className="text-sm text-[#f59300] mb-4 font-semibold">
                    Code Stats
                  </h3>
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Lines of Code</span>
                      <span className="font-semibold">45,672</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Code Reviews</span>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Top Language</span>
                      <span className="font-semibold">JavaScript (62%)</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Test Coverage</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Total Contributions</span>
                      <span className="font-semibold">1,892</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 shadow-lg">
                  <h3 className="text-sm text-[#f59300] mb-4 font-semibold">
                    Activity Highlights
                  </h3>
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Most Active Repo</span>
                      <span className="font-semibold truncate">
                        project-awesome
                      </span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Longest Streak</span>
                      <span className="font-semibold">45 days</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Organizations</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Gists</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                      <span>Discussions</span>
                      <span className="font-semibold">18</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Points Breakdown */}
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 shadow-lg mb-12">
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <>
                <h3 className="text-sm text-[#f59300] mb-4 font-semibold">
                  Points Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Repositories ({profitYield})</span>
                    <span className="font-semibold">{profitYield * 5}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Followers ({userData ? userData.followers : 0})</span>
                    <span className="font-semibold">
                      {userData ? userData.followers * 2 : 0}
                    </span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Commits ({commitStats?.totalCommits})</span>
                    <span className="font-semibold">
                      {commitStats?.totalCommits * 10}
                    </span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Stars ({repos.star})</span>
                    <span className="font-semibold">{repos.star * 5}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>PRs Merged ({pr.mergedPrCount})</span>
                    <span className="font-semibold">
                      {pr.mergedPrCount * 20}
                    </span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Packages (8)</span>
                    <span className="font-semibold">240</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Issues Closed ({Issue.closed})</span>
                    <span className="font-semibold">{Issue.closed * 5}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Code Reviews ({review})</span>
                    <span className="font-semibold">{review * 7}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>Total Points</span>
                    <span className="text-[#ffaa33]">{TotalScore}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* GitHub Insights */}
          <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border border-[#f59300]/20 shadow-lg">
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <>
                <h3 className="text-sm text-[#f59300] mb-4 font-semibold">
                  GitHub Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Total Watchers</span>
                    <span className="font-semibold">{watcher}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Open Issues</span>
                    <span className="font-semibold">{Issue.openissue}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Total Forks</span>
                    <span className="font-semibold">{forked}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Current Streak</span>
                    <span className="font-semibold">12 days</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Top Repo Stars</span>
                    <span className="font-semibold">{repos.star}</span>
                  </div>
                  <div className="flex justify-between hover:text-[#ffaa33] transition-colors duration-200">
                    <span>Last Updated</span>
                    <span className="font-semibold">{Latest}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!user && isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-lg z-50 animate-slideIn">
          <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-[#f59300]/40 relative transform transition-all duration-300 hover:scale-105">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-[#ffaa33] transition-colors duration-300"
              onClick={() => setIsPopupOpen(false)}
            >
              <span className="text-2xl">X</span>
            </button>
            <h2 className="text-2xl font-bold text-center mb-6 text-[#f59300] tracking-wide animate-fadeIn">
              Welcome to Your Dashboard
            </h2>
            <p className="text-sm text-gray-300 mb-6 text-center">
              Log in with GitHub to ignite your stats!
            </p>
            <ul className="text-sm text-gray-400 list-none mb-6 space-y-2">
              <li className="flex items-center gap-2 animate-slideIn delay-100">
                <span className="text-[#f59300]">🔥</span> Secure Authentication
              </li>
              <li className="flex items-center gap-2 animate-slideIn delay-200">
                <span className="text-[#f59300]">🔥</span> Track Your Progress
              </li>
              <li className="flex items-center gap-2 animate-slideIn delay-300">
                <span className="text-[#f59300]">🔥</span> Access Anywhere
              </li>
            </ul>
            <GithubProvider />
            <p className="text-xs text-center text-gray-500 mt-6">
              By logging in, you agree to our{" "}
              <a href="#" className="text-[#ffaa33] hover:underline">
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
