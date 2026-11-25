import React from 'react';
import { Settings } from 'lucide-react';

interface SystemPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SystemPromptInput: React.FC<SystemPromptInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-3 shadow-sm mb-3">
      <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-slate-300">
        <Settings className="w-3.5 h-3.5 text-indigo-400" />
        <span>System Prompt (Optional - Session Level)</span>
      </div>
      <input
        type="text"
        data-testid="system-prompt-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g. You are a concise and helpful software engineering mentor..."
        className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
      />
    </div>
  );
};
