'use client';

import { useState } from 'react';

interface AMDAgent007Props {
  articleTitle?: string;
}

export default function AMDAgent007({ articleTitle }: AMDAgent007Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'agent'; text: string }>>([
    {
      role: 'agent',
      text: articleTitle 
        ? `👋 Hi! I'm Agent 007. I can help you understand this article: "${articleTitle.substring(0, 60)}..."`
        : '👋 Hi! I'm AMD Agent 007. Ask me anything about AMD Solutions, African tech, or this article!'
    }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = message;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setMessage('');

    // Simulate agent response (replace with OpenAI API call later)
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'agent',
        text: `I understand you're asking about "${userMessage}". This feature is being enhanced with OpenAI integration. For now, join our War Room for real-time discussions: https://chat.whatsapp.com/KmTlNs5TTV69xPNzRkcMZc`
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-black border-2 border-[#facc15] rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#facc15] to-[#eab308] p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#facc15] font-bold text-sm">
                007
              </div>
              <div>
                <h3 className="font-bold text-black">AMD Agent 007</h3>
                <p className="text-xs text-black/70">Realtime Intel</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black hover:text-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#facc15] text-black'
                      : 'bg-gray-800 text-white border border-[rgba(250,204,21,0.2)]'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[rgba(250,204,21,0.2)]">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-900 border border-[rgba(250,204,21,0.2)] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#facc15]"
              />
              <button
                onClick={handleSend}
                className="bg-[#facc15] hover:bg-[#eab308] text-black p-2 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#facc15] to-[#eab308] rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform group"
        title="Chat with AMD Agent 007"
      >
        <span className="text-2xl font-bold text-black group-hover:scale-110 transition-transform">
          007
        </span>
      </button>
    </>
  );
}
