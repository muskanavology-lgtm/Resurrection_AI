import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { uploadProject } from "../lib/api";
import { useActiveProject } from "../lib/ProjectContext";
import { PageHeader, Panel } from "../components/UI";

const PHASES = [
  "Extracting archive",
  "Detecting framework & stack",
  "Scanning routes & controllers",
  "Running security analysis",
  "Building dependency graph",
  "Computing health score",
  "Finalizing report",
];

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); 
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const phaseTimer = useRef(null);
  const navigate = useNavigate();
  const { setActiveProject } = useActiveProject();

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length) {
      setErrorMsg("Only .zip files are accepted.");
      setStatus("error");
      return;
    }
    if (accepted?.[0]) {
      setFile(accepted[0]);
      setStatus("idle");
      setErrorMsg("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/zip": [".zip"], "application/x-zip-compressed": [".zip"] },
  });

  function startFakePhaseProgress() {
    let i = 0;
    setPhaseIndex(0);
    phaseTimer.current = setInterval(() => {
      i = Math.min(i + 1, PHASES.length - 1);
      setPhaseIndex(i);
    }, 1400);
  }

  function stopFakePhaseProgress() {
    if (phaseTimer.current) clearInterval(phaseTimer.current);
  }

  async function handleAnalyze() {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");
    try {
      const res = await uploadProject(file, (pct) => {
        setProgress(pct);
        if (pct >= 100) {
          setStatus("analyzing");
          startFakePhaseProgress();
        }
      });
      stopFakePhaseProgress();
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.error || "Analysis failed on the server.");
      }
      setStatus("done");
      setActiveProject(data.projectId, file.name);
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      stopFakePhaseProgress();
      setStatus("error");
      setErrorMsg(
        err?.response?.data?.error ||
          err?.message ||
          "Upload failed. Check that the backend server is running."
      );
    }
  }

  const busy = status === "uploading" || status === "analyzing";

  return (
    <div>
      <PageHeader
        eyebrow="Step 1"
        title="Upload Repository"
        subtitle="Drop a zipped codebase and let the engine read it like a senior developer — architecture, security, health and a chat-ready knowledge graph, generated in one pass."
      />

      <Panel className="p-10">
        {!busy && status !== "done" && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-3xl h-[340px] flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragActive
                ? "border-cyan-400 bg-cyan-500/5"
                : "border-white/15 hover:border-cyan-400/60 hover:bg-white/[0.02]"
            }`}
          >
            <input {...getInputProps()} />
            <FiUploadCloud size={64} className="text-cyan-400 mb-5" />
            <h2 className="text-2xl font-display font-semibold">
              {isDragActive ? "Drop it here" : "Drag & drop a .zip"}
            </h2>
            <p className="text-slate-400 mt-2">or click to browse your files</p>
          </div>
        )}

        {busy && (
          <div className="h-[340px] flex flex-col items-center justify-center">
            <div className="relative h-20 w-20 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-violet-400 border-transparent animate-spin" />
            </div>
            <h2 className="text-xl font-display font-semibold mb-1">
              {status === "uploading" ? `Uploading… ${progress}%` : "Analyzing repository"}
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={status === "uploading" ? "upload" : phaseIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-slate-400 mono text-sm mt-2"
              >
                {status === "uploading" ? "Sending archive to engine…" : PHASES[phaseIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="w-72 h-1.5 rounded-full bg-white/5 mt-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
                initial={{ width: 0 }}
                animate={{
                  width: status === "uploading" ? `${progress}%` : `${Math.min(95, (phaseIndex + 1) * (100 / PHASES.length))}%`,
                }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="h-[340px] flex flex-col items-center justify-center">
            <FiCheckCircle size={56} className="text-emerald-400 mb-4" />
            <h2 className="text-xl font-display font-semibold">Analysis complete</h2>
            <p className="text-slate-400 mt-2">Redirecting to your dashboard…</p>
          </div>
        )}

        {/* Selected file row */}
        {file && !busy && status !== "done" && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <FiFile className="text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                aria-label="Remove file"
              >
                <FiX />
              </button>
              <button
                onClick={handleAnalyze}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Analyze Repository
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300">
            <FiAlertCircle className="shrink-0" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}
      </Panel>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          ["Framework & stack detection", "MERN, MEAN, Laravel, Django, Spring Boot and more"],
          ["Security & health scoring", "Hardcoded secrets, JWT issues, missing rate limits"],
          ["AI-ready knowledge graph", "Chat with the repo using real file context"],
        ].map(([t, s]) => (
          <Panel key={t} className="p-5">
            <p className="text-sm font-semibold text-white mb-1">{t}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{s}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
