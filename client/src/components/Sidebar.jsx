import {
  FiHome,
  FiUpload,
  FiCpu,
  FiShield,
  FiActivity,
  FiMessageSquare,
  FiSearch,
  FiGitBranch,
  FiFileText,
  FiZap,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useActiveProject } from "../lib/ProjectContext";

const menu = [
  { name: "Dashboard", icon: FiHome, path: "/dashboard", needsProject: false },
  { name: "Upload", icon: FiUpload, path: "/upload", needsProject: false },
  { name: "Architecture", icon: FiCpu, path: "/architecture", needsProject: true },
  { name: "Security", icon: FiShield, path: "/security", needsProject: true },
  { name: "Health", icon: FiActivity, path: "/health", needsProject: true },
  { name: "AI Chat", icon: FiMessageSquare, path: "/chat", needsProject: true },
  { name: "Repository Search", icon: FiSearch, path: "/search", needsProject: true },
  { name: "Knowledge Graph", icon: FiGitBranch, path: "/graph", needsProject: true },
  { name: "Impact Simulator", icon: FiZap, path: "/impact", needsProject: true },
  { name: "README", icon: FiFileText, path: "/readme", needsProject: true },
];

export default function Sidebar() {
  const { activeProjectId, activeProjectName } = useActiveProject();

  return (
    <aside className="w-72 shrink-0 border-r border-line bg-black/30 backdrop-blur-xl flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-7">
        <h1 className="text-2xl font-display font-bold text-gradient tracking-tight">
          Resurrection AI
        </h1>
        <p className="text-slate-500 text-xs mt-1.5 mono uppercase tracking-[0.18em]">
          Repository Intelligence
        </p>
      </div>

      {/* Active project chip */}
      <div className="px-5 mb-2">
        {activeProjectId ? (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-3.5 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-cyan-400/70 mb-0.5">
              Active Repository
            </p>
            <p className="text-sm text-white font-medium truncate">
              {activeProjectName || "Untitled project"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
            <p className="text-xs text-slate-500">No repository loaded</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
        {menu.map((item) => {
          const disabled = item.needsProject && !activeProjectId;
          const Icon = item.icon;
          if (disabled) {
            return (
              <div
                key={item.name}
                title="Upload a repository first"
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-600 cursor-not-allowed select-none"
              >
                <Icon className="text-base" />
                <span className="text-sm">{item.name}</span>
              </div>
            );
          }
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/15 border border-cyan-500/25 text-cyan-300"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Icon className="text-base" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom status card */}
      <div className="p-4">
        <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white">AI Engine</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulseSlow" />
              </span>
              <span className="text-[10px] mono text-emerald-300">online</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Upload a repository and get full architecture, security and AI reasoning instantly.
          </p>
        </div>
      </div>
    </aside>
  );
}
