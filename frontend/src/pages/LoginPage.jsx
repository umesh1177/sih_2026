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
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  trainee: {
    label: "Trainee Officer",
    description: "Scientist 'B' / Scientific Assistant",
    icon: "🎓",
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700"
  },
  trainer: {
    label: "Senior Trainer",
    description: "Scientist 'E' / 'F' – Lead Forecaster",
    icon: "🧑‍🏫",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700"
  },
  admin: {
    label: "Administrator",
    description: "Director General / Deputy DG",
    icon: "🛡️",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700"
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
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => onLoginSuccess(), 800);
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
          setSuccess(res.message || "Registration submitted for admin approval!");
          setTimeout(() => onLoginSuccess(), 1200);
        } else {
          setError(res.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (acc) => {
    switchAccount(acc);
    onLoginSuccess();
  };

  const roleConf = ROLE_CONFIG[selectedRole];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050f2c] via-[#0a2558] to-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* ─── Left Panel: Brand & Info ─── */}
      <div className="lg:w-1/2 flex flex-col justify-between p-10 lg:p-16 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        {/* Logo & Brand */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-200/70 hover:text-white text-xs font-semibold mb-10 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Homepage
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white text-[#0a2558] flex items-center justify-center font-black text-2xl shadow-xl">
              Q
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-tight">CAPACITY CONNECT</h1>
              <p className="text-blue-200/70 text-xs font-medium">MoES • India Meteorological Department</p>
            </div>
          </div>

          <div className="space-y-2 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Smart Education • SIH Problem ID: 26075
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mt-3">
              Digital Capacity<br />
              <span className="text-sky-300">Building Portal</span>
            </h2>
            <p className="text-sm text-blue-100/80 leading-relaxed max-w-sm mt-3">
              Unified LMS for MoES & IMD officers — AI-powered assessments, proctored kiosk quizzes, competency mapping, and official certifications.
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🔐", label: "Secure RBAC Auth" },
              { icon: "🤖", label: "AI Question Generator" },
              { icon: "📊", label: "Competency Radar" },
              { icon: "🏆", label: "Official Certifications" },
              { icon: "🎯", label: "Kiosk Proctored Exams" },
              { icon: "📚", label: "Trainer Library" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs font-semibold text-blue-100">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="mt-10 flex items-center gap-2 text-[11px] text-blue-200/50 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Ministry of Earth Sciences, Government of India • Secured Portal</span>
        </div>
      </div>

      {/* ─── Right Panel: Auth Form ─── */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Tab switcher */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  mode === "login"
                    ? "text-[#0a2558] border-b-2 border-[#0a2558]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  mode === "register"
                    ? "text-[#0a2558] border-b-2 border-[#0a2558]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </div>

            <div className="p-7 space-y-5">
              {/* Role selector */}
              <div>
                <p className="text-xs font-bold text-slate-600 mb-2.5 uppercase tracking-wider">Select Your Role</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, conf]) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        selectedRole === role
                          ? `${conf.border} ${conf.bg} ring-2 ring-offset-1 ring-current`
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="text-xl mb-1">{conf.icon}</div>
                      <p className={`text-[10px] font-black leading-tight ${selectedRole === role ? conf.text : "text-slate-600"}`}>
                        {conf.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder="Dr. Firstname Lastname"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    placeholder="firstname.lastname@imd.gov.in"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password {mode === "login" && <span className="font-normal text-slate-400">(optional for demo)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder={mode === "login" ? "Enter password or leave blank for demo" : "Create a secure password"}
                      className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={e => update("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                        <input
                          type="text"
                          value={form.department}
                          onChange={e => update("department", e.target.value)}
                          placeholder="e.g., NWP Division"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation</label>
                        <input
                          type="text"
                          value={form.designation}
                          onChange={e => update("designation", e.target.value)}
                          placeholder="e.g., Scientist 'B'"
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Qualifications</label>
                      <input
                        type="text"
                        value={form.qualifications}
                        onChange={e => update("qualifications", e.target.value)}
                        placeholder="e.g., M.Sc. Physics, PG Diploma Meteorology"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                      />
                    </div>
                  </>
                )}

                {/* Error / Success alerts */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-sm font-black text-white shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-r ${roleConf.color} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : mode === "login" ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                    ? `Sign In as ${roleConf.label}`
                    : `Register as ${roleConf.label}`}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or fast demo access</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Demo fast-switch buttons */}
              <div className="grid grid-cols-3 gap-2">
                {demoAccounts.slice(0, 3).map((acc, i) => {
                  const roleKey = acc.user.role;
                  const conf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.trainee;
                  return (
                    <button
                      key={i}
                      onClick={() => handleDemoLogin(acc)}
                      className={`p-2.5 rounded-xl border text-center transition-all hover:shadow-md active:scale-95 ${conf.bg} ${conf.border}`}
                    >
                      <div className="text-lg mb-0.5">{conf.icon}</div>
                      <p className={`text-[9px] font-black ${conf.text} uppercase tracking-wide`}>{conf.label}</p>
                      <p className="text-[8px] text-slate-400 font-medium mt-0.5">Demo Login</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-blue-200/40 mt-5 font-medium">
            Secured by MoES RBAC • All data encrypted in transit
          </p>
        </div>
      </div>
    </div>
  );
};
