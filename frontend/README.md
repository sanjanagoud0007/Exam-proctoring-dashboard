# ProctorAI — Frontend Application

This directory contains the React single-page application (SPA) powering the **ProctorAI** dashboard interface. It is created using **Vite**, **Tailwind CSS**, and **Framer Motion**, delivering a futuristic glassmorphic UI.

---

## 1. Architecture

The frontend follows a highly modular structure built for scale:

```
frontend/vite-project/
├── public/              # Static public assets
├── src/
│   ├── animations/      # Shared Framer Motion physics configs
│   ├── assets/          # Logo images and vectors
│   ├── components/      # Reusable UI inputs, layouts, and warning modals
│   ├── context/         # Auth context, Theme selector, Toast managers
│   ├── hooks/           # Custom React hooks (timers, state syncing)
│   ├── pages/           # High-level route pages (dashboards, exams)
│   ├── services/        # Axios API fetch wrapper config
│   ├── utils/           # Face detectors, lockdown scripts, PDF reports
│   ├── App.jsx          # Route switcher and protected gates
│   └── main.jsx         # App mounting file
└── index.html           # Document root
```

---

## 2. Routing Structure

Routing is managed by `react-router-dom` in `src/App.jsx`. Access control is handled by the `<ProtectedRoute>` wrapper:

```jsx
// Example from App.jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Application Routes
- `/`: Futuristic landing page with platform overview and stats.
- `/login` / `/register`: Encrypted authorization forms.
- `/forgot-password`: Multi-step OTP-based security verification loop.
- `/dashboard`: Student panel displaying assigned exams and history.
- `/exam/:id`: Full browser lockdown exam view.
- `/results`: View submitted exam statistics and rankings.
- `/leaderboard`: View class rankings based on scores.
- `/proctor`: Live monitor dashboard for proctors.
- `/admin`: Command center displaying platform metrics and audit reports.
- `/admin/users`: Management page to approve, revoke, or delete users.

---

## 3. State Management

The application utilizes the React **Context API** to maintain lightweight global state:

1. **AuthContext (`AuthContext.jsx`)**: Manages the logged-in user's profile info, JWT tokens, and session initialization. Checks `localStorage` to persist logins.
2. **ThemeContext (`ThemeContext.jsx`)**: Tracks the selected theme (`light` or `dark`). Adds the `.dark` utility class to the HTML element.
3. **ToastContext (`ToastContext.jsx`)**: Manages custom alerts and toasts with animations.

---

## 4. Key Components

- **WebcamMonitor (`WebcamMonitor.jsx`)**: Renders `<Webcam />` and initializes the TinyFaceDetector and TensorFlow.js object scanners. Features:
  - **Virtual Camera Scan**: Enumerates video devices and block labels with "OBS", "Virtual", etc.
  - **Freeze Scan**: Compares consecutive pixel streams. If there is exactly zero variance over 9s, triggers a warning.
- **Timer (`Timer.jsx`)**: A tabular-numeric countdown clock. Automatically fires `onExpire()` once time runs out.
- **Input (`Input.jsx`)**: Encapsulates standard form fields. Detects `type="password"` to offer a toggle eye icon button using Lucide React (`Eye` and `EyeOff`) with smooth hover scales.
- **WarningModal (`WarningModal.jsx`)**: Overlay triggered upon academic infractions. Requires user acknowledgement and triggers a fullscreen request when dismissed.

---

## 5. UI Libraries

- **Tailwind CSS**: Utility-first styling with custom configurations for glassmorphic backdrops, glowing borders, and futuristic gradients.
- **Framer Motion**: Controls page-level transitions, toast pops, and multi-step password reset cards.
- **Lucide React Icons**: Premium outline vector icons.
- **Recharts**: Responsive SVG charts representing violation heatmaps, risk ratios, and exam performance.

---

## 6. Theme Customization

The dark and light theme styles are set in `src/index.css`. The dark theme is configured with navy-indigo gradients, whereas the light theme features professional, bright slate borders.

To configure variables, edit:
```css
:root {
  --bg: #f8fafc;
  --bg-elevated: #ffffff;
  --text: #0f172a;
  --border: #e2e8f0;
  --accent: #6366f1;
}

.dark {
  --bg: #030712;
  --bg-elevated: #0f172a;
  --text: #f1f5f9;
  --border: #1e293b;
}
```
---

## 7. Configuration

Ensure your `frontend/vite-project/.env` is set:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
