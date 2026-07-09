import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AIChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const projectId = localStorage.getItem("projectId") || "active-session";
    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setQuestion("");
    try {
      const res = await axios.post("http://localhost:5000/api/ai/repo-chat", {
        sessionId: projectId,
        question
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to access workspace core tensors. Verify cluster state connectivity." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatAIResponse = (text) => {
    if (!text) return "";
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const lang = match ? match[1] : "code";
        const codeContent = match ? match[2] : part.replace(/```/g, "");

        return (
          <div key={index} className="my-4 overflow-hidden rounded-lg border border-white/10 shadow-lg w-full font-mono">
            <div className="bg-slate-900 px-4 py-1.5 text-xs text-slate-400 border-b border-white/5 flex justify-between uppercase">
              <span>{lang || "source"}</span>
            </div>
            <pre className="bg-black/60 p-4 text-sm text-emerald-400 overflow-x-auto leading-relaxed whitespace-pre">
              <code>{codeContent.trim()}</code>
            </pre>
          </div>
        );
      }
      const inlineParts = part.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={index} className="whitespace-pre-line leading-relaxed text-slate-200">
          {inlineParts.map((subPart, subIdx) => {
            if (subPart.startsWith("**") && subPart.endsWith("**")) {
              return <strong key={subIdx} className="text-cyan-400 font-extrabold">{subPart.replace(/\*\*/g, "")}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="p-6 font-sans text-white max-w-[1100px] mx-auto w-full h-[90vh] flex flex-col justify-between">
      <div className="mb-4">
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          AI Repository Chat Engine
        </h1>
        <p className="text-slate-500 text-xs tracking-wide uppercase mt-0.5">Active Context Mapping Session with Target Codebases</p>
      </div>

      {/* Messages Feed Layout Panel */}
      <div className="flex-1 bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 overflow-y-auto mb-4 space-y-6 max-h-[62vh] scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-sm text-center max-w-md mx-auto">
            Ask any query regarding structure flows, dynamic routing protocols or specific method parameters in the uploaded package.
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] rounded-xl px-5 py-4 text-sm shadow-md ${
              msg.role === "user"
                ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-300 rounded-tr-none"
                : "bg-white/[0.03] border border-white/[0.06] text-slate-300 rounded-tl-none w-full"
            }`}>
              {msg.role === "user" ? msg.content : formatAIResponse(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.02] border border-white/[0.04] text-slate-400 rounded-xl px-5 py-4 text-sm animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Decompiling file stack logic maps...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Row Block */}
      <div className="flex gap-3 bg-black/50 border border-white/[0.08] p-2.5 rounded-xl backdrop-blur-xl">
        <input
          type="text"
          placeholder="Ask something (e.g., Explain the products schema logic and security loopholes)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600"
        />
        <button onClick={sendQuestion} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black px-6 py-2 rounded-lg text-xs tracking-wider uppercase transition-transform hover:scale-[1.02] active:scale-100">
          Send
        </button>
      </div>
    </div>
  );
}