import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation } from 'react-router-dom';
import { saveMessages, loadMessages } from "./ChatStorage";
import { motion } from 'framer-motion';

const TypingIndicator = () => (
  <div className="flex space-x-2 p-2">
    <div className="w-2 h-2 bg-[#ff9211] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-[#ff9211] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-[#ff9211] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const CoreMate = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [messages, setMessages] = useState(location.state?.messages || loadMessages());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const getAIResponse = async (userInput) => {
    try {
      const response = await fetch('https://dev-proof-backend.vercel.app/api/coremate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json(); // Parse JSON response
      if (!data.success || typeof data.data !== 'string') {
        throw new Error('Invalid response format from API');
      }
  
      return data.data.trim(); // Return only the markdown content from 'data'
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return `
  ## Oops! 😅
  
  Sorry, I'm having trouble connecting right now. Please try asking your CORE platform question again!
  
  What can I help you with?
      `.trim();
    }
  };

  const simulateTyping = async (text) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const aiMessage = {
      role: 'ai',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, aiMessage]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiResponse = await getAIResponse(input.trim());
    await simulateTyping(aiResponse);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed bottom-20 right-6 w-[90vw] max-w-md h-[70vh] z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="relative bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white font-lexend rounded-2xl shadow-xl overflow-hidden flex flex-col h-full border border-[#ff9211]/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff9211] to-orange-500 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-[#e0820f] p-2 rounded-xl">
              <Bot className="w-6 h-6 text-[#0f0f0f]" />
            </div>
            <h2 className="text-lg font-rubik font-bold text-[#0f0f0f]">CoreMate</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#0f0f0f] hover:text-orange-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1a1a]">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-4 p-4 bg-[#1c1c1c] rounded-2xl border border-[#ff9211]/20">
              <Bot className="w-12 h-12 mx-auto mb-2 text-[#ff9211]" />
              <p className="text-lg font-medium text-[#ff9211] mb-1">Hey there! I’m CoreMate! 👋</p>
              <p className="text-gray-300 text-sm">Ask me anything about the CORE staking platform!</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse gap-2' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#ff9211]' : 'bg-orange-500'}`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-[#0f0f0f]" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#0f0f0f]" />
                  )}
                </div>
                <div
                  style={{ borderRadius: msg.role === "user" ? "20px 0px 20px 20px" : "0px 20px 20px 20px" }}
                  className={`p-3 mt-4 ${msg.role === 'user'
                    ? 'bg-[#ff9211] text-[#0f0f0f]'
                    : 'bg-[#1c1c1c] text-white border border-[#ff9211]/30 shadow-md'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-orange-200' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#0f0f0f]" />
              </div>
              <div className="bg-[#1c1c1c] rounded-2xl p-2 border border-[#ff9211]/30 shadow-md">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1c1c1c] border-t border-[#ff9211]/20">
          <div className="flex items-end space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the CORE platform..."
              className="flex-1 text-white p-3 border border-[#ff9211]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff9211] focus:border-transparent resize-none max-h-24 bg-[#141414] placeholder-gray-500 text-sm"
              rows="1"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-xl ${loading || !input.trim()
                ? 'bg-gray-600 text-gray-400'
                : 'bg-[#ff9211] text-[#0f0f0f] hover:bg-[#e0820f]'
              } transition-all duration-200 ease-in-out`}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoreMate;