import { useNavigate } from "react-router-dom";

const ExamCard = ({ exam }) => {
  const navigate = useNavigate();

  const startExamHandler = () => {
    navigate(`/exam/${exam._id}`);
  };

  return (
    <div className="group overflow-hidden rounded-[28px] bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{exam.title}</h2>
          <p className="text-sm text-slate-500">Created by {exam.createdBy ? exam.createdBy.name || "Admin" : "Admin"}</p>
        </div>
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          {exam.questions?.length || 0} Qs
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Duration</span>
          <span>{exam.duration} min</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Questions</span>
          <span>{exam.questions?.length || 0}</span>
        </div>
      </div>

      <button
        onClick={startExamHandler}
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700"
      >
        Start Exam
      </button>
    </div>
  );
};

export default ExamCard;