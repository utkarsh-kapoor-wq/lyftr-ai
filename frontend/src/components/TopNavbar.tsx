import React, { useState } from 'react';
import { Sliders, ShieldAlert, Copy, Check } from 'lucide-react';

interface TopNavbarProps {
  modelName: string;
  keysCount: number;
  sessionId: string;
  onOpenSystemPrompt: () => void;
  onOpenFailover: () => void;
  hasCustomSystemPrompt: boolean;
  hasActiveSimulation: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  modelName,
  keysCount,
  sessionId,
  onOpenSystemPrompt,
  onOpenFailover,
  hasCustomSystemPrompt,
  hasActiveSimulation,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySession = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-950/70 backdrop-blur z-10 flex-shrink-0">
      {/* Brand & Model */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-bold text-zinc-100 tracking-tight">
          Lyftr Gateway
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-mono text-[11px] font-medium">
          {modelName}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* System Prompt Modal Trigger */}
        <button
          onClick={onOpenSystemPrompt}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            hasCustomSystemPrompt
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
          title="Configure System Prompt"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">System Prompt</span>
          {hasCustomSystemPrompt && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
        </button>

        {/* Simulate Failover Modal Trigger */}
        <button
          onClick={onOpenFailover}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            hasActiveSimulation
              ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
          }`}
          title="Simulate Failover"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Simulate Failover</span>
          {hasActiveSimulation && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        {/* Health status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Ready ({keysCount} keys)</span>
        </div>

        {/* Session ID Pill with Copy */}
        <button
          onClick={handleCopySession}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition"
          title="Click to copy Session ID"
        >
          <span>session: {sessionId.substring(0, 10)}...</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
        </button>
      </div>
    </header>
  );
};
