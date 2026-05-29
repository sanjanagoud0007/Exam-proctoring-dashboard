export const resultPublishedEmailTemplate = (name, exam, attempt) => {
  const scorePercent = attempt.maxScore
    ? Math.round((attempt.score / attempt.maxScore) * 100)
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Results Published</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0b0f19;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .header {
      background: linear-gradient(135deg, #10b981, #06b6d4);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .content h2 {
      color: #ffffff;
      margin-top: 0;
    }
    .content p {
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .result-card {
      background: #0f172a;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin-bottom: 25px;
    }
    .score-large {
      font-size: 48px;
      font-weight: bold;
      color: #10b981;
      margin: 10px 0;
    }
    .score-label {
      color: #64748b;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stats-grid {
      display: grid;
      grid-template-cols: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
      border-top: 1px solid #1f2937;
      padding-top: 15px;
    }
    .stat-box {
      text-align: center;
    }
    .stat-val {
      font-size: 18px;
      font-weight: bold;
      color: #f1f5f9;
    }
    .stat-lbl {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-weight: bold;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
    }
    .footer {
      background: #0f172a;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #475569;
      border-top: 1px solid #1f2937;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Results Published</h1>
    </div>
    <div class="content">
      <h2>Hi ${name || "Student"},</h2>
      <p>Your results for the exam <strong>${exam.title}</strong> have been published. Please review your performance below.</p>
      
      <div class="result-card">
        <div class="score-label">Graded Score</div>
        <div class="score-large">${attempt.score}${scorePercent !== null ? ` / ${attempt.maxScore || 100}` : ""}</div>
        
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-val" style="color: ${attempt.riskLevel === "Low Risk" ? "#34d399" : attempt.riskLevel === "Medium Risk" ? "#fbbf24" : "#f87171"};">
              ${attempt.riskLevel || "Low Risk"}
            </div>
            <div class="stat-lbl">Proctor Risk Level</div>
          </div>
          <div class="stat-box">
            <div class="stat-val">${attempt.cheatingScore || 0} pts</div>
            <div class="stat-lbl">Integrity Violation Score</div>
          </div>
        </div>
      </div>

      <div class="btn-container">
        <a href="http://localhost:5173/login" class="btn">View Detailed Report</a>
      </div>
      <p>If you have any questions or require an appeal regarding your proctoring logs, please reach out to your instructor.</p>
      <p>Best regards,<br/>The ProctorAI Academic Office</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ProctorAI Online Exam Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
export default resultPublishedEmailTemplate;
