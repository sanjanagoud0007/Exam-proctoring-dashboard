import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "./ui/Button";

const WarningModal = ({
  open,
  title = "Integrity warning",
  message,
  violationCount,
  maxViolations = 4,
  onContinue,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl glass border border-amber-500/30 p-8 shadow-glow"
        >
          <div className="flex items-center gap-3 text-amber-400 mb-4">
            <FiAlertTriangle size={28} />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <p className="text-slate-300">{message}</p>
          <p className="mt-4 text-sm text-slate-500">
            Violations{" "}
            <span className="font-bold text-red-400">
              {violationCount} / {maxViolations}
            </span>
          </p>
          {violationCount >= maxViolations ? (
            <p className="mt-4 text-sm font-medium text-red-400">
              Auto-submitting exam…
            </p>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onContinue}
              className="mt-6 w-full"
            >
              I understand — continue
            </Button>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default WarningModal;
