import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
    >
      {theme === "dark" ? t("themeLight") : t("themeDark")}
    </button>
  );
};

export default ThemeToggle;
