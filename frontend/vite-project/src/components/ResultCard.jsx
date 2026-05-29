const ResultCard = ({ attempt }) => {
  const exam = attempt.examId;
  const maxScore = exam?.questions?.length ?? "—";

  return (
    <div className="rounded-2xl border border-slate-700 bg-white/10 p-5 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-cyan-400">
        {exam?.title || "Exam"}
      </h3>
      <p className="mt-2 text-slate-300">
        Score:{" "}
        <span className="font-bold text-white">
          {attempt.score} / {maxScore}
        </span>
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Submitted:{" "}
        {new Date(attempt.endTime || attempt.updatedAt).toLocaleString()}
      </p>
    </div>
  );
};

export default ResultCard;
