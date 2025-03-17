import { useAccount } from "wagmi";
import GithubProvider from "../components/Github";

export default function DashBoard() {
  const { address } = useAccount();
  return (
    <div>
      <div className="flex justify-center h-auto">{address}</div>
      <GithubProvider />
    </div>
  );
}
