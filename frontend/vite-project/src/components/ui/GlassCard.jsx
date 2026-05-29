import { motion } from "framer-motion";

export const GlassCard = ({
  children,
  className = "",
  hover = true,
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={hover ? { y: -2 } : undefined}
    className={`rounded-2xl glass-light p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
