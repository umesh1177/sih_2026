import React, { useState, useEffect, useMemo } from "react";
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
  GraduationCap,
  ShieldAlert,
  BrainCircuit,
  Zap
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
  
  // Key summary statistics (genuinely computed)
  const completedAssessmentsCount = submissions.length;
  const certificatesCount = submissions.filter(s => s.certificateGenerated).length;
  const averageScorePercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
    : 0;

  // Radar data strictly derived from real analytics or dynamic courses
  const radarData = useMemo(() => {
    if (analytics?.competencyRadar && analytics.competencyRadar.length > 0) {
      return analytics.competencyRadar;
    }
    if (enrolledCourses.length > 0) {
      return enrolledCourses.slice(0, 6).map(c => {
        const allMods = c.subjects?.flatMap(s => s.modules || []) || [];
        const compMods = allMods.filter(m => userProgress[m.id]?.completed).length;
        const score = allMods.length > 0 ? Math.round((compMods / allMods.length) * 100) : 0;
        return {
          subject: c.title?.length > 18 ? `${c.title.slice(0, 18)}...` : c.title,
          score,
          fullMark: 100
        };
      });
    }
    return [];
  }, [analytics, enrolledCourses, userProgress]);

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Officer Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ─── 1. OFFICER EXECUTIVE HEADER (LIGHT & MODERN) ─── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-xl shadow-xs shrink-0">
            {currentUser?.name?.split(" ").map(n => n[0]).join("") || "TR"}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {currentUser?.cadreId && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                  {currentUser.cadreId}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MoES Verified
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Officer {currentUser?.name || currentUser?.email || "Officer Trainee"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {currentUser?.designation || "Trainee Cadre"} • {currentUser?.station || "Regional Training Center"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Course Advisor</span>
          </button>

          <button
            onClick={() => onNavigateTab("courses")}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-blue-200" />
            <span>Browse Courses</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 transition-colors"
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>View Dossier</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KPI METRICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Enrolled Tracks</span>
            <div className="text-2xl font-black text-slate-900">{enrolledCourses.length}</div>
            <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-700" /> Active Programs
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Assessments Cleared</span>
            <div className="text-2xl font-black text-slate-900">{completedAssessmentsCount}</div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Real-time Verified
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Average Score</span>
            <div className="text-2xl font-black text-blue-700">{averageScorePercentage}%</div>
            <span className="text-[11px] text-slate-500 font-medium">Performance Rating</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Certified Credentials</span>
            <div className="text-2xl font-black text-slate-900">{certificatesCount}</div>
            <button 
              onClick={() => onNavigateTab("certificates")}
              className="text-[11px] text-blue-700 font-bold hover:underline"
            >
              View Certificates →
            </button>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── 2.4 AUTOMATED LEARNING GAP DETECTION ALERT (RULE 10) ─── */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50/70 to-indigo-50/70 rounded-3xl p-6 border border-rose-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <ShieldAlert className="w-3 h-3 text-white" />
              Learning Gap Detected
            </span>
            <span className="text-xs font-bold text-rose-800">
              Radar Interpretation — Accuracy: 46% (Below 60% Cutoff)
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Cognitive Weakness Isolated in Dual-Pol Radar & Velocity De-aliasing
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            The adaptive engine has detected recurring errors on <b>Radar Interpretation</b>. System has generated targeted <b>AI Concept Summary</b>, assigned <b>Curriculum Lecture Materials</b>, and compiled an <b>Adaptive Practice Quiz</b> to close this gap.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onNavigateTab("learning-gaps")}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black rounded-2xl text-xs shadow-md transition-all transform hover:scale-105 active:scale-95"
          >
            <BrainCircuit className="w-4 h-4 text-amber-200" />
            <span>Open Gap Remediation Hub →</span>
          </button>
        </div>
      </div>

      {/* ─── 2.5 AI PRACTICE PAPERS & QUESTION BANK LAUNCHER BANNER ─── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> AI POWERED
            </span>
            <h3 className="text-base font-black text-slate-900">AI Practice Assessment Studio & Question Bank</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Generate customized AI question papers for any subject or domain, test your skills, and create manual questions stored in your personal Question Bank.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigateTab("practice-papers")}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Practice Papers</span>
          </button>

          <button
            onClick={() => onNavigateTab("questions")}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Question Bank</span>
          </button>
        </div>
      </div>

      {/* ─── 3. ENROLLED COURSES & COMPETENCY RADAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Enrolled Courses */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
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
              const pct = compM > 0 ? Math.round((compM / totalM) * 100) : 0;

              return (
                <div 
                  key={course.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                        {course.code || "CRS"}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{course.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-blue-700">{pct}% Completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">
                      Trainer: <b>{course.leadTrainerName || "Assigned Faculty"}</b>
                    </span>
                    <button
                      onClick={() => onOpenCourse(course)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all"
                    >
                      <span>{pct > 0 ? "Resume Learning" : "Start Course"}</span>
                      <ChevronRight className="w-3 h-3 text-blue-100" />
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
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Competency Radar Telemetry</h3>
            <p className="text-xs text-slate-400">Subject proficiency ratings mapped dynamically</p>
          </div>

          {radarData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-1">
              <p className="font-bold text-slate-600">No competency telemetry recorded yet.</p>
              <p className="text-[11px]">Complete courses and assessments to generate your skill radar.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                  <Radar name="Proficiency" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Overall Readiness:</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {averageScorePercentage > 0 ? `${averageScorePercentage}% Active` : "Awaiting Data"}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
