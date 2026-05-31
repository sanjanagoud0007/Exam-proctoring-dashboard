import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShield,
  FiEye,
  FiBarChart2,
  FiZap,
  FiChevronDown,
} from "react-icons/fi";
import { useState } from "react";
import Button from "../components/ui/Button";

const features = [
  {
    icon: FiEye,
    title: "AI face & gaze tracking",
    desc: "TensorFlow + face-api detect no-face, multiple faces, phones, and tab switches.",
  },
  {
    icon: FiShield,
    title: "Browser lockdown",
    desc: "Fullscreen, copy/paste block, shortcut detection, and auto-submit on violations.",
  },
  {
    icon: FiBarChart2,
    title: "Recruiter-grade analytics",
    desc: "Risk scores, heatmaps, leaderboards, and PDF exports for institutions.",
  },
  {
    icon: FiZap,
    title: "Real-time proctoring",
    desc: "Socket.IO live feeds, violation alerts, and screen recording replay.",
  },
];

const stats = [
  { v: "99.2%", l: "Integrity uptime" },
  { v: "50ms", l: "Alert latency" },
  { v: "20+", l: "AI checks" },
  { v: "3", l: "Role portals" },
];

const faqs = [
  {
    q: "Does it work for remote hiring tests?",
    a: "Yes — built for mock tests, campus drives, and certification exams.",
  },
  {
    q: "What AI models are used?",
    a: "face-api.js, BlazeFace, COCO-SSD, and custom integrity scoring.",
  },
  {
    q: "Can proctors intervene live?",
    a: "Live chat, webcam frames, and violation feeds are included.",
  },
];

const Landing = () => (
  <div className="min-h-screen bg-slate-950 text-white mesh-bg">
    <nav className="sticky top-0 z-50 border-b border-white/5 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-bold gradient-text">ProctorAI</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-300 hover:text-white">
            Sign in
          </Link>
          <Link to="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </div>
    </nav>

    <section className="relative overflow-hidden px-6 pt-20 pb-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Enterprise exam integrity
          </span>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Proctor exams like a{" "}
            <span className="gradient-text">funded SaaS</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            AI monitoring, live dashboards, and analytics — the portfolio piece
            recruiters remember.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="!px-8 !py-3.5 !text-base">
                Start free demo
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="!px-8 !py-3.5">
                View dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 gradient-border rounded-3xl glass p-2 shadow-glow"
        >
          <div className="rounded-2xl bg-slate-900/90 p-6">
            <div className="flex gap-2 mb-4">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {["Live monitor", "Risk: Low", "3 active exams"].map((t, i) => (
                <motion.div
                  key={t}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 + i }}
                  className="rounded-xl bg-slate-800/80 p-4 text-sm text-cyan-300"
                >
                  {t}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="border-y border-white/5 bg-slate-900/50 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-white">{s.v}</p>
            <p className="text-sm text-slate-500">{s.l}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Built for integrity teams</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl glass p-6"
            >
              <f.icon className="text-indigo-400" size={28} />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold mb-8">FAQ</h2>
        {faqs.map((item) => (
          <FAQItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </section>

    <footer className="border-t border-white/5 py-12 text-center text-sm text-slate-500">
      <p>© {new Date().getFullYear()} ProctorAI — Exam Proctoring Dashboard</p>
      <Link to="/login" className="mt-2 inline-block text-indigo-400 hover:underline">
        Sign in to platform
      </Link>
    </footer>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-3 rounded-xl glass overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
      >
        {q}
        <FiChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-slate-400">{a}</p>}
    </div>
  );
};

export default Landing;
