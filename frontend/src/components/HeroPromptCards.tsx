import React from 'react';
import { Cpu, Network, Code2, Orbit } from 'lucide-react';

interface HeroPromptCardsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const HeroPromptCards: React.FC<HeroPromptCardsProps> = ({ onSelectPrompt }) => {
  const cards = [
    {
      icon: Cpu,
      title: 'Algorithmic Thinking',
      desc: 'Explain how self-balancing binary search trees maintain O(log n) height.',
      color: 'text-indigo-400 group-hover:text-indigo-300',
      border: 'hover:border-indigo-500/50',
    },
    {
      icon: Network,
      title: 'Distributed Resilience',
      desc: 'How do distributed key-value stores resolve split-brain network partitions?',
      color: 'text-amber-400 group-hover:text-amber-300',
      border: 'hover:border-amber-500/50',
    },
    {
      icon: Code2,
      title: 'Modern TypeScript',
      desc: 'Write a type-safe TypeScript debounce function with flush and cancel methods.',
      color: 'text-cyan-400 group-hover:text-cyan-300',
      border: 'hover:border-cyan-500/50',
    },
    {
      icon: Orbit,
      title: 'Astrophysics & Relativity',
      desc: 'Why does gravitational time dilation occur near high-density celestial bodies?',
      color: 'text-violet-400 group-hover:text-violet-300',
      border: 'hover:border-violet-500/50',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-6 py-10 text-center">
      {/* Brand Icon with Sunset Gradient Ring */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-[1.5px] shadow-2xl shadow-indigo-500/20">
          <div className="w-full h-full bg-[#0d0e12] rounded-2xl flex items-center justify-center">
            <Orbit className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
        What would you like to explore?
      </h1>
      <p className="text-sm text-zinc-400 max-w-lg mb-10 leading-relaxed font-sans">
        Ask questions, analyze complex problems, or select a prompt below to get started.
      </p>

      {/* 4 Brand New Unique Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={i}
              onClick={() => onSelectPrompt(card.desc)}
              className={`p-4 rounded-2xl bg-[#121318]/90 hover:bg-[#181920] border border-zinc-800/80 ${card.border} transition-all duration-200 group text-left shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${card.color} transition`} />
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition">
                  {card.title}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {card.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
