import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Capsule Box */}
      <div className="bg-[#12131a]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            data-testid="chat-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="Ask a question, analyze system designs, or test failover..."
            className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-44 leading-relaxed font-sans"
          />
          <button
            type="button"
            data-testid="send-button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 focus:outline-none disabled:opacity-20 disabled:hover:from-indigo-500 disabled:hover:to-violet-600 transition-all flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/25"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 text-center mt-2 font-sans flex items-center justify-center gap-2">
        <span>Multi-Key Failover</span>
        <span>•</span>
        <span>In-Memory Cache</span>
        <span>•</span>
        <span>Session State</span>
      </div>
    </div>
  );
};
