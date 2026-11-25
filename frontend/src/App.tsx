import React, { useState, useEffect } from 'react';
import { MessageItem, ChatResponse } from './types';
import { SystemPromptInput } from './components/SystemPromptInput';
import { FailoverTester } from './components/FailoverTester';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { MessageSquare, RefreshCw, Activity } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function formatErrorDetail(detail: any): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((err) => {
        const loc = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : '';
        const msg = err.msg || JSON.stringify(err);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join('\n');
  }
  if (typeof detail === 'object' && detail !== null) {
    return JSON.stringify(detail, null, 2);
  }
  return 'An unexpected error occurred.';
}

export const App: React.FC = () => {
  // A new session_id is generated on EVERY page load
  const [sessionId] = useState<string>(() => `s-${Math.random().toString(36).substring(2, 10)}`);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [simulationHeader, setSimulationHeader] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<{ status: string; keys: number } | null>(null);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        setHealthStatus({ status: data.status, keys: data.keys_configured });
      })
      .catch(() => {
        setHealthStatus({ status: 'unreachable', keys: 0 });
      });
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: MessageItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (simulationHeader.trim()) {
        headers['X-Simulate-Failure'] = simulationHeader.trim();
      }

      const bodyPayload: Record<string, any> = {
        session_id: sessionId,
        message: content,
      };
      if (systemPrompt.trim()) {
        bodyPayload.system_prompt = systemPrompt.trim();
      }

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        let errorText = `HTTP Error ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errorText = formatErrorDetail(errData.detail);
          }
        } catch {
          errorText = await res.text() || errorText;
        }

        const errorItem: MessageItem = {
          id: `err-${Date.now()}`,
          role: 'error',
          content: errorText,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorItem]);
        return;
      }

      const data: ChatResponse = await res.json();
      const assistantMessage: MessageItem = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const networkError: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'error',
        content: `Network or Connection Error: ${err.message || 'Unable to reach backend API.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, networkError]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <header className="flex items-center justify-between py-3 border-b border-slate-800 mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              LiteLLM Multi-Turn Chat
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-normal border border-slate-700">
                {sessionId}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Provider failover, prompt caching & SQLite persistence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {healthStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
              <Activity
                className={`w-3.5 h-3.5 ${
                  healthStatus.status === 'ok' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span>{healthStatus.status} ({healthStatus.keys} keys)</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleNewSession}
            title="Start new session"
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </header>

      {/* Top Configuration Controls */}
      <div className="flex-shrink-0">
        <SystemPromptInput
          value={systemPrompt}
          onChange={setSystemPrompt}
          disabled={isLoading}
        />
        <FailoverTester
          value={simulationHeader}
          onChange={setSimulationHeader}
          disabled={isLoading}
        />
      </div>

      {/* Main Chat Feed */}
      <ChatWindow messages={messages} isLoading={isLoading} />

      {/* Chat Input */}
      <div className="pt-2 flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;
