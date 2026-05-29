import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = ({ label, className = "", type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full relative">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
            isPassword ? "pr-11" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex="-1"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            ) : (
              <Eye className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;

