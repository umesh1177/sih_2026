import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Users,
  Award,
  Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  trainee: {
    label: "Trainee Officer",
    sublabel: "Scientist 'B' / Assistant",
    icon: GraduationCap,
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-blue-300 hover:bg-blue-50/20",
    roleName: "Rahul Sharma",
    desc: "Scientist 'B' Trainee"
  },
  trainer: {
    label: "Senior Trainer",
    sublabel: "Scientist 'E' / 'F' – Lead",
    icon: Users,
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20",
    roleName: "Dr. Amit Sengupta",
    desc: "Scientist 'F' Lead Faculty"
  },
  admin: {
    label: "Administrator",
    sublabel: "Director General / Admin",
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20",
    roleName: "Dr. M. Mohapatra",
    desc: "Director General / Admin"
  }
};

export const LoginPage = ({ onLoginSuccess, onBack }) => {
  const { login, register, demoAccounts, switchAccount } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [selectedRole, setSelectedRole] = useState("trainer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    designation: "",
    qualifications: "",
    experience: ""
  });

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!form.name.trim()) return setError("Full name is required.");
      if (!form.email.trim()) return setError("Email address is required.");
      if (form.password && form.password !== form.confirmPassword) {
        return setError("Passwords do not match.");
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const res = await login(form.email, form.password, selectedRole);
        if (res.success) {
          setSuccess("Login successful! Redirecting to dashboard...");
          setTimeout(() => onLoginSuccess(), 600);
        } else {
          setError(res.message || "Login failed. Please check your credentials.");
        }
      } else {
        const res = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: selectedRole,
          department: form.department,
          designation: form.designation,
          qualifications: form.qualifications,
          experience: form.experience
        });
        if (res.success) {
          setSuccess(res.message || "Registration submitted! Redirecting to portal...");
          setTimeout(() => onLoginSuccess(), 1000);
        } else {
          setError(res.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (acc) => {
    switchAccount(acc);
    onLoginSuccess();
  };

  const roleConf = ROLE_CONFIG[selectedRole] || ROLE_CONFIG.trainee;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius)] hover:bg-slate-100 transition-colors group border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-700" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">MoES–IMD National Capacity Building Portal</span>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-xl mx-auto w-full space-y-5">
        
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-800">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Ministry of Earth Sciences • India Meteorological Department</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Portal Authentication
          </h1>
          <p className="text-xs text-slate-500 font-normal max-w-md mx-auto">
            Choose 1-Click Fast Login for demonstration or sign in with your official account.
          </p>
        </div>

        {/* 1. Quick 1-Click Demo Login Cards */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fast 1-Click Demo Login</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">No password required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {demoAccounts.slice(0, 3).map((acc, idx) => {
              const roleKey = acc.user.role;
              const conf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.trainee;
              const Icon = conf.icon;

              return (
                <button
                  key={idx}
                  onClick={() => handleDemoLogin(acc)}
                  className={`bg-white p-3.5 rounded-[var(--radius)] border ${conf.cardBorder} shadow-2xs hover:shadow-sm transition-all text-left flex flex-col justify-between group cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-8 h-8 rounded-[var(--radius)] flex items-center justify-center ${conf.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${conf.badge}`}>
                      {roleKey}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {acc.user.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {conf.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-blue-700 pt-1.5 border-t border-slate-100">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Main Sign In / Registration Card */}
        <div className="w-full bg-white rounded-[var(--radius)] shadow-2xs border border-slate-200 overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 gap-1">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-xs font-medium rounded-[var(--radius)] flex items-center justify-center gap-1.5 transition-all ${
                mode === "login"
                  ? "bg-white text-blue-800 shadow-2xs font-semibold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Officer Sign In</span>
            </button>
            
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-xs font-medium rounded-[var(--radius)] flex items-center justify-center gap-1.5 transition-all ${
                mode === "register"
                  ? "bg-white text-blue-800 shadow-2xs font-semibold border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Role Selector */}
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                Cadre Designation:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ROLE_CONFIG).map(([role, conf]) => {
                  const Icon = conf.icon;
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-2 rounded-[var(--radius)] border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 text-blue-900 font-medium"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-normal"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-700" : "text-slate-400"}`} />
                      <span className="text-[11px] leading-tight">{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name & Title *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    placeholder="e.g., Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="e.g., officer@imd.gov.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password {mode === "login" && <span className="font-normal text-slate-400">(optional for demo)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    placeholder={mode === "login" ? "Enter password or leave blank" : "Create password"}
                    className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={e => update("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Department / Division</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={e => update("department", e.target.value)}
                        placeholder="e.g., NWP Division"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={form.designation}
                        onChange={e => update("designation", e.target.value)}
                        placeholder="e.g., Scientist 'B'"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Feedback Alerts */}
              {error && (
                <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-[var(--radius)] text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}
              
              {success && (
                <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-[var(--radius)] text-xs text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-[var(--radius)] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all ${roleConf.activeBtn} disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === "login" ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {loading
                    ? "Authenticating..."
                    : mode === "login"
                    ? `Sign In as ${roleConf.label}`
                    : `Submit Registration for ${roleConf.label}`}
                </span>
              </button>

            </form>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD) • Capacity Building Framework
      </footer>

    </div>
  );
};

