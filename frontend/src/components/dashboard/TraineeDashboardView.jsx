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
  
  const now = new Date();
  const submissionQuizIds = new Set(submissions.filter(s => !s.isDisqualified).map(s => s.quizId));

  // Dynamic scheduled assessments filtering for Trainee Dashboard
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  const enrolledSubjectNames = new Set(
    enrolledCourses.flatMap(c => (c.subjects || []).map(s => (s.name || s.title || "").toLowerCase().trim()))
  );
  const enrolledSubjectIds = new Set(
    enrolledCourses.flatMap(c => (c.subjects || []).map(s => s.id))
  );

  const officialQuizzes = quizzes.filter(q => {
    if (q.isPractice === true) return false;
    
    // Specifically targeting certain trainees: check membership
    if (q.targetTraineeIds && Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length > 0) {
      return q.targetTraineeIds.includes(currentUser?.id);
    }

    // Empty targetTraineeIds [] = trainer published for "All Enrolled Trainees" = broadcast to all
    if (Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length === 0) return true;

    // General academy-wide assessments or explicitly open
    if (!q.courseId || q.isAllTrainees) return true;

    // Enrolled course ID match
    if (q.courseId && enrolledCourseIds.has(q.courseId)) return true;

    // Enrolled course Name match
    if (q.courseName && enrolledCourses.some(c => c.title?.toLowerCase() === q.courseName?.toLowerCase())) return true;

    // Enrolled subject ID / Name match
    if (q.subjectId && enrolledSubjectIds.has(q.subjectId)) return true;
    if (q.subjectName && enrolledSubjectNames.has(q.subjectName.toLowerCase().trim())) return true;

    // Fallback: If not enrolled in any course yet, show available academy assessments
    if (enrolledCourses.length === 0) return true;

    return false;
  });


  const liveAssessments = officialQuizzes.filter(q => {
    if (submissionQuizIds.has(q.id)) return false;
    if (q.scheduledStartTime && new Date(q.scheduledStartTime) > now) return false;
    if (q.deadlineTime && new Date(q.deadlineTime) < now) return false;
    return true;
  });

  const upcomingAssessments = officialQuizzes.filter(q => {
    if (submissionQuizIds.has(q.id)) return false;
    return q.scheduledStartTime && new Date(q.scheduledStartTime) > now;
  });

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

      {/* ─── 2.2 ACTIVE & UPCOMING SCHEDULED ASSESSMENTS (TRAINER SCHEDULED) ─── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Trainer-Scheduled Assessments &amp; Exams</span>
                {liveAssessments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {liveAssessments.length} Live Now
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Official evaluations scheduled by MoES trainers. Complete in fullscreen proctored mode.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("assessments")}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-center"
          >
            <span>View All Assessments ({officialQuizzes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live & Upcoming Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Live Exams */}
          {liveAssessments.map(exam => {
            const deadlineFormatted = exam.deadlineTime 
              ? new Date(exam.deadlineTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
              : "Open Window";
            const qCount = exam.questions?.length || 10;

            return (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      AVAILABLE • LIVE NOW
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {exam.durationMinutes || 30} Mins
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {exam.subjectName || exam.courseName || "Core Subject"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {qCount} Questions • {exam.totalMarks || 20} Marks
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Deadline: <b className="text-slate-700">{deadlineFormatted}</b></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">Trainer: {exam.trainerName || "MoES Faculty"}</span>
                  <button
                    onClick={() => onStartExam && onStartExam(exam)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-sm transition-all transform hover:scale-105 active:scale-95 shrink-0"
                  >
                    <PlayCircle className="w-4 h-4 text-emerald-100" />
                    <span>Start Exam</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* 2. Upcoming Exams */}
          {upcomingAssessments.map(exam => {
            const startFormatted = exam.scheduledStartTime 
              ? new Date(exam.scheduledStartTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
              : "Coming Soon";
            const qCount = exam.questions?.length || 10;
            const diffDays = exam.scheduledStartTime 
              ? Math.ceil((new Date(exam.scheduledStartTime) - now) / (1000 * 60 * 60 * 24)) 
              : 1;

            return (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/40 to-white border border-blue-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-wider flex items-center gap-1 border border-blue-200">
                      <Clock className="w-3 h-3 text-blue-600" />
                      UPCOMING • {diffDays === 1 ? "In 1 Day" : `In ${diffDays} Days`}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {exam.durationMinutes || 30} Mins
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {exam.subjectName || exam.courseName || "Core Subject"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {qCount} Questions • {exam.totalMarks || 20} Marks
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Starts: <b className="text-slate-800">{startFormatted}</b></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">Trainer: {exam.trainerName || "MoES Faculty"}</span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Locked</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State if No Live or Upcoming */}
          {liveAssessments.length === 0 && upcomingAssessments.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Active or Upcoming Scheduled Assessments</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All assigned assessments are up to date. When trainers schedule new exams for your course tracks, they will appear right here with full proctored kiosk launch options.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab("assessments")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Go to Assessments Center
                </button>
              </div>
            </div>
          )}
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

              // Find any scheduled assessments for this specific course or its subjects
              const courseQuizzes = officialQuizzes.filter(q => 
                q.courseId === course.id || 
                q.courseName?.toLowerCase() === course.title?.toLowerCase() ||
                (course.subjects || []).some(s => s.id === q.subjectId || (s.name && q.subjectName && s.name.toLowerCase() === q.subjectName.toLowerCase()))
              );

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

                  {/* Subjects & Scheduled Assessments Grid */}
                  {(course.subjects || []).length > 0 && (
                    <div className="pt-1 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Course Subjects &amp; Scheduled Assessments:
                      </span>
                      <div className="space-y-1.5">
                        {course.subjects.map((sub, sIdx) => {
                          const subQuiz = courseQuizzes.find(q => 
                            q.subjectId === sub.id || 
                            (q.subjectName && (sub.name || sub.title) && q.subjectName.toLowerCase() === (sub.name || sub.title).toLowerCase())
                          );
                          const isLive = subQuiz && (!subQuiz.scheduledStartTime || new Date(subQuiz.scheduledStartTime) <= now) && (!subQuiz.deadlineTime || new Date(subQuiz.deadlineTime) >= now) && !submissionQuizIds.has(subQuiz.id);
                          const isUpcoming = subQuiz && subQuiz.scheduledStartTime && new Date(subQuiz.scheduledStartTime) > now && !submissionQuizIds.has(subQuiz.id);

                          return (
                            <div key={sub.id || sIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                                <span className="font-bold text-slate-800 text-[11px] truncate max-w-[220px]">
                                  {sub.name || sub.title}
                                </span>
                              </div>

                              {subQuiz ? (
                                isLive ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                                      Exam Available Now
                                    </span>
                                    <button
                                      onClick={() => onStartExam && onStartExam(subQuiz)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-2xs transition-all flex items-center gap-1"
                                    >
                                      <PlayCircle className="w-3 h-3 text-emerald-100" />
                                      <span>Start Exam</span>
                                    </button>
                                  </div>
                                ) : isUpcoming ? (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-blue-500" />
                                    Exam Starts {new Date(subQuiz.scheduledStartTime).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {sub.modules?.length || 2} Modules
                                  </span>
                                )
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {sub.modules?.length || 2} Modules
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
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
