import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { useToast } from "../context/ToastContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const passwordOk = (p) =>
    p.length >= 8 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast("Passwords do not match", "error");
      return;
    }
    if (!passwordOk(form.password)) {
      toast(
        "Password needs 8+ chars with uppercase, lowercase, and a number",
        "error"
      );
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      toast(
        data.approved
          ? "Account created — you can sign in now"
          : "Account created — await admin approval",
        "success"
      );
      navigate("/login");
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl glass-light p-8 shadow-glass"
      >
        <Link to="/" className="text-xl font-bold gradient-text">
          ProctorAI
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          Create account
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Join as student or proctor. Password must be 8+ characters with
          uppercase, lowercase, and a number.
        </p>

        <Input
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <div className="mt-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm"
          >
            <option value="student">Student</option>
            <option value="proctor">Proctor</option>
          </select>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Input
            label="Confirm"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-8 w-full !py-3">
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="mt-6 text-center text-sm text-slate-500">
          Have an account?{" "}
          <Link to="/login" className="text-indigo-500 font-semibold">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Register;
