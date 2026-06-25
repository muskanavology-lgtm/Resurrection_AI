import { useState, useEffect } from "react";
import { FiFileText, FiCopy, FiDownload, FiCheck, FiRefreshCw } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { useActiveProject } from "../lib/ProjectContext";
import { generateReadmeAI, getDocs } from "../lib/api";
import { PageHeader, Panel, EmptyState, Loader } from "../components/UI";

export default function ReadmePage() {
  const { activeProjectId, activeProjectName } = useActiveProject();
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
   
    setLoading(true);
    getDocs(activeProjectId)
      .then((res) => {
        const existing = res.data?.docs?.readme;
        if (existing) setReadme(existing);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeProjectId]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await generateReadmeAI(activeProjectId);
      setReadme(res.data?.readme || "");
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleDownload() {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Document" title="README Generator" />
        <EmptyState icon={FiFileText} title="No repository loaded" subtitle="Upload a repository to auto-generate a professional README." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Document"
        title="README Generator"
        subtitle={`Professional documentation for ${activeProjectName || "this repository"}, written by AI from the real analysis.`}
        right={
          readme && (
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-40"
              >
                <FiRefreshCw className={generating ? "animate-spin" : ""} size={14} />
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10"
              >
                {copied ? <FiCheck size={14} className="text-emerald-400" /> : <FiCopy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm"
              >
                <FiDownload size={14} />
                Download
              </button>
            </div>
          )
        }
      />

      {loading && <Loader label="Loading README" />}

      {!loading && !readme && !generating && (
        <EmptyState
          icon={FiFileText}
          title="No README generated yet"
          subtitle="Generate a complete README from the repository's real architecture, stack and routes."
          action={
            <button
              onClick={handleGenerate}
              className="mt-4 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm"
            >
              Generate README
            </button>
          }
        />
      )}

      {generating && <Loader label="Writing documentation" />}

      {error && <Panel className="p-6 border-rose-500/30 text-rose-300 text-sm">{error}</Panel>}

      {readme && !generating && (
        <Panel className="p-8">
          <div className="prose-ai">
            <ReactMarkdown>{readme}</ReactMarkdown>
          </div>
        </Panel>
      )}
    </div>
  );
}
