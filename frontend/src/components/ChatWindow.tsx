import React, { useEffect, useRef } from 'react';
import { MessageItem } from '../types';
import { ChatMessage } from './ChatMessage';
import { HeroPromptCards } from './HeroPromptCards';
import { Loader2, Bot } from 'lucide-react';

interface ChatWindowProps {
  messages: MessageItem[];
  isLoading: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col justify-center">
        <HeroPromptCards onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-2">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="w-full max-w-3xl mx-auto py-4 px-4" data-testid="assistant-loading">
          <div className="flex gap-4">
            <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-sm mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Thinking and generating response...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
