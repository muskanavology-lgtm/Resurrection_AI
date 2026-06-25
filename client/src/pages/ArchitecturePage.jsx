import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ArchitecturePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArch = async () => {
      try {
        const pId = localStorage.getItem("projectId");
        if (!pId) return;
        
        // Anti-cache query parameter append kiya hai taaki hamesha fresh data aaye
        const res = await axios.get(`http://localhost:5000/api/dashboard/${pId}?t=${Date.now()}`);
        setData(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArch();
  }, []);

  if (loading) return <div className="p-8 text-cyan-400 font-mono animate-pulse">Syncing Micro-Architectures...</div>;

  // Strict check for MERN layers vs PHP layers
  const isMern = data?.framework?.toLowerCase().includes("mern") || data?.techStack?.toLowerCase().includes("node");
  const currentFramework = data?.framework || (isMern ? "MERN Stack Engine" : "Core System Engine");
  const routeArray = data?.routesFound || data?.routes || [];

  return (
    <div className="p-8 text-white max-w-[1200px] mx-auto w-full">
      <h1 className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        System Architecture Blueprint
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl">
          <span className="text-xs text-slate-500 block uppercase">Detected Stack Topology</span>
          <span className="text-2xl font-bold text-cyan-400">{currentFramework}</span>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-black/30 p-3 rounded-lg">
              <span className="text-xs text-slate-400 block">Controllers Indexed</span>
              <span className="text-xl font-bold text-white">{data?.controllers || 0}</span>
            </div>
            <div className="bg-black/30 p-3 rounded-lg">
              <span className="text-xs text-slate-400 block">Total Entry Modules</span>
              <span className="text-xl font-bold text-white">{data?.totalComponents || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 p-6 rounded-xl">
          <span className="text-xs text-purple-400 font-bold uppercase block mb-2">AI Architectural Structural Layout</span>
          <p className="text-sm text-slate-300 font-mono bg-black/40 p-3 rounded-lg border border-white/5">
            {data?.aiDocumentation || `This is a ${currentFramework} based application mapping architecture components.`}
          </p>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 p-6 rounded-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-300">Active Controller Endpoints ({routeArray.length})</h3>
        {routeArray.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {routeArray.map((r, i) => (
              <div key={i} className="p-2 bg-black/40 border border-white/5 rounded font-mono text-xs text-emerald-400">
                {r.path || r}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No standalone explicit routes registered outside root controller scopes.</p>
        )}
      </div>
    </div>
  );
}