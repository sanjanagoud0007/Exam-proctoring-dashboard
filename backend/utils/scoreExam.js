export const calculateExamScore = (exam, answers, questionOrder) => {
  let score = 0;
  let maxScore = 0;
  let mcqTotal = 0;
  let mcqCorrect = 0;

  const order =
    questionOrder?.length > 0
      ? questionOrder
      : exam.questions.map((_, i) => i);

  order.forEach((originalIndex, displayIndex) => {
    const q = exam.questions[originalIndex];
    if (!q) return;

    const marks = q.marks || 1;
    maxScore += marks;

    if (q.type !== "mcq") return;

    mcqTotal += 1;
    const studentAnswer = answers?.[displayIndex];
    if (studentAnswer && studentAnswer === q.correctAnswer) {
      mcqCorrect += 1;
      score += marks;
    } else if (
      studentAnswer &&
      exam.negativeMarking &&
      q.correctAnswer
    ) {
      score -= exam.negativeMarkValue || 0.25;
    }
  });

  if (score < 0) score = 0;

  return {
    score: Number(score.toFixed(2)),
    maxScore,
    mcqCorrect,
    mcqTotal,
  };
};
