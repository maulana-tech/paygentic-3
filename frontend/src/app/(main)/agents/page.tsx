"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import {
  AgentMessage,
  getAgentModel,
  getAgentModelLabel,
  getAgentType,
  getAgentTypeColor,
  getListingById,
  getAgentById,
} from "@/data/store";

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
  const { user, isConnected, ownedAgents, addOwnedAgent } = useUserStore();
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentCard | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAgents = async (userId: string) => {
    try {
      const res = await fetch(`/api/service-access?userId=${userId}`);
      const data = await res.json();
      const accesses = data.accesses || [];
      for (const a of accesses) {
        addOwnedAgent({
          id: a.id,
          purchaseId: a.purchaseId,
          listingId: a.listingId,
          sellerAgentId: a.sellerAgentId,
          accessToken: a.accessToken,
          status: a.status,
          expiresAt: a.expiresAt,
          accessTokenCreated: a.accessTokenCreated,
        });
      }
      buildAgentCards(accesses);
    } catch {
      if (ownedAgents.length > 0) {
        buildAgentCardsFromZustand(ownedAgents);
      } else {
        setAgents([]);
      }
    }
  };

  const buildAgentCards = (accesses: Array<{ id: string; accessToken: string; listingId: string; expiresAt: string; accessTokenCreated: string; sellerName?: string; category?: string; title?: string; status: string }>) => {
    const cards: AgentCard[] = accesses
      .filter((access) => access.status === "ACTIVE")
      .map((access) => {
        const category = access.category || "";
        const modelId = getAgentModel(category);
        return {
          accessId: access.id,
          accessToken: access.accessToken,
          listingId: access.listingId,
          title: access.title || "Unknown Service",
          sellerName: access.sellerName || "Unknown",
          category,
          agentType: getAgentType(category),
          agentTypeColor: getAgentTypeColor(getAgentType(category)),
          modelId,
          modelLabel: getAgentModelLabel(modelId),
          expiresAt: access.expiresAt,
          createdAt: access.accessTokenCreated,
        };
      });
    setAgents(cards);
  };

  const buildAgentCardsFromZustand = (agentList: Array<{ id: string; purchaseId: string; listingId: string; sellerAgentId: string; accessToken: string; status: string; expiresAt: string; accessTokenCreated: string }>) => {
    const cards: AgentCard[] = agentList
      .filter((a) => a.status === "ACTIVE")
      .map((a) => {
        const listing = getListingById(a.listingId);
        const seller = listing ? getAgentById(listing.agentId || listing.userId) : null;
        const category = listing?.category || "";
        const modelId = getAgentModel(category);
        return {
          accessId: a.id,
          accessToken: a.accessToken,
          listingId: a.listingId,
          title: listing?.title || "Unknown Service",
          sellerName: seller?.name || "Unknown",
          category,
          agentType: getAgentType(category),
          agentTypeColor: getAgentTypeColor(getAgentType(category)),
          modelId,
          modelLabel: getAgentModelLabel(modelId),
          expiresAt: a.expiresAt,
          createdAt: a.accessTokenCreated,
        };
      });
    setAgents(cards);
  };

  useEffect(() => {
    if (!isConnected || !user) return;
    fetchAgents(user.id);
  }, [user, isConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    if (abortRef.current) abortRef.current.abort();
    setActiveAgent(null);
    setMessages([]);
    setTaskId(null);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeAgent || loading) return;

    const messageText = input.trim();
    const userMessage: AgentMessage = { role: "user", content: messageText, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const res = await fetch("/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: activeAgent.accessToken,
          message: messageText,
          taskId,
          listingId: activeAgent.listingId,
          userId: user?.id,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.error || "Failed"}`, timestamp: new Date().toISOString() }]);
        setLoading(false);
        return;
      }

      const contentType = res.headers.get("content-type");

      if (contentType?.includes("text/event-stream")) {
        let fullContent = "";
        setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: new Date().toISOString() }]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.done) {
                if (data.taskId) setTaskId(data.taskId);
                break;
              }
              if (data.content) {
                fullContent += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: fullContent, timestamp: new Date().toISOString() };
                  return updated;
                });
              }
            } catch {}
          }
        }
      } else {
        const data = await res.json();
        const content = data.response || data.error || "No response";
        setMessages((prev) => [...prev, { role: "assistant", content, timestamp: new Date().toISOString() }]);
        if (data.taskId) setTaskId(data.taskId);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again.", timestamp: new Date().toISOString() }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const formatMessage = (content: string) =>
    content.split("```").map((part, index) => {
      if (index % 2 === 1) {
        const firstNewline = part.indexOf("\n");
        const lang = firstNewline > -1 ? part.slice(0, firstNewline) : "";
        const code = firstNewline > -1 ? part.slice(firstNewline + 1) : part;
        return (
          <pre key={index} className="my-2 overflow-x-auto rounded-[0.875rem] bg-slate-950 p-3 text-xs text-slate-100">
            {lang && <div className="mb-1 text-xs text-slate-400">{lang}</div>}
            <code>{code}</code>
          </pre>
        );
      }

      const lines = part.split("\n");
      return lines.map((line, lineIndex) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ));
    });

  if (!isConnected) {
    return (
      <div className="page-shell min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white">My Agents</h1>
          <p className="mt-4 text-white/80">Connect your wallet to view your purchased agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">My Agents</h1>
          <p className="mt-2 text-sm text-white/80">Your purchased AI agents ready to execute tasks.</p>
        </div>

        {agents.length === 0 ? (
          <div className="glass-panel rounded-[1.25rem] p-12 text-center">
            <p className="text-lg font-medium text-white">No agents yet</p>
            <p className="mt-2 text-sm text-white/80">Purchase an agent from the marketplace to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <button
                key={agent.accessId}
                type="button"
                onClick={() => openAgent(agent)}
                className={`focus-ring glass-panel rounded-[1rem] cursor-pointer p-5 text-left transition-transform duration-200 hover:scale-[1.01] ${
                  activeAgent?.accessId === agent.accessId ? "border-brand" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">{agent.title}</h3>
                    <p className="mt-1 text-xs text-white/80">by {agent.sellerName}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${agent.agentTypeColor}`}>{agent.agentType}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <span className="rounded-full bg-white/10 px-2.5 py-1">{agent.category}</span>
                  <span className="rounded-full bg-brand-light px-2.5 py-1 text-brand-strong">{agent.modelLabel}</span>
                  <span>Expires {new Date(agent.expiresAt).toLocaleDateString()}</span>
                </div>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="glass-panel-strong flex h-[85vh] w-[90vw] max-w-4xl flex-col rounded-[1.5rem]">
            <div className="flex items-center justify-between border-b border-border-main px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-text-main">{activeAgent.title}</h2>
                <p className="mt-1 text-xs text-text-secondary">
                  <span className={`mr-2 rounded-full border px-2 py-0.5 ${activeAgent.agentTypeColor}`}>{activeAgent.agentType}</span>
                  <span className="mr-2 rounded-full bg-brand-light px-2 py-0.5 text-brand-strong">{activeAgent.modelLabel}</span>
                  by {activeAgent.sellerName}
                </p>
              </div>
              <button type="button" onClick={closeAgent} className="focus-ring cursor-pointer rounded-full p-2 text-text-secondary hover:bg-white/70 dark:hover:bg-slate-800/80">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[1rem] bg-brand-light text-brand">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-text-main">Start a conversation</p>
                  <p className="mt-1 text-xs text-text-secondary">Ask {activeAgent.title} to help you with a task.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {getSuggestionChips(activeAgent.category).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setInput(chip)}
                        className="focus-ring cursor-pointer rounded-full border border-border-main bg-white/80 px-3 py-2 text-xs text-text-secondary hover:bg-white dark:bg-slate-900/70"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.role === "user" ? "flex justify-end" : ""}`}>
                  <div
                    className={`max-w-[85%] rounded-[1rem] px-4 py-3 text-sm leading-6 ${
                      msg.role === "user" ? "bg-brand text-white" : "field-shell text-text-main"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.role === "user" ? msg.content : formatMessage(msg.content)}</div>
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
                <div className="mb-4">
                  <div className="field-shell inline-block rounded-[0.875rem] px-4 py-3 text-sm text-text-secondary">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
                        .
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                        .
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border-main px-5 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your task..."
                  disabled={loading}
                  className="focus-ring field-shell flex-1 rounded-full px-4 py-3 text-sm text-text-main disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="focus-ring cursor-pointer rounded-full border border-brand bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Thinking..." : "Send"}
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
    "code generation": ["Review this code for bugs", "Build a landing page with HTML/CSS", "Write a REST API in Node.js", "Explain this error message"],
    "data analysis": ["Analyze this sales dataset", "Create a dashboard layout", "Find trends in user data", "Write SQL for revenue report"],
    "content writing": ["Write a blog post about AI", "Create a social media calendar", "Write product descriptions", "Draft an email campaign"],
    "web research": ["Research competitors in fintech", "Summarize latest AI trends", "Find market opportunities", "Analyze industry reports"],
    automation: ["Design a Zapier workflow", "Write a Python automation script", "Set up CI/CD pipeline", "Create an API integration"],
    translation: ["Translate this to Japanese", "Localize content for EU market", "Create a translation glossary"],
    security: ["Audit this code for vulnerabilities", "Review authentication flow", "Write a security policy"],
    devops: ["Set up Docker for this app", "Create GitHub Actions workflow", "Design monitoring strategy"],
    design: ["Suggest a color palette", "Review this UI layout", "Create a design system", "Check accessibility"],
    "customer support": ["Write support email templates", "Create an FAQ section", "Design escalation workflow"],
  };
  return chips[category] || ["Help me with a task", "What can you do?"];
}
