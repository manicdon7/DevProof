import { fetchUserRepos } from "../Api/Github";

const githubService = () => {
  const repo = async (username, token) => {
    try {
      const res = await fetchUserRepos(username, token);

      if (!res || !Array.isArray(res.Total)) {
        console.error(
          "Error: Expected 'Total' to be an array but got",
          res.Total
        );
        return [];
      }

      const repoNames = res.Total.map((repo) => repo.name);
      return repoNames;
    } catch (error) {
      console.error("Error fetching repos:", error);
    }
  };

  return { repo };
};

export default githubService;
