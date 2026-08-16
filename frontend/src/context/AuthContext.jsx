import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persistSession = (data) => {
    const { token, ...userInfo } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { name, email, password });
      persistSession(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractError(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persistSession(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractError(err) };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function extractError(err) {
  if (err.code === "ERR_NETWORK") {
    return "Can't reach the server. Is the backend running on the expected port?";
  }
  return err.response?.data?.message || "Something went wrong. Please try again.";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
