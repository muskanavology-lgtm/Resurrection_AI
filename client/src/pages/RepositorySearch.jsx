import { useState } from "react";
import { FiSearch, FiFile } from "react-icons/fi";
import { useActiveProject } from "../lib/ProjectContext";
import { searchRepository } from "../lib/api";
import { PageHeader, Panel, EmptyState, Loader } from "../components/UI";

export default function RepositorySearch() {
  const { activeProjectId } = useActiveProject();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchRepository(activeProjectId, keyword.trim());
      setResults(res.data?.results || []);
      setCount(res.data?.count || 0);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Find" title="Repository Search" />
        <EmptyState icon={FiSearch} title="No repository loaded" subtitle="Upload a repository to search inside its source files." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Find"
        title="Repository Search"
        subtitle="Search every file in the repository for a keyword, function name or pattern."
      />

      <Panel className="p-2">
        <form onSubmit={handleSearch} className="flex items-center gap-2 p-2">
          <FiSearch className="text-slate-500 ml-2 shrink-0" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. jwt.sign, useEffect, mongoose.model…"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm disabled:opacity-40"
          >
            Search
          </button>
        </form>
      </Panel>

      {loading && <Loader label="Searching files" />}
      {error && <p className="text-rose-400 text-sm">{error}</p>}

      {results && !loading && (
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">
            {count} match{count === 1 ? "" : "es"} {count > 50 && "(showing first 50)"}
          </p>
          <div className="space-y-2.5">
            {results.length === 0 && (
              <Panel className="p-8 text-center text-slate-500 text-sm">No matches found.</Panel>
            )}
            {results.map((r, i) => (
              <Panel key={i} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiFile className="text-cyan-400 shrink-0" size={14} />
                  <span className="mono text-xs text-slate-400 truncate">{r.file}</span>
                  <span className="mono text-[10px] text-slate-600">:{r.line}</span>
                </div>
                <pre className="mono text-xs text-slate-200 bg-black/30 rounded-lg px-3 py-2 overflow-x-auto">
                  {r.code}
                </pre>
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
