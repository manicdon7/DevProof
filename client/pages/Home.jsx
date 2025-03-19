import { useAccount } from "wagmi";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { HeroSection } from "../components/HeroSection";
import { EmpowerSection } from "../components/EmpowerSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { WhyChooseSection } from "../components/WhyChooseSection";
import { LeaderboardSection } from "../components/LeaderBoardSection";
import { JoinSection } from "../components/JoinSection";
import { FeaturedSection } from "../components/FeaturedSection";
import { NewsletterSection } from "../components/NewsLetterSection";
import ClickSpark from "../components/ClickSpark";
import BotButton from "../components/BotButton";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const auth = getAuth();
  const [githubUser, setGithubUser] = useState(null);

  // Monitor GitHub authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGithubUser(user); // Set GitHub user if authenticated, null if not
    });
    return () => unsubscribe();
  }, [auth]);

  // Handle redirection logic
  useEffect(() => {
    const AuthRedirect = async () => {
      try {
        // Check if both wallet is connected AND GitHub is authenticated
        if (isConnected && address && githubUser) {
          const data = JSON.stringify({
            address: address,
            connected: isConnected,
            githubUid: githubUser.uid, // Store GitHub UID for reference
          });
          Cookies.set("address", data);
          navigate("/staketoken");
        }
      } catch (error) {
        console.error("Error in AuthRedirect:", error);
      }
    };

    AuthRedirect();
  }, [address, isConnected, githubUser, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-white">
      <ClickSpark
        sparkColor='#ff9211'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="bg-[#1a1a1a] w-full">
        <BotButton/>
          <HeroSection />
          <EmpowerSection />
          <HowItWorksSection />
          <WhyChooseSection />
          <LeaderboardSection />
          <JoinSection />
          {/* <FeaturedSection />
          <NewsletterSection /> */}

        </div>
      </ClickSpark>
    </div>
  );
}