import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import CoreMate from '../components/CoreMate';

const BotButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div className="relative group">
          <motion.button
            className="bg-[#ff9211] hover:bg-[#e0820f] w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleChat}
          >
            <Bot className="w-8 h-8 text-[#0f0f0f]" />
          </motion.button>
          <motion.span
            className="absolute -top-10 right-1/2 translate-x-1/2 bg-[#1c1c1c] text-[#ff9211] border border-[#ff9211]/30 font-semibold text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CoreMate
          </motion.span>
        </motion.div>
      </motion.div>
      <CoreMate isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default BotButton;