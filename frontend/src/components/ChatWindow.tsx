import React, { useEffect, useRef } from 'react';
import { MessageItem } from '../types';
import { ChatMessage } from './ChatMessage';
import { Sparkles, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  messages: MessageItem[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-1 py-4 space-y-2">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">
            Start a Conversation
          </h3>
          <p className="text-sm max-w-sm text-slate-400">
            Send a message to begin. Subsequent turns will retain session context,
            and repeated prompts will leverage LiteLLM prompt caching.
          </p>
        </div>
      ) : (
        messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
      )}

      {isLoading && (
        <div className="flex justify-start my-3" data-testid="assistant-loading">
          <div className="flex gap-3 max-w-[80%] items-center bg-slate-800/80 border border-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Thinking and generating response...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
