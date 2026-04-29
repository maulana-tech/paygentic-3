"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { getServiceAccessesByUser, getListingById, getAgentById, getAgentType, getAgentTypeColor, getAgentModel, getAgentModelLabel, AgentMessage } from "@/data/store";

interface AgentCard {
  accessId: string;
  accessToken: string;
  listingId: string;
  title: string;
  sellerName: string;
  category: string;
  agentType: string;
  agentTypeColor: string;
  modelId: string;
  modelLabel: string;
  expiresAt: string;
  createdAt: string;
}

export default function AgentsPage() {
  const { user, isConnected } = useUserStore();
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentCard | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isConnected || !user) return;
    const accesses = getServiceAccessesByUser(user.id);
    const cards: AgentCard[] = accesses
      .filter(a => a.status === 'ACTIVE')
      .map(a => {
        const listing = getListingById(a.listingId);
        const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;
        const category = listing?.category || '';
        const modelId = getAgentModel(category);
        return {
          accessId: a.id,
          accessToken: a.accessToken,
          listingId: a.listingId,
          title: listing?.title || 'Unknown Service',
          sellerName: seller?.name || 'Unknown',
          category,
          agentType: getAgentType(category),
          agentTypeColor: getAgentTypeColor(getAgentType(category)),
          modelId,
          modelLabel: getAgentModelLabel(modelId),
          expiresAt: a.expiresAt,
          createdAt: a.accessTokenCreated
        };
      });
    setAgents(cards);
  }, [user, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openAgent = async (agent: AgentCard) => {
    setActiveAgent(agent);
    setMessages([]);
    setTaskId(null);
    setInput("");
    setLoading(false);

    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const closeAgent = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setActiveAgent(null);
    setMessages([]);
    setTaskId(null);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeAgent || loading) return;

    const userMessage: AgentMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: activeAgent.accessToken,
          message: input.trim(),
          taskId,
          listingId: activeAgent.listingId,
          userId: user?.id
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.error || 'Failed'}`, timestamp: new Date().toISOString() }]);
        setLoading(false);
        return;
      }

      const contentType = res.headers.get('content-type');

      if (contentType?.includes('text/event-stream')) {
        let fullContent = '';
        setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.done) {
                if (data.taskId) setTaskId(data.taskId);
                break;
              }
              if (data.content) {
                fullContent += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: fullContent, timestamp: new Date().toISOString() };
                  return updated;
                });
              }
            } catch {}
          }
        }
      } else {
        const data = await res.json();
        const content = data.response || data.error || 'No response';
        setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date().toISOString() }]);
        if (data.taskId) setTaskId(data.taskId);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date().toISOString() }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const formatMessage = (content: string) => {
    return content.split('```').map((part, i) => {
      if (i % 2 === 1) {
        const firstNewline = part.indexOf('\n');
        const lang = firstNewline > -1 ? part.slice(0, firstNewline) : '';
        const code = firstNewline > -1 ? part.slice(firstNewline + 1) : part;
        return (
          <pre key={i} className="my-2 overflow-x-auto rounded-none bg-gray-900 p-3 text-xs text-gray-100">
            {lang && <div className="mb-1 text-xs text-gray-400">{lang}</div>}
            <code>{code}</code>
          </pre>
        );
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < part.split('\n').length - 1 && <br />}
        </span>
      ));
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-text-main">My Agents</h1>
          <p className="mt-4 text-text-secondary">Connect your wallet to view your purchased agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">My Agents</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Your purchased AI agents ready to execute tasks
          </p>
        </div>

        {agents.length === 0 ? (
          <div className="rounded-none border border-border-main bg-white p-12 text-center">
            <p className="text-lg font-medium text-text-main">No agents yet</p>
            <p className="mt-2 text-sm text-text-secondary">
              Purchase an agent from the marketplace to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map(agent => (
              <button
                key={agent.accessId}
                onClick={() => openAgent(agent)}
                className={`cursor-pointer rounded-none border bg-white p-5 text-left transition-colors hover:bg-gray-50 ${
                  activeAgent?.accessId === agent.accessId ? 'border-brand' : 'border-border-main'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-main">{agent.title}</h3>
                    <p className="mt-1 text-xs text-text-secondary">by {agent.sellerName}</p>
                  </div>
                  <span className={`rounded-none border px-2 py-1 text-xs font-medium ${agent.agentTypeColor}`}>
                    {agent.agentType}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
                  <span className="rounded-none bg-gray-100 px-2 py-1">{agent.category}</span>
                  <span className="rounded-none bg-blue-50 px-2 py-1 text-blue-700">{agent.modelLabel}</span>
                  <span>Expires {new Date(agent.expiresAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Open Chat
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-none border border-border-main bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border-main px-5 py-3">
              <div>
                <h2 className="text-base font-semibold text-text-main">{activeAgent.title}</h2>
                <p className="text-xs text-text-secondary">
                  <span className={`mr-2 rounded-none border px-1.5 py-0.5 text-xs ${activeAgent.agentTypeColor}`}>
                    {activeAgent.agentType}
                  </span>
                  <span className="mr-2 rounded-none bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                    {activeAgent.modelLabel}
                  </span>
                  by {activeAgent.sellerName}
                </p>
              </div>
              <button
                onClick={closeAgent}
                className="cursor-pointer rounded-none p-1 text-text-secondary hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-sm font-medium text-text-main">Start a conversation</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    Ask {activeAgent.title} to help you with a task
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {getSuggestionChips(activeAgent.category).map(chip => (
                      <button
                        key={chip}
                        onClick={() => setInput(chip)}
                        className="cursor-pointer rounded-none border border-border-main bg-gray-50 px-3 py-1.5 text-xs text-text-secondary hover:bg-gray-100"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`max-w-[85%] rounded-none px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand text-white'
                      : 'border border-border-main bg-gray-50 text-text-main'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.role === 'user' ? msg.content : formatMessage(msg.content)}</div>
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
                <div className="mb-4">
                  <div className="inline-block rounded-none border border-border-main bg-gray-50 px-4 py-3 text-sm text-text-secondary">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border-main px-5 py-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type your task..."
                  disabled={loading}
                  className="flex-1 rounded-none border border-border-main px-3 py-2.5 text-sm text-text-main placeholder:text-text-secondary focus:border-brand focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="cursor-pointer rounded-none bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Thinking...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSuggestionChips(category: string): string[] {
  const chips: Record<string, string[]> = {
    'code generation': ['Review this code for bugs', 'Build a landing page with HTML/CSS', 'Write a REST API in Node.js', 'Explain this error message'],
    'data analysis': ['Analyze this sales dataset', 'Create a dashboard layout', 'Find trends in user data', 'Write SQL for revenue report'],
    'content writing': ['Write a blog post about AI', 'Create a social media calendar', 'Write product descriptions', 'Draft an email campaign'],
    'web research': ['Research competitors in fintech', 'Summarize latest AI trends', 'Find market opportunities', 'Analyze industry reports'],
    'automation': ['Design a Zapier workflow', 'Write a Python automation script', 'Set up CI/CD pipeline', 'Create an API integration'],
    'translation': ['Translate this to Japanese', 'Localize content for EU market', 'Create a translation glossary'],
    'security': ['Audit this code for vulnerabilities', 'Review authentication flow', 'Write a security policy'],
    'devops': ['Set up Docker for this app', 'Create GitHub Actions workflow', 'Design monitoring strategy'],
    'design': ['Suggest a color palette', 'Review this UI layout', 'Create a design system', 'Check accessibility'],
    'customer support': ['Write support email templates', 'Create an FAQ section', 'Design escalation workflow']
  };
  return chips[category] || ['Help me with a task', 'What can you do?'];
}
