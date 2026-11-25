import React from 'react';
import { Plus, MessageSquare, Shield, Terminal, PanelLeftClose, PanelLeft, Bot, Trash2, Clock } from 'lucide-react';
import { SavedSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  sessionId: string;
  sessions: SavedSession[];
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  keysCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onNewChat,
  sessionId,
  sessions,
  onSelectSession,
  onDeleteSession,
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
        {/* Past Sessions List */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2 font-mono flex items-center justify-between">
            <span>Conversations</span>
            <span className="text-[9px] text-zinc-400 font-normal">{sessions.length} saved</span>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-zinc-400 italic bg-[#12131c]/40 rounded-xl border border-zinc-800/40">
                No past sessions yet
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === sessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSession(s.id)}
                    className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer border transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-950/60 border-indigo-700/50 text-indigo-200 shadow-sm'
                        : 'bg-[#12131c]/60 hover:bg-[#181924] border-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                      <span className="truncate font-medium">{s.title || s.id}</span>
                    </div>
                    <button
                      onClick={(e) => onDeleteSession(s.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3 text-zinc-500 hover:text-rose-400" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Current Active Session Info */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5 font-mono">
            Current Session ID
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#12131c] border border-zinc-800/80 text-xs text-zinc-300 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate font-mono text-[11px] text-zinc-400">{sessionId}</span>
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
