import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const { user, setUser } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");

    setUser(null);

    navigate("/");
  };

  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
      <h1 className="text-2xl font-bold">
        AI Proctor
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => navigate("/results")}
          className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Results
        </button>

        <button
          type="button"
          onClick={() => navigate("/leaderboard")}
          className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Leaderboard
        </button>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Profile
        </button>

        {(user?.role === "admin" || user?.role === "proctor") && (
          <button
            type="button"
            onClick={() =>
              navigate(
                user?.role === "admin"
                  ? "/admin/recordings"
                  : "/proctor/recordings"
              )
            }
            className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Recordings
          </button>
        )}

        <LanguageSelector />
        <ThemeToggle />

        {user?.role === "admin" && (
          <>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/exams/create")}
              className="rounded-2xl bg-green-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              Create exam
            </button>
          </>
        )}

        {user?.role === "proctor" && (
          <button
            type="button"
            onClick={() => navigate("/proctor")}
            className="rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            Proctor
          </button>
        )}

        <button
          onClick={logoutHandler}
          className="rounded-2xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;