import { useEffect, useState, useRef } from "react";

const Timer = ({ duration, onExpire, disabled }) => {
  const [time, setTime] = useState(duration * 60);
  const expiredRef = useRef(false);

  useEffect(() => {
    setTime(duration * 60);
    expiredRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (disabled || time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 0) return 0;
        if (prev <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disabled, onExpire, duration]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const urgent = time < 300;

  return (
    <div
      className={`rounded-xl px-4 py-2 font-mono text-sm font-semibold tabular-nums ${
        urgent
          ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
          : "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
      }`}
    >
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
};

export default Timer;
