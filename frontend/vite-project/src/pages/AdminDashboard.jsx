import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiUsers, FiFileText, FiAlertTriangle, FiPlus } from "react-icons/fi";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
import { useToast } from "../context/ToastContext";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

const COLORS = ["#6366f1", "#94a3b8"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"
    );
    socket.emit("joinProctorRoom");
    socket.on("proctorEvent", (d) =>
      setEvents((p) => [d, ...p].slice(0, 20))
    );
    API.get("/analytics/admin")
      .then(({ data }) => setAnalytics(data))
      .catch(() => {});
    return () => socket.disconnect();
  }, []);

  const runSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await API.post("/seed");
      toast(data.message || "Database seeded successfully", "success");
      const { data: stats } = await API.get("/analytics/admin");
      setAnalytics(stats);
    } catch (err) {
      toast(getApiErrorMessage(err, "Seed failed"), "error");
    }
    setSeeding(false);
  };

  const heatmap =
    analytics?.violationHeatmap?.map((v) => ({
      name: v._id,
      count: v.count,
    })) || [];

  return (
    <AppLayout title="Admin">
      <PageHeader
        title="Admin command center"
        subtitle="Platform analytics and integrity oversight"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={seeding}
              onClick={runSeed}
            >
              {seeding ? "Seeding…" : "Seed demo data"}
            </Button>
            <Button icon={FiPlus} onClick={() => navigate("/admin/exams/create")}>
              Create exam
            </Button>
          </div>
        }
      />

      {analytics && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard label="Students" value={analytics.totalStudents} icon={FiUsers} />
          <StatCard label="Proctors" value={analytics.totalProctors} icon={FiUsers} />
          <StatCard label="Exams" value={analytics.totalExams} icon={FiFileText} />
          <StatCard
            label="Violations"
            value={analytics.totalViolations}
            icon={FiAlertTriangle}
          />
          <StatCard
            label="Avg score"
            value={analytics.averageScore}
            trend={`${analytics.activeSessions} live`}
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <GlassCard className="h-80">
          <h3 className="font-semibold mb-4">Violation heatmap</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={heatmap}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard className="h-80">
          <h3 className="font-semibold mb-4">Pass / fail ratio</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={[
                  { name: "Pass", value: analytics?.passFailRatio?.pass || 0 },
                  { name: "Fail", value: analytics?.passFailRatio?.fail || 0 },
                ]}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {COLORS.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4">Live events</h3>
        <div className="max-h-48 overflow-y-auto space-y-2 text-sm">
          {events.map((ev, i) => (
            <p key={i} className="text-slate-600 dark:text-slate-300">
              <span className="text-indigo-500 font-medium">{ev.type}</span> —{" "}
              {ev.message}
            </p>
          ))}
        </div>
      </GlassCard>
    </AppLayout>
  );
};

export default AdminDashboard;
