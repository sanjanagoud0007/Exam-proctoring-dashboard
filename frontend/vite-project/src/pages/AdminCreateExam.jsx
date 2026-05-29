import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
import { Plus, Trash2, Sparkles, Save } from "lucide-react";
import API from "../services/api";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import StudentMultiSelect from "../components/StudentMultiSelect";
import { useToast } from "../context/ToastContext";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const AdminCreateExam = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const { toast } = useToast();
  const home = user?.role === "proctor" ? "/proctor" : "/admin";
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    API.get("/auth/profile")
      .then(({ data }) => {
        const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const updated = { ...stored, ...data, token: stored.token };
        localStorage.setItem("userInfo", JSON.stringify(updated));
        setUser(updated);
      })
      .catch(() => {});

    API.get("/users/students")
      .then(({ data }) => setStudents(data))
      .catch(() => setStudents([]));
  }, [setUser]);

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qIndex].options];
      opts[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const addOption = (qIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = {
        ...next[qIndex],
        options: [...next[qIndex].options, ""],
      };
      return next;
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = next[qIndex].options.filter((_, i) => i !== oIndex);
      const correct =
        next[qIndex].correctAnswer === next[qIndex].options[oIndex]
          ? ""
          : next[qIndex].correctAnswer;
      next[qIndex] = { ...next[qIndex], options: opts, correctAnswer: correct };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      setError("Enter a topic for AI generation.");
      return;
    }
    const count = Math.max(1, Math.min(Number(aiCount) || 5, 20));
    setAiLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await API.post("/ai/generate-questions", {
        topic: aiTopic.trim(),
        count,
        difficulty: aiDifficulty,
      });

      const raw = data.questions;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.questions)
          ? raw.questions
          : [];

      const generated = list.map((q) => {
        const options = (q.options || [])
          .map((o) => String(o).trim())
          .filter(Boolean);
        const opts =
          options.length >= 2
            ? options
            : ["Option A", "Option B", "Option C", "Option D"];
        const correct =
          String(q.correctAnswer || "").trim() ||
          opts[0];
        return {
          question: String(q.question || "").trim(),
          options: opts,
          correctAnswer: opts.includes(correct) ? correct : opts[0],
        };
      });

      if (!generated.length) {
        setError("No questions returned. Try again or check backend logs.");
        toast("AI returned no questions", "error");
        return;
      }

      setQuestions(generated);
      const hint = data.message ? ` ${data.message}` : "";
      setMessage(
        `Loaded ${generated.length} questions (${data.source || "ai"}).${hint}`
      );
      toast(`Generated ${generated.length} questions`, "success");
    } catch (err) {
      const msg = getApiErrorMessage(err, "AI generation failed");
      setError(msg);
      toast(msg, "error");
    }
    setAiLoading(false);
  };

  const validate = () => {
    if (!title.trim()) return "Exam title is required.";
    if (duration < 1) return "Duration must be at least 1 minute.";
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required.`;
      const filled = q.options.map((o) => o.trim()).filter(Boolean);
      if (filled.length < 2) {
        return `Question ${i + 1} needs at least 2 options.`;
      }
      if (!q.correctAnswer.trim()) {
        return `Question ${i + 1}: select the correct answer.`;
      }
      if (!filled.includes(q.correctAnswer.trim())) {
        return `Question ${i + 1}: correct answer must match an option.`;
      }
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        duration: Number(duration),
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctAnswer: q.correctAnswer.trim(),
        })),
      };

      const { data } = await API.post("/exams", payload);

      if (selectedStudents.length > 0) {
        await API.post("/exams/assign", {
          examId: data._id,
          studentIds: selectedStudents,
        });
        toast(
          `Assigned to ${selectedStudents.length} student(s)`,
          "success"
        );
      } else {
        toast("Exam created", "success");
      }

      setTimeout(() => navigate(home), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create exam"));
    }
    setLoading(false);
  };

  return (
    <AppLayout title="Create exam">
      <PageHeader
        title="Create exam"
        subtitle="Build manually or generate MCQs with AI"
        action={
          <button
            type="button"
            onClick={() => navigate(home)}
            className="text-sm text-indigo-500 hover:underline"
          >
            ← Back
          </button>
        }
      />
      <div className="max-w-4xl">

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-red-200 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-3 text-emerald-200 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <section className="rounded-2xl border border-slate-700 bg-white/10 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-cyan-400 mb-4">
              Exam details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 px-4 py-3"
                  placeholder="e.g. JavaScript Fundamentals"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-600 px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6">
            <h2 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              AI question generator
            </h2>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="md:col-span-2 rounded-xl bg-slate-900 border border-slate-600 px-4 py-2"
                placeholder="Topic (e.g. React Hooks)"
              />
              <input
                type="number"
                min={1}
                max={20}
                value={aiCount}
                onChange={(e) => setAiCount(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-600 px-4 py-2"
                placeholder="Count"
              />
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-600 px-4 py-2"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button
              type="button"
              disabled={aiLoading}
              onClick={generateWithAI}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-2 font-medium hover:bg-violet-500 disabled:opacity-50"
            >
              {aiLoading ? "Generating…" : "Generate & fill questions"}
            </button>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-cyan-400">
                Questions ({questions.length})
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500"
              >
                <Plus size={18} />
                Add question
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-400">
                    Q{qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-400 hover:text-red-300"
                      aria-label="Remove question"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                  rows={2}
                  className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-3 mb-4"
                  placeholder="Question text"
                />

                <p className="text-xs text-slate-500 mb-2">Options</p>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex gap-2 mb-2">
                    <input
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-slate-500 hover:text-red-400 px-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qIndex)}
                  className="text-xs text-cyan-400 hover:underline mb-4"
                >
                  + Add option
                </button>

                <label className="block text-xs text-slate-500 mb-1">
                  Correct answer
                </label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    updateQuestion(qIndex, "correctAnswer", e.target.value)
                  }
                  className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                >
                  <option value="">Select correct option</option>
                  {q.options
                    .map((o) => o.trim())
                    .filter(Boolean)
                    .map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-700 bg-white/10 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-cyan-400 mb-2">
              Assign to students (optional)
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Check each student who should receive this exam. Use Select all or
              search to pick many at once.
            </p>
            <StudentMultiSelect
              students={students}
              selectedIds={selectedStudents}
              onChange={setSelectedStudents}
              emptyMessage="No students found. Approve student accounts first, or assign later from the Proctor dashboard."
            />
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-lg font-semibold hover:bg-green-500 disabled:opacity-50"
          >
            <Save size={22} />
            {loading
              ? "Publishing…"
              : selectedStudents.length
                ? "Publish & assign exam"
                : "Publish exam"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default AdminCreateExam;
