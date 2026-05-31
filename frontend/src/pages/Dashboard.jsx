import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiCamera,
} from "react-icons/fi";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: examData }, { data: attempts }] = await Promise.all([
          API.get("/exams/student"),
          API.get("/attempts"),
        ]);
        setExams(examData);
        setActivity(attempts.slice(0, 5));
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const upcoming = exams.filter((e) => e.status !== "completed").length;
  const completed = exams.filter((e) => e.status === "completed").length;

  return (
    <AppLayout title="Student dashboard">
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "Student"}`}
        subtitle="Your assigned exams and integrity status"
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              label="Assigned"
              value={exams.length}
              icon={FiBookOpen}
              delay={0}
            />
            <StatCard
              label="Upcoming"
              value={upcoming}
              icon={FiClock}
              delay={0.05}
            />
            <StatCard
              label="Completed"
              value={completed}
              icon={FiCheckCircle}
              delay={0.1}
            />
            <StatCard
              label="Submissions"
              value={activity.length}
              icon={FiActivity}
              delay={0.15}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Your exams
              </h2>
              {exams.length === 0 ? (
                <EmptyState
                  icon={FiBookOpen}
                  title="No exams assigned"
                  description="Contact your proctor when an exam is published."
                />
              ) : (
                exams.map((exam, i) => (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {exam.title}
                          </h3>
                          <Badge variant={exam.status === "active" ? "live" : "info"}>
                            {exam.status || "upcoming"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {exam.duration} min · {exam.questions?.length || 0}{" "}
                          questions
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Webcam + fullscreen required. Allowed 3 warnings. 4th violation =
                          auto-submit.
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/exam/${exam._id}`)}
                      >
                        Start exam
                      </Button>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </div>

            <div className="space-y-6">
              <GlassCard>
                <div className="flex items-center gap-3 mb-4">
                  <FiCamera className="text-cyan-500" size={22} />
                  <h3 className="font-semibold">Before you start</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li>• Optional profile photo</li>
                  <li>• Allow camera & screen share</li>
                  <li>• Stable internet connection</li>
                  <li>• Quiet, well-lit room</li>
                </ul>
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => navigate("/profile")}
                >
                  Update profile
                </Button>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold mb-4">Recent activity</h3>
                {activity.length === 0 ? (
                  <p className="text-sm text-slate-500">No submissions yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((a) => (
                      <li
                        key={a._id}
                        className="text-sm border-l-2 border-indigo-500 pl-3"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {a.examId?.title}
                        </span>
                        <p className="text-slate-500">
                          Score {a.score} · {a.riskLevel}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </GlassCard>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
