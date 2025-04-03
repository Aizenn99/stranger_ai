import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, ChatState } from './types';
import { Skull } from 'lucide-react';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

const STRANGER_THINGS_PROMPT = `You are an AI assistant themed after Stranger Things. 
Respond in a way that incorporates elements and terminology from the show, such as:
- The Upside Down
- Hawkins Lab
- The Mind Flayer
- Demogorgons
- References to characters like Eleven, Mike, Dustin, etc.
- Use phrases like "mouth breather", "friends don't lie", "pretty good", etc.
Keep responses helpful and accurate while maintaining the theme.
`;

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [skulls, setSkulls] = useState<{ id: number; size: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const newSkulls = Array.from({ length: 25 }, (_, i) => {
      const size = Math.random() * 40 + 20; // Size between 20px and 60px
      return {
        id: i,
        size,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${Math.random() * 3}s`,
          opacity: Math.random() * 0.7 + 0.3, // Random opacity between 0.3 and 1
        },
      };
    });
    setSkulls(newSkulls);
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: 'user', content: message };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const chat = model.startChat({
        history: [
          { role: 'assistant', parts: STRANGER_THINGS_PROMPT },
          ...chatState.messages.map(msg => ({
            role: msg.role,
            parts: msg.content,
          })),
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const botMessage: Message = {
        role: 'assistant',
        content: response.text(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Floating Skulls - Full Screen */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {skulls.map(skull => (
          <Skull
            key={skull.id}
            size={skull.size}
            className="absolute text-red-500 animate-floating"
            style={skull.style}
          />
        ))}
      </div>

      {/* Header */}
      <header className="bg-black/80 p-4 md:p-6 border-b border-red-900/40 shadow-lg shadow-red-900/10 relative z-10">
        <div className="flex items-center justify-between max-w-screen-lg mx-auto w-full">        
          {/* Stranger Things Logo (Centered) */}
          <div className="flex-1 flex justify-center">
            <img 
              src="/assets/logo.png"
              alt="Stranger Things Logo"
              className="h-16 md:h-24 object-contain"
            />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto chat-container relative z-10 h-[calc(100vh-120px)] md:h-[calc(100vh-160px)] max-w-screen-lg mx-auto w-full px-4 flex items-center justify-center"
        >
          {chatState.messages.length === 0 && (
            <div className="text-red-500 opacity-80 text-center">
              <p className="text-2xl stranger-title">Enter the Upside Down...</p>
              <p className="text-sm stranger-title opacity-70">Ask me anything about Hawkins...</p>
            </div>
          )}
          {chatState.messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {chatState.isLoading && (
            <div className="p-8 text-red-500 flex justify-center items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full loading-dot animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-4 h-4 bg-red-500 rounded-full loading-dot animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-red-500 rounded-full loading-dot animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
      </div>


      {/* Input */}
      <div className="px-4 max-w-screen-lg mx-auto w-full relative z-10">
        <ChatInput onSend={handleSend} disabled={chatState.isLoading} />
      </div>

      {/* Floating Animation */}
      <style>
        {`
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .animate-floating {
            animation: floating 5s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default App;
