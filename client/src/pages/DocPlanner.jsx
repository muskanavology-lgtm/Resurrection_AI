import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiUploadCloud, FiFile, FiX, FiDownload, FiCpu, FiLayers,
  FiDatabase, FiCode, FiZap, FiAlertCircle, FiCheckCircle,
  FiFolder, FiChevronRight, FiClock, FiRefreshCw
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Panel, PageHeader, Badge } from "../components/UI";

const PHASES = [
  "Reading your documentation",
  "Understanding project requirements",
  "Identifying modules & features",
  "Planning folder structure",
  "Designing database schema",
  "Mapping API routes",
  "Writing AuthController code",
  "Writing Model files",
  "Writing Route handlers",
  "Writing Middleware",
  "Writing Config files",
  "Writing Entry point",
  "Finalizing complete project",
];

const METHOD_COLORS = {
  GET: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  POST: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  PUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  PATCH: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DELETE: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const PRIORITY_TONE = { High: "critical", Medium: "medium", Low: "good" };

function CodeViewer({ code, language, filePath }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="mono text-xs text-slate-400 ml-2">{filePath}</span>
        </div>
        <button onClick={copy} className="mono text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="mono text-xs text-slate-200 p-5 overflow-x-auto max-h-96 bg-[#060a14] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DocPlanner() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [plan, setPlan] = useState(null);
  const [docPlanId, setDocPlanId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("modules");
  const [activeFile, setActiveFile] = useState(null);
  const [genStatus, setGenStatus] = useState("idle");
  const phaseTimer = useRef(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length) { setErrorMsg("Only .txt, .md, .pdf, .docx accepted."); return; }
    if (accepted?.[0]) { setFile(accepted[0]); setErrorMsg(""); setStatus("idle"); setPlan(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop,
    accept: {
      "text/plain": [".txt"], "text/markdown": [".md"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  function startPhaseTimer() {
    let i = 0; setPhaseIndex(0);
    phaseTimer.current = setInterval(() => {
      i = Math.min(i + 1, PHASES.length - 1);
      setPhaseIndex(i);
    }, 3500);
  }
  function stopPhaseTimer() { if (phaseTimer.current) clearInterval(phaseTimer.current); }

  async function handleAnalyze() {
    if (!file) return;
    setStatus("loading"); setErrorMsg(""); setPlan(null);
    startPhaseTimer();
    try {
      const formData = new FormData();
      formData.append("document", file);
      const res = await axios.post("/api/docs/plan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });
      stopPhaseTimer();
      if (!res.data.success) throw new Error(res.data.error || "Failed");
      setPlan(res.data.plan);
      setDocPlanId(res.data.docPlanId);
      setActiveFile(res.data.plan?.starterCode?.[0] || null);
      setStatus("done");
      setActiveTab("modules");
    } catch (err) {
      stopPhaseTimer();
      setStatus("error");
      setErrorMsg(err?.response?.data?.error || err.message);
    }
  }

  async function handleDownload() {
    if (!docPlanId) return;
    setGenStatus("generating");
    try {
      const res = await axios.post(`/api/docs/generate/${docPlanId}`, {}, {
        responseType: "blob", timeout: 300000,
      });
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(plan?.suggestedFramework || "project").toLowerCase().replace(/\s+/g, "-")}-generated.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setGenStatus("done");
    } catch (err) {
      setGenStatus("idle");
      setErrorMsg("Download failed: " + (err?.response?.data?.error || err.message));
    }
  }

  const tabs = [
    { id: "modules", label: "Modules", icon: FiLayers },
    { id: "routes", label: "API Routes", icon: FiZap },
    { id: "database", label: "Database", icon: FiDatabase },
    { id: "structure", label: "File Structure", icon: FiFolder },
    { id: "code", label: "Source Code", icon: FiCode },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Build from Docs"
        title="Documentation → Project"
        subtitle="Upload any requirements doc, SRS, PRD or specification — AI reads it like a senior architect, plans the full project, and writes real production-ready code for every file."
      />

      {/* Upload area — only show when no plan yet */}
      {!plan && (
        <Panel className="p-8">
          {status !== "loading" && (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragActive ? "border-cyan-400 bg-cyan-500/5" : "border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02]"
                }`}
              >
                <input {...getInputProps()} />
                <FiUploadCloud size={48} className="text-cyan-400 mb-3" />
                <p className="text-xl font-display font-semibold">
                  {isDragActive ? "Drop it here" : "Drop your documentation"}
                </p>
                <p className="text-slate-400 text-sm mt-2">.txt · .md · .pdf · .docx accepted</p>
              </div>
              {file && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FiFile className="text-cyan-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-white"><FiX /></button>
                    <button
                      onClick={handleAnalyze}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-bold text-sm hover:opacity-90"
                    >
                      Analyze & Plan
                    </button>
                  </div>
                </div>
              )}
              {errorMsg && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
                  <FiAlertCircle className="shrink-0" /> {errorMsg}
                </div>
              )}
            </>
          )}

          {status === "loading" && (
            <div className="min-h-72 flex flex-col items-center justify-center gap-5">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                <div className="absolute inset-0 rounded-full border-[3px] border-t-cyan-400 border-r-violet-400 border-transparent animate-spin" />
              </div>
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phaseIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-lg font-medium text-white"
                  >
                    {PHASES[phaseIndex]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-sm text-slate-400 mt-1">AI is writing real code for each file…</p>
              </div>
              <div className="w-80 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
                  animate={{ width: `${((phaseIndex + 1) / PHASES.length) * 100}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-slate-500 mono">This may take 2-3 minutes — AI is coding {plan?.filesToGenerate?.length || "all"} files</p>
            </div>
          )}
        </Panel>
      )}

      {/* RESULTS */}
      {status === "done" && plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Summary card */}
          <Panel className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <FiCheckCircle className="text-emerald-400 shrink-0" size={24} />
                  <h2 className="text-2xl font-display font-bold text-white">Project Plan Ready</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-cyan-300">
                    {plan.suggestedFramework}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{plan.summary}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleDownload}
                  disabled={genStatus === "generating"}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {genStatus === "generating"
                    ? <><FiRefreshCw className="animate-spin" size={15} /> Generating ZIP…</>
                    : genStatus === "done"
                    ? <><FiCheckCircle size={15} /> Downloaded!</>
                    : <><FiDownload size={15} /> Download Project ZIP</>
                  }
                </button>
                <button
                  onClick={() => { setPlan(null); setStatus("idle"); setFile(null); setDocPlanId(null); }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm hover:bg-white/10"
                >
                  <FiUploadCloud size={14} /> New Document
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
              {[
                ["Modules", plan.modules?.length ?? 0, "text-violet-400"],
                ["Pages", plan.frontendPages?.length ?? 0, "text-cyan-400"],
                ["API Routes", plan.backendRoutes?.length ?? 0, "text-emerald-400"],
                ["DB Tables", plan.databaseSchema?.length ?? 0, "text-amber-400"],
                ["Files Coded", plan.starterCode?.length ?? 0, "text-rose-400"],
              ].map(([label, val, color]) => (
                <div key={label} className="rounded-xl bg-white/[0.04] border border-white/8 p-4 text-center">
                  <p className={`text-3xl font-display font-bold ${color}`}>{val}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Tab nav */}
          <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1.5 border border-white/8 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === id
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/25 text-cyan-300"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* MODULES TAB */}
          {activeTab === "modules" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.modules?.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Panel className="p-5 h-full hover:border-violet-500/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400">
                          <FiLayers size={16} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          m.priority === "High" ? "bg-rose-500/10 text-rose-300 border-rose-500/30" :
                          m.priority === "Medium" ? "bg-amber-500/10 text-amber-300 border-amber-500/30" :
                          "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}>{m.priority}</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">{m.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
                    </Panel>
                  </motion.div>
                ))}
              </div>
              {plan.frontendPages?.length > 0 && (
                <Panel className="p-6">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Frontend Pages</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.frontendPages.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
                        <FiChevronRight size={12} /> {p}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          )}

          {/* API ROUTES TAB */}
          {activeTab === "routes" && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">
                Backend API Routes ({plan.backendRoutes?.length ?? 0})
              </h3>
              <div className="space-y-2">
                {plan.backendRoutes?.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-5 py-3.5 hover:border-white/15 transition-colors"
                  >
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border mono min-w-[54px] text-center ${METHOD_COLORS[r.method] || "bg-white/5 text-slate-300 border-white/10"}`}>
                      {r.method}
                    </span>
                    <span className="mono text-sm text-white flex-1">{r.path}</span>
                    <span className="text-xs text-slate-400 hidden sm:block">{r.purpose}</span>
                  </motion.div>
                ))}
              </div>
            </Panel>
          )}

          {/* DATABASE TAB */}
          {activeTab === "database" && (
            <div className="grid sm:grid-cols-2 gap-5">
              {plan.databaseSchema?.map((table, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Panel className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <FiDatabase size={14} />
                      </div>
                      <h3 className="font-semibold text-white mono">{table.table}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {table.fields?.map((f, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                          <span className="mono text-slate-300">{f}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </motion.div>
              ))}
            </div>
          )}

          {/* FILE STRUCTURE TAB */}
          {activeTab === "structure" && (
            <Panel className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-5">
                Complete Folder Structure
              </h3>
              <pre className="mono text-sm text-slate-200 bg-black/30 rounded-xl p-6 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {plan.suggestedFileStructure || "No structure generated."}
              </pre>
            </Panel>
          )}

          {/* SOURCE CODE TAB */}
          {activeTab === "code" && (
            <div className="flex gap-5">
              {/* File list sidebar */}
              <div className="w-64 shrink-0">
                <Panel className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2 px-2">Files Generated</p>
                  <div className="space-y-1">
                    {plan.starterCode?.map((f, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveFile(f)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                          activeFile?.filePath === f.filePath
                            ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-300"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <p className="mono truncate">{f.filePath.split("/").pop()}</p>
                        <p className="text-slate-500 truncate mt-0.5">{f.filePath}</p>
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>

              {/* Code viewer */}
              <div className="flex-1 min-w-0 space-y-4">
                {activeFile ? (
                  <>
                    <div className="flex items-center gap-3">
                      <FiCode className="text-cyan-400" />
                      <span className="mono text-sm text-slate-200">{activeFile.filePath}</span>
                      <Badge tone="cyan">{activeFile.language}</Badge>
                    </div>
                    {activeFile.explanation && (
                      <Panel className="p-4">
                        <p className="text-sm text-slate-300 leading-relaxed">{activeFile.explanation}</p>
                      </Panel>
                    )}
                    <CodeViewer
                      code={activeFile.code}
                      language={activeFile.language}
                      filePath={activeFile.filePath}
                    />
                  </>
                ) : (
                  <Panel className="p-12 text-center text-slate-500">
                    Select a file to view its code
                  </Panel>
                )}
              </div>
            </div>
          )}

          {/* Error below results */}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm">
              <FiAlertCircle className="shrink-0" /> {errorMsg}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
