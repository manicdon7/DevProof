import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FuzzyText from '../components/FuzzyText';

const NotFound = () => {
  const navigate = useNavigate();
  const [hoverIntensity, setHoverIntensity] = useState(0.2);
  const [enableHover, setEnableHover] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-[#0f0f0f] text-white font-lexend">
      <div className="bg-[#1a1a1a] p-8 rounded-xl shadow-xl border border-[#ff9211]/30 max-w-[600px] w-full">
        <div 
          className="mb-4"
          onMouseEnter={() => setHoverIntensity(0.8)}
          onMouseLeave={() => setHoverIntensity(0.2)}
        >
          <FuzzyText 
            baseIntensity={0.2} 
            hoverIntensity={hoverIntensity} 
            enableHover={enableHover}
            color="#ff9211" // Match staking accent
            fontFamily="Rubik" // Match staking headings
            fontSize="clamp(3rem, 12vw, 12rem)" // Slightly larger for impact
          >
            404
          </FuzzyText>
        </div>
        <h2 className="text-4xl mt-4 mb-6 text-[#ff9211] font-rubik font-bold">
          Page Not Found
        </h2>
        <p className="text-xl mb-8 text-[#a0a0a0] max-w-[600px]">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-[#ff9211] text-[#0f0f0f] font-rubik font-semibold rounded-full shadow-lg 
          hover:bg-[#e0820f] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(255,146,17,0.3)] 
          active:translate-y-0"
          onMouseEnter={() => setEnableHover(false)}
          onMouseLeave={() => setEnableHover(true)}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;