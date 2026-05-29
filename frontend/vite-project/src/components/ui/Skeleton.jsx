export const Skeleton = ({ className = "h-4 w-full" }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
  />
);

export const SkeletonCard = () => (
  <div className="rounded-2xl glass-light p-6 space-y-4">
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-10 w-full rounded-xl" />
  </div>
);

export default Skeleton;
