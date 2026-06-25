import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SecurityPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchSecurityData = async () => {
      try {
        const projectId = localStorage.getItem("projectId");
        if (!projectId) {
          if (isMounted) {
            setErrorMsg("No active repository matrix found. Please upload a zip project first.");
            setLoading(false);
          }
          return;
        }
        const res = await axios.get(`http://localhost:5000/api/security/${projectId}`);
        
        if (isMounted) {
          if (res.data && res.data.success) {
            setIssues(res.data.issues || []);
          } else {
            setIssues(res.data?.securityReport?.issues || res.data || []);
          }
        }
      } catch (err) {
        console.error("Vulnerability endpoint connection crash:", err);
        if (isMounted) {
          setErrorMsg("Extension interceptor or network drop detected. Try Incognito mode.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSecurityData();

    return () => {
      isMounted = false; 
    };
  }, []);

  if (loading) return <div className="p-8 text-slate-400 font-mono animate-pulse">Running advanced vulnerability mapping sequence...</div>;
  if (errorMsg) return <div className="p-8 text-red-400 font-mono text-center border border-red-500/20 bg-red-500/5 rounded-xl m-6">{errorMsg}</div>;

  const critical = issues.filter(i => i.severity === "critical").length;
  const high = issues.filter(i => i.severity === "high").length;
  const medium = issues.filter(i => i.severity === "medium").length;

  return (
    <div className="p-8 text-white max-w-[1200px] mx-auto w-full min-h-screen space-y-6">
      <div>
        <h1 className="text-3xl font-black text-red-500 font-mono">Security Vectors & Audit Logs</h1>
        <p className="text-slate-400 text-xs mt-1">Real-time target directory analysis returned from custom security scanner arrays.</p>
      </div>

      {/* Grid counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
          <span className="text-xs text-red-400 font-mono block">CRITICAL THREATS</span>
          <span className="text-3xl font-black block mt-1">{critical}</span>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
          <span className="text-xs text-orange-400 font-mono block">HIGH THREATS</span>
          <span className="text-3xl font-black block mt-1">{high}</span>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
          <span className="text-xs text-yellow-400 font-mono block">MEDIUM RISKS</span>
          <span className="text-3xl font-black block mt-1">{medium}</span>
        </div>
      </div>

      {/* Vulnerabilities Stream List */}
      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider mb-4">Indexed Flaws Stream</h3>
        {issues.length > 0 ? (
          <div className="space-y-2">
            {issues.map((issue, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 bg-black/40 flex justify-between items-center ${
                issue.severity === "critical" ? "border-red-500" : "border-amber-500"
              }`}>
                <div className="font-mono">
                  <span className="text-cyan-400 text-xs block">{issue.file || "Unknown Root Location"}</span>
                  <p className="text-slate-300 text-sm mt-1">{issue.message || "Vulnerability rule triggered."}</p>
                </div>
                <span className={`text-xs uppercase px-2 py-0.5 rounded font-bold font-mono ${
                  issue.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                }`}>{issue.severity}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-emerald-400 text-xs font-mono">✓ System secure. Zero vulnerability patterns discovered.</div>
        )}
      </div>
    </div>
  );
}