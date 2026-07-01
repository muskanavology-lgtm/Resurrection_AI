import { useState } from "react";
import { FiCode, FiPackage, FiList } from "react-icons/fi";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useActiveProject } from "../lib/ProjectContext";
import { generateFeatureCode } from "../lib/api";
import { PageHeader, Panel, EmptyState, CodeBlock } from "../components/UI";

const EXAMPLES = [
  "Add rate limiting middleware",
  "Add JWT refresh token logic",
  "Add input validation with Joi",
  "Add a centralized error handler",
];

export default function CodeGenerator() {
  const { activeProjectId } = useActiveProject();
  const [feature, setFeature] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawAnswer, setRawAnswer] = useState("");
  const [error, setError] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!feature.trim() || !activeProjectId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRawAnswer("");
    try {
      const res = await generateFeatureCode(activeProjectId, feature.trim());
      if (res.data?.generated) {
        setResult(res.data.generated);
      } else {
        setRawAnswer(res.data?.rawAnswer || "");
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
        <PageHeader eyebrow="Build" title="Code Generator" />
        <EmptyState
          icon={FiCode}
          title="No repository loaded"
          subtitle="Upload a repository, then describe a feature to get real, working code for it."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Build"
        title="Code Generator"
        subtitle="Describe a feature — get actual working code matched to this repository's stack, not just a suggestion."
      />

      <Panel className="p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            placeholder="e.g. Add rate limiting to all API routes"
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
              {loading ? "Writing code…" : "Generate Code"}
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
          <p className="mono text-xs uppercase tracking-wide">Writing code for your stack…</p>
        </div>
      )}

      {error && <Panel className="p-6 border-rose-500/30 text-rose-300 text-sm">{error}</Panel>}

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {result.summary && (
            <Panel className="p-6">
              <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
            </Panel>
          )}

          {result.files?.map((f, i) => (
            <div key={i} className="space-y-2">
              {f.explanation && (
                <p className="text-sm text-slate-400 leading-relaxed">{f.explanation}</p>
              )}
              <CodeBlock code={f.code} language={f.language} filePath={f.filePath} />
            </div>
          ))}

          {result.installCommands?.length > 0 && (
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <FiPackage size={16} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Install Commands</h3>
              </div>
              <CodeBlock code={result.installCommands.join("\n")} language="bash" filePath="terminal" />
            </Panel>
          )}

          {result.integrationSteps?.length > 0 && (
            <Panel className="p-6">
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <FiList size={16} />
                <h3 className="text-sm font-semibold uppercase tracking-wide">Integration Steps</h3>
              </div>
              <ol className="space-y-2.5">
                {result.integrationSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
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
