export const welcomeEmailTemplate = (name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ProctorAI</title>
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
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
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
      <h1>Welcome to ProctorAI</h1>
    </div>
    <div class="content">
      <h2>Hi ${name || "User"},</h2>
      <p>Thank you for registering with <strong>ProctorAI</strong> — the next generation, AI-powered online examination proctoring platform.</p>
      <p>Your account is now active. If you are a student, please wait for an administrator or proctor to approve your registration if approval is required. In the meantime, you can log in to your dashboard to complete your profile.</p>
      <div class="btn-container">
        <a href="http://localhost:5173/login" class="btn">Log In to Dashboard</a>
      </div>
      <p>Best regards,<br/>The ProctorAI Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ProctorAI Online Exam Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
export default welcomeEmailTemplate;
