import { useState } from "react";
import { FiZap, FiFile, FiClock, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useActiveProject } from "../lib/ProjectContext";
import { simulateFeatureImpact } from "../lib/api";
import { PageHeader, Panel, EmptyState, Badge } from "../components/UI";

const EXAMPLES = [
  "Add Google OAuth login",
  "Add a real-time chat system with Socket.io",
  "Add Redis caching for product listings",
  "Add email verification on signup",
];

function tryParseJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export default function ImpactSimulator() {
  const { activeProjectId } = useActiveProject();
  const [feature, setFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawAnswer, setRawAnswer] = useState("");
  const [error, setError] = useState(null);

  async function handleSimulate(e) {
    e.preventDefault();
    if (!feature.trim() || !activeProjectId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await simulateFeatureImpact(activeProjectId, feature.trim());
      const impact = res.data?.impact || "";
      const parsed = tryParseJSON(impact);
      if (parsed) {
        setResult(parsed);
      } else {
        setRawAnswer(impact);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Plan" title="Feature Impact Simulator" />
        <EmptyState
          icon={FiZap}
          title="No repository loaded"
          subtitle="Upload a repository, then describe a feature to see exactly what it would touch."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plan"
        title="Feature Impact Simulator"
        subtitle="Describe a feature you want to add — the engine maps which files, layers and risks it would touch before you write a line of code."
      />

      <Panel className="p-6">
        <form onSubmit={handleSimulate} className="space-y-4">
          <textarea
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder="e.g. Add Google login to the existing auth system"
            rows={3}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/50 outline-none resize-none"
          />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {EXAMPLES.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setFeature(ex)}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || !feature.trim()}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm disabled:opacity-40 shrink-0"
            >
              {loading ? "Simulating…" : "Simulate Impact"}
            </button>
          </div>
        </form>
      </Panel>

      {loading && (
        <div className="flex flex-col items-center py-16 gap-4 text-slate-400">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-transparent animate-spin" />
          </div>
          <p className="mono text-xs uppercase tracking-wide">Reasoning over the codebase…</p>
        </div>
      )}

      {error && (
        <Panel className="p-6 border-rose-500/30 text-rose-300 text-sm">{error}</Panel>
      )}

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-3 text-slate-300">
                <FiClock />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Estimated Effort</h3>
              </div>
              <p className="text-2xl font-display font-semibold text-white">
                {result.estimatedTime || "—"}
              </p>
            </Panel>
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-3 text-slate-300">
                <FiAlertCircle />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Risk Level</h3>
              </div>
              <Badge
                tone={
                  /high/i.test(result.risk) ? "critical" : /medium/i.test(result.risk) ? "medium" : "good"
                }
              >
                {result.risk || "Unknown"}
              </Badge>
            </Panel>
          </div>

          {result.affectedFiles?.length > 0 && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                Affected Files
              </h3>
              <div className="space-y-2">
                {result.affectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <FiFile className="text-cyan-400 shrink-0" size={14} />
                    <span className="mono text-slate-200">{f}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {result.newFiles?.length > 0 && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                New Files To Create
              </h3>
              <div className="space-y-2">
                {result.newFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    <FiFile className="text-emerald-400 shrink-0" size={14} />
                    <span className="mono text-slate-200">{f}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {result.reason?.length > 0 && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                Why These Changes
              </h3>
              <ul className="space-y-2">
                {result.reason.map((r, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </motion.div>
      )}

      {rawAnswer && !loading && (
        <Panel className="p-6">
          <div className="prose-ai">
            <ReactMarkdown>{rawAnswer}</ReactMarkdown>
          </div>
        </Panel>
      )}
    </div>
  );
}
