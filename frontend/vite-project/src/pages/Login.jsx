import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock } from "react-icons/fi";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toast("Email and password are required", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", {
        email: trimmedEmail,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast(`Welcome back, ${data.name}`, "success");
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "proctor") navigate("/proctor");
      else navigate("/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Invalid credentials", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen mesh-bg flex bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 border-r border-slate-200 dark:border-slate-800">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md"
        >
          <Link to="/" className="text-2xl font-bold gradient-text">
            ProctorAI
          </Link>
          <h1 className="mt-8 text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            Secure exams. <br />
            <span className="text-indigo-500">Zero compromise.</span>
          </h1>
          <p className="mt-4 text-slate-500">
            AI proctoring trusted by engineering teams and placement cells.
          </p>
        </motion.div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="w-full max-w-md rounded-3xl glass-light p-8 shadow-glass"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-slate-500 mb-8">
            Secure sign-in with encrypted credentials
          </p>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@university.edu"
          />
          <div className="mt-4">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          <Link
            to="/forgot-password"
            className="mt-2 block text-right text-sm text-indigo-500 hover:underline"
          >
            Forgot password?
          </Link>
          <Button
            type="submit"
            disabled={loading}
            icon={FiLock}
            className="mt-8 w-full !py-3"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/register" className="font-semibold text-indigo-500">
              Create account
            </Link>
          </p>
          <Link
            to="/"
            className="mt-4 block text-center text-xs text-slate-400 hover:text-slate-600"
          >
            ← Back to home
          </Link>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;
