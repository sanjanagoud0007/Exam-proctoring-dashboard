import { motion } from "framer-motion";
import { SkeletonCard } from "./ui/Skeleton";

const PageLoader = () => (
  <div className="min-h-screen mesh-bg bg-slate-50 dark:bg-slate-950 p-8">
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="mb-8 flex items-center gap-3"
    >
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500" />
      <span className="text-lg font-semibold text-slate-600 dark:text-slate-300">
        Loading ProctorAI…
      </span>
    </motion.div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export default PageLoader;
