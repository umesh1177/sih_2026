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
  ChevronRight,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Users,
  Award,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookOpen,
  FileCheck2,
  BadgeCheck,
  Compass,
  RefreshCw,
  Info,
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  trainee: {
    label: "Trainee Officer",
    sublabel: "Scientist 'B' / Meteorologist Gr-II",
    icon: GraduationCap,
    badge: "bg-blue-50 text-blue-800 border-blue-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-blue-300 hover:bg-blue-50/20",
    roleName: "Rahul Sharma",
    desc: "Scientist 'B' Trainee (MC Jaipur)"
  },
  trainer: {
    label: "Senior Trainer",
    sublabel: "Scientist 'E' / 'F' – Lead Faculty",
    icon: Users,
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20",
    roleName: "Dr. Amit Sengupta",
    desc: "Scientist 'F' Lead Faculty (NWP Div)"
  },
  admin: {
    label: "Administrator",
    sublabel: "Director General / Governance",
    icon: ShieldCheck,
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    activeBtn: "bg-[#0B3475] hover:bg-[#08285C] text-white",
    cardBorder: "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20",
    roleName: "Dr. M. Mohapatra",
    desc: "Director General / Chief Admin"
  }
};

const SALUTATIONS = ["Dr.", "Shri", "Smt.", "Ms.", "Prof.", "Mr."];

const IMD_DESIGNATIONS = {
  trainee: [
    "Scientist 'B' (Trainee)",
    "Meteorologist Grade-II",
    "Scientific Assistant (SA)",
    "Junior Research Fellow (JRF)",
    "Project Scientist-I"
  ],
  trainer: [
    "Scientist 'F' (Senior Faculty & Lead)",
    "Scientist 'E' (Head of Division)",
    "Scientist 'D' (Senior Meteorologist)",
    "Scientist 'C' (Operational Faculty)",
    "Director / Officer-in-Charge",
    "Visiting Professor / Emeritus Meteorologist"
  ],
  admin: [
    "Director General of Meteorology (DGM)",
    "Head of Centre & Chief Administrator",
    "Scientist 'G' / Training Coordinator",
    "Central Registrar & Governance Officer"
  ]
};

const IMD_DIVISIONS = [
  "Numerical Weather Prediction (NWP) Division",
  "Radar Meteorology & DWR Operations",
  "Satellite Meteorology & Remote Sensing (INSAT/GIS)",
  "Cyclone Warning Division (RSMC New Delhi)",
  "Aviation Meteorology Division (CAMD)",
  "Monsoon & Climate Dynamics Center",
  "Agromet Advisory & Weather Services (AAS)",
  "Hydrometeorology & Flood Forecasting",
  "Instruments & Observational Network Division",
  "Central Training Institute (CTI Pune)",
  "Information Technology & HPC Division",
  "Seismology & Earthquake Risk Evaluation"
];

const IMD_STATIONS = [
  "National Weather Forecasting Centre, IMD HQ New Delhi",
  "Central Training Institute (CTI Pune)",
  "Regional Meteorological Centre (RMC) New Delhi",
  "Regional Meteorological Centre (RMC) Mumbai",
  "Regional Meteorological Centre (RMC) Chennai",
  "Regional Meteorological Centre (RMC) Kolkata",
  "Regional Meteorological Centre (RMC) Guwahati",
  "Regional Meteorological Centre (RMC) Nagpur",
  "Meteorological Centre (MC) Jaipur",
  "Meteorological Centre (MC) Ahmedabad",
  "Meteorological Centre (MC) Bhubaneswar",
  "Meteorological Centre (MC) Hyderabad",
  "Meteorological Centre (MC) Bengaluru",
  "Meteorological Centre (MC) Thiruvananthapuram",
  "Meteorological Centre (MC) Patna",
  "Meteorological Centre (MC) Srinagar",
  "Meteorological Centre (MC) Shimla",
  "Meteorological Centre (MC) Dehradun",
  "Doppler Weather Radar (DWR) Station Cherrapunji",
  "Cyclone Warning Centre (CWC) Visakhapatnam",
  "Coastal Warning Station Paradip"
];

const IMD_ZONES = [
  "HQ & National Centers (New Delhi / Pune)",
  "North Zone (Delhi, UP, HP, J&K, Punjab, Haryana, Rajasthan)",
  "West Zone (Maharashtra, Gujarat, Goa)",
  "South Zone (Tamil Nadu, Kerala, Karnataka, Andhra, Telangana)",
  "East Zone (West Bengal, Odisha, Bihar, Jharkhand)",
  "North-East Zone (Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura)",
  "Central Zone (Madhya Pradesh, Chhattisgarh)"
];

const SPECIALIZATIONS = [
  "Numerical Weather Prediction (NWP) & Data Assimilation",
  "Doppler Weather Radar (DWR) Nowcasting & Severe Storms",
  "Satellite Image Interpretation & Remote Sensing (INSAT-3D/3DR)",
  "Tropical Cyclone Tracking & RSMC Warning Operations",
  "Monsoon Dynamics & Long-Range Climate Modeling",
  "Aviation Weather & Aerodrome Terminal Warnings (TAF/METAR)",
  "Agrometeorological Advisory & Crop-Weather Modeling",
  "Hydrometeorology & Urban Flood Forecasting",
  "Atmospheric Instrumentation & Automatic Weather Stations (AWS)",
  "AI/ML in Weather Intelligence & Physics-Informed Neural Models",
  "Synoptic Meteorology & Extreme Weather Diagnostics"
];

const HIGHEST_DEGREES = [
  "Ph.D. in Atmospheric Sciences / Meteorology",
  "Ph.D. in Physics / Applied Mathematics / Geophysics",
  "M.Tech in Atmospheric Sciences / Climate Science",
  "M.Sc. in Meteorology / Atmospheric Physics",
  "M.Sc. in Physics / Mathematics / Oceanography",
  "B.Tech in Computer Science / Geospatial Technology",
  "B.Sc. (Hons) in Physics / Mathematics"
];

const EXPERIENCE_TIERS = [
  "< 1 Year (Induction / Foundational Trainee)",
  "1 - 3 Years (Junior Scientific Officer)",
  "3 - 7 Years (Mid-level Operational Meteorologist)",
  "7 - 15 Years (Senior Scientific Officer / Faculty)",
  "15+ Years (Principal Scientist / Lead Specialist)"
];

const BATCH_YEARS = [
  "Batch 2026 - Foundational Induction (Meteorologist Gr-II & Sc-'B')",
  "Batch 2025 - Advanced In-Service Capacity Program",
  "Batch 2024 - Mid-Career Refresher & Specialized Ops",
  "Batch 2023 - Operational Competency Stream",
  "Executive Faculty & Mentorship Pool"
];

const SUGGESTED_SKILLS = [
  "WRF Modeling",
  "Synoptic Chart Analysis",
  "Python for Meteorology",
  "DWR Nowcasting",
  "INSAT Satellite GIS",
  "AWS Calibration",
  "GFS Ensemble Post-Processing",
  "Severe Weather Warning Dissemination",
  "Flood Forecasting",
  "QGIS / ArcGIS",
  "Atmospheric Sounding / Tephigram",
  "AI/ML Weather Forecasting"
];

export const LoginPage = ({ onLoginSuccess, onBack }) => {
  const { login, register, demoAccounts, switchAccount } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [selectedRole, setSelectedRole] = useState("trainer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Registration Multi-Step State (1: Official Identity, 2: IMD Deployment, 3: Scientific Profile)
  const [regStep, setRegStep] = useState(1);

  const [form, setForm] = useState({
    // Step 1: Official Identity & Credentials
    salutation: "Dr.",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    // Step 2: IMD Deployment & Posting
    designation: "Scientist 'B' (Trainee)",
    department: "Numerical Weather Prediction (NWP) Division",
    station: "National Weather Forecasting Centre, IMD HQ New Delhi",
    zone: "HQ & National Centers (New Delhi / Pune)",
    cadreId: `IMD-MET-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,

    // Step 3: Technical Domain & Academic Profile
    specialization: "Numerical Weather Prediction (NWP) & Data Assimilation",
    highestDegree: "M.Sc. in Meteorology / Atmospheric Physics",
    university: "Central Training Institute (CTI Pune)",
    experienceYears: "1 - 3 Years (Junior Scientific Officer)",
    batchYear: "Batch 2026 - Foundational Induction (Meteorologist Gr-II & Sc-'B')",
    skills: ["Synoptic Chart Analysis", "Python for Meteorology", "WRF Modeling"],
    bio: ""
  });

  const [customSkill, setCustomSkill] = useState("");

  const update = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setError("");
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // Automatically set a realistic default designation matching the role
    const defaultDesig = IMD_DESIGNATIONS[role] ? IMD_DESIGNATIONS[role][0] : "Scientist 'B' (Trainee)";
    update("designation", defaultDesig);
  };

  const handleGenerateCadreId = () => {
    const randomId = `IMD-MET-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomEmp = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
    setForm(prev => ({ ...prev, cadreId: randomId, employeeId: randomEmp }));
  };

  const toggleSkill = (skill) => {
    setForm(prev => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter(s => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (!form.skills.includes(customSkill.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, customSkill.trim()] }));
    }
    setCustomSkill("");
  };

  const validateStep = (stepNum) => {
    setError("");
    if (stepNum === 1) {
      if (!form.name.trim()) {
        setError("Full Name is required.");
        return false;
      }
      if (!form.email.trim()) {
        setError("Official Email is required.");
        return false;
      }
      // Simple email check
      if (!form.email.includes("@")) {
        setError("Please enter a valid official email address.");
        return false;
      }
      if (form.password && form.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match. Please verify.");
        return false;
      }
      return true;
    }
    if (stepNum === 2) {
      if (!form.designation.trim()) {
        setError("Cadre Designation is required.");
        return false;
      }
      if (!form.department.trim()) {
        setError("Department / Division is required.");
        return false;
      }
      if (!form.station.trim()) {
        setError("Posting Station / Office is required.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(regStep)) {
      setRegStep(prev => Math.min(3, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setError("");
    setRegStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!validateStep(1) || !validateStep(2)) return;
      if (!form.highestDegree) {
        setError("Highest qualification is required.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const res = await login(form.email, form.password, selectedRole);
        if (res.success) {
          setSuccess("Login authenticated! Redirecting to IMD LMS Portal...");
          setTimeout(() => onLoginSuccess(), 600);
        } else {
          setError(res.message || "Login failed. Please check your credentials or use 1-Click Fast Login.");
        }
      } else {
        const trimmedName = form.name.trim();
        const fullName = form.salutation && !trimmedName.toLowerCase().startsWith(form.salutation.toLowerCase())
          ? `${form.salutation} ${trimmedName}`
          : trimmedName;
        const res = await register({
          name: fullName,
          salutation: form.salutation,
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: selectedRole,
          designation: form.designation,
          department: form.department,
          station: form.station,
          zone: form.zone,
          cadreId: form.cadreId,
          employeeId: form.employeeId,
          highestDegree: form.highestDegree,
          university: form.university,
          experienceYears: form.experienceYears,
          experience: `${form.experienceYears} at ${form.station}`,
          batchYear: form.batchYear,
          specialization: form.specialization,
          skills: form.skills,
          interests: [form.specialization, "Capacity Building", "IMD Operations"],
          qualifications: `${form.highestDegree} (${form.university || 'IMD / MoES'})`,
          bio: form.bio || `${form.designation} posted at ${form.station}, ${form.department}. Specializing in ${form.specialization}.`
        });

        if (res.success) {
          setSuccess(res.message || "Officer registration submitted successfully! Redirecting...");
          setTimeout(() => onLoginSuccess(), 1000);
        } else {
          setError(res.message || "Registration failed. Please review your entries.");
        }
      }
    } catch (err) {
      setError("Network error communicating with authentication server. Please try again.");
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
      
      {/* ═════════ TOP NAVBAR ═════════ */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius)] hover:bg-slate-100 transition-colors group border border-slate-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-blue-700" />
          <span>Back to Homepage</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">MoES–IMD National Capacity Building Portal</span>
        </div>
      </header>

      {/* ═════════ MAIN CONTAINER ═════════ */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header Institutional Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>Ministry of Earth Sciences • India Meteorological Department</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {mode === "login" ? "Officer Portal Authentication" : "New Officer Registration & Cadre Enrollment"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            {mode === "login"
              ? "Access official learning modules, meteorological competency tracking, and assessment records."
              : "Register your scientific credentials for institutional verification and training course access."}
          </p>
        </div>

        {/* ═════════ FAST 1-CLICK DEMO LOGIN (ALWAYS VISIBLE IN LOGIN MODE) ═════════ */}
        {mode === "login" && (
          <div className="w-full max-w-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Fast Demonstration Sign-In</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">No password required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoAccounts.slice(0, 3).map((acc, idx) => {
                const roleKey = acc.user.role;
                const conf = ROLE_CONFIG[roleKey] || ROLE_CONFIG.trainee;
                const Icon = conf.icon;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    className={`bg-white p-3.5 rounded-xl border ${conf.cardBorder} shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${conf.badge}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${conf.badge}`}>
                        {roleKey}
                      </span>
                    </div>

                    <div className="mb-2">
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {acc.user.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {conf.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700 pt-2 border-t border-slate-100">
                      <span>Instant Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═════════ MAIN CARD (LOGIN / REGISTER) ═════════ */}
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-blue-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <LogIn className="w-4 h-4 text-blue-700" />
              <span>Officer Sign In</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setMode("register"); setRegStep(1); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-blue-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
              }`}
            >
              <UserPlus className="w-4 h-4 text-blue-700" />
              <span>Register New Cadre Profile</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* ═════════ REGISTRATION STEP INDICATOR ═════════ */}
            {mode === "register" && (
              <div className="space-y-3 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-blue-700" />
                    <span>Registration Dossier — Step {regStep} of 3</span>
                  </span>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {regStep === 1 && "1. Official Identity & Access"}
                    {regStep === 2 && "2. IMD Deployment & Posting"}
                    {regStep === 3 && "3. Domain Specialization & Degree"}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setRegStep(1)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      regStep >= 1 ? "bg-blue-700" : "bg-slate-200"
                    }`}
                    title="Step 1: Identity"
                  />
                  <div
                    onClick={() => { if (validateStep(1)) setRegStep(2); }}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      regStep >= 2 ? "bg-blue-700" : "bg-slate-200"
                    }`}
                    title="Step 2: Deployment"
                  />
                  <div
                    onClick={() => { if (validateStep(1) && validateStep(2)) setRegStep(3); }}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      regStep >= 3 ? "bg-blue-700" : "bg-slate-200"
                    }`}
                    title="Step 3: Qualifications"
                  />
                </div>
              </div>
            )}
            
            {/* ═════════ ROLE SELECTOR CARDS ═════════ */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Cadre Role & Access Level:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.entries(ROLE_CONFIG).map(([role, conf]) => {
                  const Icon = conf.icon;
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-600/30"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? "text-blue-700" : "text-slate-400"}`} />
                      <span className="text-xs leading-tight">{conf.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">{conf.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═════════ MODE: LOGIN FORM ═════════ */}
            {mode === "login" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Official Email Address *</span>
                    <span className="text-[10px] font-normal text-slate-400">e.g., officer@imd.gov.in</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => update("email", e.target.value)}
                      placeholder="e.g., amit.sengupta@imd.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Account Password</span>
                    <span className="text-[10px] font-normal text-slate-400">Optional for fast demo login</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      placeholder="Enter password or leave blank for demo"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Feedback Alerts */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all ${roleConf.activeBtn} disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>
                    {loading ? "Authenticating Officer..." : `Sign In as ${roleConf.label}`}
                  </span>
                </button>
              </form>
            )}

            {/* ═════════ MODE: MULTI-STEP REGISTRATION FORM ═════════ */}
            {mode === "register" && (
              <div className="space-y-5">
                
                {/* ── STEP 1: OFFICIAL IDENTITY & CREDENTIALS ── */}
                {regStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
                      <FileCheck2 className="w-4 h-4 text-blue-700" />
                      <span>1. Official Identity & Contact Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Salutation */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                        <select
                          value={form.salutation}
                          onChange={e => update("salutation", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {SALUTATIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Full Name */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (as per Service Record) *</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => update("name", e.target.value)}
                          placeholder="e.g., Rajesh Kumar / Sunita Verma"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Official Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email Address *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => update("email", e.target.value)}
                            placeholder="e.g., rajesh.kumar@imd.gov.in"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Official @imd.gov.in or institutional email preferred</p>
                      </div>

                      {/* Mobile / Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Official Mobile / Contact Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={e => update("phone", e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Used for 2FA and operational emergency broadcasts</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={e => update("password", e.target.value)}
                            placeholder="Minimum 6 characters"
                            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
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

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={e => update("confirmPassword", e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: IMD DEPLOYMENT & POSTING ── */}
                {regStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
                      <Briefcase className="w-4 h-4 text-blue-700" />
                      <span>2. IMD Deployment & Cadre Posting Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Cadre Designation */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cadre Designation *</label>
                        <select
                          value={form.designation}
                          onChange={e => update("designation", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {(IMD_DESIGNATIONS[selectedRole] || IMD_DESIGNATIONS.trainee).map(des => (
                            <option key={des} value={des}>{des}</option>
                          ))}
                        </select>
                      </div>

                      {/* Department / Division */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Division *</label>
                        <select
                          value={form.department}
                          onChange={e => update("department", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {IMD_DIVISIONS.map(div => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Posting Station / Office */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Posting Station / Centre *</label>
                        <select
                          value={form.station}
                          onChange={e => update("station", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {IMD_STATIONS.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {/* Regional Zone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Regional Zone *</label>
                        <select
                          value={form.zone}
                          onChange={e => update("zone", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {IMD_ZONES.map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cadre ID & Employee ID */}
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>Government Cadre & Personnel Registry Number</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleGenerateCadreId}
                          className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate ID</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cadre Registration ID</label>
                          <input
                            type="text"
                            value={form.cadreId}
                            onChange={e => update("cadreId", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-blue-950"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">MoES Employee / Roll ID</label>
                          <input
                            type="text"
                            value={form.employeeId}
                            onChange={e => update("employeeId", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: DOMAIN SPECIALIZATION & ACADEMIC PROFILE ── */}
                {regStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-100">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      <span>3. Scientific Specialization & Educational Dossier</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Primary Specialization */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Meteorological Specialization *</label>
                        <select
                          value={form.specialization}
                          onChange={e => update("specialization", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>

                      {/* Highest Degree */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Educational Degree *</label>
                        <select
                          value={form.highestDegree}
                          onChange={e => update("highestDegree", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {HIGHEST_DEGREES.map(deg => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* University / Institute */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Graduating University / Institute</label>
                        <input
                          type="text"
                          value={form.university}
                          onChange={e => update("university", e.target.value)}
                          placeholder="e.g., CTI Pune / IIT Delhi"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        />
                      </div>

                      {/* Experience Tier */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Experience</label>
                        <select
                          value={form.experienceYears}
                          onChange={e => update("experienceYears", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        >
                          {EXPERIENCE_TIERS.map(tier => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </div>

                      {/* Training Cohort */}
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Training Cohort / Batch</label>
                        <select
                          value={form.batchYear}
                          onChange={e => update("batchYear", e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium truncate"
                        >
                          {BATCH_YEARS.map(batch => (
                            <option key={batch} value={batch}>{batch}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Interactive Skills & Competencies Selection */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Select Core Meteorological Competencies & Skills:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_SKILLS.map(skill => {
                          const isSelected = form.skills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? "bg-blue-700 text-white shadow-2xs"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              <span>{skill}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Add custom skill */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="text"
                          value={customSkill}
                          onChange={e => setCustomSkill(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomSkill(); } }}
                          placeholder="Add other skill (e.g. ECMWF Assimilation)"
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSkill}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 cursor-pointer"
                        >
                          + Add Skill
                        </button>
                      </div>
                    </div>

                    {/* Officer Dossier Live Preview Badge */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Generated Cadre ID Card Preview</span>
                        </span>
                        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-blue-100">
                          {form.cadreId}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold">
                            {(() => {
                              const tName = (form.name || "").trim();
                              if (!tName) return "Officer Name";
                              return form.salutation && !tName.toLowerCase().startsWith(form.salutation.toLowerCase())
                                ? `${form.salutation} ${tName}`
                                : tName;
                            })()}
                          </h4>
                          <p className="text-[11px] text-blue-100">
                            {form.designation} • {form.department}
                          </p>
                          <p className="text-[10px] text-blue-200/80 mt-0.5">
                            Station: {form.station}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/20 text-white">
                          {selectedRole}
                        </span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Feedback Alerts */}
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* ── STEP NAVIGATION BUTTONS ── */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {regStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {regStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B3475] hover:bg-[#08285C] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ml-auto"
                    >
                      <span>Continue to {regStep === 1 ? "Deployment" : "Specialization"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all ${roleConf.activeBtn} disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer ml-auto`}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>
                        {loading ? "Submitting Registration..." : `Submit Registration for ${roleConf.label}`}
                      </span>
                    </button>
                  )}
                </div>

                {/* Governance Notice */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <b>IMD Governance Policy:</b> Registrations for scientific and operational cadres are routed to the Central Directorate / Admin verification queue for credential authentication before active course enrollment privileges are granted.
                  </span>
                </div>

              </div>
            )}

          </div>
        </div>

      </main>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white space-y-1">
        <p className="font-semibold text-slate-700">
          India Meteorological Department • Ministry of Earth Sciences • Government of India
        </p>
        <p className="text-[11px] text-slate-400">
          Capacity Connect LMS • Central Training Institute (CTI Pune) • Mausam Bhawan, Lodhi Road, New Delhi
        </p>
      </footer>

    </div>
  );
};
