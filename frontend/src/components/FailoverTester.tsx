import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';

interface FailoverTesterProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const FailoverTester: React.FC<FailoverTesterProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Key 1 429 Failover', val: 'key_1=429' },
    { label: 'Key 1 500 Failover', val: 'key_1=500' },
    { label: 'All Keys 429 (503 Error)', val: '*=429' },
  ];

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-amber-500/30 rounded-xl p-3 shadow-sm mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-semibold text-amber-400 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Failover Testing Simulation (X-Simulate-Failure)</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-2.5 pt-2 border-t border-slate-700/60">
          <p className="text-xs text-slate-400 mb-2">
            Simulate HTTP provider failures to verify sequential fallback or 503 outage handling.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {presets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  value === preset.val
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs px-2 py-0.5 rounded border border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. key_1=429 or key_1=429,key_2=500 or *=429"
            className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
        </div>
      )}
    </div>
  );
};
