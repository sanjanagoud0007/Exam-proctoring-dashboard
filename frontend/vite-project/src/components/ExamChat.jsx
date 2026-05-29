import { useEffect, useState, useRef } from "react";
import API from "../services/api";

const ExamChat = ({ examId, socket, user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get(`/chat/${examId}`).then(({ data }) => setMessages(data));
  }, [examId]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("joinExamChat", { examId });
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("examChat", handler);
    return () => socket.off("examChat", handler);
  }, [socket, examId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = {
      examId,
      message: text.trim(),
      senderName: user?.name,
      senderRole: user?.role,
      senderId: user?._id,
    };
    socket?.emit("examChat", payload);
    await API.post(`/chat/${examId}`, { message: text.trim() });
    setMessages((prev) => [
      ...prev,
      { ...payload, createdAt: new Date().toISOString() },
    ]);
    setText("");
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="font-semibold text-cyan-400 mb-2">Live support</h3>
      <div className="h-40 overflow-y-auto text-sm space-y-2 mb-2">
        {messages.map((m, i) => (
          <div key={m._id || i} className="text-slate-300">
            <span className="text-cyan-500">{m.senderName}:</span> {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-white"
          placeholder="Message proctor…"
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ExamChat;
