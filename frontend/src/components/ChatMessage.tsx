import React from 'react';
import { User, Bot, AlertCircle, Zap, Database, Clock, Key } from 'lucide-react';
import { MessageItem } from '../types';

interface ChatMessageProps {
  message: MessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  if (isError) {
    return (
      <div className="flex justify-start my-3">
        <div className="flex gap-3 max-w-[85%] bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 shadow-sm text-rose-200">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-rose-400">Error Occurred</div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end my-3">
        <div className="flex gap-3 max-w-[80%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="bg-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  const meta = message.metadata;
  const isCache = meta?.resolution_source === 'LLM_CACHE';

  return (
    <div className="flex justify-start my-3" data-testid="assistant-message">
      <div className="flex gap-3 max-w-[88%] w-full">
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-sm">
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-sm p-4 shadow-sm space-y-3">
          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {meta && (
            <div className="pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
              {/* Badge for LLM_CACHE vs LIVE_INFERENCE */}
              <span
                data-testid="meta-source"
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${
                  isCache
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isCache ? (
                  <>
                    <Database className="w-3 h-3" />
                    <span>LLM_CACHE</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>LIVE_INFERENCE</span>
                  </>
                )}
              </span>

              {/* Model */}
              <span
                data-testid="meta-model"
                className="text-slate-400 font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50"
              >
                {meta.model}
              </span>

              {/* Latency */}
              <span
                data-testid="meta-latency"
                className="inline-flex items-center gap-1 text-slate-400 font-mono"
              >
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{meta.latency_ms} ms</span>
              </span>

              {/* Tokens */}
              <span className="text-slate-400 text-xs">
                In: <span data-testid="meta-input-tokens" className="font-mono text-slate-300 font-semibold">{meta.input_tokens}</span>
                {' '}| Out: <span data-testid="meta-output-tokens" className="font-mono text-slate-300 font-semibold">{meta.output_tokens}</span>
              </span>

              {/* Key ID & Fallbacks if available */}
              {meta.key_id && (
                <span className="inline-flex items-center gap-1 text-slate-400 text-xs ml-auto">
                  <Key className="w-3 h-3 text-slate-500" />
                  <span className="font-mono text-slate-300">{meta.key_id}</span>
                  {meta.fallback_attempts > 0 && (
                    <span className="text-amber-400 text-[11px] font-medium">
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
