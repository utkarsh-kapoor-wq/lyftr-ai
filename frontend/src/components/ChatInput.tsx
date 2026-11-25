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
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-2 shadow-2xl focus-within:border-zinc-700 transition">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            data-testid="chat-input"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="Message Lyftr Gateway..."
            className="flex-1 bg-transparent border-0 resize-none px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-44 leading-relaxed font-sans"
          />
          <button
            type="button"
            data-testid="send-button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white focus:outline-none disabled:opacity-20 disabled:hover:bg-zinc-100 transition-all flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-zinc-400 text-center mt-2 font-sans">
        Lyftr Gateway can make mistakes. Verify important failover and token telemetry.
      </div>
    </div>
  );
};
