import React from 'react';
import { Plus, MessageSquare, Shield, Terminal, PanelLeftClose, PanelLeft, Bot } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  sessionId: string;
  keysCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewChat,
  sessionId,
  keysCount,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-3 left-3 z-30 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition shadow-md"
        title="Open Sidebar"
      >
        <PanelLeft className="w-4 h-4" />
      </button>
    );
  }

  return (
    <aside className="w-64 bg-[#0a0b10] border-r border-zinc-800/80 flex flex-col h-full flex-shrink-0 transition-all z-20">
      {/* Top Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-800/60">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-950/50 to-zinc-900/80 hover:from-indigo-900/60 hover:to-zinc-800 border border-indigo-700/40 text-sm font-medium text-zinc-100 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>New Session</span>
        </button>
        <button
          onClick={onToggle}
          className="ml-2 p-2 rounded-xl hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition"
          title="Close Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions / Chat List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2 font-mono">
            Active Session
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#12131c] border border-zinc-800/80 text-sm text-zinc-200 shadow-sm">
            <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate font-mono text-xs text-zinc-300">{sessionId}</span>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2 font-mono">
            Cluster Telemetry
          </div>
          <div className="p-2.5 rounded-xl bg-[#12131c]/60 border border-zinc-800/60 space-y-2 text-xs">
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Failover Pool
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{keysCount} active keys</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Cache Strategy
              </span>
              <span className="font-mono text-zinc-200">LiteLLM Local</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                Persistence
              </span>
              <span className="font-mono text-zinc-200">SQLite (WAL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile Branding */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-[#08090d]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-[#12131c] border border-zinc-800/70">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
            UK
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-100 truncate">Utkarsh Kapoor</div>
            <div className="text-[10px] text-zinc-400 truncate">kapoorutkarsh17@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
