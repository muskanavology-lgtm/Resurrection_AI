import { useState, useEffect, useRef } from "react";
import { FiSend, FiMessageSquare, FiCpu, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { useActiveProject } from "../lib/ProjectContext";
import { sendChatMessage } from "../lib/api";
import { PageHeader, Panel, EmptyState } from "../components/UI";

const SUGGESTIONS = [
  "Where is authentication handled?",
  "Explain the upload flow end to end",
  "What security risks should I fix first?",
  "How is the database connected?",
];

function historyKey(projectId) {
  return `resurrection_ai_chat_${projectId}`;
}

export default function Chat() {
  const { activeProjectId, activeProjectName } = useActiveProject();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!activeProjectId) return;
    try {
      const raw = sessionStorage.getItem(historyKey(activeProjectId));
      setMessages(raw ? JSON.parse(raw) : []);
    } catch {
      setMessages([]);
    }
    setHistoryLoaded(true);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId || !historyLoaded) return;
    try {
      sessionStorage.setItem(historyKey(activeProjectId), JSON.stringify(messages));
    } catch {
    
    }
  }, [messages, activeProjectId, historyLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: question }]);
    setSending(true);
    try {
      const res = await sendChatMessage(activeProjectId, question);
      const answer = res.data?.answer || "No response from the engine.";
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the AI engine. " +
            (err?.response?.data?.error || err.message || "Check that the backend and OpenRouter key are configured."),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Conversation" title="AI Chat" />
        <EmptyState
          icon={FiMessageSquare}
          title="No repository loaded"
          subtitle="Upload a repository, then chat with it like you would with a senior teammate."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      <PageHeader
        eyebrow="Conversation"
        title="AI Chat"
        subtitle={`Ask anything about ${activeProjectName || "this repository"} — answers remember context across the session.`}
      />

      <Panel className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {historyLoaded && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-10">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <FiCpu size={22} />
              </div>
              <p className="text-slate-400 max-w-sm">
                Start by asking something specific — file names and exact flows give the best answers.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3.5 py-2 rounded-full text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                  <FiCpu size={14} className="text-ink" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 text-white"
                    : "bg-white/[0.03] border border-white/8 text-slate-200"
                }`}
              >
                {m.role === "user" ? (
                  <p>{m.content}</p>
                ) : (
                  <div className="prose-ai">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FiUser size={14} className="text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shrink-0">
                <FiCpu size={14} className="text-ink" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-white/[0.03] border border-white/8 flex gap-1.5 items-center">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulseSlow"
                    style={{ animationDelay: `${d * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/8 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any file, flow or risk in this repo…"
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="h-11 w-11 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 flex items-center justify-center text-ink disabled:opacity-40 transition-opacity shrink-0"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </Panel>
    </div>
  );
}
