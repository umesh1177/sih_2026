import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Clock3,
  KeyRound,
  FileText
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

    if (!form.name.trim()) return setError("Full Name is mandatory.");
    if (!form.employeeId.trim()) return setError("Official Employee ID is mandatory.");
    if (!form.email.trim()) return setError("Official Email is mandatory.");
    if (!form.designation.trim()) return setError("Official Designation is mandatory.");
    if (!isPasswordStrong) {
      return setError("Password does not meet the mandatory security requirements (8+ chars, uppercase, lowercase, number, special char).");
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
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between">
      {/* Top Institutional Header Bar */}
      <header className="bg-white border-b border-[#D9E2EC] px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#164E63] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
            CC
          </div>
          <div>
            <span className="font-bold text-xs text-[#164E63] uppercase tracking-tight block">CAPACITY CONNECT</span>
            <span className="text-[11px] text-[#64748B] block">Ministry of Earth Sciences • India Meteorological Department</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Public Portal</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Institutional Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-[#164E63] border border-cyan-200">
                <Building2 className="w-3.5 h-3.5" />
                Problem Statement ID: 26075
              </span>
              <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                Capacity Building & LMS Portal
              </h1>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Centralized digital capacity development platform for atmospheric scientists, operational meteorologists, and technical personnel across MoES institutes.
              </p>
            </div>

            {/* Key Pillars */}
            <div className="space-y-2.5">
              {[
                { title: "Role-Scoped Access Control", desc: "Role-based views for Trainees, Trainers, and Administrative officers." },
                { title: "Controlled Assessments", desc: "Timed evaluations with server-side scoring and integrity monitoring." },
                { title: "5-Factor Competency Mapping", desc: "Transparent rule-based scoring for operational mission deployment." },
                { title: "Verified Credentials", desc: "Publicly verifiable digital certificates with cryptographic SHA-256 validation." },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-[#D9E2EC] flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                    ✓
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-[#1E293B]">{item.title}</h2>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-2 text-[11px] text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>Official prototype environment • Secure password authentication</span>
            </div>
          </div>

          {/* Right Column: Login & Register Box */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg border border-[#D9E2EC] shadow-sm overflow-hidden">
              {/* Top Mode Selector Tabs */}
              <div className="grid grid-cols-2 border-b border-[#D9E2EC] bg-[#F8FAFC]">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    mode === "login"
                      ? "text-[#1D4ED8] bg-white border-[#1D4ED8]"
                      : "text-[#64748B] border-transparent hover:text-[#1E293B]"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Officer Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    mode === "register"
                      ? "text-[#1D4ED8] bg-white border-[#1D4ED8]"
                      : "text-[#64748B] border-transparent hover:text-[#1E293B]"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Official Registration</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-[#B91C1C] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ═══════════ SIGN IN FORM ═══════════ */}
                {mode === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                        Official Email Address <span className="text-[#B91C1C]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => update("email", e.target.value)}
                        placeholder="e.g. amit.sengupta@imd.gov.in"
                        className="w-full px-3 py-2 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                        Account Password <span className="text-[#B91C1C]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={form.password}
                          onChange={e => update("password", e.target.value)}
                          placeholder="Enter your account password"
                          className="w-full px-3 py-2 pr-9 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
                    </button>

                    {/* Quick Demo Credentials Panel */}
                    <div className="pt-4 border-t border-[#D9E2EC]">
                      <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                        Demonstration Accounts (Password: Password@123)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {demoAccounts.map((acc, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleDemoClick(acc)}
                            className={`p-2 rounded border text-left transition-colors text-xs ${
                              form.email === acc.email
                                ? "bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]"
                                : "bg-[#F8FAFC] border-[#D9E2EC] text-[#1E293B] hover:border-slate-400"
                            }`}
                          >
                            <span className="block font-semibold truncate text-[11px]">{acc.label.split("(")[0]}</span>
                            <span className="block text-[10px] text-[#64748B] truncate">{acc.email}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                ) : (
                  /* ═══════════ REGISTRATION FORM ═══════════ */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                        Requested Account Type <span className="text-[#B91C1C]">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => update("role", "trainee")}
                          className={`p-2.5 rounded border text-left transition-colors ${
                            form.role === "trainee"
                              ? "bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]"
                              : "bg-white border-[#D9E2EC] text-[#1E293B] hover:border-slate-300"
                          }`}
                        >
                          <p className="font-semibold text-xs">Trainee / Cadet</p>
                          <p className="text-[11px] text-[#64748B]">Scientist 'B' / Technical Staff</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => update("role", "trainer")}
                          className={`p-2.5 rounded border text-left transition-colors ${
                            form.role === "trainer"
                              ? "bg-blue-50 border-[#1D4ED8] text-[#1D4ED8]"
                              : "bg-white border-[#D9E2EC] text-[#1E293B] hover:border-slate-300"
                          }`}
                        >
                          <p className="font-semibold text-xs">Trainer / Instructor</p>
                          <p className="text-[11px] text-[#64748B]">Faculty / Senior Forecaster</p>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Full Name <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => update("name", e.target.value)}
                          placeholder="e.g. Dr. Ramesh Gupta"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Official Employee ID <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.employeeId}
                          onChange={e => update("employeeId", e.target.value)}
                          placeholder="e.g. MOES-MET-2026-901"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Official Email <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={e => update("email", e.target.value)}
                          placeholder="name@imd.gov.in"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => update("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Department / Division <span className="text-[#B91C1C]">*</span>
                        </label>
                        <select
                          value={form.department}
                          onChange={e => update("department", e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        >
                          <option value="Numerical Weather Prediction Division">Numerical Weather Prediction Division</option>
                          <option value="Radar & Satellite Meteorology Division">Radar & Satellite Meteorology Division</option>
                          <option value="Cyclone Warning & Marine Division">Cyclone Warning & Marine Division</option>
                          <option value="Agrometeorological Advisory Division">Agrometeorological Advisory Division</option>
                          <option value="Seismology & Marine Observatories">Seismology & Marine Observatories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Designation <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.designation}
                          onChange={e => update("designation", e.target.value)}
                          placeholder="e.g. Scientist 'B' / Forecaster"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Password <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={form.password}
                          onChange={e => update("password", e.target.value)}
                          placeholder="Create password"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                          Confirm Password <span className="text-[#B91C1C]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={form.confirmPassword}
                          onChange={e => update("confirmPassword", e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>

                    {/* Password Policy Checks */}
                    <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#D9E2EC] space-y-1 text-[11px]">
                      <p className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px]">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[#64748B]">
                        <span className={hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                          {hasMinLength ? "✓" : "○"} Min 8 characters
                        </span>
                        <span className={hasUpper ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                          {hasUpper ? "✓" : "○"} Uppercase letter
                        </span>
                        <span className={hasLower ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                          {hasLower ? "✓" : "○"} Lowercase letter
                        </span>
                        <span className={hasNumber && hasSpecial ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                          {hasNumber && hasSpecial ? "✓" : "○"} Number & Symbol
                        </span>
                      </div>
                    </div>

                    {/* Service Declaration */}
                    <label className="flex items-start gap-2 p-2.5 bg-slate-50 rounded border border-[#D9E2EC] cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={form.declarationAccepted}
                        onChange={e => update("declarationAccepted", e.target.checked)}
                        className="mt-0.5 rounded text-[#1D4ED8] focus:ring-[#1D4ED8]"
                      />
                      <span className="text-[11px] text-[#475569] leading-tight">
                        I declare that all provided employee information is accurate. I understand my account will require administrative review before activation.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      <span>Submit for Verification</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#D9E2EC] bg-white py-3 px-6 text-center text-xs text-[#64748B]">
        CAPACITY CONNECT • Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD) • SIH 2026
      </footer>

      {/* Pending Registration Modal */}
      {registrationPendingModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border border-[#D9E2EC] shadow-lg text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
              <Clock3 className="w-6 h-6" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                PENDING VERIFICATION
              </span>
              <h3 className="text-base font-bold text-[#1E293B] mt-2">Registration Queued for Approval</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Application for <b>{registrationPendingModal.name}</b> ({registrationPendingModal.employeeId}) is under administrative review.
              </p>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded border border-[#D9E2EC] text-left text-xs space-y-1 text-[#64748B]">
              <p>Department: <b className="text-[#1E293B]">{registrationPendingModal.department}</b></p>
              <p>Role: <b className="text-[#1E293B] uppercase">{registrationPendingModal.role}</b></p>
              <p>Email: <b className="text-[#1E293B]">{registrationPendingModal.email}</b></p>
            </div>

            <button
              onClick={() => {
                setRegistrationPendingModal(null);
                setMode("login");
              }}
              className="w-full py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded text-xs transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
