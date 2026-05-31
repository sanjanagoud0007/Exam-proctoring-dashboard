import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import AppLayout from "./layout/AppLayout";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";
import { getApiErrorMessage } from "../utils/apiError";

const PendingApproval = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    setChecking(true);
    setError("");
    try {
      const updated = await refreshUser();
      if (updated.approved) {
        window.location.href = "/dashboard";
      } else {
        setError(
          "Still pending. An admin must approve your account (see steps below)."
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not check status"));
    }
    setChecking(false);
  };

  return (
    <AppLayout title="Pending approval">
      <div className="max-w-lg mx-auto mt-12 space-y-6">
        <GlassCard>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Account pending approval
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Updating your profile does <strong>not</strong> approve your account.
            A platform <strong>admin</strong> must approve student accounts before
            you can take exams.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Signed in as: {user?.email} ({user?.role})
          </p>

          {error && (
            <p className="mt-3 text-sm text-amber-400 rounded-lg bg-amber-500/10 p-3">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button disabled={checking} onClick={checkStatus}>
              {checking ? "Checking…" : "Refresh approval status"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/profile")}
            >
              Edit profile
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem("userInfo");
                window.location.href = "/login";
              }}
            >
              Log out & sign in again
            </Button>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            How to get approved
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Ask your exam proctor to open <strong>Approve students</strong> in
            the sidebar and approve your email, then click{" "}
            <strong>Refresh approval status</strong> above.
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

const isStudentPending = (user) =>
  user?.role === "student" && user.approved !== true;

const ProtectedRoute = ({ children, allowedRoles, allowPending }) => {
  const { user } = useContext(AuthContext);

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "proctor") return <Navigate to="/proctor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (isStudentPending(user) && !allowPending) {
    return <PendingApproval />;
  }

  return children;
};

export default ProtectedRoute;
