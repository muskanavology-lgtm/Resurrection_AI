import { useLocation } from "react-router-dom";

const titles = {
  "/dashboard": "Overview",
  "/upload": "Upload Repository",
  "/doc-planner": "Documentation Planner",
  "/architecture": "Architecture",
  "/security": "Security Report",
  "/health": "Repository Health",
  "/chat": "AI Chat",
  "/search": "Repository Search",
  "/graph": "Knowledge Graph",
  "/impact": "Feature Impact Simulator",
  "/code-generator": "Code Generator",
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
       <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center p-[2px] overflow-hidden">
  <div className="w-full h-full rounded-full bg-[#0b0f19] flex items-center justify-center overflow-hidden">
      <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFmwWIkVV6qpZOQkuGKN2jBzNrBeZJoY6_S8hWsfN70A&s=10g"alt="User Logo" className="h-full w-full object-cover"
          />
          </div>
          </div></div>
    </header>
  );
}
