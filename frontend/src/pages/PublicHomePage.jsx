import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Layers, 
  CheckCircle2, 
  BellRing, 
  PlayCircle,
  Clock,
  ChevronRight,
  LogIn,
  UserPlus,
  Search,
  Check,
  Copy,
  Printer,
  ExternalLink,
  QrCode,
  X,
  FileCheck,
  AlertCircle,
  GraduationCap,
  Download,
  Flame,
  BarChart3,
  Filter,
  CheckCircle,
  ShieldAlert,
  Compass,
  FileBadge2,
  Cpu,
  RefreshCw,
  Globe2,
  Radio,
  SlidersHorizontal
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const CATEGORY_TABS = [
  { id: "All", label: "All Curricula", keywords: [] },
  { id: "Recent", label: "Recent Courses 🚀", keywords: [] },
  { id: "Atmospheric", label: "Atmospheric & NWP Modeling", keywords: ["atmospheric", "nwp", "numerical", "wrf", "gfs", "dynamics", "modeling"] },
  { id: "Radar", label: "Radar & Remote Sensing", keywords: ["radar", "dwr", "doppler", "remote sensing", "polarimetric", "nowcasting"] },
  { id: "Cyclone", label: "Cyclone & Marine Meteorology", keywords: ["cyclone", "storm surge", "marine", "tropical", "ocean", "adcirc"] },
  { id: "Satellite", label: "Satellite Meteorology", keywords: ["satellite", "insat", "imager", "sounder", "remote sensing"] },
  { id: "Agro", label: "Agrometeorology & Crop Advisories", keywords: ["agro", "crop", "fasal", "meghdoot", "soil", "agriculture", "climate"] },
  { id: "Climate", label: "Climate Science & Monsoon Dynamics", keywords: ["climate", "monsoon", "ism", "enso", "long-range", "variability"] },
  { id: "Seismo", label: "Seismology & Geophysics", keywords: ["seismic", "earthquake", "geophysics", "nseis"] }
];

const LEVEL_OPTIONS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export const PublicHomePage = ({ onEnterPortal, onOpenCourse, onOpenLoginPage }) => {
  const { currentUser, demoAccounts, switchAccount } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [homeCourseFilter, setHomeCourseFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [searchQuery, setSearchQuery] = useState("");

  // Certificate Verification State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    api.getAnnouncements().then(res => res.success && setAnnouncements(res.announcements)).catch(() => {});
    api.getCourses().then(res => res.success && setCourses(res.courses)).catch(() => {});

    // Check if URL has ?verify=... or ?id=... parameter
    const params = new URLSearchParams(window.location.search);
    const certParam = params.get("verify") || params.get("id");
    if (certParam) {
      setVerifyQuery(certParam);
      handlePerformVerification(certParam);
    }
  }, []);

  const handlePerformVerification = async (queryToVerify) => {
    const q = (queryToVerify !== undefined ? queryToVerify : verifyQuery) || "";
    if (!q.trim()) {
      setVerifyError("Please enter a valid Certificate ID or verification URL.");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    setVerifiedCert(null);
    setShowVerifyModal(true);

    try {
      const res = await api.verifyCertificate(q);
      if (res.success && res.certificate) {
        setVerifiedCert(res.certificate);
      } else {
        setVerifyError(res.message || "Certificate record not found. Please verify the ID.");
      }
    } catch (err) {
      setVerifyError("Network error during verification. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyVerificationLink = (certId) => {
    const url = `${window.location.origin}/?verify=${certId || "MOES-CERT-NWP-401-0981"}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Dynamic Course Filtering
  const filteredCourses = useMemo(() => {
    let list = [...courses];

    // 1. Category Filter
    if (homeCourseFilter === "Recent") {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (homeCourseFilter !== "All") {
      const currentTab = CATEGORY_TABS.find(t => t.id === homeCourseFilter);
      if (currentTab && currentTab.keywords.length > 0) {
        list = list.filter(c => {
          const text = `${c.category || ""} ${c.title || ""} ${c.description || ""} ${(c.competenciesGained || []).join(" ")}`.toLowerCase();
          return currentTab.keywords.some(k => text.includes(k.toLowerCase()));
        });
      }
    }

    // 2. Level Filter
    if (levelFilter !== "All Levels") {
      list = list.filter(c => (c.level || "").toLowerCase() === levelFilter.toLowerCase());
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      list = list.filter(c => 
        (c.title || "").toLowerCase().includes(sq) ||
        (c.code || "").toLowerCase().includes(sq) ||
        (c.leadTrainerName || "").toLowerCase().includes(sq) ||
        (c.category || "").toLowerCase().includes(sq) ||
        (c.department || "").toLowerCase().includes(sq) ||
        (c.description || "").toLowerCase().includes(sq) ||
        (c.competenciesGained || []).some(comp => comp.toLowerCase().includes(sq))
      );
    }

    return list;
  }, [courses, homeCourseFilter, levelFilter, searchQuery]);

  // Compute category count helper
  const getCategoryCount = (tab) => {
    if (tab.id === "All" || tab.id === "Recent") return courses.length;
    return courses.filter(c => {
      const text = `${c.category || ""} ${c.title || ""} ${c.description || ""} ${(c.competenciesGained || []).join(" ")}`.toLowerCase();
      return tab.keywords.some(k => text.includes(k.toLowerCase()));
    }).length;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none antialiased">
      
      {/* ─── 1. TOP FLASH DIRECTIVE & FAST-ROLE BAR ─── */}
      <div className="bg-[#0a2558] text-white px-4 lg:px-8 py-2 text-xs flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden max-w-4xl">
          <span className="px-2 py-0.5 rounded bg-rose-600 font-extrabold text-[10px] tracking-wider uppercase shrink-0 animate-pulse flex items-center gap-1">
            <Radio className="w-3 h-3" /> DIRECTIVE
          </span>
          <p className="text-blue-100 truncate font-medium text-[11px] sm:text-xs">
            {announcements[0]?.content || "Ministry of Earth Sciences mandates standardized digital capacity building certifications for operational weather forecasters."}
          </p>
        </div>

        {/* Demo Fast Account Switcher */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-blue-200 font-semibold">Fast Demo Sign-In:</span>
          {demoAccounts.map((acc, i) => (
            <button
              key={i}
              onClick={() => {
                switchAccount(acc);
                onEnterPortal();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white hover:text-[#0a2558] rounded-md text-[10px] font-bold text-white transition-all shadow-sm hover:scale-105"
            >
              {acc.role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION HEADER ─── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & National Emblem Identity */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-blue-200">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-[#0a2558] tracking-tight">
                  CAPACITY CONNECT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase border border-blue-200">
                  MoES • IMD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                National Meteorological Capacity Building & Accreditation Portal
              </p>
            </div>
          </div>

          {/* Center Quick Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#curricula-section" className="hover:text-[#0a2558] transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Curricula Catalog</span>
            </a>
            <a href="#verification-section" className="hover:text-emerald-700 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verification Ledger</span>
            </a>
            <a href="#features-section" className="hover:text-[#0a2558] transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pillars</span>
            </a>
          </nav>

          {/* Navigation Controls: 🌟 PROMINENT VERIFY CERTIFICATE BUTTON + AUTH */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* 🌟 VERIFY CERTIFICATE BUTTON (REQUESTED IN NAVIGATION) */}
            <button
              onClick={() => {
                setShowVerifyModal(true);
                setVerifyError("");
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-400 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95 group"
              title="Verify authenticity of any MoES/IMD Issued Certificate"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="font-extrabold tracking-tight">Verify Certificate</span>
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-3.5 sm:px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-all hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Officer</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── 3. MODERN HERO SECTION (LIGHT THEME & NAVY ACCENTS) ─── */}
      <section className="bg-gradient-to-br from-[#0a2558] via-[#0d3477] to-[#122854] text-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden shadow-md">
        
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>Official Capacity Building • Ministry of Earth Sciences (MoES)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Empowering India's Meteorological Workforce Through <span className="text-sky-300">Digital Competency Mastery</span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
              A unified digital ecosystem for the <b>Ministry of Earth Sciences (MoES)</b> and <b>India Meteorological Department (IMD)</b>. Standardized operational curricula, AI-proctored kiosk assessments, automated competency radar mapping, and official cryptographic certifications.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => {
                  const traineeAcc = demoAccounts.find(a => a.role === "trainee");
                  if (traineeAcc) switchAccount(traineeAcc);
                  onEnterPortal();
                }}
                className="flex items-center gap-2 px-6 sm:px-7 py-3.5 bg-white text-[#0a2558] hover:bg-blue-50 font-black rounded-2xl text-xs sm:text-sm shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Enter Trainee Dashboard (Rahul)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const trainerAcc = demoAccounts.find(a => a.role === "trainer");
                  if (trainerAcc) switchAccount(trainerAcc);
                  onEnterPortal();
                }}
                className="flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-blue-600/40 hover:bg-blue-600/60 text-white font-bold rounded-2xl text-xs sm:text-sm border border-blue-400/40 transition-all hover:scale-105 active:scale-95"
              >
                <Layers className="w-4 h-4 text-blue-200" />
                <span>Enter Trainer Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setShowVerifyModal(true);
                  setVerifyError("");
                }}
                className="flex items-center gap-2 px-5 sm:px-6 py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold rounded-2xl text-xs sm:text-sm border border-emerald-400/40 transition-all hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Certificate</span>
              </button>
            </div>

            {/* Live Telemetry Counters */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">4,280+</p>
                <p className="text-[11px] text-blue-200 font-medium">Certified Officers</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">36</p>
                <p className="text-[11px] text-blue-200 font-medium">Regional Met Centres</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-300">100%</p>
                <p className="text-[11px] text-blue-200 font-medium">Verifiable Credentials</p>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Instant Interactive Verification Box */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Certificate Verification</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950 shadow-sm">
                PUBLIC LEDGER
              </span>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              Enter any Certificate ID or unique verification URL to confirm authentic accreditation:
            </p>

            {/* Search Input & Action */}
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  placeholder="e.g. MOES-CERT-NWP-401-0981"
                  className="flex-1 px-3.5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
                  onKeyDown={(e) => e.key === "Enter" && handlePerformVerification()}
                />
                <button
                  onClick={() => handlePerformVerification()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-transform active:scale-95 shrink-0 shadow-md"
                >
                  Verify Now
                </button>
              </div>
              
              {/* Sample Quick IDs */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-blue-200 pt-1">
                <span className="font-semibold text-blue-100">Sample Credential IDs:</span>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-CERT-NWP-401-0981");
                    handlePerformVerification("MOES-CERT-NWP-401-0981");
                  }}
                  className="underline hover:text-white font-mono"
                >
                  MOES-CERT-NWP-401-0981
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-IMD-2026-9810");
                    handlePerformVerification("MOES-IMD-2026-9810");
                  }}
                  className="underline hover:text-white font-mono"
                >
                  MOES-IMD-2026-9810
                </button>
              </div>
            </div>

            {/* Framework highlights */}
            <div className="pt-3 border-t border-white/15 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Signed by Director General of Meteorology</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant QR-code verification for promotions & roster duty</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. DEDICATED PUBLIC CERTIFICATE VERIFICATION BANNER SECTION ─── */}
      <section id="verification-section" className="py-10 px-4 sm:px-6 lg:px-8 bg-emerald-50/80 border-b border-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border-2 border-emerald-300">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  MoES Digital Certificate Verification Ledger
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-200 text-emerald-900 uppercase">
                  Live & Public
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                Public accreditation verification service for recruiting authorities, state disaster management authorities (SDMA), and IMD administrative promotion boards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowVerifyModal(true);
                setVerifyError("");
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-2xl text-xs shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Launch Verification Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. FOUR PILLARS OF CAPACITY BUILDING SECTION ─── */}
      <section id="features-section" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 uppercase border border-blue-200">
              MoES Operational Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a2558] tracking-tight">
              Standardized Meteorological Capacity Building
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Transforming operational weather readiness through structured digital learning, AI assessments, and verified credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 bg-slate-50 hover:bg-blue-50/50 rounded-3xl border border-slate-200 transition-all hover:shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Standardized Curricula</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                6 core operational disciplines including NWP modeling, Doppler radar nowcasting, tropical cyclones, satellite meteorology, and agrometeorology.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 bg-slate-50 hover:bg-emerald-50/50 rounded-3xl border border-slate-200 transition-all hover:shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">AI Kiosk Assessments</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-screen proctored kiosk exam mode with anti-cheat protection, randomized question banks, and automated instant scoring.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 bg-slate-50 hover:bg-purple-50/50 rounded-3xl border border-slate-200 transition-all hover:shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Competency Radar</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated multi-axial skill mapping that visualizes officer operational readiness across NWP physics, radar de-aliasing, and cyclone tracking.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 bg-slate-50 hover:bg-amber-50/50 rounded-3xl border border-slate-200 transition-all hover:shadow-md space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <FileBadge2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Cryptographic Certificates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tamper-proof digital certificates with SHA-256 validation hashes, Director General signatures, and 100% public verification links.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. COURSE CATALOG & WORKING FILTERS SECTION ─── */}
      <section id="curricula-section" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
        
        {/* Section Header & Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                MoES Certified Curricula
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {filteredCourses.length} Programs Found</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a2558] tracking-tight">
              Operational Meteorology Curricula & Tracks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized specialized modules designed by India Meteorological Department central training divisions.
            </p>
          </div>

          {/* Search bar and Level filter */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, code, skill..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level Filter Dropdown */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm shrink-0"
            >
              {LEVEL_OPTIONS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

          </div>
        </div>

        {/* Dynamic Filter Tabs Bar (Fully Working with counts) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORY_TABS.map(tab => {
            const isSelected = homeCourseFilter === tab.id;
            const count = getCategoryCount(tab);
            return (
              <button
                key={tab.id}
                onClick={() => setHomeCourseFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs border flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0a2558] text-white border-[#0a2558] shadow-sm scale-105"
                    : tab.id === "Recent"
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3 my-6">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No courses matching your filter criteria</h4>
            <p className="text-xs text-slate-500">Try selecting "All Curricula" or clearing your search keywords.</p>
            <button
              onClick={() => {
                setHomeCourseFilter("All");
                setLevelFilter("All Levels");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0a2558] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredCourses.map(course => {
              const isNewlyCreated = course.isNew || course.isRecent || (Date.now() - new Date(course.createdAt || 0).getTime() < 14 * 86400000);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail banner */}
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0a2558] text-white shadow">
                          {course.code}
                        </span>
                        {isNewlyCreated && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> NEW LAUNCH
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                          {course.level || "Intermediate"}
                        </span>
                      </div>
                    </div>

                    {/* Body content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                        <span className="text-blue-700 font-bold">{course.category}</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {course.duration}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                        {course.description}
                      </p>

                      {/* Competencies Chips */}
                      {course.competenciesGained && course.competenciesGained.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {course.competenciesGained.slice(0, 3).map((comp, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Card Action */}
                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[11px] text-slate-600 font-medium">
                      Trainer: <b>{course.leadTrainerName || "MoES Faculty"}</b>
                    </span>
                    <button
                      onClick={() => {
                        onOpenCourse(course);
                        onEnterPortal();
                      }}
                      className="px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs transition-colors shadow flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 7. DIRECTIVES & CIRCULARS BROADCAST ─── */}
      {announcements.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-[#0a2558] flex items-center gap-2">
                  <BellRing className="w-5 h-5 text-blue-600" />
                  <span>MoES Directives & Training Circulars</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official administrative orders from the Directorate General of Meteorology
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{announcements.length} active notifications</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.slice(0, 3).map((ann, i) => (
                <div key={ann.id || i} className={`p-5 rounded-2xl border shadow-sm ${
                  ann.urgent ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ann.urgent ? "bg-rose-600 text-white" : "bg-blue-100 text-blue-900"
                    }`}>{ann.urgent ? "URGENT" : ann.category || "Notice"}</span>
                    <span className="text-[10px] text-slate-400">{ann.date || "Active Directive"}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">{ann.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 8. FOOTER ─── */}
      <footer className="bg-[#0a2558] text-white py-10 border-t border-white/10 px-4 sm:px-6 lg:px-8 text-center text-xs">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-[#0a2558] flex items-center justify-center font-black text-lg">
              Q
            </div>
            <span className="font-black text-base tracking-tight">CAPACITY CONNECT</span>
          </div>
          <p className="font-bold text-blue-100">
            Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
          </p>
          <p className="text-blue-200/70 text-[11px] max-w-xl mx-auto">
            National Digital Capacity Building & Competency Learning Management Portal. Designed for high-integrity meteorological training, automated competency mapping, and cryptographic certificate issuance.
          </p>
          <div className="pt-4 border-t border-white/10 text-slate-400 text-[10px] flex items-center justify-between flex-wrap gap-2">
            <span>© 2026 Ministry of Earth Sciences, Government of India. All rights reserved.</span>
            <span>Secured with SHA-256 Cryptographic Verification Ledger</span>
          </div>
        </div>
      </footer>

      {/* ═════════ 9. PUBLIC CERTIFICATE VERIFICATION MODAL ═════════ */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Official Certificate Verification Portal
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Ministry of Earth Sciences • India Meteorological Department
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-700">
                Enter Unique Certificate ID or Full Verification URL:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={verifyQuery}
                    onChange={(e) => setVerifyQuery(e.target.value)}
                    placeholder="e.g. MOES-CERT-NWP-401-0981 or http://localhost:5173/?verify=..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                    onKeyDown={(e) => e.key === "Enter" && handlePerformVerification()}
                  />
                </div>
                <button
                  onClick={() => handlePerformVerification()}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#081d45] text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-60 transition-transform active:scale-95"
                >
                  {verifying ? "Verifying..." : "Verify Authenticity"}
                </button>
              </div>

              {/* Sample Quick Chips */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span className="font-bold text-slate-600">Sample Credentials:</span>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-CERT-NWP-401-0981");
                    handlePerformVerification("MOES-CERT-NWP-401-0981");
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-blue-700 font-mono text-[10px] font-bold"
                >
                  MOES-CERT-NWP-401-0981
                </button>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-IMD-2026-9810");
                    handlePerformVerification("MOES-IMD-2026-9810");
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-blue-700 font-mono text-[10px] font-bold"
                >
                  MOES-IMD-2026-9810
                </button>
              </div>
            </div>

            {/* Verification Error */}
            {verifyError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 mb-4 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{verifyError}</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Please ensure the Certificate ID is typed accurately as printed on the issued credential.
                  </p>
                </div>
              </div>
            )}

            {/* 🌟 OFFICIAL VERIFIED CERTIFICATE DISPLAY CANVAS 🌟 */}
            {verifiedCert && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Status Verified Banner */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold">{verifiedCert.status}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-800">
                    ID: {verifiedCert.certificateId}
                  </span>
                </div>

                {/* Printable Certificate Frame */}
                <div id="verified-certificate-frame" className="p-6 sm:p-8 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 rounded-3xl border-4 border-double border-amber-400/60 shadow-inner relative text-center space-y-4 overflow-hidden">
                  
                  {/* Watermark Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <div className="w-64 h-64 rounded-full border-8 border-slate-900 flex items-center justify-center font-black text-8xl">
                      MoES
                    </div>
                  </div>

                  {/* Header Logos */}
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
                    <div className="text-left">
                      <p className="text-[10px] font-black tracking-wider text-slate-800 uppercase">
                        Government of India
                      </p>
                      <p className="text-xs font-black text-[#0a2558]">
                        Ministry of Earth Sciences (MoES)
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#0a2558] text-white flex items-center justify-center font-black text-lg shadow-sm">
                      Q
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black tracking-wider text-slate-800 uppercase">
                        IMD Central Training
                      </p>
                      <p className="text-xs font-black text-[#0a2558]">
                        Directorate of Capacity
                      </p>
                    </div>
                  </div>

                  {/* Certificate Title */}
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-black text-[#0a2558] tracking-wide uppercase">
                      Certificate of Competency Mastery
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      National Operational Meteorology Framework
                    </p>
                  </div>

                  {/* Recipient Details */}
                  <div className="py-2 space-y-1">
                    <p className="text-xs text-slate-500">This is officially certified that</p>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-4">
                      {verifiedCert.recipientName}
                    </h4>
                    <p className="text-[11px] text-slate-600 font-mono">
                      Cadre ID: <b>{verifiedCert.recipientCadreId}</b>
                    </p>
                  </div>

                  {/* Course Details */}
                  <div className="p-3 bg-white/80 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <p className="text-slate-600">has successfully demonstrated operational competency in</p>
                    <p className="font-black text-[#0a2558] text-sm">
                      {verifiedCert.courseTitle} ({verifiedCert.courseCode})
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 pt-0.5">
                      Grading: {verifiedCert.grade}
                    </p>
                  </div>

                  {/* Signatures & Verification Meta */}
                  <div className="pt-3 border-t border-amber-200/80 grid grid-cols-2 gap-4 text-[10px] text-slate-600">
                    <div className="text-left space-y-0.5">
                      <p className="font-bold text-slate-800 font-serif italic text-xs">M. Mohapatra</p>
                      <p className="font-bold text-slate-900">{verifiedCert.directorGeneral}</p>
                      <p className="text-slate-500">Issue Date: {verifiedCert.issueDate}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-bold text-slate-800 font-serif italic text-xs">Amit Sengupta</p>
                      <p className="font-bold text-slate-900">{verifiedCert.leadInstructor}</p>
                      <p className="font-mono text-slate-500 text-[9px] truncate">{verifiedCert.cryptographicHash}</p>
                    </div>
                  </div>

                </div>

                {/* Verification Share & Action Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyVerificationLink(verifiedCert.certificateId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? "Link Copied!" : "Copy Verification URL"}</span>
                    </button>

                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                    >
                      <Printer className="w-4 h-4 text-blue-600" />
                      <span>Print / PDF</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 ml-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified by MoES Central Ledger
                  </span>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
