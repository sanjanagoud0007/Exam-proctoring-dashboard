import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow hover:from-indigo-500 hover:to-violet-500",
  secondary:
    "glass-light text-slate-800 dark:text-slate-100 hover:bg-white/90 dark:hover:bg-slate-800",
  ghost: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
};

export const Button = ({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  ...props
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
    {...props}
  >
    {Icon && <Icon size={18} />}
    {children}
  </motion.button>
);

export default Button;
