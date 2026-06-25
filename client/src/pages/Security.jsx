import { useActiveProject } from "../lib/ProjectContext";
import { useProjectData } from "../hooks/useProjectData";
import { getProject } from "../lib/api";
import { PageHeader, Panel, Loader, ErrorState, EmptyState, Badge, severityTone, ProgressRing } from "../components/UI";
import { FiShield, FiAlertTriangle } from "react-icons/fi";

export default function Security() {
  const { activeProjectId } = useActiveProject();
  const { data, loading, error, refetch } = useProjectData(getProject, activeProjectId);

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader eyebrow="Defense" title="Security Report" />
        <EmptyState icon={FiShield} title="No repository loaded" subtitle="Upload a repository to run the security scan." />
      </div>
    );
  }

  if (loading) return <Loader label="Scanning for vulnerabilities" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const project = data?.project;
  
  const report = project?.securityReport || {};
  const issues = report.issues || [];
  const score = report.securityScore ?? report.score ?? 0;
  const grade = report.grade || "—";
  const counts = {
    critical: report.critical || 0,
    high: report.high || 0,
    medium: report.medium || 0,
    low: report.low || 0,
  };

  const ringColor = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f43f5e";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Defense"
        title="Security Report"
        subtitle="Pattern-based scan for exposed secrets, unsafe code paths and risky dependencies."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="p-7 flex items-center gap-6">
          <ProgressRing value={score} label="score" color={ringColor} />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Grade</p>
            <h2 className="text-3xl font-display font-semibold text-white">{grade}</h2>
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
            Issue Breakdown
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(counts).map(([sev, n]) => (
              <div key={sev} className="text-center">
                <p className="text-2xl font-display font-bold text-white">{n}</p>
                <Badge tone={severityTone(sev)}>{sev}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="p-7">
        <h3 className="text-lg font-display font-semibold mb-5">Findings</h3>
        {issues.length === 0 ? (
          <p className="text-sm text-slate-500">No issues detected by the scanner.</p>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4"
              >
                <FiAlertTriangle className="text-rose-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge tone={severityTone(issue.severity)}>{issue.severity}</Badge>
                    <span className="mono text-xs text-slate-500 truncate">{issue.file}</span>
                  </div>
                  <p className="text-sm text-slate-200">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {report.recommendations?.length > 0 && (
        <Panel className="p-7">
          <h3 className="text-lg font-display font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2.5">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
