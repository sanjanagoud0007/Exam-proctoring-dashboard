import { useContext, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import ResultCard from "../components/ResultCard";
import { AuthContext } from "../context/AuthContext";
import { downloadScorecardPdf } from "../utils/pdfReport";

const Result = () => {
  const { user } = useContext(AuthContext);
  const isTeacher =
    user?.role === "admin" || user?.role === "proctor";

  const [loading, setLoading] = useState(true);
  const [myAttempts, setMyAttempts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [examFilter, setExamFilter] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) setLoading(true);
    });

    const load = async () => {
      try {
        if (isTeacher) {
          const params = examFilter ? { examId: examFilter } : {};
          const { data } = await API.get("/attempts/analytics", {
            params,
          });
          if (active) setAnalytics(data);
        } else {
          const { data } = await API.get("/attempts");
          if (active) setMyAttempts(data);
        }
      } catch (error) {
        console.log(error);
      }
      if (active) setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [isTeacher, examFilter]);

  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (!isTeacher) {
    return (
      <AppLayout title="Results">
        <PageHeader title="My results" subtitle="Scores and integrity reports" />
        <div>
          {myAttempts.length === 0 ? (
            <p className="text-slate-400">No submitted exams yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myAttempts.map((attempt) => (
                <ResultCard key={attempt._id} attempt={attempt} />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  const { summary, attempts, violationLogs, examSummaries } =
    analytics || {};

  return (
    <AppLayout title="Analytics">
      <PageHeader
        title="Results & analytics"
        subtitle="Exam scores and proctoring violations"
      />

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard label="Submissions" value={summary?.totalAttempts ?? 0} />
        <StatCard label="Avg score" value={summary?.averageScore ?? 0} />
        <StatCard label="Violations" value={summary?.totalViolations ?? 0} />
      </div>

        {examSummaries?.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <GlassCard className="h-72">
              <h2 className="font-semibold mb-4">Average scores by exam</h2>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={examSummaries}>
                  <XAxis dataKey="title" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#22d3ee" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            <GlassCard className="h-72">
              <h2 className="font-semibold mb-4">Violation trend</h2>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={(violationLogs || []).slice(0, 20).map((v, i) => ({
                    i,
                    score: v.score || 10,
                  }))}
                >
                  <XAxis dataKey="i" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#fbbf24" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        )}

        {examSummaries?.length > 0 && (
          <GlassCard className="mb-8">
            <h2 className="font-semibold mb-4">Per-exam averages</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="py-2 pr-4">Exam</th>
                    <th className="py-2 pr-4">Attempts</th>
                    <th className="py-2 pr-4">Avg score</th>
                    <th className="py-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {examSummaries.map((row) => (
                    <tr
                      key={row.examId}
                      className="border-b border-slate-800"
                    >
                      <td className="py-3 pr-4">{row.title}</td>
                      <td className="py-3 pr-4">{row.attempts}</td>
                      <td className="py-3 pr-4">{row.averageScore}</td>
                      <td className="py-3">{row.maxScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">
            Filter by exam ID (optional)
          </label>
          <input
            type="text"
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            placeholder="Paste exam MongoDB id"
            className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-700 px-4 py-2"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <GlassCard>
            <h2 className="font-semibold mb-4">Student submissions</h2>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {(attempts || []).length === 0 ? (
                <p className="text-slate-500">No attempts yet.</p>
              ) : (
                attempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="rounded-xl bg-slate-900/60 p-4 border border-slate-700"
                  >
                    <p className="font-medium">
                      {attempt.studentId?.name || "Student"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {attempt.examId?.title} — Score {attempt.score}/
                      {attempt.examId?.questions?.length ?? "?"} —{" "}
                      {attempt.riskLevel}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs text-cyan-400 underline"
                      onClick={() =>
                        downloadScorecardPdf({
                          studentName: attempt.studentId?.name,
                          examTitle: attempt.examId?.title,
                          score: attempt.score,
                          maxScore: attempt.examId?.questions?.length,
                          riskLevel: attempt.riskLevel,
                          cheatingScore: attempt.cheatingScore,
                        })
                      }
                    >
                      Download PDF report
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-semibold mb-4">Recent violations</h2>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {(violationLogs || []).length === 0 ? (
                <p className="text-slate-500">No violations logged.</p>
              ) : (
                violationLogs.map((log) => (
                  <div
                    key={log._id}
                    className="rounded-xl bg-slate-900/60 p-4 border border-slate-700"
                  >
                    <span className="text-xs font-semibold text-amber-400">
                      {log.eventType}
                    </span>
                    <p className="text-sm mt-1">
                      {log.studentId?.name} — {log.description}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
    </AppLayout>
  );
};

export default Result;
