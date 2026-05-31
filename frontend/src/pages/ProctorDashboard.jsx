import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiAlertTriangle, FiVideo, FiActivity, FiPlus } from "react-icons/fi";
import { getApiErrorMessage } from "../utils/apiError";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import StudentMultiSelect from "../components/StudentMultiSelect";

const ProctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [stats, setStats] = useState({
    activeStudents: 0,
    warnings: 0,
    examsRunning: 0,
    suspiciousActivities: 0,
  });
  const [liveFrames, setLiveFrames] = useState({});

  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl);
    socket.on("connect", () => socket.emit("joinProctorRoom"));
    socket.on("proctorEvent", (data) => {
      setEvents((prev) => [data, ...prev].slice(0, 40));
      setStats((s) => ({
        ...s,
        warnings: s.warnings + 1,
        suspiciousActivities: s.suspiciousActivities + 1,
      }));
    });
    socket.on("dashboardStats", (data) => {
      setStats(data);
    });
    socket.on("webcamFrame", (data) => {
      if (data.studentId && data.frame) {
        setLiveFrames((prev) => ({
          ...prev,
          [data.studentId]: data,
        }));
      }
    });
    Promise.all([
      API.get("/users/students"),
      API.get("/exams"),
    ]).then(([s, e]) => {
      setStudents(s.data);
      setExams(e.data);
    });
    return () => socket.disconnect();
  }, []);

  const handleExamChange = (examId) => {
    setSelectedExam(examId);
    if (!examId) {
      setSelectedStudents([]);
      return;
    }
    const exam = exams.find((e) => e._id === examId);
    if (exam?.assignedStudents?.length) {
      setSelectedStudents(
        exam.assignedStudents.map((s) => String(s._id || s))
      );
    } else {
      setSelectedStudents([]);
    }
  };

  const assignExam = async () => {
    if (!selectedExam) {
      toast("Select an exam first", "error");
      return;
    }
    if (selectedStudents.length === 0) {
      toast("Select at least one student", "error");
      return;
    }
    try {
      const { data } = await API.post("/exams/assign", {
        examId: selectedExam,
        studentIds: selectedStudents,
      });
      toast(
        `Exam assigned to ${selectedStudents.length} student(s)`,
        "success"
      );
      if (data?.exam?.assignedStudents) {
        setSelectedStudents(
          data.exam.assignedStudents.map((id) => String(id))
        );
      }
    } catch (err) {
      toast(getApiErrorMessage(err, "Assign failed"), "error");
    }
  };

  return (
    <AppLayout title="Live monitoring">
      <PageHeader
        title={`Proctor hub — ${user?.name}`}
        subtitle="Real-time AI integrity monitoring"
        action={
          <div className="flex gap-2 items-center">
            <Button icon={FiPlus} onClick={() => navigate("/proctor/exams/create")}>
              Create exam
            </Button>
            <Badge variant="live">Live</Badge>
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Students" value={students.length} icon={FiUsers} />
        <StatCard label="Exams" value={exams.length} icon={FiActivity} />
        <StatCard label="Warnings" value={stats.warnings} icon={FiAlertTriangle} />
        <StatCard
          label="Risk score"
          value={stats.suspiciousActivities}
          icon={FiVideo}
        />
      </div>

      <GlassCard className="mb-8">
        <h3 className="font-semibold mb-2">Assign exam to students</h3>
        <p className="text-sm text-slate-500 mb-4">
          Select an exam, then check every student who should receive it.
        </p>
        <label className="block text-sm text-slate-500 mb-1">Exam</label>
        <select
          value={selectedExam}
          onChange={(e) => handleExamChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm mb-4"
        >
          <option value="">Select exam</option>
          {exams.map((e) => (
            <option key={e._id} value={e._id}>
              {e.title}
            </option>
          ))}
        </select>
        <label className="block text-sm text-slate-500 mb-2">
          Students (multiple)
        </label>
        <StudentMultiSelect
          students={students}
          selectedIds={selectedStudents}
          onChange={setSelectedStudents}
          emptyMessage="No students found. Create or approve student accounts first."
        />
        <Button
          onClick={assignExam}
          className="mt-4"
          disabled={!selectedExam || selectedStudents.length === 0}
        >
          Assign to {selectedStudents.length || ""} student
          {selectedStudents.length === 1 ? "" : "s"}
        </Button>
      </GlassCard>

      <h3 className="text-lg font-semibold mb-4">Live webcam grid</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Object.keys(liveFrames).length === 0 ? (
          <p className="text-slate-500 col-span-full text-sm">
            Waiting for student feeds…
          </p>
        ) : (
          Object.entries(liveFrames).map(([id, data]) => (
            <motion.div
              key={id}
              layout
              className="rounded-2xl overflow-hidden glass gradient-border"
            >
              <img
                src={data.frame}
                alt=""
                className="h-36 w-full object-cover"
              />
              <p className="p-2 text-xs font-medium text-cyan-500">
                {data.studentName}
              </p>
            </motion.div>
          ))
        )}
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FiAlertTriangle className="text-amber-500" />
          Live violation feed
        </h3>
        <div className="max-h-[420px] overflow-y-auto space-y-3">
          <AnimatePresence>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No events yet.</p>
            ) : (
              events.map((ev, i) => (
                <motion.div
                  key={ev.timestamp + i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl border border-slate-200/50 dark:border-slate-700 p-4"
                >
                  <Badge variant="warning">{ev.type}</Badge>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    {ev.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ev.studentName} ·{" "}
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
    </AppLayout>
  );
};

export default ProctorDashboard;
