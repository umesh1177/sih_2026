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
  Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export const PublicHomePage = ({ onEnterPortal, onOpenCourse, onOpenLoginPage, onOpenVerifyCertificate }) => {
  const { currentUser, demoAccounts, login } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.getAnnouncements().then(res => res.success && setAnnouncements(res.announcements || []));
    api.getCourses().then(res => res.success && setCourses(res.courses || []));
  }, []);

  const handleDemoFastLogin = async (acc) => {
    const res = await login(acc.email, acc.password);
    if (res.success) {
      onEnterPortal();
    } else {
      if (onOpenLoginPage) onOpenLoginPage();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      {/* Top MoES Ticker Header */}
      <div className="bg-[#06173a] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 overflow-hidden max-w-4xl">
          <span className="px-2 py-0.5 rounded bg-rose-600 font-bold text-[10px] tracking-wider uppercase shrink-0 animate-pulse">
            GOVERNMENT DIRECTIVE
          </span>
          <p className="text-blue-200/90 truncate font-medium">
            {announcements[0]?.content || "Ministry of Earth Sciences mandates standardized capacity building certifications across all state meteorological centres."}
          </p>
        </div>

        {/* Demo Fast Login for SIH Evaluators */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-blue-200 font-semibold">Demo Role Fast-Login:</span>
          {demoAccounts.map((acc, i) => (
            <button
              key={i}
              onClick={() => handleDemoFastLogin(acc)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white hover:text-[#0a2558] rounded-md text-[10px] font-bold text-white transition-colors"
            >
              {acc.role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              CC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-[#0a2558] tracking-tight">CAPACITY CONNECT</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-900 uppercase">
                  MoES • IMD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                National Digital Capacity Building & Competency Learning Management Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenVerifyCertificate && onOpenVerifyCertificate()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Verify Certificate</span>
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Sign In
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0a2558] via-[#0d3477] to-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Smart Education • Problem ID: 26075</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Empowering India's Meteorological Workforce Through <span className="text-sky-300">Digital Capacity Mastery</span>
            </h1>

            <p className="text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
              A unified digital ecosystem for the <b>Ministry of Earth Sciences (MoES)</b> and <b>India Meteorological Department (IMD)</b>. Featuring standardized training curricula, integrity-monitored kiosk assessments, explainable competency mapping, and QR-verifiable digital certifications.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    onEnterPortal();
                  } else {
                    if (onOpenLoginPage) onOpenLoginPage();
                  }
                }}
                className="flex items-center gap-2 px-7 py-3.5 bg-white text-[#0a2558] hover:bg-blue-50 font-black rounded-2xl text-xs shadow-xl transition-all transform hover:scale-105"
              >
                <span>{currentUser ? `Enter Portal as ${currentUser.name}` : "Access Training Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenVerifyCertificate && onOpenVerifyCertificate()}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 transition-colors"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verify Digital Certificate</span>
              </button>
            </div>
          </div>

          {/* Right Hero Feature Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white">IMD Capacity Governance</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-900">
                STRICT RBAC & AUDIT LOGS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center font-bold text-white">
                  🎓
                </div>
                <div>
                  <p className="font-bold text-white">Trainee Cadets</p>
                  <p className="text-blue-200 text-[11px]">Curricula, Controlled Kiosk Exams, Skill Radar & Certificates</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center font-bold text-white">
                  🧑‍🏫
                </div>
                <div>
                  <p className="font-bold text-white">Senior Trainers</p>
                  <p className="text-blue-200 text-[11px]">AI Question Drafting, Content Library, Timed Quizzes & Analytics</p>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/30 flex items-center justify-center font-bold text-white">
                  🛡️
                </div>
                <div>
                  <p className="font-bold text-white">Administrators</p>
                  <p className="text-blue-200 text-[11px]">Competency Mapping Engine, Credential Verification & Audit Logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0a2558] tracking-tight">
              Featured Operational Meteorology Programs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Standardized specialized modules designed by India Meteorological Department training divisions
            </p>
          </div>
          <button
            onClick={() => {
              if (currentUser) onEnterPortal();
              else if (onOpenLoginPage) onOpenLoginPage();
            }}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>View All Programs in Portal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558] text-white shadow">
                    {course.code}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                    <span>{course.category}</span>
                    <span>{course.duration}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-slate-600 font-medium">
                  Trainer: <b>{course.leadTrainerName}</b>
                </span>
                <button
                  onClick={() => {
                    onOpenCourse(course);
                    if (currentUser) onEnterPortal();
                    else if (onOpenLoginPage) onOpenLoginPage();
                  }}
                  className="px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs transition-colors shadow"
                >
                  Explore Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements Grid */}
      {announcements.length > 0 && (
        <section className="py-10 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-[#0a2558] flex items-center gap-2">
                <BellRing className="w-5 h-5" />
                Latest MoES Directives & Circulars
              </h2>
              <span className="text-xs text-slate-500">{announcements.length} active circulars</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 2).map((ann, i) => (
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
          Smart India Hackathon • Problem Statement ID: 26075 • Theme: Smart Education
        </p>
      </footer>
    </div>
  );
};
