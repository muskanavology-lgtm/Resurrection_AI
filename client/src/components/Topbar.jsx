import { useLocation } from "react-router-dom";

const titles = {
  "/dashboard": "Overview",
  "/upload": "Upload Repository",
  "/architecture": "Architecture",
  "/security": "Security Report",
  "/health": "Repository Health",
  "/chat": "AI Chat",
  "/search": "Repository Search",
  "/graph": "Knowledge Graph",
  "/impact": "Feature Impact Simulator",
  "/readme": "README Generator",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Resurrection AI";

  return (
    <header className="h-16 border-b border-line bg-black/20 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-200">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="mono text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
          v2.4
        </span>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500" />
      </div>
    </header>
  );
}
