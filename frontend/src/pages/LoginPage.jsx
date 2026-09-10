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
  Award,
  GraduationCap,
  BookOpen,
  UserCheck,
  Compass
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  trainee: {
    label: "Trainee Officer",
    sublabel: "Scientist 'B' / Assistant",
    icon: "🎓",
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    ring: "ring-blue-500"
  },
  trainer: {
    label: "Senior Trainer",
    sublabel: "Scientist 'E' / 'F' – Lead",
    icon: "🧑‍🏫",
    color: "from-indigo-600 to-violet-600",
    bg: "bg-indigo-50",
    border: "border-indigo-300",
    text: "text-indigo-700",
    ring: "ring-indigo-500"
  },
  admin: {
    label: "Administrator",
    sublabel: "Director General / Dy. DG",
    icon: "🛡️",
    color: "from-teal-600 to-emerald-600",
    bg: "bg-teal-50",
    border: "border-teal-300",
    text: "text-teal-700",
    ring: "ring-teal-500"
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Top Header Breadcrumb bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-600" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Official MoES Single Sign-On Portal</span>
        </div>
      </header>

      {/* Main Two-Column Auth View */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 max-w-6xl mx-auto w-full gap-8 lg:gap-14">
        
        {/* ─── Left Column: Brand & Value Prop ─── */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900 tracking-tight">CAPACITY CONNECT</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase">
                  MoES • IMD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">National Meteorological Digital Capacity Building System</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>MoES Official Training & Competency Verification</span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Access the National Meteorological <span className="text-blue-600">Learning Framework</span>
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Unified digital training environment for <b>Ministry of Earth Sciences (MoES)</b> and <b>India Meteorological Department (IMD)</b> officers. Complete standardized curricula, proctored assessments, and official certifications.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: "🔐", label: "RBAC Verified Auth", desc: "Trainee, Trainer & Admin" },
              { icon: "🎓", label: "Interactive Studios", desc: "Lectures & AI Summaries" },
              { icon: "🛡️", label: "Proctored Kiosk Exams", desc: "Fullscreen Tab-Locked" },
              { icon: "📜", label: "Verified Credentials", desc: "QR & Cryptographic URL" }
            ].map((f, i) => (
              <div key={i} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{f.icon}</span>
                  <span className="text-xs font-bold text-slate-900">{f.label}</span>
                </div>
                <p className="text-[11px] text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Demo Login Chips Box */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">
                ⚡ 1-Click Fast Demo Login:
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">No Password Required</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.slice(0, 3).map((acc, i) => {
                const roleKey = acc.user.role;
                const conf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.trainee;
                return (
                  <button
                    key={i}
                    onClick={() => handleDemoLogin(acc)}
                    className={`p-2.5 rounded-xl border text-center transition-all hover:shadow-md active:scale-95 bg-white hover:bg-slate-50 ${conf.border} group`}
                  >
                    <div className="text-lg mb-0.5">{conf.icon}</div>
                    <p className={`text-[10px] font-black ${conf.text} truncate`}>{acc.user.name.split(" ")[0]}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{acc.user.role}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ─── Right Column: Clean Elevated Auth Form ─── */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Mode Switcher Tabs (Sign In / Register) */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  mode === "login"
                    ? "bg-white text-[#0a2558] shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>Officer Sign In</span>
              </button>
              
              <button
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all ${
                  mode === "register"
                    ? "bg-white text-[#0a2558] shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Register Account</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              
              {/* Role Selector Grid */}
              <div>
                <p className="text-[11px] font-extrabold text-slate-600 mb-2 uppercase tracking-wider">
                  Select Designation Cadre:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, conf]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        selectedRole === role
                          ? `${conf.border} ${conf.bg} ring-2 ${conf.ring} shadow-sm`
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="text-xl mb-1">{conf.icon}</div>
                      <p className={`text-[10px] font-black leading-tight ${selectedRole === role ? conf.text : "text-slate-700"}`}>
                        {conf.label}
                      </p>
                      <p className="text-[8px] text-slate-400 mt-0.5 truncate">{conf.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name & Title *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder="e.g., Dr. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official NIC / MoES Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    placeholder="e.g., rahul.sharma@imd.gov.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password {mode === "login" && <span className="font-normal text-slate-400">(optional for demo accounts)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder={mode === "login" ? "Enter password or leave blank for demo" : "Create a secure password"}
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={e => update("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Department / Division</label>
                        <input
                          type="text"
                          value={form.department}
                          onChange={e => update("department", e.target.value)}
                          placeholder="e.g., NWP Division"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Cadre / Designation</label>
                        <input
                          type="text"
                          value={form.designation}
                          onChange={e => update("designation", e.target.value)}
                          placeholder="e.g., Scientist 'B'"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Feedback Alerts */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 bg-gradient-to-r ${roleConf.color} disabled:opacity-70 disabled:cursor-not-allowed`}
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
        </div>

      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD) • National LMS
      </footer>

    </div>
  );
};
