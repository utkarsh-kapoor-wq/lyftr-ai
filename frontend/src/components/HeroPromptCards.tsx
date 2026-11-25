import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeroPromptCardsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const HeroPromptCards: React.FC<HeroPromptCardsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: 'General Knowledge',
      desc: 'What is the capital of France?',
    },
    {
      title: 'System Architecture',
      desc: 'Explain how multi-key failover works in LiteLLM.',
    },
    {
      title: 'Python Function',
      desc: 'Write a concise Python function to calculate fibonacci numbers.',
    },
    {
      title: 'Quantum Computing',
      desc: 'Explain quantum computing in one simple sentence.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 text-center">
      {/* Center glowing logo */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center mb-6 shadow-xl text-cyan-400">
        <Sparkles className="w-6 h-6 animate-pulse" />
      </div>

      <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-2">
        What can I help you with today?
      </h2>
      <p className="text-xs text-zinc-400 max-w-md mb-8 leading-relaxed">
        Dual-provider failover with Google Gemini & LiteLLM, powered by in-memory prompt caching and SQLite session persistence.
      </p>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {suggestions.map((card, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(card.desc)}
            className="flex flex-col text-left p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700 transition group shadow-sm"
          >
            <span className="text-xs font-semibold text-zinc-300 group-hover:text-cyan-400 transition mb-1">
              {card.title}
            </span>
            <span className="text-xs text-zinc-400 line-clamp-1">
              {card.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
