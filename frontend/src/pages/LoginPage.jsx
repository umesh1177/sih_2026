import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  FileCheck2,
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage = ({ onLoginSuccess, onBack }) => {
  const { login, register, demoAccounts } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationPendingModal, setRegistrationPendingModal] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    phone: "",
    organization: "India Meteorological Department (IMD)",
    department: "Numerical Weather Prediction Division",
    designation: "",
    role: "trainee", // "trainee" or "trainer" ONLY (No admin self-registration)
    password: "",
    confirmPassword: "",
    declarationAccepted: false
  });

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setError("");
  };

  // Password Strength Criteria
  const pwd = form.password || "";
  const hasMinLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) return setError("Official Email is required.");
    if (!form.password.trim()) return setError("Password is mandatory.");

    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res.success) {
        onLoginSuccess();
      } else {
        if (res.status === "pending") {
          setError("Your account is currently PENDING organizational verification. You cannot access the portal until an administrator approves your profile.");
        } else {
          setError(res.message || "Invalid email or password.");
        }
      }
    } catch (err) {
      setError("Unable to communicate with authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Form Validations
    if (!form.name.trim()) return setError("Full Name is mandatory.");
    if (!form.employeeId.trim()) return setError("Official Employee ID is mandatory.");
    if (!form.email.trim()) return setError("Official Email is mandatory.");
    if (!form.designation.trim()) return setError("Official Designation is mandatory.");
    if (!isPasswordStrong) {
      return setError("Password does not meet the mandatory government security requirements (8+ chars, uppercase, lowercase, number, special char).");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!form.declarationAccepted) {
      return setError("You must accept the official verification and service declaration.");
    }

    setLoading(true);
    try {
      const res = await register({
        name: form.name,
        employeeId: form.employeeId,
        email: form.email,
        phone: form.phone,
        organization: form.organization,
        department: form.department,
        designation: form.designation,
        role: form.role,
        password: form.password,
        confirmPassword: form.confirmPassword,
        declarationAccepted: form.declarationAccepted
      });

      if (res.success) {
        setRegistrationPendingModal({
          name: form.name,
          employeeId: form.employeeId,
          email: form.email,
          role: form.role,
          department: form.department
        });
      } else {
        setError(res.message || "Registration validation failed.");
      }
    } catch (err) {
      setError("Registration error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (acc) => {
    update("email", acc.email);
    update("password", acc.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050f2c] via-[#0a2558] to-slate-900 flex flex-col lg:flex-row overflow-y-auto">
      {/* ─── Left Branding Panel ─── */}
      <div className="lg:w-5/12 flex flex-col justify-between p-8 lg:p-14 relative overflow-hidden text-white">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-200/70 hover:text-white text-xs font-semibold mb-8 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Public Portal Home
          </button>

          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-blue-200 to-white text-[#0a2558] flex items-center justify-center font-black text-xl shadow-xl shrink-0">
              CC
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white uppercase">CAPACITY CONNECT</h1>
              <p className="text-blue-200/70 text-[11px] font-medium">Ministry of Earth Sciences • IMD</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Smart Education • SIH Problem ID: 26075</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight mt-2">
              Institutional Capacity Building & LMS
            </h2>
            <p className="text-xs text-blue-100/80 leading-relaxed max-w-md mt-2">
              Official capacity building platform for operational meteorologists, atmospheric scientists, and cadet officers of MoES institutes.
            </p>
          </div>

          {/* Feature Pillars */}
          <div className="space-y-2.5">
            {[
              { icon: "🏛️", title: "Organization-Scoped Authorization", desc: "Granular administrative boundaries across IMD HQ and regional centres." },
              { icon: "🎯", title: "Controlled Kiosk Assessments", desc: "Integrity-monitored evaluations with timed windows and server-side grading." },
              { icon: "📊", title: "Explainable Competency Engine", desc: "5-factor rule-based faculty matching with transparent scoring rationale." },
              { icon: "📜", title: "QR-Verifiable Digital Certificates", desc: "Accredited credentials issued upon verified full course completion." },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs flex items-start gap-3">
                <span className="text-base shrink-0">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-white text-xs">{item.title}</h4>
                  <p className="text-[11px] text-blue-200/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-blue-200/50">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secured Government LMS Prototype • All authentication strictly validated</span>
        </div>
      </div>

      {/* ─── Right Authentication Panel ─── */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Top Mode Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                mode === "login"
                  ? "text-[#0a2558] bg-white border-b-2 border-[#0a2558] shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Officer Sign In</span>
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                mode === "register"
                  ? "text-[#0a2558] bg-white border-b-2 border-[#0a2558] shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Official Registration</span>
            </button>
          </div>

          <div className="p-7 space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* ═══════════ LOGIN MODE ═══════════ */}
            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    placeholder="e.g. amit.sengupta@imd.gov.in"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder="Enter your secure password"
                      className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] transition-all"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{loading ? "Verifying Credentials..." : "Authenticate & Access Portal"}</span>
                </button>

                {/* SIH Fast Demo Credentials Selector */}
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    SIH Judging Prototype Demo Accounts (Password: Password@123)
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {demoAccounts.map((acc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleDemoClick(acc)}
                        className={`p-2 rounded-xl border text-left transition-all hover:border-[#0a2558] ${
                          form.email === acc.email ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <span className="block text-[10px] font-bold text-slate-800 truncate">{acc.label.split("(")[0]}</span>
                        <span className="block text-[9px] text-slate-500 truncate">{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            ) : (
              /* ═══════════ REGISTRATION MODE (PHASE 2) ═══════════ */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                {/* Account Type Selection (Trainee or Trainer ONLY - No Admin) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                    Requested Account Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => update("role", "trainee")}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        form.role === "trainee"
                          ? "bg-blue-50 border-[#0a2558] text-[#0a2558] ring-2 ring-[#0a2558]/10"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎓</span>
                        <div>
                          <p className="font-bold text-xs">Trainee Cadet</p>
                          <p className="text-[10px] text-slate-500">Scientist 'B' / Scientific Officer</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => update("role", "trainer")}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        form.role === "trainer"
                          ? "bg-blue-50 border-[#0a2558] text-[#0a2558] ring-2 ring-[#0a2558]/10"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧑‍🏫</span>
                        <div>
                          <p className="font-bold text-xs">Senior Trainer</p>
                          <p className="text-[10px] text-slate-500">Lead Forecaster / Scientist 'E'/'F'</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder="Dr. / Cadet Full Name"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={form.employeeId}
                      onChange={e => update("employeeId", e.target.value)}
                      placeholder="e.g. MOES-MET-2026-7819"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => update("email", e.target.value)}
                      placeholder="firstname.lastname@imd.gov.in"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Contact Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department / Centre *</label>
                    <select
                      value={form.department}
                      onChange={e => update("department", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-[#0a2558]/20"
                    >
                      <option value="Numerical Weather Prediction Division">Numerical Weather Prediction Division (IMD HQ)</option>
                      <option value="Radar & Satellite Meteorology Division">Radar & Satellite Meteorology Division</option>
                      <option value="Cyclone Warning & Marine Division">Cyclone Warning & Marine Division (CWC Visakhapatnam)</option>
                      <option value="Agrometeorological Advisory Division">Agrometeorological Advisory Division (IMD Pune)</option>
                      <option value="Seismology & Marine Observatories">Seismology & Marine Observatories (IMD Mumbai)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Designation *</label>
                    <input
                      type="text"
                      required
                      value={form.designation}
                      onChange={e => update("designation", e.target.value)}
                      placeholder="e.g. Scientist 'B' / Lead Forecaster"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>
                </div>

                {/* Password & Complexity Check */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder="Create secure password"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={e => update("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0a2558]/20"
                    />
                  </div>
                </div>

                {/* Password Policy Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[10px]">
                  <p className="font-bold text-slate-700 uppercase tracking-wider">Password Complexity Requirements:</p>
                  <div className="grid grid-cols-2 gap-1 text-slate-600">
                    <span className={hasMinLength ? "text-emerald-700 font-bold" : "text-slate-400"}>
                      {hasMinLength ? "✓" : "○"} Min 8 characters
                    </span>
                    <span className={hasUpper ? "text-emerald-700 font-bold" : "text-slate-400"}>
                      {hasUpper ? "✓" : "○"} Uppercase letter
                    </span>
                    <span className={hasLower ? "text-emerald-700 font-bold" : "text-slate-400"}>
                      {hasLower ? "✓" : "○"} Lowercase letter
                    </span>
                    <span className={hasNumber && hasSpecial ? "text-emerald-700 font-bold" : "text-slate-400"}>
                      {hasNumber && hasSpecial ? "✓" : "○"} Number & Special symbol
                    </span>
                  </div>
                </div>

                {/* Verification Declaration Checkbox */}
                <label className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-xl border border-blue-100 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={form.declarationAccepted}
                    onChange={e => update("declarationAccepted", e.target.checked)}
                    className="mt-0.5 rounded text-[#0a2558] focus:ring-[#0a2558]"
                  />
                  <span className="text-[11px] text-slate-700 leading-tight">
                    I declare that the employee credentials provided above are accurate and understand my account will be submitted for <b>organizational verification</b> before access is granted.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Submit Registration for Organizational Verification</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── Registration Pending Modal (Rule 10) ─── */}
      {registrationPendingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
                STATUS: PENDING VERIFICATION
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Registration Submitted</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Your account application for <b>{registrationPendingModal.name}</b> ({registrationPendingModal.employeeId}) has been logged and queued for administrative approval.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
              <p className="text-slate-500">Department: <b className="text-slate-800">{registrationPendingModal.department}</b></p>
              <p className="text-slate-500">Requested Role: <b className="text-slate-800 uppercase">{registrationPendingModal.role}</b></p>
              <p className="text-slate-500">Official Email: <b className="text-slate-800">{registrationPendingModal.email}</b></p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setRegistrationPendingModal(null);
                  setMode("login");
                }}
                className="w-full py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
