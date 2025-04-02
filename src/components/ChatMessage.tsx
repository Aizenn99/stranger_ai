import React from 'react';
import { User, Copy, Volume2, Skull } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-6 p-8 ${isBot ? 'bg-red-950/20' : 'bg-black/60'} message-glow relative overflow-hidden`}>
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg 
                      ${isBot ? 'bg-red-600' : 'bg-red-800'} 
                      shadow-lg shadow-red-900/30 relative`}>
        {isBot ? (
          <>
            <Skull size={28} className="text-white" />
            <div className="absolute -top-1 -right-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </>
        ) : (
          <User size={28} className="text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xl font-bold ${isBot ? 'text-red-500' : 'text-red-400'} stranger-title`}>
            {isBot ? 'Eleven' : 'You'}
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-all duration-300 group"
              title="Copy message"
            >
              <Copy size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleSpeak}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-all duration-300 group"
              title="Speak message"
            >
              <Volume2 size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        <div className="text-white/90 leading-relaxed text-lg">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : 'javascript';
                return !inline ? (
                  <div className="relative group">
                    <div className="absolute -top-3 right-2 text-xs text-red-400/70 px-2 py-1 rounded-md bg-red-950/30">
                      {language}
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      style={coldarkDark}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !bg-gray-900/50 !p-4 !my-4 border border-red-900/30 shadow-lg shadow-red-900/10"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-900/50 px-2 py-1 rounded text-red-400" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
