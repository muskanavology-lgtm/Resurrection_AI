import { FiActivity, FiShield, FiCpu, FiGitBranch, FiDatabase, FiCode, FiUploadCloud } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useActiveProject } from "../lib/ProjectContext";
import { useProjectData } from "../hooks/useProjectData";
import { getProject } from "../lib/api";
import { PageHeader, StatCard, Panel, Loader, ErrorState, EmptyState, Badge } from "../components/UI";

export default function Dashboard() {
  const { activeProjectId, activeProjectName } = useActiveProject();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useProjectData(getProject, activeProjectId);

  if (!activeProjectId) {
    return (
      <div>
        <PageHeader
          eyebrow="Overview"
          title="Repository Intelligence"
          subtitle="AI-powered codebase analysis platform."
        />
        <EmptyState
          icon={FiUploadCloud}
          title="No repository loaded yet"
          subtitle="Upload a zipped codebase to generate architecture, security and health reports."
          action={
            <button
              onClick={() => navigate("/upload")}
              className="mt-4 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-ink font-semibold text-sm"
            >
              Upload a repository
            </button>
          }
        />
      </div>
    );
  }

  if (loading) return <Loader label="Loading dashboard" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const project = data?.project;
  if (!project) return <ErrorState message="Project data unavailable." onRetry={refetch} />;

  const stats = project.scanResult || {};
  const analysis = project.analysis || {};
  const techStack = project.techStack || {};
  const health = project.repositoryHealth || {};
  const security = project.securityReport || {};
  const missing = project.missingFeatures?.missing || [];

  const cards = [
    {
      title: "Health Score",
      value: health.healthScore != null ? `${health.healthScore}%` : "—",
      icon: <FiActivity size={22} />,
      accent: "cyan",
    },
    {
      title: "Security Grade",
      value: security.grade || health.grade || "—",
      icon: <FiShield size={22} />,
      accent: "rose",
    },
    {
      title: "Architecture",
      value: analysis.framework || "Unknown",
      icon: <FiCpu size={22} />,
      accent: "violet",
    },
    {
      title: "Routes",
      value: project.routes?.length ?? 0,
      icon: <FiGitBranch size={22} />,
      accent: "emerald",
    },
    {
      title: "Database",
      value: techStack.database?.[0] || analysis.database?.[0] || "—",
      icon: <FiDatabase size={22} />,
      accent: "amber",
    },
    {
      title: "Total Files",
      value: stats.totalFiles ?? 0,
      icon: <FiCode size={22} />,
      accent: "cyan",
    },
  ];

  const flowSteps = ["Frontend", "Routes", "Controllers", "Services", "Database"];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Overview"
        title={activeProjectName || project.projectName || "Repository Intelligence"}
        subtitle="AI-powered codebase analysis platform."
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <StatCard key={c.title} {...c} delay={i * 0.06} />
        ))}
      </div>

      <Panel className="p-8">
        <h2 className="text-xl font-display font-semibold mb-7">Architecture Flow</h2>
        <div className="flex flex-wrap items-center gap-3">
          {flowSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/15 to-violet-500/15 border border-cyan-500/20 font-medium text-sm text-cyan-200">
                {step}
              </div>
              {i < flowSteps.length - 1 && <span className="text-slate-500">→</span>}
            </div>
          ))}
        </div>
        {analysis.confidence && (
          <p className="text-xs text-slate-500 mt-5">
            Detected as <span className="text-slate-300">{analysis.architecture || analysis.framework}</span>{" "}
            with {analysis.confidence} confidence.
          </p>
        )}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
          <div className="flex gap-2 flex-wrap">
            {[
              ...(techStack.frontend || analysis.frontend || []),
              ...(techStack.backend || analysis.backend || []),
              ...(techStack.database || analysis.database || []),
              ...(techStack.languages || analysis.languages || []),
            ].length === 0 ? (
              <p className="text-sm text-slate-500">No stack detected.</p>
            ) : (
              [
                ...new Set([
                  ...(techStack.frontend || analysis.frontend || []),
                  ...(techStack.backend || analysis.backend || []),
                  ...(techStack.database || analysis.database || []),
                  ...(techStack.languages || analysis.languages || []),
                ]),
              ].map((t) => (
                <Badge key={t} tone="cyan">
                  {t}
                </Badge>
              ))
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Missing Features</h3>
          {missing.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing flagged.</p>
          ) : (
            <ul className="space-y-2.5">
              {missing.slice(0, 6).map((m) => (
                <li key={m} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
