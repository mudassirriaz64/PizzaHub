import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Check auth every 5 minutes to detect session expiration
    const authCheckInterval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(authCheckInterval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/verify.php");
      if (response.data.authenticated) {
        setAdmin(response.data.admin);
      } else {
        setAdmin(null);
      }
    } catch (error) {
      // Session expired or invalid
      if (error.response?.status === 401) {
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login.php", {
        username,
        password,
      });
      if (response.data.success) {
        setAdmin(response.data.admin);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout.php");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);
    }
  };

  const updateAdmin = (updatedAdmin) => {
    setAdmin(updatedAdmin);
  };

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, checkAuth, updateAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
