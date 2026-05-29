import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiUser,
  FiBarChart2,
  FiAward,
  FiShield,
  FiUsers,
  FiPlusCircle,
  FiVideo,
  FiAlertTriangle,
  FiLogOut,
} from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
  }`;

export const Sidebar = ({ open, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role;

  const studentLinks = [
    { to: "/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/results", icon: FiBarChart2, label: "Results" },
    { to: "/leaderboard", icon: FiAward, label: "Leaderboard" },
    { to: "/violations", icon: FiAlertTriangle, label: "Violations" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  const proctorLinks = [
    { to: "/proctor", icon: FiShield, label: "Live monitor" },
    { to: "/proctor/users", icon: FiUsers, label: "Approve students" },
    { to: "/proctor/exams/create", icon: FiPlusCircle, label: "Create exam" },
    { to: "/results", icon: FiBarChart2, label: "Analytics" },
    { to: "/proctor/recordings", icon: FiVideo, label: "Recordings" },
    { to: "/violations", icon: FiAlertTriangle, label: "Violations" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", icon: FiGrid, label: "Overview" },
    { to: "/admin/exams/create", icon: FiPlusCircle, label: "Create exam" },
    { to: "/admin/users", icon: FiUsers, label: "Users" },
    { to: "/results", icon: FiBarChart2, label: "Analytics" },
    { to: "/admin/recordings", icon: FiVideo, label: "Recordings" },
    { to: "/violations", icon: FiAlertTriangle, label: "Violations" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  const links =
    role === "admin"
      ? adminLinks
      : role === "proctor"
        ? proctorLinks
        : studentLinks;

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  const content = (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white font-bold">
          P
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">ProctorAI</p>
          <p className="text-xs text-slate-500 capitalize">{role} portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={linkClass} onClick={onClose}>
            <l.icon size={18} />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
      >
        <FiLogOut size={18} />
        Sign out
      </button>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-slate-200/80 dark:lg:border-slate-800 glass-light">
        {content}
      </aside>
      {open && (
        <motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          className="fixed inset-y-0 left-0 z-50 w-64 glass-light lg:hidden"
        >
          {content}
        </motion.aside>
      )}
    </>
  );
};

export default Sidebar;
