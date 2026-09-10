import React, { useState, useEffect } from "react";
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
  BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const PublicHomePage = ({ onEnterPortal, onOpenCourse, onOpenLoginPage }) => {
  const { currentUser, demoAccounts, switchAccount, login, register } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [homeCourseFilter, setHomeCourseFilter] = useState("All");

  // Certificate Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyQuery, setVerifyQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Auth Modal State (Quick in-place auth)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "amit.sengupta@imd.gov.in",
    password: "",
    role: "trainer",
    department: "Numerical Weather Prediction Division, New Delhi",
    designation: "Scientist 'F' & Senior Meteorologist",
    qualifications: "Ph.D. Atmospheric Sciences",
    experience: "18 years"
  });

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
    const q = queryToVerify || verifyQuery;
    if (!q.trim()) {
      setVerifyError("Please enter a Certificate ID or verification URL.");
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

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "login") {
      const res = await login(authForm.email, authForm.password, authForm.role);
      if (res.success) {
        setShowAuthModal(false);
        onEnterPortal();
      } else {
        alert(res.message);
      }
    } else {
      const res = await register(authForm);
      if (res.success) {
        alert(res.message);
        setShowAuthModal(false);
        onEnterPortal();
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      
      {/* ─── 1. TOP FLASH TICKER BAR ─── */}
      <div className="bg-[#0a2558] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 overflow-hidden max-w-4xl">
          <span className="px-2 py-0.5 rounded bg-rose-600 font-extrabold text-[10px] tracking-wider uppercase shrink-0 animate-pulse">
            DIRECTIVE
          </span>
          <p className="text-blue-100 truncate font-medium">
            {announcements[0]?.content || "Ministry of Earth Sciences mandates standardized digital capacity building certifications for operational weather forecasters."}
          </p>
        </div>

        {/* Demo Fast Account Switcher for Evaluators */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-blue-200 font-semibold">Demo Role Fast-Login:</span>
          {demoAccounts.map((acc, i) => (
            <button
              key={i}
              onClick={() => {
                switchAccount(acc);
                onEnterPortal();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white hover:text-[#0a2558] rounded-md text-[10px] font-bold text-white transition-colors"
            >
              {acc.role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 2. MAIN NAVIGATION HEADER ─── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & National Emblem */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-2xl shadow-md">
              Q
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-[#0a2558] tracking-tight">CAPACITY CONNECT</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase">
                  MoES • IMD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                National Digital Capacity Building & Competency Accreditation Portal
              </p>
            </div>
          </div>

          {/* Action Buttons: Verify Certificate (Requested) + Login / Register */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* 🌟 VERIFY CERTIFICATE BUTTON (REQUESTED BY USER) */}
            <button
              onClick={() => {
                setShowVerifyModal(true);
                setVerifyError("");
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Verify authenticity of any MoES/IMD Issued Certificate"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Certificate</span>
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Role Login
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
            >
              Register Officer
            </button>
          </div>
        </div>
      </header>

      {/* ─── 3. ATTRACTIVE HERO SECTION (CLEAN & MODERN) ─── */}
      <section className="bg-gradient-to-br from-[#0a2558] via-[#0d3477] to-[#122854] text-white py-16 lg:py-20 px-6 relative overflow-hidden shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart Education • Ministry of Earth Sciences LMS</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Empowering India's Meteorological Workforce Through <span className="text-sky-300">Digital Capacity Mastery</span>
            </h1>

            <p className="text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
              A unified digital ecosystem for the <b>Ministry of Earth Sciences (MoES)</b> and <b>India Meteorological Department (IMD)</b>. Standardized training curricula, AI-assisted proctored kiosk assessments, automated competency mapping, and official cryptographic certifications.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onEnterPortal()}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-[#0a2558] hover:bg-blue-50 font-black rounded-2xl text-xs shadow-xl transition-all transform hover:scale-105"
              >
                <span>Enter Training Portal as {currentUser?.role.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowVerifyModal(true);
                  setVerifyError("");
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold rounded-2xl text-xs border border-emerald-400/30 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Public Certificate</span>
              </button>
            </div>

            {/* Quick Live Telemetry Counters */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">4,280+</p>
                <p className="text-[11px] text-blue-200">Certified Officers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">18</p>
                <p className="text-[11px] text-blue-200">IMD State Centres</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-300">99.4%</p>
                <p className="text-[11px] text-blue-200">Exam Reliability</p>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Quick Certificate Verification & Features */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 lg:p-7 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Certificate Verification</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-900">
                100% PUBLIC & FREE
              </span>
            </div>

            <p className="text-xs text-blue-100">
              Enter any Certificate ID or unique verification URL to confirm authentic accreditation:
            </p>

            {/* Mini verification input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyQuery}
                  onChange={(e) => setVerifyQuery(e.target.value)}
                  placeholder="e.g. MOES-CERT-NWP-401-0981"
                  className="flex-1 px-3.5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => handlePerformVerification()}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-transform active:scale-95 shrink-0"
                >
                  Verify
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-blue-200">
                <span>Sample IDs:</span>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-CERT-NWP-401-0981");
                    handlePerformVerification("MOES-CERT-NWP-401-0981");
                  }}
                  className="underline hover:text-white"
                >
                  MOES-CERT-NWP-401-0981
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setVerifyQuery("MOES-IMD-2026-9810");
                    handlePerformVerification("MOES-IMD-2026-9810");
                  }}
                  className="underline hover:text-white"
                >
                  MOES-IMD-2026-9810
                </button>
              </div>
            </div>

            {/* Framework highlights */}
            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cryptographically signed by Director General of Meteorology</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Instant QR-code verification for promotions & cadre ranking</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. COURSE CATALOG SECTION ─── */}
      <section className="py-14 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                MoES Certified Curricula
              </span>
              <span className="text-xs text-slate-500">• {courses.length} Standard Programs</span>
            </div>
            <h2 className="text-2xl font-black text-[#0a2558] tracking-tight">
              Featured Operational Meteorology Programs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized specialized modules designed by India Meteorological Department training divisions
            </p>
          </div>
          <button
            onClick={onEnterPortal}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Programs in Portal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: "All", label: "All Curricula" },
            { id: "Recent", label: "Recent New Courses 🚀" },
            { id: "Numerical Weather Prediction", label: "Numerical Weather Prediction" },
            { id: "Radar Meteorology", label: "Radar Meteorology" },
            { id: "Cyclone Tracking & Warning", label: "Cyclone & Marine" },
            { id: "Satellite Meteorology", label: "Satellite Meteorology" },
            { id: "Agrometeorology", label: "Agrometeorology" }
          ].map(tab => {
            const isSelected = (homeCourseFilter || "All") === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setHomeCourseFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs border ${
                  isSelected
                    ? "bg-[#0a2558] text-white border-[#0a2558] shadow-sm"
                    : tab.id === "Recent"
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Course Cards */}
        {(() => {
          const displayCourses = courses.filter(course => {
            if (homeCourseFilter === "Recent") {
              return true;
            }
            if (homeCourseFilter && homeCourseFilter !== "All") {
              return course.category === homeCourseFilter || course.title.toLowerCase().includes(homeCourseFilter.toLowerCase());
            }
            return true;
          }).sort((a, b) => {
            if (homeCourseFilter === "Recent") {
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            }
            return 0;
          });

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayCourses.map(course => {
                const isNewlyCreated = course.isRecent || (Date.now() - new Date(course.createdAt || 0).getTime() < 14 * 86400000);

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
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
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558] text-white shadow">
                            {course.code}
                          </span>
                          {isNewlyCreated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> NEW LAUNCH
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                          <span>{course.category}</span>
                          <span className="flex items-center gap-1">
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
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <span className="text-[11px] text-slate-600 font-medium">
                        Trainer: <b>{course.leadTrainerName || "MoES Faculty"}</b>
                      </span>
                      <button
                        onClick={() => {
                          onOpenCourse(course);
                          onEnterPortal();
                        }}
                        className="px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs transition-colors shadow"
                      >
                        Explore Course
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* ─── 5. DIRECTIVES & RECENT ACHIEVEMENTS ─── */}
      {announcements.length > 0 && (
        <section className="py-10 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-[#0a2558] flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Latest MoES Directives & Training Broadcasts
              </h2>
              <span className="text-xs text-slate-500">{announcements.length} active notifications</span>
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
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">{ann.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#0a2558] text-white py-8 border-t border-white/10 px-6 text-center text-xs">
        <p className="font-bold">
          CAPACITY CONNECT • Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
        </p>
        <p className="text-blue-200/70 text-[11px] mt-1">
          National Digital Capacity Building & Competency Learning Management Portal
        </p>
      </footer>

      {/* ═════════ CERTIFICATE VERIFICATION MODAL ═════════ */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
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
                Enter Unique Certificate ID or Verification URL:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={verifyQuery}
                    onChange={(e) => setVerifyQuery(e.target.value)}
                    placeholder="e.g. MOES-CERT-NWP-401-0981 or http://localhost:5173/?verify=..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      onClick={handlePrintCertificate}
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

      {/* Quick Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {authMode === "login" ? "MoES Portal Login" : "Register New Officer"}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === "register" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official IMD Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder={authMode === "login" ? "Enter your password (or leave blank for demo)" : "Create a secure password"}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Role</label>
                <select
                  value={authForm.role}
                  onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="trainee">Trainee (Scientist 'B' / Assistant)</option>
                  <option value="trainer">Trainer (Senior Scientist / Lead Forecaster)</option>
                  <option value="admin">Admin (Directorate General)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-blue-700 font-bold hover:underline"
                >
                  {authMode === "login" ? "Need to Register?" : "Already Registered? Login"}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md"
                >
                  {authMode === "login" ? "Enter Portal" : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
