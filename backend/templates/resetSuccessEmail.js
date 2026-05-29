export const resetSuccessEmailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
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
    .status-badge {
      display: inline-block;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid #10b981;
      color: #34d399;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 20px;
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
      <h1>Security Alert</h1>
    </div>
    <div class="content">
      <h2>Password Reset Successful</h2>
      <div class="status-badge">Securely Updated</div>
      <p>Hi ${name || "User"},</p>
      <p>This email is to confirm that the password for your ProctorAI account has been successfully updated.</p>
      <p>If you did this reset yourself, no further action is required. You can now log in using your new password.</p>
      <p><strong>Did not request this change?</strong> Please contact support immediately and secure your registered email account, as someone else may have gained access.</p>
      <p>Best regards,<br/>The ProctorAI Security Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ProctorAI Online Exam Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
export default resetSuccessEmailTemplate;
