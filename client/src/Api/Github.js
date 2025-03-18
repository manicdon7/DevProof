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

export const fetchUserRepos = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/repos`);
  return response.data; 
};


export const fetchUserEvents = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/events`);
  return response.data; 
};

export const fetchRepoCommits = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/commits`);
  return response.data; 
};

export const fetchStarredRepos = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/users/${username}/starred`);
  return response.data; 
};

export const fetchUserPRs = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(`/search/issues?q=author:${username}+type:pr`);
  return response.data.items; 
};

export const fetchUserIssues = async (username, token) => {
  const api = createApi(token);
  const response = await api.get(
    `/search/issues?q=author:${username}+type:issue`
  );
  return response.data.items; 
};

export const fetchRepoContents = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/contents`);
  return response.data; 
};

export const fetchRepoLanguages = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}/languages`);
  return response.data;
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
  const response = await api.get(`/repos/${owner}/${repo}/subscribers`);
  return response.data;
};

export const fetchRepoOpenIssues = async (owner, repo, token) => {
  const api = createApi(token);
  const response = await api.get(`/repos/${owner}/${repo}`);
  return response.data.open_issues_count;
};
