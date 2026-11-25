import React from 'react';
import { X, ShieldAlert } from 'lucide-react';

interface FailoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (val: string) => void;
}

export const FailoverModal: React.FC<FailoverModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
}) => {
  if (!isOpen) return null;

  const presets = [
    { label: 'Key 1 Rate Limit (429)', val: 'key_1=429', desc: 'Fails over to key_2 with fallback_attempts=1' },
    { label: 'Key 1 Server Error (500)', val: 'key_1=500', desc: 'Fails over to key_2 gracefully' },
    { label: 'Total Outage (*=429)', val: '*=429', desc: 'Triggers clean 503 without database mutation' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Simulate Failover (X-Simulate-Failure)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Inject provider error responses into chosen key requests. Demonstrates zero-downtime key rotation
          and 503 outage isolation on demand.
        </p>

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Quick Simulation Presets
          </label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition ${
                  value === preset.val
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                    {preset.val}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 mt-0.5">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Header Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Active Header Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. key_1=429,key_2=500"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800/80">
          {value && (
            <button
              onClick={() => onChange('')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-800/40 transition mr-auto"
            >
              Clear Simulation
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
