import { createContext, useCallback, useState } from "react";
import API from "../services/api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || null;
    } catch {
      return null;
    }
  });

  const syncUser = useCallback((data) => {
    const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const updated = { ...stored, ...data, token: stored.token || data.token };
    localStorage.setItem("userInfo", JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  /** Pull latest role/approved from server (e.g. after admin approves you). */
  const refreshUser = useCallback(async () => {
    const { data } = await API.get("/auth/profile");
    return syncUser(data);
  }, [syncUser]);

  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, syncUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
