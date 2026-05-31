# ProctorAI — Enterprise AI Online Exam Proctoring Platform

ProctorAI is a production-level, recruitment-grade online exam proctoring platform designed using the MERN stack (MongoDB, Express, React, Node). It provides role-based workspaces for **Administrators**, **Proctors**, and **Students**, fortified by real-time browser lockdowns and machine learning threat detection models (face, emotion, object, eye tracking, voice detection, and device inspection).

---

## 🚀 Key Features

### 1. Advanced Security & Browser Lockdown
- **Fullscreen Enforcement**: Forces browser into fullscreen mode on exam start. If exited, a Warning Modal blocks the screen and logs a violation.
- **Tab-Switch & Focus Tracking**: Detects browser blur, window minimization, and tab switching, assigning a risk penalty on violations.
- **Disabled Clipboard**: Copying, pasting, cutting, and right-click context menus are completely disabled.
- **Blocked Keyboard Combos**: Blocked hotkeys (e.g. F12 Developer Tools, F11, Escape, Ctrl+C, Ctrl+V, Alt+Tab) are intercepted.
- **VPN/Proxy Checker**: Inspects client IP locations and matches their registered timezone against the browser system offset to catch proxy-spoofed locations.
- **Virtual Camera & Deepfake Guard**: Scans active video track labels for virtual camera drivers (e.g. OBS, ManyCam, SparkoCam, Camo) and runs a pixel variance freeze detector to identify looped videos or deepfake streams.

### 2. AI Monitoring & Analysis
- **Face & Eye Tracking**: TinyFaceDetector (via `@vladmandic/face-api`) analyzes eye coordinates, detecting face absence, head tilting, and looking away.
- **Multi-Face Alert**: Detects multiple faces in the frame.
- **Emotion Recognition**: Models evaluate active student expressions (happiness, anger, fear, surprise, neutrality) during the exam session.
- **TensorFlow Object Detection**: Utilizes TensorFlow.js (`COCO-SSD`) to scan frames for mobile phones, notebooks, and unauthorized items.
- **Voice activity detector**: Tracks background noises and voices.
- **Suspicion Score Engine**: Synthesizes telemetry inputs into a unified integrity penalty score (e.g. Phone: +50, Tab Switch: +10).
- **Integrity Grading**: Labels submissions as `Low Risk`, `Medium Risk`, or `High Risk` automatically.

### 3. Forgot Password OTP Flow
- **Hashed OTP Store**: Generates a secure, 6-digit numeric OTP with SHA256 database hashing and a 5-minute MongoDB TTL self-cleaning index.
- **Multi-Step Flow**: A sleek glassmorphic container walking the user from email verification with countdown timers (resend after 60s) to password updating.
- **Eye-Icon Input**: Seamlessly integrates Lucide React toggle elements for instant secure input checking.

### 4. HTML Email Service
- Uses Nodemailer to deliver professional, branded HTML responsive layouts for:
  - Welcome messages upon registration.
  - Expiry-bound verification OTP codes.
  - Password reset confirmations.
  - Direct exam assignment links.
  - Detailed score and proctored metrics release emails.

### 5. Multi-User Dashboards
- **Student Dashboard**: Browse assigned exams, check timer details, save progress drafts, see warnings, and view completed scores.
- **Proctor Dashboard**: Manage students, assign exam credentials, view live grid streams, watch live warning feeds, and review statistics.
- **Admin Dashboard**: Create, edit, and delete exams, review system analytics charts (Recharts), check user accounts, approve or ban users, and review violation heatmaps.

---

## 📸 Screenshots Section

### 1. Student Secure Lockdown Exam
*A responsive, mesh-background examination view featuring the auto-saving text fields, webcam monitors, and real-time warnings.*

### 2. Live Proctor Hub
*Proctors can monitor all active students simultaneously in a live webcam grid, supplemented by a real-time infraction notification panel.*

### 3. Admin Control Center
*Interactive charts rendering violation distributions, risk summaries, and user status controls.*

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Axios, Socket.IO Client, Recharts, Face-API.js, TensorFlow.js |
| **Backend** | Node.js, Express.js, Mongoose, JWT, Socket.IO, Nodemailer, Bcrypt |
| **Database** | MongoDB |

---

## 📂 Folder Structure

```
Exam-proctoring-dashboard/
├── backend/
│   ├── config/             # DB settings
│   ├── controllers/        # auth, exam, users, logs controllers
│   ├── middleware/         # auth token validation, rate limiters, error catchers
│   ├── models/             # User, Otp, Exam, Attempt, ExamSession schemas
│   ├── routes/             # REST routing layers
│   ├── services/           # Nodemailer integration
│   ├── templates/          # Branded HTML email layouts
│   ├── sockets/            # Live telemetry channels
│   └── server.js           # Server startup script
└── frontend/
    ├── public/             # Static files
    └── src/
        ├── components/     # Inputs, warning blocks, navigation bars
        ├── context/        # Auth, Theme, and Toast contexts
        ├── pages/          # Login, Register, Dashboards, Exam lockdown
        ├── services/       # Axios API handlers
        └── utils/          # faceapi landmarks, lockdown handlers
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed locally.
- MongoDB instance (local or Atlas cluster).
- SMTP mail server credentials (e.g. Mailtrap, Gmail) for email dispatches.

### 1. Set Up Backend
```bash
cd backend
cp .env.example .env
# Edit details: MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
npm install
npm run dev
```

### 2. Set Up Frontend
```bash
cd ../frontend
cp .env.example .env
# Edit server endpoints: VITE_API_URL, VITE_SOCKET_URL
npm install
npm run dev
```

### 3. Seed Demo Data
Verify `ALLOW_SEED=true` is set in your backend `.env`, then:
- Call `curl -X POST http://localhost:5000/api/seed` or click **Seed demo data** inside the Admin page.

**Demo Accounts (Password: `Demo@123`):**
- **Admin**: `admin@demo.proctorai.com`
- **Proctor**: `proctor@demo.proctorai.com`
- **Students**: `alice@demo.proctorai.com`, `bob@demo.proctorai.com`

---

## 🌐 Deployment Instructions

### Backend (Render / Heroku)
1. Initialize a Web Service linked to your repository, setting the root directory to `backend`.
2. Configure Build Command: `npm install` and Start Command: `npm start`.
3. Add Environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` matching your frontend Vercel URL, `ALLOW_SEED=false`).

### Frontend (Vercel / Netlify)
1. Add a new project pointing to the repository, setting the root folder to `frontend`.
2. Select Vite template settings (Build command: `npm run build`, Output directory: `dist`).
3. Set environment parameters (`VITE_API_URL` pointing to backend API, `VITE_SOCKET_URL` pointing to backend socket URL).

---

## 🔮 Future Enhancements
- **Virtual Proctoring**: WebRTC-based 1-to-1 audio calling between proctors and student devices.
- **Behavioral Analytics**: Deep learning models evaluating keystroke dynamics to authenticate student typing signatures.
- **Offline Syncing**: Service worker caching layers allowing students to continue write-ups during intermittent network drops.

---

## 📄 License
Released under the MIT License.
