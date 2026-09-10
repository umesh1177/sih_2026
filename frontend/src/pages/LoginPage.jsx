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
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    activeBtn: "bg-blue-600 hover:bg-blue-700 text-white",
    cardBorder: "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",
    roleName: "Rahul Sharma",
    desc: "Scientist 'B' Trainee"
  },
  trainer: {
    label: "Senior Trainer",
    sublabel: "Scientist 'E' / 'F' – Lead",
    icon: Users,
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    activeBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    cardBorder: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/40",
    roleName: "Dr. Amit Sengupta",
    desc: "Scientist 'F' Lead Faculty"
  },
  admin: {
    label: "Administrator",
    sublabel: "Director General / Admin",
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    cardBorder: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40",
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* ─── TOP NAVBAR ─── */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors group border border-slate-200"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-600" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">MoES–IMD National Capacity Building System</span>
        </div>
      </header>

      {/* ─── MAIN CENTERED LOGIN CONTAINER ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">
            <Building2 className="w-3.5 h-3.5" />
            <span>Ministry of Earth Sciences • India Meteorological Department</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Portal Authentication Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Choose 1-Click Fast Login for judging demonstration or sign in with your official cadre account.
          </p>
        </div>

        {/* ─── 1. QUICK 1-CLICK DEMO LOGIN CARDS (TRAINEE, TRAINER, ADMIN) ─── */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fast 1-Click Demo Login</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">No password needed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {demoAccounts.slice(0, 3).map((acc, idx) => {
              const roleKey = acc.user.role;
              const conf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.trainee;
              const Icon = conf.icon;

              return (
                <button
                  key={idx}
                  onClick={() => handleDemoLogin(acc)}
                  className={`bg-white p-4 rounded-2xl border ${conf.cardBorder} shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group active:scale-95 space-y-3 cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${conf.badge}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${conf.badge}`}>
                      {roleKey}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {acc.user.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {conf.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 pt-1 border-t border-slate-100">
                    <span>Sign In Now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 2. MAIN SIGN IN / REGISTRATION CARD ─── */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                mode === "login"
                  ? "bg-white text-blue-700 shadow-xs font-black border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Officer Sign In</span>
            </button>
            
            <button
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                mode === "register"
                  ? "bg-white text-blue-700 shadow-xs font-black border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            
            {/* Role Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-[11px] font-bold leading-tight">{conf.label}</span>
                    </button>
                  );
                })}
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
                    placeholder="e.g., Dr. Rajesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official NIC / MoES Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="e.g., officer@imd.gov.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password {mode === "login" && <span className="font-normal text-slate-400">(optional for demo)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    placeholder={mode === "login" ? "Enter password or leave blank" : "Create password"}
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
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
                className={`w-full py-3 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 ${roleConf.activeBtn} disabled:opacity-70 disabled:cursor-not-allowed`}
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
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        Ministry of Earth Sciences (MoES) • India Meteorological Department (IMD) • Capacity Building Framework
      </footer>

    </div>
  );
};
