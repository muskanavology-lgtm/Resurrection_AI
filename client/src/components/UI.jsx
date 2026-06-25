import { forwardRef } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiInbox } from "react-icons/fi";

export const Panel = forwardRef(function Panel({ children, className = "", ...props }, ref) {
  return (
    <div ref={ref} className={`glass rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
});

export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
      <div>
        {eyebrow && (
          <p className="mono text-xs uppercase tracking-[0.2em] text-cyan-400/80 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-slate-400 mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

export function Loader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-transparent animate-spin" />
      </div>
      <p className="mono text-xs uppercase tracking-[0.15em]">{label}…</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <Panel className="p-10 flex flex-col items-center text-center gap-3">
      <FiAlertTriangle className="text-rose-400" size={28} />
      <p className="text-slate-300 font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10 transition-colors"
        >
          Try again
        </button>
      )}
    </Panel>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  const Icon = icon || FiInbox;
  return (
    <Panel className="p-14 flex flex-col items-center text-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 mb-2">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-slate-400 max-w-sm">{subtitle}</p>}
      {action}
    </Panel>
  );
}

export function StatCard({ title, value, icon, accent = "cyan", delay = 0 }) {
  const accents = {
    cyan: "from-cyan-500 to-cyan-400",
    violet: "from-violet-500 to-violet-400",
    amber: "from-amber-400 to-amber-300",
    rose: "from-rose-500 to-rose-400",
    emerald: "from-emerald-500 to-emerald-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-6 hover:border-cyan-400/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h2 className="text-3xl font-display font-semibold mt-2 text-white truncate">
            {value}
          </h2>
        </div>
        <div
          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center text-ink shrink-0 shadow-glow`}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-white/5 text-slate-300 border-white/10",
    critical: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    high: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    medium: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    low: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    good: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${tones[tone] || tones.default}`}
    >
      {children}
    </span>
  );
}

export function severityTone(sev = "") {
  const s = sev.toLowerCase();
  if (s === "critical") return "critical";
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  if (s === "low") return "low";
  return "default";
}

export function ProgressRing({ value = 0, size = 96, stroke = 8, label, color = "#22d3ee" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-display font-bold text-white">{Math.round(clamped)}</span>
        {label && <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>}
      </div>
    </div>
  );
}

export function Bar({ value = 0, max = 100, color = "bg-cyan-400" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}
