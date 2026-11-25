import React, { useState } from 'react';
import { Sliders, ShieldAlert, Copy, Check, Zap } from 'lucide-react';

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
    <header className="h-16 border-b border-zinc-800/80 px-5 flex items-center justify-between bg-[#0a0b10]/90 backdrop-blur-xl z-10 flex-shrink-0">
      {/* Brand & Model */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              Pulse AI
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-medium">
              Enterprise
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {modelName}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* System Prompt Modal Trigger */}
        <button
          onClick={onOpenSystemPrompt}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
            hasCustomSystemPrompt
              ? 'bg-indigo-950/70 text-indigo-300 border-indigo-600/70 shadow-sm shadow-indigo-500/20'
              : 'bg-[#13141c] hover:bg-[#1c1d27] text-zinc-300 border-zinc-800'
          }`}
          title="Configure System Prompt"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">System Prompt</span>
          {hasCustomSystemPrompt && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />}
        </button>

        {/* Simulate Failover Modal Trigger */}
        <button
          onClick={onOpenFailover}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
            hasActiveSimulation
              ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-sm shadow-amber-500/20 animate-pulse'
              : 'bg-[#13141c] hover:bg-[#1c1d27] text-zinc-300 border-zinc-800'
          }`}
          title="Simulate Failover"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Simulate Failover</span>
          {hasActiveSimulation && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>

        {/* Health status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#13141c] border border-zinc-800/90 text-xs font-medium text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-zinc-300">Active ({keysCount} keys)</span>
        </div>

        {/* Session ID Pill with Copy */}
        <button
          onClick={handleCopySession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13141c] hover:bg-[#1c1d27] border border-zinc-800 font-mono text-[11px] text-zinc-400 hover:text-zinc-200 transition"
          title="Click to copy Session ID"
        >
          <span>session: {sessionId.substring(0, 10)}...</span>
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
        </button>
      </div>
    </header>
  );
};
