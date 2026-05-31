import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiKey, FiLock, FiClock } from "react-icons/fi";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Timers
  const [expiryTime, setExpiryTime] = useState(300); // 5 minutes expiration timer
  const [resendCooldown, setResendCooldown] = useState(0); // 60 seconds resend cooldown
  const timerRef = useRef(null);
  const cooldownRef = useRef(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Expiry Timer countdown
  useEffect(() => {
    if (step === 2 && expiryTime > 0) {
      timerRef.current = setInterval(() => {
        setExpiryTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            toast("OTP has expired. Please request a new one.", "error");
            setStep(1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, expiryTime, toast]);

  // Cooldown Timer countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [resendCooldown]);

  const requestOtp = async (e) => {
    if (e) e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast("Please enter your email address", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email: trimmedEmail });
      toast(data.message || "Verification code sent successfully", "success");
      setStep(2);
      setExpiryTime(300); // Reset 5 min expiry
      setResendCooldown(60); // Start 60s resend cooldown
    } catch (err) {
      toast(err.response?.data?.message || "Failed to send verification code", "error");
    }
    setLoading(false);
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      toast("Please enter the 6-digit verification code", "error");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: trimmedOtp,
      });
      toast("OTP verified. Please set your new password.", "success");
      setResetToken(data.resetToken);
      setStep(3);
    } catch (err) {
      toast(err.response?.data?.message || "Invalid OTP code", "error");
    }
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast("All fields are required", "error");
      return;
    }
    if (password !== confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }

    const passwordOk =
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password);

    if (!passwordOk) {
      toast(
        "Password must be at least 8 characters and contain uppercase, lowercase, and a number",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/reset-password", {
        token: resetToken,
        password,
      });
      toast(data.message || "Password updated successfully", "success");
      navigate("/login");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update password", "error");
    }
    setLoading(false);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen mesh-bg flex bg-slate-50 dark:bg-slate-950 items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold gradient-text">
            ProctorAI
          </Link>
        </div>

        <motion.div
          layout
          className="rounded-3xl glass-light dark:glass p-8 shadow-glass border border-slate-200 dark:border-slate-800"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="mt-2 text-sm text-slate-500 mb-8">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>

                <form onSubmit={requestOtp} className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    autoComplete="email"
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    icon={FiMail}
                    className="w-full !py-3 bg-gradient-to-r from-indigo-600 to-violet-600"
                  >
                    {loading ? "Sending Code…" : "Send Verification Code"}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Verify OTP
                </h2>
                <p className="mt-2 text-sm text-slate-500 mb-6">
                  Enter the 6-digit verification code sent to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
                </p>

                <form onSubmit={verifyOtp} className="space-y-6">
                  <Input
                    label="Verification Code"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.5em] font-semibold"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <FiClock className="text-amber-500 animate-pulse" />
                      <span>Code expires in:</span>
                      <span className="font-mono font-bold text-amber-500 tabular-nums">
                        {formatTime(expiryTime)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => requestOtp(null)}
                      className="text-indigo-500 hover:underline font-medium disabled:text-slate-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    icon={FiKey}
                    className="w-full !py-3 bg-gradient-to-r from-emerald-600 to-cyan-600"
                  >
                    {loading ? "Verifying…" : "Verify & Proceed"}
                  </Button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-6 text-center text-sm font-semibold text-indigo-500 hover:underline w-full"
                >
                  Change email address
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  New Password
                </h2>
                <p className="mt-2 text-sm text-slate-500 mb-8">
                  Create a secure password with at least 8 characters, including uppercase, lowercase, and numbers.
                </p>

                <form onSubmit={resetPassword} className="space-y-6">
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    icon={FiLock}
                    className="w-full !py-3 bg-gradient-to-r from-indigo-600 to-cyan-600"
                  >
                    {loading ? "Updating…" : "Update Password"}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-indigo-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
