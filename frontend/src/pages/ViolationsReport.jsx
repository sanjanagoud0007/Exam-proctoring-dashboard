import { useEffect, useState, useMemo } from "react";
import { FiAlertTriangle, FiFilter } from "react-icons/fi";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import SearchBar from "../components/ui/SearchBar";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { VIOLATION_SCORES } from "../utils/cheatingScores";

const typeVariant = (t) => {
  if (t?.includes("FACE") || t === "NO_FACE") return "danger";
  if (t?.includes("TAB") || t === "WINDOW_BLUR") return "warning";
  if (t?.includes("PHONE")) return "danger";
  return "neutral";
};

const ViolationsReport = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    API.get("/proctor")
      .then(({ data }) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(
    () => [...new Set(logs.map((l) => l.eventType).filter(Boolean))],
    [logs]
  );

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.description?.toLowerCase().includes(q) ||
      l.eventType?.toLowerCase().includes(q) ||
      l.studentId?.name?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || l.eventType === filter;
    return matchSearch && matchFilter;
  });

  return (
    <AppLayout title="Violations">
      <PageHeader
        title="Violations report"
        subtitle="Integrity events across all monitored sessions"
      />

      <GlassCard className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search violations…"
          />
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-2.5 text-sm"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FiAlertTriangle}
          title="No violations logged"
          description="Events appear when students trigger integrity rules during exams."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((log, i) => (
            <GlassCard key={log._id || i} hover={false} delay={i * 0.02}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge variant={typeVariant(log.eventType)}>
                    {log.eventType}
                  </Badge>
                  <p className="mt-2 text-slate-800 dark:text-slate-100">
                    {log.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Student: {log.studentId?.name || log.studentId || "—"} ·
                    Exam: {log.examId?.title || log.examId || "—"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-amber-500">
                    +{log.score || VIOLATION_SCORES[log.eventType] || 5} pts
                  </p>
                  <p className="text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default ViolationsReport;
