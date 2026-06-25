import React, { useEffect, useState } from "react";
import axios from "axios";

export default function HealthPage() {
  const [score, setScore] = useState(100);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const projectId = localStorage.getItem("projectId");
        if (!projectId) return;

        const res = await axios.get(`http://localhost:5000/api/health/${projectId}`);
        if (res.data?.success) {
          setScore(res.data.health);
        }
      } catch (err) {
        console.error("Health parsing error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  if (loading) return <div className="p-8 text-slate-400 font-mono">Compiling system diagnostics...</div>;

  return (
    <div className="p-8 text-white max-w-[1200px] mx-auto w-full min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-emerald-400">Codebase Health</h1>
        <p className="text-slate-400 text-sm">Dynamic algorithmic evaluation metrics computed by backend compiler maps.</p>
      </div>

      <div className="bg-white/[0.01] border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <span className="text-xs text-slate-500 uppercase tracking-widest mb-4">Overall Score Analysis</span>
        <div className="w-36 h-36 rounded-full border-4 border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center shadow-lg">
          <span className="text-5xl font-black text-emerald-400">{score}%</span>
        </div>
        <div className="mt-6 font-mono text-xs text-slate-400 px-4 py-1.5 bg-white/5 rounded-full">
          Status: {score >= 80 ? "Maintainable Framework Structure" : "Refactoring Actions Advised"}
        </div>
      </div>
    </div>
  );
}