const styles = {
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  danger: "bg-red-500/15 text-red-400 border-red-500/30",
  info: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  neutral: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  live: "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse",
};

export const Badge = ({ children, variant = "neutral", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[variant]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
