export const examAssignedEmailTemplate = (name, exam) => {
  const instructionsHtml = exam.instructions
    ? `<div style="background:#1f2937; padding:15px; border-radius:8px; border-left:4px solid #6366f1; margin: 20px 0; color:#cbd5e1; font-size:14px; text-align:left;">
         <strong>Instructions:</strong><br/>
         ${exam.instructions}
       </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exam Assigned</title>
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
      background: linear-gradient(135deg, #6366f1, #06b6d4);
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
    .details {
      background: #0f172a;
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      color: #64748b;
      font-weight: 500;
    }
    .detail-value {
      color: #cbd5e1;
      font-weight: bold;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #06b6d4);
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      font-weight: bold;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
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
      <h1>New Assignment</h1>
    </div>
    <div class="content">
      <h2>Hi ${name || "Student"},</h2>
      <p>A new exam has been assigned to you on ProctorAI. Please check the details below and log in to prepare.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Exam Title:</span>
          <span class="detail-value">${exam.title}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${exam.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Questions:</span>
          <span class="detail-value">${exam.questions?.length || 0}</span>
        </div>
      </div>

      ${instructionsHtml}

      <div class="btn-container">
        <a href="http://localhost:5173/login" class="btn">Take Exam Now</a>
      </div>
      <p>Make sure you have a working camera and a stable internet connection before beginning.</p>
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
export default examAssignedEmailTemplate;
