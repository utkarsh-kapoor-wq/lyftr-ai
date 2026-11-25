import React from 'react';
import { X, Sliders } from 'lucide-react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Session System Prompt Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Configure a specialized system persona for this conversation session.
          The system prompt persists across all turns in this session.
        </p>

        <textarea
          data-testid="system-prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="e.g. You are a senior Google software architect. Explain concepts with high precision, concise bullet points, and code snippets."
          className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
          {value && (
            <button
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 transition mr-auto"
            >
              Reset to Default
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-sm"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
