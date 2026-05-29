import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useTranslation } from "react-i18next";

import API from "../services/api";
import { getApiErrorMessage } from "../utils/apiError";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import WebcamMonitor from "../components/WebcamMonitor";
import Timer from "../components/Timer";
import WarningModal from "../components/WarningModal";
import ExamChat from "../components/ExamChat";
import { setupProctoring, MAX_VIOLATIONS } from "../utils/proctoring";
import { setupBrowserLockdown } from "../utils/browserLockdown";
import { setupVoiceDetection } from "../utils/voiceDetection";
import { startScreenRecording } from "../utils/screenRecorder";
import { VIOLATION_SCORES, getRiskLevel } from "../utils/cheatingScores";

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [cheatingScore, setCheatingScore] = useState(0);
  const [questionStartedAt, setQuestionStartedAt] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [markedForReview, setMarkedForReview] = useState({});
  const { toast } = useToast();

  const submittedRef = useRef(false);
  const proctorRef = useRef(null);
  const socketRef = useRef(null);
  const handleViolationRef = useRef(null);
  const examStartRef = useRef(Date.now());
  const recorderRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: examData }, { data: draft }] = await Promise.all([
          API.get(`/exams/${id}/take`),
          API.get(`/exams/${id}/draft`),
        ]);
        setExam(examData);
        if (draft?.answers?.length) {
          setAnswers(draft.answers);
        } else {
          setAnswers(new Array(examData.questions.length).fill(""));
        }
        await API.post("/sessions/start", { examId: id });
        socketRef.current?.emit("sessionStarted", {
          studentId: user?._id,
          examId: id,
          studentName: user?.name,
        });
      } catch (error) {
        toast(
          getApiErrorMessage(error, "Could not load exam"),
          "error"
        );
      }
      setLoading(false);
    };
    load();
  }, [id, navigate, user?._id, user?.name]);

  const broadcastViolation = useCallback(
    async (type, message) => {
      setCheatingScore((s) => s + (VIOLATION_SCORES[type] || 5));
      const payload = {
        type,
        message,
        studentName: user?.name,
        studentId: user?._id,
        examId: id,
        timestamp: Date.now(),
        score: VIOLATION_SCORES[type] || 5,
      };
      socketRef.current?.emit("proctorEvent", payload);
      try {
        await API.post("/proctor", {
          studentId: user?._id,
          examId: id,
          eventType: type,
          description: message,
        });
      } catch (error) {
        console.log(error);
      }
    },
    [id, user?._id, user?.name]
  );

  const submitExam = useCallback(
    async (reason = "manual") => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitted(true);
      recorderRef.current?.stop();

      const durationSeconds = Math.floor(
        (Date.now() - examStartRef.current) / 1000
      );

      try {
        const { data } = await API.post("/exams/submit", {
          examId: id,
          answers,
          endTime: new Date().toISOString(),
          submitReason: reason,
          questionOrder: exam?.questionOrder,
          timePerQuestion: questionStartedAt,
          durationSeconds,
          attendanceVerified: true,
        });

        await API.post("/sessions/end", { examId: id });
        socketRef.current?.emit("sessionEnded", {
          studentId: user?._id,
          examId: id,
        });

        toast(
          `Submitted · Score ${data.score}/${data.maxScore || "?"} · ${data.riskLevel}`,
          "success"
        );
        navigate("/results");
      } catch (error) {
        submittedRef.current = false;
        setSubmitted(false);
        toast(getApiErrorMessage(error, "Submit failed"), "error");
      }
    },
    [id, answers, exam?.questionOrder, questionStartedAt, navigate, user]
  );

  const handleViolation = useCallback(
    (payload) => {
      setViolationCount(payload.count);
      setWarningMessage(payload.message);
      setWarningOpen(true);
      broadcastViolation(payload.type, payload.message);
      if (payload.count >= MAX_VIOLATIONS) {
        setTimeout(() => submitExam("violations"), 2500);
      }
    },
    [broadcastViolation, submitExam]
  );

  handleViolationRef.current = handleViolation;

  useEffect(() => {
    if (!exam || submitted) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socketRef.current = io(socketUrl);

    proctorRef.current = setupProctoring({
      onViolation: (p) => handleViolationRef.current?.(p),
      onMaxViolations: (p) => handleViolationRef.current?.(p),
    });

    const lockdownCleanup = setupBrowserLockdown({
      onViolation: (type) =>
        proctorRef.current?.reportViolation(type),
    });

    const voiceCleanup = setupVoiceDetection({
      onVoiceDetected: () => proctorRef.current?.reportVoice(),
    });

    const detectVpn = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return;
        const data = await res.json();
        const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (data.timezone && systemTimezone !== data.timezone) {
          proctorRef.current?.reportVpnProxy();
        }
      } catch (err) {
        console.warn("VPN/Proxy detection check failed:", err);
      }
    };

    detectVpn();
    const vpnInterval = setInterval(detectVpn, 60000);

    startScreenRecording({
      onChunk: async (chunk) => {
        try {
          await API.post("/recordings/chunk", {
            examId: id,
            chunk,
            mimeType: "video/webm",
          });
        } catch (e) {
          console.warn(e);
        }
      },
    }).then((r) => {
      recorderRef.current = r;
    }).catch(() => {});

    const autosave = setInterval(async () => {
      try {
        await API.post(`/exams/${id}/autosave`, {
          answers,
          questionOrder: exam.questionOrder,
          timePerQuestion: questionStartedAt,
          startedAt: examStartRef.current,
        });
        localStorage.setItem(
          `exam_draft_${id}`,
          JSON.stringify({ answers, questionStartedAt })
        );
      } catch (e) {
        console.warn(e);
      }
    }, 8000);

    return () => {
      proctorRef.current?.cleanup();
      lockdownCleanup();
      voiceCleanup();
      clearInterval(vpnInterval);
      recorderRef.current?.stop();
      clearInterval(autosave);
      socketRef.current?.disconnect();
    };
  }, [exam, submitted, answers, questionStartedAt, id]);

  const changeAnswerHandler = (questionIndex, answer) => {
    const updated = [...answers];
    updated[questionIndex] = answer;
    setAnswers(updated);
    setQuestionStartedAt((prev) => ({
      ...prev,
      [questionIndex]:
        prev[questionIndex] ||
        Math.floor((Date.now() - examStartRef.current) / 1000),
    }));
  };

  const report = (fn) => () => proctorRef.current?.[fn]?.();

  if (loading) {
    return <h1 className="text-center mt-10 text-2xl dark:text-white">Loading…</h1>;
  }

  if (!exam) {
    return <h1 className="text-center mt-10 text-red-600">Exam not found</h1>;
  }

  return (
    <div className="min-h-screen mesh-bg bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <div className="sticky top-0 z-50 border-b border-slate-800/80 glass px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-400">
            Secure exam mode
          </p>
          <h1 className="font-bold text-lg">{exam.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-amber-400">
            {getRiskLevel(cheatingScore)} · {cheatingScore} pts
          </span>
          <Timer
            duration={exam.duration}
            disabled={submitted}
            onExpire={() => submitExam("timeout")}
          />
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
      <WarningModal
        open={warningOpen}
        message={warningMessage}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
        onContinue={() => {
          setWarningOpen(false);
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
      />

      <div className="flex flex-wrap gap-6 mb-6">
        <WebcamMonitor
          disabled={submitted}
          onStreamLost={report("reportWebcamOff")}
          onNoFace={report("reportNoFace")}
          onMultipleFaces={report("reportMultipleFaces")}
          onLookingAway={report("reportLookingAway")}
          onMobilePhone={report("reportMobilePhone")}
          onSuspiciousMovement={report("reportSuspiciousMovement")}
          onVirtualCamera={report("reportVirtualCamera")}
          onFrameCapture={(frame) => {
            socketRef.current?.emit("webcamFrame", {
              studentId: user?._id,
              examId: id,
              studentName: user?.name,
              frame,
            });
          }}
        />
        <div className="flex-1 min-w-[240px]">
          <ExamChat examId={id} socket={socketRef.current} user={user} />
        </div>
      </div>

      {exam.instructions && (
        <p className="mb-6 text-sm text-slate-400 glass rounded-xl p-4">
          {exam.instructions}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {exam.questions.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveQuestion(index)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold border ${
              activeQuestion === index
                ? "border-indigo-500 bg-indigo-500/20"
                : "border-slate-700"
            } ${answers[index] ? "text-emerald-400" : ""} ${
              markedForReview[index] ? "ring-1 ring-amber-400" : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {exam.questions[activeQuestion] && (
        <div className="glass rounded-2xl p-6 ring-2 ring-indigo-500/40">
          {(() => {
            const q = exam.questions[activeQuestion];
            const index = activeQuestion;
            return (
              <>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="text-xl font-semibold">
                    Q{index + 1}. {q.question}
                  </h2>
                  <span className="text-xs uppercase text-slate-500">
                    {q.type || "mcq"}
                  </span>
                </div>

                {q.type === "descriptive" || q.type === "coding" ? (
                  <textarea
                    rows={q.type === "coding" ? 12 : 6}
                    value={answers[index] || ""}
                    disabled={submitted}
                    onChange={(e) =>
                      changeAnswerHandler(index, e.target.value)
                    }
                    className="w-full rounded-xl bg-slate-900 border border-slate-600 p-4 font-mono text-sm"
                    placeholder={
                      q.type === "coding"
                        ? "// Write your solution here"
                        : "Type your answer…"
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {(q.options || []).map((option, oi) => (
                      <label
                        key={oi}
                        className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 cursor-pointer hover:border-indigo-500/50"
                      >
                        <input
                          type="radio"
                          name={`q-${index}`}
                          checked={answers[index] === option}
                          disabled={submitted}
                          onChange={() =>
                            changeAnswerHandler(index, option)
                          }
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={activeQuestion <= 0}
                    onClick={() => setActiveQuestion((i) => i - 1)}
                    className="rounded-xl border border-slate-600 px-4 py-2 text-sm"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setMarkedForReview((m) => ({
                        ...m,
                        [index]: !m[index],
                      }))
                    }
                    className="rounded-xl border border-amber-500/50 px-4 py-2 text-sm text-amber-400"
                  >
                    {markedForReview[index] ? "Unmark review" : "Mark for review"}
                  </button>
                  <button
                    type="button"
                    disabled={activeQuestion >= exam.questions.length - 1}
                    onClick={() => setActiveQuestion((i) => i + 1)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm"
                  >
                    Next
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <button
        type="button"
        onClick={() => submitExam("manual")}
        disabled={submitted}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 py-4 text-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
      >
        {submitted ? "Submitting…" : t("submitExam")}
      </button>
      </div>
    </div>
  );
};

export default ExamPage;
