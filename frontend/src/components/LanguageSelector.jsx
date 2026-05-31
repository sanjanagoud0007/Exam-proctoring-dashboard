import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem("language", e.target.value);
      }}
      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"
    >
      <option value="en">EN</option>
      <option value="hi">HI</option>
      <option value="te">TE</option>
    </select>
  );
};

export default LanguageSelector;
