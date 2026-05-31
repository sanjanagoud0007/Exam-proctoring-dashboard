import { useState } from "react";
import { FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import LanguageSelector from "../LanguageSelector";

export const TopNavbar = ({ onMenuClick, title }) => {
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 glass-light">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <FiMenu size={22} />
        </button>
        {title && (
          <h2 className="hidden text-sm font-semibold text-slate-500 sm:block">
            {title}
          </h2>
        )}
        <div className="ml-auto flex items-center gap-3">
          <input
            type="search"
            placeholder="Quick search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hidden w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-sm md:block lg:w-64"
          />
          <LanguageSelector />
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-600 dark:text-slate-300"
          >
            {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3 py-1.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0] || "U"}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
              {user?.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
