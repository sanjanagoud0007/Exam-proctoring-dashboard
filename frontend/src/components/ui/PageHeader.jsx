import { motion } from "framer-motion";

export const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
  >
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

export default PageHeader;
