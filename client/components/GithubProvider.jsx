import { useUserContext } from "../context";
import { auth, signInWithPopup, provider } from "../firebase.config";

export default function GithubProvider() {
  const { setUsers } = useUserContext();

  const Provider = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result);
      if (result && result.user) {
        sessionStorage.setItem(
          "oauthAccessToken",
          result._tokenResponse.oauthAccessToken
        );
        setUsers(result?.user);
      } else {
        console.error("Result or user is null");
      }
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  return (
    <div>
      <div
        onClick={Provider}
        className="cursor-pointer p-3 bg-black text-white rounded"
      >
        Github
      </div>
    </div>
  );
}
