import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-ink text-white relative">
      <div className="fixed inset-0 bg-grid-glow pointer-events-none" />
      <Sidebar />
      <main className="flex-1 min-w-0 relative z-[1]">
        <Topbar />
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
