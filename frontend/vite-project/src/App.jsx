import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const ExamPage = lazy(() => import("./pages/ExamPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCreateExam = lazy(() => import("./pages/AdminCreateExam"));
const ProctorDashboard = lazy(() => import("./pages/ProctorDashboard"));
const Result = lazy(() => import("./pages/Result"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const RecordingReplay = lazy(() => import("./pages/RecordingReplay"));
const ViolationsReport = lazy(() => import("./pages/ViolationsReport"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowPending>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proctor/exams/create"
            element={
              <ProtectedRoute allowedRoles={["proctor", "admin"]}>
                <AdminCreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/violations"
            element={
              <ProtectedRoute>
                <ViolationsReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recordings"
            element={
              <ProtectedRoute allowedRoles={["admin", "proctor"]}>
                <RecordingReplay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proctor"
            element={
              <ProtectedRoute allowedRoles={["proctor"]}>
                <ProctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proctor/users"
            element={
              <ProtectedRoute allowedRoles={["proctor", "admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proctor/recordings"
            element={
              <ProtectedRoute allowedRoles={["proctor"]}>
                <RecordingReplay />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
