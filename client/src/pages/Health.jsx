import { useActiveProject } from "../lib/ProjectContext";
import { useProjectData } from "../hooks/useProjectData";
import { getProject } from "../lib/api";
import { PageHeader, Panel, Loader, ErrorState, EmptyState, ProgressRing, Bar } from "../components/UI";
import { FiActivity } from "react-icons/fi";

export default function Health() {
  const { activeProjectId } = useActiveProject();
  const { data, loading, error, refetch } = useProjectData(getProject, activeProjectId);

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Diagnostics" title="Repository Health" />
        <EmptyState icon={FiActivity} title="No repository loaded" subtitle="Upload a repository to compute its health score." />
      </div>
    );
  }

  if (loading) return <Loader label="Computing health score" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const project = data?.project;
  const health = project?.repositoryHealth || {};
  const techDebt = project?.techDebtReport || {};

  const dims = [
    ["Security", health.security],
    ["Architecture", health.architecture],
    ["Code Quality", health.codeQuality],
    ["Documentation", health.documentation],
    ["Maintainability", health.maintainability],
  ].filter(([, v]) => v != null);

  const ringColor = health.healthScore >= 85 ? "#34d399" : health.healthScore >= 70 ? "#22d3ee" : "#fbbf24";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Diagnostics"
        title="Repository Health"
        subtitle="A composite score across security, architecture, quality and documentation."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="p-7 flex items-center gap-6">
          <ProgressRing value={health.healthScore || 0} label="overall" color={ringColor} />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Grade</p>
            <h2 className="text-3xl font-display font-semibold text-white">{health.grade || "—"}</h2>
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-5 uppercase tracking-wide">
            Score Breakdown
          </h3>
          <div className="space-y-4">
            {dims.map(([label, val]) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300">{label}</span>
                  <span className="text-slate-400 mono">{Math.round(val)}</span>
                </div>
                <Bar value={val} color={val >= 80 ? "bg-emerald-400" : val >= 60 ? "bg-amber-400" : "bg-rose-400"} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Panel className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Technical Debt</p>
          <p className="text-2xl font-display font-semibold text-white">{techDebt.technicalDebt || "—"}</p>
        </Panel>
        <Panel className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Large Files</p>
          <p className="text-2xl font-display font-semibold text-white">{techDebt.largeFiles ?? 0}</p>
        </Panel>
        <Panel className="p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Est. Refactor Time</p>
          <p className="text-2xl font-display font-semibold text-white">{techDebt.estimatedRefactorTime || "—"}</p>
        </Panel>
      </div>
    </div>
  );
}
