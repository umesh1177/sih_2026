import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, clearToken, getStoredUser, setStoredUser, clearStoredUser, getToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Load persisted user on mount ONLY if both token and user exist in storage (Rule 16)
  const [currentUser, setCurrentUser] = useState(() => {
    const token = getToken();
    const stored = getStoredUser();
    if (token && stored && stored.status === "approved") {
      return stored;
    }
    return null; // Initial state is Unauthenticated (Public)
  });

  const [loading, setLoading] = useState(false);

  // Demo accounts for judges with standard password: Password@123
  const demoAccounts = [
    {
      role: "admin",
      label: "Admin (Dr. R. K. Bhattacharya - DG Admin)",
      email: "admin@imd.gov.in",
      password: "Password@123",
      description: "Director General & Chief Academic Controller (Scope: Organization)"
    },
    {
      role: "trainer",
      label: "Trainer (Dr. Amit Sengupta - Lead NWP)",
      email: "amit.sengupta@imd.gov.in",
      password: "Password@123",
      description: "Senior Scientist 'F' – NWP Division"
    },
    {
      role: "trainee",
      label: "Trainee (Cadet Rahul Sharma - Scientist 'B')",
      email: "rahul.sharma@imd.gov.in",
      password: "Password@123",
      description: "Scientist 'B' – Operational NWP Trainee"
    }
  ];

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user && res.token) {
        setCurrentUser(res.user);
        setStoredUser(res.user);
        setToken(res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message, status: res.status };
    } catch (err) {
      return { success: false, message: err.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      // Registration never automatically logs in or issues a portal session
      return res;
    } catch (err) {
      return { success: false, message: err.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setStoredUser(res.user);
      }
    } catch (err) {
      console.error("Profile refresh failed:", err);
    }
  };

  // Rule 17: Logout leaves user unauthenticated
  const logout = () => {
    clearToken();
    clearStoredUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      demoAccounts,
      login,
      register,
      refreshProfile,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
