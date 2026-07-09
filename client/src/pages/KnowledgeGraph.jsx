import { useEffect, useState, useMemo, useRef } from "react";
import { FiGitBranch } from "react-icons/fi";
import { useActiveProject } from "../lib/ProjectContext";
import { getKnowledgeGraph } from "../lib/api";
import { PageHeader, Panel, Loader, ErrorState, EmptyState, Badge } from "../components/UI";

function layoutNodes(nodes, width, height) {

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 60;
  return nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...n,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

function normPath(p) {
  return typeof p === "string" ? p.replace(/\\/g, "/").toLowerCase() : p;
}

function shortLabel(label, fallbackId) {
  const raw = (typeof label === "string" && label.trim()) || (typeof fallbackId === "string" && fallbackId.trim()) || "";
  if (!raw) return "unnamed";
  const parts = raw.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] || raw;
}
export default function KnowledgeGraph() {
  const { activeProjectId } = useActiveProject();
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 560 });

  useEffect(() => {
    if (!activeProjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getKnowledgeGraph(activeProjectId)
      .then((res) => setGraph(res.data?.graph || { nodes: [], edges: [] }))
      .catch((err) => setError(err?.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [activeProjectId]);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setSize({ w: containerRef.current.clientWidth, h: 560 });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  
  const visibleNodes = useMemo(() => {
    if (!graph?.nodes) return [];
    return graph.nodes.slice(0, 40);
  }, [graph]);

  const positioned = useMemo(
    () => layoutNodes(visibleNodes, size.w, size.h),
    [visibleNodes, size]
  );

  const posMap = useMemo(() => {
    const m = new Map();
    positioned.forEach((n) => m.set(normPath(n.id), n));
    return m;
  }, [positioned]);

  const visibleEdges = useMemo(() => {
    if (!graph?.edges) return [];
    return graph.edges.filter((e) => posMap.has(normPath(e.source)) && posMap.has(normPath(e.target)));
  }, [graph, posMap]);

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Map" title="Knowledge Graph" />
        <EmptyState icon={FiGitBranch} title="No repository loaded" subtitle="Upload a repository to visualize its dependency graph." />
      </div>
    );
  }

  if (loading) return <Loader label="Building graph" />;
  if (error) return <ErrorState message={error} />;

  if (!graph?.nodes?.length) {
    return (
      <div>
        <PageHeader eyebrow="Map" title="Knowledge Graph" />
        <EmptyState
          icon={FiGitBranch}
          title="No graph data available"
          subtitle="This repository didn't produce any traceable import/require relationships."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Map"
        title="Knowledge Graph"
        subtitle={`${graph.nodes.length} files · ${graph.edges.length} dependency links${
          graph.nodes.length > 40 ? " (showing first 40 for clarity)" : ""
        }`}
      />

      <Panel className="p-4" ref={containerRef}>
        <svg width="100%" height={size.h} className="overflow-visible">
          {visibleEdges.map((e, i) => {
            const s = posMap.get(normPath(e.source));
            const t = posMap.get(normPath(e.target));
            if (!s || !t) return null;
            const isActive = hovered && (hovered === e.source || hovered === e.target);
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={isActive ? "#22d3ee" : "rgba(255,255,255,0.1)"}
                strokeWidth={isActive ? 1.6 : 1}
              />
            );
          })}
          {positioned.map((n) => {
            const isActive = hovered === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                <circle r={isActive ? 9 : 6} fill={isActive ? "#22d3ee" : "#a78bfa"} opacity={isActive ? 1 : 0.85} />
                {(() => {
                  const txt = shortLabel(n.label, n.id);
                  const charW = isActive ? 6.4 : 5.2;
                  const w = Math.max(20, txt.length * charW + 10);
                  const labelY = isActive ? -16 : -12;
                  return (
                    <>
                      <rect
                        x={-w / 2}
                        y={labelY - 12}
                        width={w}
                        height={16}
                        rx={4}
                        fill="rgba(5,8,16,0.85)"
                        opacity={isActive ? 1 : 0.7}
                      />
                      <text
                        x={0}
                        y={labelY}
                        textAnchor="middle"
                        fontSize={isActive ? 11 : 9}
                        fill={isActive ? "#fff" : "#94a3b8"}
                        className="mono"
                      >
                        {txt}
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </Panel>

      <Panel className="p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
          All Files ({graph.nodes.length})
        </h3>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {graph.nodes.map((n) => (
            <Badge key={n.id} tone="violet">
              {shortLabel(n.label, n.id)}
            </Badge>
          ))}
        </div>
      </Panel>
    </div>
  );
}
