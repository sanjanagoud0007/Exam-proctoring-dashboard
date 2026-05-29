import { useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed right-6 top-6 z-50 max-w-sm rounded-md bg-slate-900 p-3 text-white shadow">
      {message}
    </div>
  );
};

export default Toast;
