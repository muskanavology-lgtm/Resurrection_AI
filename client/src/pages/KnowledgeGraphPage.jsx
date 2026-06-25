import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

export default function KnowledgeGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const projectId = localStorage.getItem("projectId");
        if (!projectId) return;

        const res = await axios.get(`http://localhost:5000/api/dashboard/${projectId}`);
        const dataPayload = res.data?.data || res.data;
        const graph = dataPayload?.knowledgeGraph;

    
        const structuralNodes = (graph?.nodes || []).map((node, i) => ({
          ...node,
          id: node.id || `node_${i}`,
          position: node.position || { x: (i % 4) * 250, y: Math.floor(i / 4) * 150 },
          style: {
            background: "#1e1b4b",
            color: "#22d3ee",
            border: "1px solid rgba(34, 211, 238, 0.4)",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "12px",
            fontFamily: "monospace"
          }
        }));

        setNodes(structuralNodes);
        setEdges(graph?.edges || []);
        setSummary(graph?.graphSummary || dataPayload?.graphSummary);
      } catch (error) {
        console.error("Graph Parsing Error", error);
      } finally {
        setLoading(false);
      }
    };

    loadGraph();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400 font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mr-3"></div>
        Compiling Dependency Clusters...
      </div>
    );
  }

  return (
    <div className="p-8 font-sans text-white max-w-[1400px] mx-auto w-full min-h-screen flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Repository Knowledge Graph
        </h1>
        <p className="text-slate-400 text-sm mt-1">AI Generated Architecture Map & Inter-module Clusters</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl backdrop-blur-md">
          <div className="p-2"><span className="text-slate-500 text-xs block">Total Clusters</span><span className="text-xl font-bold text-cyan-400">{summary.totalNodes || nodes.length} Nodes</span></div>
          <div className="p-2"><span className="text-slate-500 text-xs block">Interlink Paths</span><span className="text-xl font-bold text-purple-400">{summary.totalEdges || edges.length} Edges</span></div>
          <div className="p-2"><span className="text-slate-500 text-xs block">Central Pivot Module</span><span className="text-xl font-bold text-emerald-400 truncate block">{summary.mostConnected || "None Detected"}</span></div>
        </div>
      )}

      {/* CRITICAL FIX: Explicit Height Required for ReactFlow Engine */}
      <div className="w-full h-[650px] bg-black/40 border border-white/[0.08] rounded-2xl overflow-hidden relative shadow-inner">
        {nodes.length > 0 ? (
          <ReactFlow nodes={nodes} edges={edges} fitView defaultEdgeOptions={{ animated: true, style: { stroke: "#a855f7" } }}>
            <MiniMap style={{ background: "#0f172a" }} maskColor="rgba(0, 0, 0, 0.4)" nodeColor="#22d3ee" />
            <Controls className="bg-slate-900 border border-slate-700 text-white fill-white" />
            <Background color="#334155" gap={16} size={1} />
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
            No logical maps found inside this project bundle tree.
          </div>
        )}
      </div>
    </div>
  );
}