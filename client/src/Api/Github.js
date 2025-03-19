import axios from "axios";

const GITHUB_API_BASE = "https://api.github.com";

const createApi = (token) => {
  return axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
};

export const fetchUserData = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}`);
  return response.data;
};

export const fetchUserRepos = async (username, token, page = 1) => {
  const api = createApi(token);
  const response = await api.get(
    `/users/${username}/repos?visibility=all&page=${page}&per_page=100`
  );

  const totalStars = response.data.reduce(
    (total, repo) => total + repo.stargazers_count,
    0
  );

  const response2 = response.data.filter((repo) => repo.fork);
  return {
    Total: response.data,
    reposlen: response.data,
    Fork: response2.length,
    star: totalStars,
  };
};

export const fetchRepoCommits = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/commits`);
  return response.data;
};

export const fetchUserEvents = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/events`);
  return response.data;
};

export const getCommitStats = (events) => {
  const commits = [];

  events.forEach((event) => {
    if (event.type === "PushEvent") {
      const commitCount = event.payload.commits.length;

      commits.push({
        date: new Date(event.created_at),
        commitCount,
      });
    }
  });

  return commits;
};

export const calculateStats = (commits, username) => {
  const currentYear = new Date().getFullYear();
  let totalCommits = 0;
  let commitsThisYear = 0;
  let largestCommit = 0;
  let externalCommits = 0;
  let totalDays = new Set();

  commits.forEach((commit) => {
    const isExternal = commit.repo && !commit.repo.owner.login === username;

    totalCommits += commit.commitCount;
    totalDays.add(commit.date.toDateString());

    if (commit.date.getFullYear() === currentYear) {
      commitsThisYear += commit.commitCount;
    }

    if (commit.commitCount > largestCommit) {
      largestCommit = commit.commitCount;
    }

    if (isExternal) {
      externalCommits += commit.commitCount;
    }
  });

  const avgPerDay = totalCommits / totalDays.size;

  return {
    totalCommits: totalCommits,
    commitsThisYear: commitsThisYear,
    avgPerDay: avgPerDay,
    largestCommit: largestCommit,
    externalCommits: externalCommits,
  };
};

export const fetchStarredRepos = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/starred`);
  const givenStarsCount = response.data.length;

  return givenStarsCount;
};

export const fetchUserPRs = async (username, token) => {
  const api = createApi(token);
  let prItems = [];
  let mergedPrItems = [];
  let page = 1;

  while (true) {
    const response = await api.get(
      `/search/issues?q=author:${username}+type:pr&page=${page}&per_page=100`
    );

    if (response.data.items.length === 0) {
      break;
    }

    prItems = [...prItems, ...response.data.items];

    const mergedItems = response.data.items.filter((pr) => {
      if (!pr.pull_request.merged_at) return false;
      const repoOwner = pr.repository_url.split("/").slice(-2, -1)[0];
      return pr.user.login !== repoOwner;
    });

    mergedPrItems = [...mergedPrItems, ...mergedItems];

    page += 1;
  }

  return {
    totalPrCount: prItems.length,
    mergedPrCount: mergedPrItems.length,
  };
};
export const fetchUserIssues = async (username, token) => {
  const api = createApi(token);
  let issueItems = [];
  let page = 1;

  while (true) {
    const response = await api.get(
      `/search/issues?q=author:${username}+type:issue&page=${page}&per_page=100`
    );

    if (!response.data || response.data.items.length === 0) {
      break;
    }

    issueItems = [...issueItems, ...response.data.items];
    page += 1;
  }

  const openedIssues = issueItems.filter(
    (issue) => issue.state === "open"
  ).length;

  const closedIssues = issueItems.filter(
    (issue) => issue.state === "closed" && issue.labels.length === 0
  ).length;

  const specialIssuesClosed = issueItems
    .filter(
      (issue) => issue.state === "closed" && issue.labels.length > 0
      // issue.user?.login !== username
    )
    .map((issue) => ({
      name: issue.user?.login || "Unknown",
      title: issue.title,
      labels: issue.labels.map((label) => ({
        name: label.name,
        description: label.description || "No description",
        color: label.color || "default",
      })),
    }));

  return {
    total: issueItems.length,
    openissue: openedIssues,
    closed: closedIssues,
    specialIssues: specialIssuesClosed,
  };
};

export const IssueClassify = async (specialissues) => {
  try {
    if (!specialissues || specialissues.length === 0) {
      console.warn("No special issues to analyze.");
      return;
    }

    const res = await axios.post("https://dev-proof-backend/api/classify/v1", {
      issues: specialissues,
    });

    if (res?.data) {
      return res.data;
    } else {
      console.warn("No response data from classification API.");
    }
  } catch (error) {
    console.error(
      "Error classifying issues:",
      error.response?.data || error.message
    );
  }
};

const getUserRepositories = async (userScreenName, token) => {
  try {
    const response = await fetch(
      `https://api.github.com/users/${userScreenName}/repos`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching user repositories: ${response.statusText}`
      );
    }

    const repoData = await response.json();
    return repoData;
  } catch (error) {
    console.error("Error in getUserRepositories:", error);
  }
};

export const getTotalForksForAllRepositories = async (
  userScreenName,
  token
) => {
  try {
    const repos = await getUserRepositories(userScreenName, token);

    if (!repos || repos.length === 0) {
      console.log("No repositories found.");
      return;
    }

    let totalForks = 0;

    for (const repo of repos) {
      totalForks += repo.forks_count;
    }

    return totalForks;
  } catch (error) {
    console.error("Error in getTotalForksForAllRepositories:", error);
  }
};

export const getLastUpdatedForAllRepositories = async (
  userScreenName,
  token
) => {
  try {
    const repos = await getUserRepositories(userScreenName, token);

    if (!repos || repos.length === 0) {
      console.log("No repositories found.");
      return;
    }

    let latestUpdatedDate = null;

    for (const repo of repos) {
      const repoLastUpdated = repo.updated_at;

      if (repoLastUpdated) {
        if (
          !latestUpdatedDate ||
          new Date(repoLastUpdated) > new Date(latestUpdatedDate)
        ) {
          latestUpdatedDate = repoLastUpdated;
        }
      }
    }

    if (latestUpdatedDate) {
      console.log(
        `The most recent "Last Updated" date across all repositories: ${latestUpdatedDate}`
      );
      return latestUpdatedDate;
    } else {
      console.log("No repositories have an 'updated_at' field.");
      return null;
    }
  } catch (error) {
    console.error("Error in getLastUpdatedForAllRepositories:", error);
  }
};

export const fetchRepoContents = async (username, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${username}/${repo}/contents`);
  return response.data;
};

const fetchuserRepos = async (username, token) => {
  try {
    const api = createApi(token);
    let repos = [];
    let page = 1;

    while (true) {
      const response = await api.get(
        `/users/${username}/repos?page=${page}&per_page=100`
      );
      if (response.data.length === 0) break;
      repos.push(...response.data.map((repo) => repo.name));
      page++;
    }

    return repos;
  } catch (error) {
    console.error("Error fetching user repositories:", error);
    return [];
  }
};

const fetchRepoPullRequests = async (owner, repo, token) => {
  try {
    const api = createApi(token);
    let pullRequests = [];
    let page = 1;

    while (true) {
      const response = await api.get(
        `/repos/${owner}/${repo}/pulls?state=all&page=${page}&per_page=100`
      );
      if (response.data.length === 0) break;
      pullRequests.push(...response.data.map((pr) => pr.number));
      page++;
    }

    return pullRequests;
  } catch (error) {
    console.error(`Error fetching PRs for repo ${repo}:`, error);
    return [];
  }
};

const fetchPullRequestReviews = async (owner, repo, prNumber, token) => {
  try {
    const api = createApi(token);
    const response = await api.get(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching reviews for PR #${prNumber} in repo ${repo}:`,
      error
    );
    return [];
  }
};

export const fetchAllReviews = async (username, token) => {
  try {
    const repos = await fetchuserRepos(username, token);

    const prPromises = repos.map((repo) =>
      fetchRepoPullRequests(username, repo, token).then((prs) =>
        prs.map((pr) => ({ repo, pr }))
      )
    );

    const prResults = await Promise.all(prPromises);
    const allPRs = prResults.flat();

    const reviewPromises = allPRs.map(({ repo, pr }) =>
      fetchPullRequestReviews(username, repo, pr, token).then((reviews) => {
        const reviewBodies = reviews
          .map((review) => review.body)
          .filter((body) => body && body.trim() !== "");

        return reviewBodies.length > 0
          ? { repo, prNumber: pr, reviews: reviewBodies }
          : null;
      })
    );

    const reviews = await Promise.all(reviewPromises);
    return reviews.filter((review) => review !== null);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return [];
  }
};

export const fetchRepoStats = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}`);
  return response.data;
};

export const fetchDiscussions = async (owner, repo, token) => {
  const api = createApi(token);
  try {
    const response = await api.get(`/repos/${owner}/${repo}/discussions`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchUserReviews = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(
    `/search/issues?q=reviewed-by:${username}+type:pr`
  );
  return response.data.items;
};

export const fetchContributionStreak = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/events`);
  return response.data;
};

export const fetchUserContributions = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/events`);
  return response.data.filter(
    (event) =>
      event.type === "PushEvent" && event.repo.name.split("/")[0] !== username
  );
};

export const fetchRepoDependents = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/forks`);
  return response.data;
};

export const fetchCommitDetails = async (owner, repo, sha, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/commits/${sha}`);
  return response.data;
};

export const fetchUserOrgs = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/orgs`);
  return response.data;
};

export const fetchRepoWatchers = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}`);
  return response.data;
};

export const fetchRepoOpenIssues = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}`);
  return response.data.open_issues_count;
};
