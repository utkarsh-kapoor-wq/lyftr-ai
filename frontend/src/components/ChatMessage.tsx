import React from 'react';
import { Bot, AlertCircle, Zap, Database, Clock, Key } from 'lucide-react';
import { MessageItem } from '../types';

interface ChatMessageProps {
  message: MessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  if (isError) {
    return (
      <div className="w-full max-w-3xl mx-auto py-3 px-4">
        <div className="flex gap-3 bg-rose-950/30 border border-rose-900/60 rounded-2xl p-4 text-rose-300 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Error Occurred
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="w-full max-w-3xl mx-auto py-4 px-4 flex justify-end">
        <div className="max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap font-sans">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Message
  const meta = message.metadata;
  const isCache = meta?.resolution_source === 'LLM_CACHE';

  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-4" data-testid="assistant-message">
      <div className="flex gap-4">
        {/* Assistant Avatar */}
        <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-sm mt-0.5">
          <Bot className="w-4 h-4" />
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 space-y-3 min-w-0">
          <div className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </div>

          {meta && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              {/* Badge for LLM_CACHE vs LIVE_INFERENCE */}
              <span
                data-testid="meta-source"
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${
                  isCache
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                    : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/80'
                }`}
              >
                {isCache ? (
                  <>
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>LLM_CACHE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>LIVE_INFERENCE</span>
                  </>
                )}
              </span>

              {/* Model */}
              <span
                data-testid="meta-model"
                className="text-zinc-400 font-mono text-[11px] bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800"
              >
                {meta.model}
              </span>

              {/* Latency */}
              <span
                data-testid="meta-latency"
                className="inline-flex items-center gap-1 text-zinc-400 font-mono text-[11px]"
              >
                <Clock className="w-3 h-3 text-zinc-500" />
                <span>{meta.latency_ms} ms</span>
              </span>

              {/* Tokens */}
              <span className="text-zinc-500 text-[11px]">
                In: <span data-testid="meta-input-tokens" className="font-mono text-zinc-300 font-semibold">{meta.input_tokens}</span>
                {' '}| Out: <span data-testid="meta-output-tokens" className="font-mono text-zinc-300 font-semibold">{meta.output_tokens}</span>
              </span>

              {/* Key ID & Fallback Attempts */}
              {meta.key_id && (
                <span className="inline-flex items-center gap-1 text-zinc-400 text-[11px] ml-auto">
                  <Key className="w-3 h-3 text-zinc-500" />
                  <span className="font-mono text-zinc-300">{meta.key_id}</span>
                  {meta.fallback_attempts > 0 && (
                    <span className="text-amber-400 font-medium">
                      ({meta.fallback_attempts} fallback{meta.fallback_attempts > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
