export const otpEmailTemplate = (name, otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code</title>
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
    .content p {
      margin-top: 0;
      margin-bottom: 20px;
      color: #94a3b8;
    }
    .otp-container {
      text-align: center;
      margin: 30px 0;
      background: rgba(99, 102, 241, 0.1);
      border: 1px dashed #6366f1;
      border-radius: 12px;
      padding: 20px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #38bdf8;
      margin: 0;
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
      <h1>ProctorAI Security</h1>
    </div>
    <div class="content">
      <p>Hi ${name || "User"},</p>
      <p>We received a request to reset the password for your ProctorAI account. Use the verification code below to proceed. This code is valid for <strong>5 minutes</strong>.</p>
      <div class="otp-container">
        <div class="otp-code">${otp}</div>
      </div>
      <p>If you did not request this code, please ignore this email or contact support if you suspect unauthorized access.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ProctorAI Online Exam Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
export default otpEmailTemplate;
