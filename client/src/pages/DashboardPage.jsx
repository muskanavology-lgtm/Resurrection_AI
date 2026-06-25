import React, { useEffect, useState } from "react";
import axios from "axios";

function DashboardPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

const loadDashboard = async () => {
    try {
      const projectId = localStorage.getItem("projectId");
      if (!projectId) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/dashboard/${projectId}`);
      console.log("Clean Front-end Fetched Data:", res.data);
      
    
      setProject(res.data);
    } catch (err) {
      console.log("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#22d3ee", fontFamily: "sans-serif" }}>
        <h3>Parsing Architecture Intelligence...</h3>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: "30px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", textAlign: "center", color: "#94a3b8", fontFamily: "sans-serif" }}>
        <h2>No Active Repository Analytics Available</h2>
        <p>Please upload a project zip via the upload portal.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", color: "#ffffff", padding: "10px", backgroundColor: "transparent" }}>
      
      {/* INTERNAL CUSTOM CSS FOR GRID & CARDS */}
      <style>{`
        .dash-grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .dash-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 25px; }
        .dash-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
        
        .glow-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; borderRadius: 16px; border-radius: 14px; position: relative; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); transition: transform 0.2s; }
        .glow-card:hover { border-color: rgba(34, 211, 238, 0.3); }
        
        .tag-pill { display: inline-block; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: monospace; margin: 4px; }
        .tag-cyan { background: rgba(34, 211, 238, 0.1); color: #22d3ee; border: 1px solid rgba(34, 211, 238, 0.2); }
        .tag-purple { background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.2); }
        .tag-emerald { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
        
        .doc-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6; color: #cbd5e1; max-height: 140px; overflow-y: auto; }
      `}</style>

      {/* DASHBOARD HEADER */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 6px 0", letterSpacing: "-0.5px" }}>
          Project Analysis Dashboard
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          AI Generated Repository Insights & Framework Architecture Breakdown
        </p>
      </div>

      {/* MAIN TOP CARDS STATS */}
      <div className="dash-grid-4">
        
        <div className="glow-card">
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", tracking: "1px" }}>Total Components</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#22d3ee", marginTop: "8px" }}>
            {project.stats?.components || 0}
          </div>
        </div>

        <div className="glow-card">
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Core Framework</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#a855f7", marginTop: "8px" }}>
            {project.documentation?.framework || "MERN"}
          </div>
        </div>

        <div className="glow-card">
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Controllers</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#10b981", marginTop: "8px" }}>
            {project.stats?.controllers || 0}
          </div>
        </div>

        <div className="glow-card">
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase" }}>Total Files Count</div>
          <div style={{ fontSize: "38px", fontWeight: "900", color: "#f59e0b", marginTop: "8px" }}>
            {project.stats?.files || 0}
          </div>
        </div>

      </div>

      {/* SPLIT SECTION DETAILED BREAKDOWN */}
      <div className="dash-grid-2">
        
        {/* System Details Wrapper */}
        <div className="glow-card" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", margin: "0 0 15px 0", color: "#e2e8f0" }}>
            System Stack Setup
          </h3>
          <div style={{ fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#94a3b8" }}>Main Framework Structure</span>
              <span style={{ fontWeight: "600", color: "#22d3ee" }}>{project.documentation?.framework || "MERN Stack"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ color: "#94a3b8" }}>Database Engine</span>
              <span style={{ fontWeight: "600", color: "#a855f7" }}>{project.documentation?.database?.join(", ") || "MongoDB"}</span>
            </div>
          </div>
        </div>

        {/* AI Description Wrapper */}
        <div className="glow-card">
          <h3 style={{ fontSize: "16px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", margin: "0 0 15px 0", color: "#e2e8f0" }}>
            AI Architecture Documentation
          </h3>
          <div className="doc-box">
            {project.documentation?.overview || "This application consists of modular server endpoints connected to a multi-tiered component reactive client frontend architecture structure."}
          </div>
        </div>

      </div>

      {/* DETECTED TECH STACK TAG CONTAINER */}
      <div className="glow-card" style={{ marginBottom: "25px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "700", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", margin: "0 0 15px 0", color: "#e2e8f0" }}>
          Detected Repository Stack Breakdown
        </h3>
        
        <div style={{ marginBottom: "15px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Languages Used</span>
          {project.documentation?.languages?.map((lang, idx) => (
            <span key={idx} className="tag-pill tag-cyan">{lang}</span>
          )) || <span className="tag-pill tag-cyan">JavaScript</span>}
        </div>

        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Libraries / Framework Technologies</span>
          {project.documentation?.frontend?.map((item, idx) => (
            <span key={idx} className="tag-pill tag-purple">{item} (Client)</span>
          ))}
          {project.documentation?.backend?.map((item, idx) => (
            <span key={idx} className="tag-pill tag-emerald">{item} (Server)</span>
          ))}
        </div>
      </div>

      {/* BOTTOM RUNTIME COUNTS MAP */}
      <div className="glow-card" style={{ background: "linear-gradient(to right, #0f172a, #1e1b4b)", borderColor: "rgba(34, 211, 238, 0.15)" }}>
        <h4 style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", margin: "0 0 15px 0" }}>Structure Analytics Metadata Mapping</h4>
        <div className="dash-grid-3">
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Models</div>
            <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>{project.stats?.models || 0}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Pages</div>
            <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>{project.stats?.pages || 0}</div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ color: "#64748b", fontSize: "11px", textTransform: "uppercase" }}>Routes</div>
            <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>{project.stats?.routes || 0}</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default DashboardPage;