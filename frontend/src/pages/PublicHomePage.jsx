import React, { useState, useEffect } from "react";
import { 
  Building2, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Layers, 
  CheckCircle2, 
  BellRing, 
  ChevronRight, 
  Search,
  Sparkles,
  Lock,
  GraduationCap
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
    <div className="min-h-screen bg-[#F6F8FA] text-slate-800 flex flex-col font-sans select-none">
      
      {/* Top MoES Ticker Header */}
      <div className="bg-[#155E75] text-white px-4 py-2 text-xs flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2 overflow-hidden max-w-4xl">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-800 text-teal-100 uppercase shrink-0 border border-teal-600/50">
            OFFICIAL NOTICE
          </span>
          <p className="text-teal-50 truncate text-[11px] font-medium">
            {announcements[0]?.content || "Ministry of Earth Sciences mandates standardized digital capacity building & competency development."}
          </p>
        </div>

        {/* Demo Fast Login for SIH Evaluators */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-teal-100 font-medium">Evaluator Quick-Access:</span>
          {demoAccounts.map((acc, i) => (
            <button
              key={i}
              onClick={() => handleDemoFastLogin(acc)}
              className="px-2.5 py-0.5 bg-white/15 hover:bg-white hover:text-[#155E75] rounded text-[10px] font-semibold text-white transition-colors"
            >
              {acc.role.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-[#D9E2EC] shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#155E75] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">CAPACITY CONNECT</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                  MoES • IMD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                National Meteorological Capacity Building & Competency Learning Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenVerifyCertificate && onOpenVerifyCertificate()}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-[#D9E2EC] hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Verify Certificate</span>
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-4 py-2 border border-[#D9E2EC] hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
            >
              Sign In
            </button>

            <button
              onClick={() => onOpenLoginPage && onOpenLoginPage()}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
            >
              Register Officer
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#D9E2EC] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-[#1D4ED8]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>MoES / IMD Institutional Training Platform • SIH 26075</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Institutional Capacity Building & Competency Development for Operational Meteorology
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
              A unified digital ecosystem supporting standardized training curricula, secure proctored kiosk assessments, explainable competency matching, and verifiable digital accreditations for India Meteorological Department personnel.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (currentUser) {
                    onEnterPortal();
                  } else {
                    if (onOpenLoginPage) onOpenLoginPage();
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors"
              >
                <span>{currentUser ? `Enter Portal as ${currentUser.name}` : "Access Training Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenVerifyCertificate && onOpenVerifyCertificate()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs border border-[#D9E2EC] transition-colors"
              >
                <Award className="w-4 h-4 text-slate-500" />
                <span>Verify Digital Certificate</span>
              </button>
            </div>
          </div>

          {/* Right Hero Feature Card */}
          <div className="lg:col-span-5 bg-[#F6F8FA] rounded-xl p-6 border border-[#D9E2EC] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E2EC]">
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Role-Based Access Governance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                VERIFIED RBAC
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#D9E2EC] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Trainee Officers</p>
                  <p className="text-slate-500 text-[11px]">Structured curricula, proctored assessments, competency transcripts</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#D9E2EC] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Faculty & Trainers</p>
                  <p className="text-slate-500 text-[11px]">Course authoring, question bank management, evaluation workflows</p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#D9E2EC] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Institutional Administrators</p>
                  <p className="text-slate-500 text-[11px]">Officer approvals, competency matching engine, audit trails</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Grid */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Operational Meteorology Curricula & Specialized Programs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized specialized modules designed by India Meteorological Department training divisions
            </p>
          </div>
          <button
            onClick={() => {
              if (currentUser) onEnterPortal();
              else if (onOpenLoginPage) onOpenLoginPage();
            }}
            className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
          >
            <span>View All Programs in Portal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-[#D9E2EC] overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-40 overflow-hidden relative bg-slate-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-slate-800 border border-slate-200 shadow-xs">
                    {course.code}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5">
                    <span>{course.category}</span>
                    <span>{course.duration}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs mb-1.5 line-clamp-2 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-3">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-slate-600 font-medium">
                  Faculty: <span className="font-semibold text-slate-800">{course.leadTrainerName}</span>
                </span>
                <button
                  onClick={() => {
                    onOpenCourse(course);
                    if (currentUser) onEnterPortal();
                    else if (onOpenLoginPage) onOpenLoginPage();
                  }}
                  className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-blue-700 text-white font-semibold rounded-md text-xs transition-colors shadow-xs"
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
        <section className="py-10 px-6 bg-white border-t border-[#D9E2EC]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#155E75]" />
                Latest MoES Directives & Circulars
              </h2>
              <span className="text-xs text-slate-500 font-medium">{announcements.length} active circulars</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {announcements.slice(0, 2).map((ann, i) => (
                <div key={ann.id || i} className={`p-4 rounded-lg border shadow-xs ${
                  ann.urgent ? "bg-red-50/50 border-red-200" : "bg-slate-50 border-[#D9E2EC]"
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ann.urgent ? "bg-red-100 text-red-800 border border-red-200" : "bg-blue-50 text-blue-800 border border-blue-100"
                    }`}>{ann.urgent ? "URGENT" : ann.category || "Notice"}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">{ann.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Institutional Footer */}
      <footer className="bg-[#1E293B] text-white py-6 border-t border-slate-700 px-6 text-center text-xs">
        <p className="font-semibold text-slate-200">
          CAPACITY CONNECT • Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)
        </p>
        <p className="text-slate-400 text-[11px] mt-1">
          Smart India Hackathon • Problem Statement ID: 26075 • Theme: Smart Education
        </p>
      </footer>
    </div>
  );
};
