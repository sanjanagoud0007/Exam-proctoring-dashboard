import { jsPDF } from "jspdf";

export function downloadScorecardPdf({
  studentName,
  examTitle,
  score,
  maxScore,
  riskLevel,
  cheatingScore,
  violations = [],
}) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Exam Proctoring — Scorecard", 14, 20);
  doc.setFontSize(11);
  doc.text(`Student: ${studentName}`, 14, 32);
  doc.text(`Exam: ${examTitle}`, 14, 40);
  doc.text(`Score: ${score} / ${maxScore}`, 14, 48);
  doc.text(`Integrity score: ${cheatingScore}`, 14, 56);
  doc.text(`Risk level: ${riskLevel}`, 14, 64);
  doc.text("Violations:", 14, 76);
  violations.slice(0, 12).forEach((v, i) => {
    doc.text(`• ${v.eventType || v.type}: ${v.description || ""}`, 14, 86 + i * 8);
  });
  doc.save(`${examTitle}-scorecard.pdf`);
}
