import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, clearToken, getStoredUser, setStoredUser, clearStoredUser, getToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Load persisted user on mount (survives page refresh)
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredUser();
    if (stored) return stored;
    // Default demo user for hackathon judges
    return {
      id: "u_trainer_1",
      name: "Dr. Amit Sengupta",
      email: "amit.sengupta@imd.gov.in",
      role: "trainer",
      department: "Numerical Weather Prediction Division, New Delhi",
      designation: "Scientist 'F' & Senior Meteorologist",
      specialization: ["Numerical Weather Prediction", "WRF / GFS Modeling", "Ensemble Prediction"],
      experienceYears: 18,
      status: "approved",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    };
  });

  const [loading, setLoading] = useState(false);

  // Demo Fast Switcher Accounts for Judges & Reviewers
  const demoAccounts = [
    {
      role: "trainer",
      label: "Trainer (Dr. Amit Sengupta - NWP)",
      email: "amit.sengupta@imd.gov.in",
      user: {
        id: "u_trainer_1",
        name: "Dr. Amit Sengupta",
        email: "amit.sengupta@imd.gov.in",
        role: "trainer",
        department: "Numerical Weather Prediction Division, New Delhi",
        designation: "Scientist 'F' & Senior Meteorologist",
        specialization: ["Numerical Weather Prediction", "WRF / GFS Modeling", "Ensemble Prediction"],
        experienceYears: 18,
        status: "approved",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
      }
    },
    {
      role: "trainee",
      label: "Trainee (Rahul Sharma - Scientist 'B')",
      email: "rahul.sharma@imd.gov.in",
      user: {
        id: "u_trainee_1",
        name: "Rahul Sharma",
        email: "rahul.sharma@imd.gov.in",
        role: "trainee",
        department: "Meteorological Centre, Jaipur",
        designation: "Scientist 'B' (Trainee)",
        status: "approved",
        interests: ["NWP Models", "Satellite Imagery", "Severe Weather Warnings"],
        skills: ["Python for Meteorology", "Synoptic Analysis", "QGIS", "Data Assimilation"],
        qualifications: "M.Sc. Physics (University of Rajasthan), Advanced PG Diploma in Meteorology",
        experience: "2 years as Trainee Scientific Assistant at IMD Jaipur Field Station.",
        certificates: [],
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"
      }
    },
    {
      role: "trainee_pending",
      label: "Trainee (Aniket Deshmukh - Pending Approval)",
      email: "aniket.d@imd.gov.in",
      user: {
        id: "u_trainee_pending",
        name: "Aniket Deshmukh",
        email: "aniket.d@imd.gov.in",
        role: "trainee",
        department: "Regional Meteorological Centre, Mumbai",
        designation: "Scientific Assistant Grade-II",
        status: "pending",
        interests: ["Urban Flood Forecasting", "Nowcasting", "Doppler Radar"],
        skills: ["Surface Observations", "AWS Data Analysis"],
        qualifications: "B.Sc. Physics (Mumbai University)",
        experience: "1 year field station maintenance.",
        certificates: [],
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250"
      }
    },
    {
      role: "admin",
      label: "Admin (Director General Admin)",
      email: "admin@imd.gov.in",
      user: {
        id: "u_admin_1",
        name: "Dr. Mrutyunjay Mohapatra",
        email: "admin@imd.gov.in",
        role: "admin",
        department: "Directorate General of Meteorology, New Delhi",
        designation: "Director General & Chief Admin",
        status: "approved",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
      }
    }
  ];

  const switchAccount = async (accountObj) => {
    const user = accountObj.user;
    setCurrentUser(user);
    setStoredUser(user);
    // Use a demo token for fast-switch accounts
    setToken(`demo-jwt-token-${user.id}`);

    // Dynamically fetch fresh data from backend
    if (user.id) {
      try {
        const fresh = await api.getProfile(user.id);
        if (fresh.success && fresh.user) {
          setCurrentUser(fresh.user);
          setStoredUser(fresh.user);
        }
      } catch (e) {
        console.warn("Could not fetch fresh profile on switch:", e);
      }
    }
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await api.login(email, password, role);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setStoredUser(res.user);
        if (res.token) setToken(res.token);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setStoredUser(res.user);
        if (res.token) setToken(res.token);
        return { success: true, message: res.message, user: res.user };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.getProfile(currentUser.id);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setStoredUser(res.user);
      }
    } catch (err) {
      console.error("Profile refresh failed:", err);
    }
  };

  const logout = () => {
    clearToken();
    clearStoredUser();
    // Revert to default demo trainer
    const defaultUser = demoAccounts[0].user;
    setCurrentUser(defaultUser);
    setStoredUser(defaultUser);
    setToken(`demo-jwt-token-${defaultUser.id}`);
  };

  // On mount: ensure token exists and fetch fresh user profile from backend
  useEffect(() => {
    const token = getToken();
    if (!token && currentUser?.id) {
      setToken(`demo-jwt-token-${currentUser.id}`);
    }
    if (currentUser?.id) {
      refreshProfile();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      demoAccounts,
      switchAccount,
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
