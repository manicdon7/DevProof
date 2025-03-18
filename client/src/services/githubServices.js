const GITHUB_API_BASE = "https://api.github.com";

const githubService = {
  getUserProfile: async (username) => {
    const response = await axios.get(`${GITHUB_API_BASE}/users/${username}`);
    return response.data;
  },
  getRepos: async (username) => {
    const response = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos`
    );
    return response.data;
  },
  getPullRequests: async (owner, repo) => {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`
    );
    return response.data;
  },
};

export default githubService;
