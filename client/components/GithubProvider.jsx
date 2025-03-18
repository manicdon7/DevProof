import { auth, signInWithPopup, provider } from "../firebase.config";

export default function GithubProvider() {
  const Provider = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
    } catch (error) {
      throw new Error(error);
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
