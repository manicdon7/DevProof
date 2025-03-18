import { useAccount } from "wagmi";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    const AuthRedirect = async () => {
      try {
        if (isConnected && address) {
          const Data = JSON.stringify({
            address: address,
            connected: isConnected,
          });
          Cookies.set("address", Data);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error in AuthRedirect:", error);
      }
    };

    AuthRedirect();
  }, [address, isConnected, navigate]);

  return (
    <div>
      <div className="flex justify-center h-auto">{address}</div>
    </div>
  );
}
