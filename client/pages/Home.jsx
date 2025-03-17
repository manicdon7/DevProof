import { useAccount } from "wagmi";

export default function HomePage() {
  const { address } = useAccount();
  return (
    <div>
      <div className="flex justify-center h-auto">{address}</div>
    </div>
  );
}
