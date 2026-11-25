import React, { useState, useEffect } from 'react';
import { MessageItem, ChatResponse } from './types';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { SystemPromptModal } from './components/SystemPromptModal';
import { FailoverModal } from './components/FailoverModal';

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

  // UI Modals & Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<boolean>(false);
  const [isFailoverOpen, setIsFailoverOpen] = useState<boolean>(false);

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
          errorText = (await res.text()) || errorText;
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
    <div className="flex h-screen w-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewSession}
        sessionId={sessionId}
        keysCount={healthStatus?.keys || 2}
      />

      {/* Main Chat Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#09090b]">
        {/* Top Navbar */}
        <TopNavbar
          modelName="gemini-3-flash"
          keysCount={healthStatus?.keys || 2}
          sessionId={sessionId}
          onOpenSystemPrompt={() => setIsSystemPromptOpen(true)}
          onOpenFailover={() => setIsFailoverOpen(true)}
          hasCustomSystemPrompt={Boolean(systemPrompt.trim())}
          hasActiveSimulation={Boolean(simulationHeader.trim())}
        />

        {/* Scrollable Conversation or Hero Suggestions */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={handleSendMessage}
        />

        {/* Floating Capsule Input */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Configuration Modals */}
      <SystemPromptModal
        isOpen={isSystemPromptOpen}
        onClose={() => setIsSystemPromptOpen(false)}
        value={systemPrompt}
        onChange={setSystemPrompt}
      />

      <FailoverModal
        isOpen={isFailoverOpen}
        onClose={() => setIsFailoverOpen(false)}
        value={simulationHeader}
        onChange={setSimulationHeader}
      />
    </div>
  );
};

export default App;
