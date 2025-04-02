import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Message, ChatState } from './types';
import { Brain, Zap, Skull } from 'lucide-react';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyCyTZv2wL4H99dK1EY1sz8sCDBwVQCUO3k");
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
  const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
      },
    }));
    setParticles(newParticles);
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="floating-particle"
          style={particle.style}
        />
      ))}

      {/* Header */}
      
<header className="bg-black/80 p-6 border-b border-red-900/40 relative shadow-lg shadow-red-900/10">
  <div className="flex items-center justify-between max-w-5xl mx-auto">
    {/* Left: Logo */}
    <div className="flex items-center gap-4">
      <div className="relative">
        <Brain className="text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" size={42} />
        <div className="absolute -top-2 -right-2">
          <Zap className="text-yellow-500" size={18} />
        </div>
      </div>
      <h1 className="text-4xl stranger-title text-red-500 tracking-wider drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]">
        Stranger AI
      </h1>
    </div>


    {/* Right: Icon */}
    <div className="relative">
      <Skull className="text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" size={36} />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
    </div>
  </div>
</header>


      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto chat-container relative"
      >
        {chatState.messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-red-500 opacity-50 flex-col gap-4">
            <Skull size={60} className="animate-pulse" />
            <p className="text-2xl stranger-title">Enter the Upside Down...</p>
            <p className="text-sm opacity-70 stranger-title">Ask me anything about Hawkins...</p>
          </div>
        )}
        {chatState.messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {chatState.isLoading && (
          <div className="p-8 text-red-500 flex justify-center items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full loading-dot" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-red-500 rounded-full loading-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-red-500 rounded-full loading-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={chatState.isLoading} />
    </div>
  );
}

export default App;