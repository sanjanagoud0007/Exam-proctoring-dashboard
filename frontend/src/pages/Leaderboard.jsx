import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import { getRiskColor } from "../utils/cheatingScores";

const Leaderboard = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    API.get("/leaderboard").then(({ data }) => setRows(data));
  }, []);

  return (
    <AppLayout title="Leaderboard">
      <PageHeader title={t("leaderboard")} subtitle="Top performers by score" />
      <GlassCard className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">Exam</th>
                <th className="p-4">Score</th>
                <th className="p-4">Time</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.rank}-${r.studentEmail}`} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-indigo-500">#{r.rank}</td>
                  <td className="p-4">{r.studentName}</td>
                  <td className="p-4">{r.examTitle}</td>
                  <td className="p-4">
                    {r.score}/{r.maxScore}
                  </td>
                  <td className="p-4">{r.durationSeconds ?? "—"}s</td>
                  <td className={`p-4 ${getRiskColor(r.riskLevel)}`}>
                    {r.riskLevel}
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </GlassCard>
    </AppLayout>
  );
};

export default Leaderboard;
