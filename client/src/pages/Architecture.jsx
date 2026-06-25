import { useActiveProject } from "../lib/ProjectContext";
import { useProjectData } from "../hooks/useProjectData";
import { getArchitecture, getArchitectureDiagram, getProject } from "../lib/api";
import { PageHeader, Panel, Loader, ErrorState, EmptyState, Badge, ProgressRing } from "../components/UI";
import { FiCpu } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Architecture() {
  const { activeProjectId } = useActiveProject();
  const { data, loading, error, refetch } = useProjectData(getArchitecture, activeProjectId);
  const [diagram, setDiagram] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (!activeProjectId) return;
    getArchitectureDiagram(activeProjectId).then((r) => setDiagram(r.data?.diagram));
    getProject(activeProjectId).then((r) => setProject(r.data?.project));
  }, [activeProjectId]);

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Structure" title="Architecture" />
        <EmptyState icon={FiCpu} title="No repository loaded" subtitle="Upload a repository to detect its architecture pattern." />
      </div>
    );
  }

  if (loading) return <Loader label="Reading architecture" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const arch = data?.architecture || {};
  const confidencePct = parseInt(arch.confidence) || 0;
  const flow = diagram?.mermaid?.trim() || "";
  const flowSteps = flow
    .split("\n")
    .filter((l) => l.includes("-->"))
    .map((l) => l.split("-->").map((s) => s.trim().replace(/\[.*\]/, "")));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Structure"
        title="Architecture"
        subtitle="Detected from folder structure and conventions, not assumptions."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="p-7 flex items-center gap-6 lg:col-span-1">
          <ProgressRing value={confidencePct} label="confidence" color="#a78bfa" />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Pattern</p>
            <h2 className="text-2xl font-display font-semibold text-white">
              {arch.architecture || "Unknown"}
            </h2>
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
            Why this was detected
          </h3>
          {arch.reason?.length ? (
            <ul className="space-y-2">
              {arch.reason.map((r, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No specific signals recorded.</p>
          )}
        </Panel>
      </div>

      {flowSteps.length > 0 && (
        <Panel className="p-8">
          <h3 className="text-lg font-display font-semibold mb-7">Request Flow</h3>
          <div className="flex flex-wrap items-center gap-3">
            {[...new Set(flowSteps.flat())].map((step, i, arr) => (
              <div key={step + i} className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500/15 to-cyan-500/15 border border-violet-500/20 font-medium text-sm text-violet-200">
                  {step}
                </div>
                {i < arr.length - 1 && <span className="text-slate-500">→</span>}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {project && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ["Controllers", project.scanResult?.controllers?.length],
            ["Models", project.scanResult?.models?.length],
            ["Components", project.scanResult?.components?.length],
            ["Middleware", project.scanResult?.middleware?.length],
          ].map(([label, val]) => (
            <Panel key={label} className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</p>
              <p className="text-2xl font-display font-semibold text-white">{val ?? 0}</p>
            </Panel>
          ))}
        </div>
      )}

      {project?.techStack && (
        <Panel className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Detected Languages</h3>
          <div className="flex gap-2 flex-wrap">
            {(project.techStack.languages || project.analysis?.languages || []).map((l) => (
              <Badge key={l} tone="violet">
                {l}
              </Badge>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
