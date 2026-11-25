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
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col h-full flex-shrink-0 transition-all z-20">
      {/* Top Header */}
      <div className="p-3 flex items-center justify-between border-b border-zinc-900">
        <button
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-medium text-zinc-100 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>New chat</span>
        </button>
        <button
          onClick={onToggle}
          className="ml-2 p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition"
          title="Close Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions / Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-2">
          Active Session
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-sm text-zinc-200 shadow-inner">
          <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="truncate font-mono text-xs">{sessionId}</span>
        </div>

        <div className="pt-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-2 mb-2">
            System Telemetry
          </div>
          <div className="space-y-1.5 text-xs text-zinc-400 px-2">
            <div className="flex items-center justify-between py-1 border-b border-zinc-900">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Failover Pool
              </span>
              <span className="font-mono text-zinc-200">{keysCount} keys</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-zinc-900">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Caching
              </span>
              <span className="font-mono text-emerald-400">Local Mem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile Branding */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/80">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">Lyftr Gateway</div>
            <div className="text-[10px] text-zinc-400 truncate">Utkarsh Kapoor</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
