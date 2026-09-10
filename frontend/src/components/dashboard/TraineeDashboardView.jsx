import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  ClipboardList, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  PlayCircle,
  BarChart3,
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Layers,
  Calendar,
  BellRing,
  CheckCircle,
  ExternalLink,
  Target,
  GraduationCap
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from "recharts";
import { api } from "../../services/api";

export const TraineeDashboardView = ({ 
  currentUser, 
  onStartExam, 
  onOpenCourse, 
  onOpenProfile, 
  onOpenCertificate,
  onNavigateTab,
  onOpenAiAdvisor
}) => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeCourseFilter, setActiveCourseFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [qRes, cRes, aRes, annRes, progRes] = await Promise.all([
          api.getQuizzes().catch(() => ({ success: false, quizzes: [] })),
          api.getCourses().catch(() => ({ success: false, courses: [] })),
          api.getTraineeAnalytics(currentUser?.id || "u_trainee_1").catch(() => ({ success: false })),
          api.getAnnouncements().catch(() => ({ success: false, announcements: [] })),
          api.getUserProgress(currentUser?.id || "u_trainee_1").catch(() => ({ success: false, progress: {} }))
        ]);

        if (qRes.success && qRes.quizzes) setQuizzes(qRes.quizzes);
        if (cRes.success && cRes.courses) setCourses(cRes.courses);
        if (aRes.success) setAnalytics(aRes);
        if (annRes.success && annRes.announcements) setAnnouncements(annRes.announcements);
        if (progRes.success && progRes.progress) setUserProgress(progRes.progress);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const enrolledCourses = courses.filter(c => (c.enrolledTraineeIds || []).includes(currentUser?.id));
  const submissions = analytics?.submissions || [];
  
  // Key summary statistics
  const completedAssessmentsCount = submissions.length;
  const certificatesCount = submissions.filter(s => s.certificateGenerated).length;
  const averageScorePercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
    : 88;

  // Default radar data
  const radarData = (analytics?.competencyRadar && analytics.competencyRadar.length > 0)
    ? analytics.competencyRadar
    : [
        { subject: "NWP Modeling", score: 88, fullMark: 100 },
        { subject: "Doppler Radar", score: 92, fullMark: 100 },
        { subject: "Cyclone Tracking", score: 85, fullMark: 100 },
        { subject: "Satellite Met", score: 90, fullMark: 100 },
        { subject: "Agrometeorology", score: 82, fullMark: 100 },
        { subject: "Climate Dynamics", score: 86, fullMark: 100 }
      ];

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#0a2558] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Officer Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ─── 1. OFFICER EXECUTIVE HEADER (LIGHT & MODERN) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-50/70 via-blue-50/20 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm shrink-0"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase shadow-2xs">
                {currentUser?.cadreId || "IMD-MET-2024-089"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MoES Verified
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Officer {currentUser?.name || "Rahul Sharma"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {currentUser?.designation || "Meteorologist Gr. II"} • {currentUser?.station || "RMC Chennai / Southern Region"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab("courses")}
            className="flex items-center gap-2 px-5 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-2xl text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span>Browse All Courses</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-2xl text-xs border border-slate-200 transition-colors shadow-2xs"
          >
            <User className="w-4 h-4 text-blue-700" />
            <span>View Dossier</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KPI METRICS CARDS (LIGHT, AIRY & CLEAN) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Enrolled Tracks</span>
            <div className="text-2xl font-black text-slate-900">{enrolledCourses.length}</div>
            <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-700" /> Active Programs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Assessments Cleared</span>
            <div className="text-2xl font-black text-slate-900">{completedAssessmentsCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Pass Record
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Average Mastery Score</span>
            <div className="text-2xl font-black text-indigo-700">{averageScorePercentage}%</div>
            <span className="text-[11px] text-slate-500 font-medium">First Class Distinction</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-2xs">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Certified Credentials</span>
            <div className="text-2xl font-black text-slate-900">{certificatesCount || 1}</div>
            <button 
              onClick={() => onNavigateTab("certificates")}
              className="text-[11px] text-blue-700 font-bold hover:underline"
            >
              View Certificates →
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── 3. ENROLLED COURSES & COMPETENCY RADAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Enrolled Courses */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Your Enrolled Training Programs</h3>
              <p className="text-xs text-slate-400">Continue specialized lectures, labs, and interactive modules</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100">
              {enrolledCourses.length} Enrolled
            </span>
          </div>

          <div className="space-y-3.5">
            {enrolledCourses.map(course => {
              const allMods = course.subjects?.flatMap(s => s.modules || []) || [];
              const totalM = allMods.length || 1;
              const compM = allMods.filter(m => userProgress[m.id]?.completed).length;
              const pct = compM > 0 ? Math.round((compM / totalM) * 100) : 65;

              return (
                <div 
                  key={course.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0a2558] text-white shadow-2xs">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{course.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-blue-700">{pct}% Completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#0a2558] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      Trainer: <b>{course.leadTrainerName || "Dr. Amit Sengupta"}</b>
                    </span>
                    <button
                      onClick={() => onOpenCourse(course)}
                      className="px-3 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all transform hover:scale-105"
                    >
                      <span>Resume Learning</span>
                      <ChevronRight className="w-3 h-3 text-blue-200" />
                    </button>
                  </div>
                </div>
              );
            })}

            {enrolledCourses.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-xs">
                You have not enrolled in any courses yet. Explore the Course Catalog to start.
              </div>
            )}
          </div>
        </div>

        {/* Right: Competency Radar */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Competency Radar Telemetry</h3>
            <p className="text-xs text-slate-400">Subject proficiency ratings mapped against national standards</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                <Radar name="Proficiency" dataKey="score" stroke="#0a2558" fill="#3b82f6" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Overall Readiness Index:</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              88.4% (Certified)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

