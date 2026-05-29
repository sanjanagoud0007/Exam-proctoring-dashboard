import { motion } from "framer-motion";

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 px-6 text-center"
  >
    {Icon && (
      <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-indigo-500">
        <Icon size={32} />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
      {title}
    </h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export default EmptyState;
