import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

export const StatCard = ({ label, value, icon: Icon, trend, delay = 0 }) => (
  <GlassCard delay={delay} className="relative overflow-hidden">
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <motion.p
          className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value}
        </motion.p>
        {trend && (
          <p className="mt-1 text-xs text-emerald-500">{trend}</p>
        )}
      </div>
      {Icon && (
        <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500 dark:text-indigo-400">
          <Icon size={22} />
        </div>
      )}
    </div>
  </GlassCard>
);

export default StatCard;
