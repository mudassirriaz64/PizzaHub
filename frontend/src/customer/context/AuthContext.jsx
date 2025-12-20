import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

const API_Base = "http://localhost/PizzaHub/backend/customer/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("customer_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("customer_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_Base}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("customer_user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_Base}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("customer_user", JSON.stringify(data.user));
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_Base}/logout.php`, { credentials: "include" });
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    localStorage.removeItem("customer_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
