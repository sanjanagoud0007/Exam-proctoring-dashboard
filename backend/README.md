# ProctorAI — Backend Service

This directory contains the source code for the backend service powering **ProctorAI**. It is built on the **Node.js** runtime using **Express.js**, **MongoDB**, and **Socket.IO** to handle high-frequency telemetry, live proctoring events, role-based security, and automation.

---

## 1. Architecture

The service follows a strict **MVC (Model-View-Controller)** pattern with custom service layers for external utilities like Nodemailer:

```
backend/
├── config/             # DB configuration and initial setup
├── controllers/        # Express handlers (auth, exam, proctor, analytics, etc.)
├── middleware/         # Security, Rate-limiter, JWT authorization, Errors
├── models/             # Mongoose schemas (User, Otp, Exam, Attempt, etc.)
├── routes/             # API routes definitions
├── services/           # Nodemailer and SMTP email notifications
├── sockets/            # Socket.IO event handler and metrics broadcaster
├── templates/          # Brand-aligned HTML email layouts
├── utils/              # Scoring math, shufflers, validations
└── server.js           # Server startup script
```

---

## 2. API Routes

### Authentication (`/api/auth`)
- `POST /register`: Registers a student or proctor. Sends a welcome email.
- `POST /login`: Log in to get a JWT. Automatically sets bootstrap admin if emails match.
- `POST /forgot-password`: Generates and hashes a 6-digit OTP, saves it in `Otp`, and emails it to the user.
- `POST /verify-otp`: Validates the OTP. On success, returns a 10-minute JWT reset token.
- `POST /reset-password`: Consumes the JWT reset token to securely save the new password.
- `PUT /profile`: Modifies student/proctor preferred language, light/dark theme, or avatar.
- `GET /profile`: Retrieves the active profile data.
- `GET /users`: (Admin/Proctor) Lists registered users.
- `PUT /user/:id/approve`: (Admin/Proctor) Approves a pending user.
- `PUT /user/:id/role`: (Admin) Updates a user's role.

### Exams (`/api/exams`)
- `POST /`: (Admin/Proctor) Create an exam.
- `GET /`: (Admin/Proctor/Student) Lists all exams.
- `GET /:id`: Retrieves exam specifications.
- `POST /submit`: Processes final student answers, calculates MCQ grades, runs suspicion scoring.
- `POST /assign`: (Admin/Proctor) Assigns exam access to a list of students.
- `GET /student`: Retrieves active exams assigned to the logged-in student.
- `GET /:id/take`: Retransmits questions shuffled specifically for the student.
- `POST /:id/autosave`: Autosaves active drafts to prevent exam progress loss.
- `GET /:id/draft`: Returns saved progress draft for recovery.
- `POST /verify-attendance`: Verifies face recognition attendance checks.

### Sockets & Proctored Logs (`/api/proctor`)
- `POST /`: Records a new telemetry violation in the DB and broadcasts to Socket.IO channels.
- `GET /`: Retrieves complete list of violation logs.

---

## 3. Models & Schemas

### User (`UserModel.js`)
Stores account information, role details, and UI configurations.
- `name`: User's full name.
- `email`: Indexed, normalized lowercase email address.
- `password`: BCrypt-hashed password.
- `role`: enum (`student`, `proctor`, `admin`).
- `approved`: Boolean flag.

### OTP (`OtpModel.js`)
Secures the password reset loop.
- `email`: Checked identifier.
- `otpHash`: SHA256 code hash.
- `attempts`: Counts verification failures.
- `expiresAt`: TTL date (purged automatically in 5 minutes).

### Exam (`ExamModel.js`)
Defines questions, options, configurations, and duration.
- `title`: Exam title.
- `duration`: Time in minutes.
- `questions`: Array of questions (MCQ, descriptive, or coding).
- `negativeMarking`: Boolean.
- `negativeMarkValue`: Negative point increment.
- `maxViolations`: Maximum warnings before auto-submission.

### Attempt (`AttemptModel.js`)
Represents a finalized exam response.
- `studentId`, `examId`: Relational keys.
- `answers`: Array of answers matching the student's question shuffler.
- `score`: Final mark.
- `cheatingScore`: Final total accumulated risk score.
- `riskLevel`: `Low Risk`, `Medium Risk`, `High Risk`.

---

## 4. Middleware Explanation

1. **Protect (`authMiddleware.js`)**: Decodes the authorization header bearer token. Checks if the student account has been approved by the admin. Rejects pending users.
2. **Role Gateways (`authMiddleware.js`)**:
   - `protectAdmin`: Grants access to users with `role: admin`.
   - `protectProctor`: Grants access to users with `role: proctor`.
   - `protectAdminOrProctor`: Standard checker for analytics and exam setups.
3. **Rate Limiters (`rateLimiter.js` & `authRateLimiter.js`)**: Prevents DDoS and brute-force attacks on auth endpoints.
4. **Error Handlers (`errorMiddleware.js`)**: Catch-all for API exceptions, returning clear JSON structures rather than leaking stack traces in production.

---

## 5. Socket.IO Setup

Socket.IO handles real-time streams between the student webcam scan and the proctor command panel.

- **Rooms**:
  - `proctors`: Proctor dashboard panels join this room to watch webcam feeds and receive alerts.
  - `exam-chat-${examId}`: Facilitates chat questions and instructions between proctors and active students.
- **Events**:
  - `webcamFrame`: Streamed snapshots sent by students to proctors (stored temporarily in `ExamSession`).
  - `proctorEvent`: Broadcasts violations (e.g. Tab switch, Virtual camera, Voice, phone) to the proctors room.
  - `dashboardStats`: Automatically computed active exam telemetry broadcasted every 15 seconds.

---

## 6. Environment Variables

Create a `backend/.env` file with:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/proctorai
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_ORIGIN=http://localhost:5173
ALLOW_SEED=true
AUTO_APPROVE_STUDENTS=true
BOOTSTRAP_ADMIN_EMAIL=admin@demo.proctorai.com

# SMTP configuration for Nodemailer
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@proctorai.com
```
