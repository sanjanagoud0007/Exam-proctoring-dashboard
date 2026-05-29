const shuffleArray = (arr, seed) => {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const buildStudentExam = (exam, studentId) => {
  const seed =
    String(studentId) +
    String(exam._id) +
    String(exam.createdAt || "");

  const indices = exam.questions.map((_, i) => i);
  const questionOrder = shuffleArray(indices, seed.charCodeAt(0) || 42);

  const questions = questionOrder.map((qi) => {
    const q = exam.questions[qi];
    const options = shuffleArray(q.options, seed.charCodeAt(1) + qi);
    const { correctAnswer, ...safe } = q.toObject?.() || q;
    return { ...safe, options, _originalIndex: qi };
  });

  return {
    _id: exam._id,
    title: exam.title,
    duration: exam.duration,
    status: exam.status,
    questions,
    questionOrder,
  };
};
