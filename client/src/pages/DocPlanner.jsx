import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiUploadCloud, FiFile, FiX, FiCheckCircle, FiDownload,
  FiCpu, FiLayers, FiDatabase, FiCode, FiZap, FiAlertCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { Panel, PageHeader, Badge, Loader } from "../components/UI";

const PHASES = [
  "Reading documentation",
  "Understanding project requirements",
  "Identifying modules & features",
  "Planning folder structure",
  "Designing database schema",
  "Mapping API routes",
  "Writing starter code",
  "Finalizing project plan",
];

export default function DocToProject() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error | generating
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [plan, setPlan] = useState(null);
  const [rawAnswer, setRawAnswer] = useState("");
  const [docPlanId, setDocPlanId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("modules");
  const [genStatus, setGenStatus] = useState("idle"); // idle | generating | done
  const phaseTimer = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    onDrop: (accepted, rejected) => {
      if (rejected?.length) {
        setErrorMsg("Only .txt, .md, .pdf, .docx files accepted.");
        return;
      }
      if (accepted?.[0]) {
        setFile(accepted[0]);
        setErrorMsg("");
        setStatus("idle");
        setPlan(null);
      }
    },
  });

  function startPhaseTimer() {
    let i = 0;
    setPhaseIndex(0);
    phaseTimer.current = setInterval(() => {
      i = Math.min(i + 1, PHASES.length - 1);
      setPhaseIndex(i);
    }, 2000);
  }
  function stopPhaseTimer() {
    if (phaseTimer.current) clearInterval(phaseTimer.current);
  }

  async function handleAnalyze() {
    if (!file) return;
    setStatus("uploading");
    setErrorMsg("");
    setPlan(null);
    startPhaseTimer();

    try {
      const formData = new FormData();
      formData.append("document", file);
      const res = await axios.post("/api/docs/plan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      stopPhaseTimer();
      const data = res.data;
      if (!data.success) throw new Error(data.error || "Plan generation failed");
      setPlan(data.plan || null);
      setRawAnswer(data.rawAnswer || "");
      setDocPlanId(data.docPlanId);
      setStatus("done");
      setActiveTab("modules");
    } catch (err) {
      stopPhaseTimer();
      setStatus("error");
      setErrorMsg(err?.response?.data?.error || err.message);
    }
  }

  async function handleGenerateProject() {
    if (!docPlanId) return;
    setGenStatus("generating");
    try {
      const res = await axios.post(`/api/docs/generate/${docPlanId}`, {}, {
        responseType: "blob",
        timeout: 180000,
      });
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fw = plan?.suggestedFramework?.toLowerCase().replace(/\s+/g, "-") || "project";
      a.download = `${fw}-generated.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setGenStatus("done");
    } catch (err) {
      setGenStatus("idle");
      setErrorMsg("Code generation failed: " + (err?.response?.data?.error || err.message));
    }
  }

  const busy = status === "uploading";
  const tabs = [
    { id: "modules", label: "Modules", icon: FiLayers },
    { id: "structure", label: "File Structure", icon: FiCode },
    { id: "routes", label: "API Routes", icon: FiZap },
    { id: "database", label: "Database", icon: FiDatabase },
    { id: "code", label: "Starter Code", icon: FiCpu },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Build from Docs"
        title="Documentation → Project"
        subtitle="Upload any requirements doc, spec or PRD — AI reads it like a senior architect and plans the entire project with real starter code."
      />

      {/* Upload Panel */}
      {!plan && (
        <Panel className="p-8">
          {!busy && (
            <>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragActive ? "border-cyan-400 bg-cyan-500/5" : "border-white/15 hover:border-cyan-400/60"
                }`}
              >
                <input {...getInputProps()} />
                <FiUploadCloud size={40} className="text-cyan-400 mb-3" />
                <p className="text-lg font-display font-semibold">
                  {isDragActive ? "Drop it here" : "Drop your documentation"}
                </p>
                <p className="text-slate-400 text-sm mt-1">.txt · .md · .pdf · .docx accepted</p>
              </div>

              {file && (
                <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FiFile className="text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-sm text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-white"><FiX /></button>
                    <button
                      onClick={handleAnalyze}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm"
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

          {busy && (
            <div className="h-56 flex flex-col items-center justify-center gap-4">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-violet-400 border-transparent animate-spin" />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-slate-300 font-medium"
                >
                  {PHASES[phaseIndex]}
                </motion.p>
              </AnimatePresence>
              <div className="w-64 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
                  animate={{ width: `${((phaseIndex + 1) / PHASES.length) * 100}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* Plan Result */}
      {status === "done" && (plan || rawAnswer) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header with summary + actions */}
          <Panel className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FiCheckCircle className="text-emerald-400" size={22} />
                  <h2 className="text-xl font-display font-semibold text-white">
                    Project Plan Ready
                  </h2>
                  {plan?.suggestedFramework && (
                    <Badge tone="cyan">{plan.suggestedFramework}</Badge>
                  )}
                </div>
                {plan?.summary && (
                  <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">{plan.summary}</p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setPlan(null); setRawAnswer(""); setStatus("idle"); setDocPlanId(null); setFile(null); }}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-sm hover:bg-white/10"
                >
                  New Document
                </button>
                <button
                  onClick={handleGenerateProject}
                  disabled={genStatus === "generating" || !docPlanId}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm disabled:opacity-50"
                >
                  <FiDownload size={15} />
                  {genStatus === "generating" ? "Generating…" : genStatus === "done" ? "Downloaded!" : "Generate & Download Project"}
                </button>
              </div>
            </div>

            {/* Stats row */}
            {plan && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {[
                  ["Modules", plan.modules?.length ?? 0],
                  ["Pages", plan.frontendPages?.length ?? 0],
                  ["API Routes", plan.backendRoutes?.length ?? 0],
                  ["Starter Files", plan.starterCode?.length ?? 0],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl bg-white/[0.04] border border-white/8 p-4 text-center">
                    <p className="text-2xl font-display font-bold text-white">{val}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Raw fallback if JSON parse failed */}
          {!plan && rawAnswer && (
            <Panel className="p-7">
              <div className="prose-ai">
                <ReactMarkdown>{rawAnswer}</ReactMarkdown>
              </div>
            </Panel>
          )}

          {plan && (
            <>
              {/* Tab nav */}
              <div className="flex gap-1 bg-white/[0.03] rounded-2xl p-1.5 border border-white/8 overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === id
                        ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/25 text-cyan-300"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* Modules tab */}
              {activeTab === "modules" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {plan.modules?.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Panel className="p-5 h-full">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-white text-sm">{m.name}</h3>
                          <Badge tone={m.priority === "High" ? "critical" : m.priority === "Medium" ? "medium" : "good"}>
                            {m.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
                      </Panel>
                    </motion.div>
                  ))}
                  {/* Frontend pages */}
                  {plan.frontendPages?.length > 0 && (
                    <Panel className="p-5 sm:col-span-2">
                      <h3 className="font-semibold text-white text-sm mb-3">Frontend Pages</h3>
                      <div className="flex flex-wrap gap-2">
                        {plan.frontendPages.map((p, i) => (
                          <Badge key={i} tone="violet">{p}</Badge>
                        ))}
                      </div>
                    </Panel>
                  )}
                </div>
              )}

              {/* File structure tab */}
              {activeTab === "structure" && (
                <Panel className="p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                    Suggested Folder / File Structure
                  </h3>
                  {plan.suggestedFileStructure ? (
                    <pre className="mono text-xs text-slate-200 leading-relaxed bg-black/30 rounded-xl p-5 overflow-x-auto whitespace-pre-wrap">
                      {plan.suggestedFileStructure}
                    </pre>
                  ) : (
                    <p className="text-slate-500 text-sm">No structure generated.</p>
                  )}
                </Panel>
              )}

              {/* API Routes tab */}
              {activeTab === "routes" && (
                <Panel className="p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
                    Backend API Routes ({plan.backendRoutes?.length ?? 0})
                  </h3>
                  <div className="space-y-2.5">
                    {plan.backendRoutes?.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                        <Badge tone={r.method === "GET" ? "cyan" : r.method === "POST" ? "good" : r.method === "DELETE" ? "critical" : "medium"}>
                          {r.method}
                        </Badge>
                        <div>
                          <p className="mono text-sm text-white">{r.path}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{r.purpose}</p>
                        </div>
                      </div>
                    ))}
                    {(!plan.backendRoutes || plan.backendRoutes.length === 0) && (
                      <p className="text-slate-500 text-sm">No routes in plan.</p>
                    )}
                  </div>
                </Panel>
              )}

              {/* Database tab */}
              {activeTab === "database" && (
                <div className="space-y-4">
                  {plan.databaseSchema?.map((table, i) => (
                    <Panel key={i} className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <FiDatabase className="text-violet-400" />
                        <h3 className="font-semibold text-white">{table.table}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {table.fields?.map((f, j) => (
                          <span key={j} className="mono text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                            {f}
                          </span>
                        ))}
                      </div>
                    </Panel>
                  ))}
                  {(!plan.databaseSchema || plan.databaseSchema.length === 0) && (
                    <Panel className="p-8 text-center text-slate-500 text-sm">No database schema in plan.</Panel>
                  )}
                </div>
              )}

              {/* Starter Code tab */}
              {activeTab === "code" && (
                <div className="space-y-5">
                  {plan.starterCode?.map((f, i) => (
                    <Panel key={i} className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <FiCode className="text-cyan-400 shrink-0" />
                        <span className="mono text-sm text-slate-200">{f.filePath}</span>
                        {f.language && <Badge tone="default">{f.language}</Badge>}
                      </div>
                      {f.explanation && (
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">{f.explanation}</p>
                      )}
                      {f.code ? (
                        <pre className="mono text-xs text-slate-200 bg-black/40 rounded-xl p-4 overflow-x-auto max-h-72">
                          {f.code}
                        </pre>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Code will be generated when you download the project.</p>
                      )}
                    </Panel>
                  ))}
                  {(!plan.starterCode || plan.starterCode.length === 0) && (
                    <Panel className="p-8 text-center text-slate-500 text-sm">No starter files generated yet.</Panel>
                  )}
                </div>
              )}
            </>
          )}

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
