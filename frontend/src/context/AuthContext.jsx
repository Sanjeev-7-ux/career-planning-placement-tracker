import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user: authenticatedUser } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      let message = "Login failed. Please check your credentials.";
      if (error?.response?.status === 401) {
        message = "Incorrect email or password.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.code === "ERR_NETWORK") {
        message = "Cannot connect to server. Please ensure the backend is running on port 8080.";
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user: authenticatedUser } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (error) {
      let message = "Registration failed. Please try again.";
      if (error?.response?.status === 409) {
        message = "An account with this email already exists.";
      } else if (error?.response?.status === 400) {
        message = "Please check your details. Password must be at least 8 characters.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
