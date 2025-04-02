import React, { useState } from 'react';
import { Send, Skull } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-gradient-to-t from-black via-black/95 to-transparent relative z-10">
      <div className="flex gap-4 max-w-4xl mx-auto relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="Ask about the mysteries of Hawkins..."
          className="flex-1 p-5 rounded-lg bg-gray-900/50 text-white border-2 border-red-900/30 
                     focus:border-red-500 focus:outline-none transition-all duration-300 
                     placeholder-red-200/20 input-focus-effect text-lg"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-8 py-4 rounded-lg bg-red-900/80 text-white hover:bg-red-800 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                     hover:shadow-lg hover:shadow-red-900/30 flex items-center gap-2"
        >
          <Send size={20} />
          <Skull size={16} className="animate-pulse" />
        </button>
      </div>
    </form>
  );
};