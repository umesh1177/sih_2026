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
  User,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Layers,
  GraduationCap,
  ShieldAlert,
  BrainCircuit
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
  onNavigateTab,
  onOpenAiAdvisor
}) => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [qRes, cRes, aRes, progRes] = await Promise.all([
          api.getQuizzes().catch(() => ({ success: false, quizzes: [] })),
          api.getCourses().catch(() => ({ success: false, courses: [] })),
          api.getTraineeAnalytics(currentUser?.id || "u_trainee_1").catch(() => ({ success: false })),
          api.getUserProgress(currentUser?.id || "u_trainee_1").catch(() => ({ success: false, progress: {} }))
        ]);

        if (qRes.success && qRes.quizzes) setQuizzes(qRes.quizzes);
        if (cRes.success && cRes.courses) setCourses(cRes.courses);
        if (aRes.success) setAnalytics(aRes);
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

  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  const enrolledSubjectNames = new Set(
    enrolledCourses.flatMap(c => (c.subjects || []).map(s => (s.name || s.title || "").toLowerCase().trim()))
  );
  const enrolledSubjectIds = new Set(
    enrolledCourses.flatMap(c => (c.subjects || []).map(s => s.id))
  );

  const officialQuizzes = quizzes.filter(q => {
    if (q.isPractice === true) return false;
    
    if (q.targetTraineeIds && Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length > 0) {
      return q.targetTraineeIds.includes(currentUser?.id);
    }

    if (Array.isArray(q.targetTraineeIds) && q.targetTraineeIds.length === 0) return true;
    if (!q.courseId || q.isAllTrainees) return true;
    if (q.courseId && enrolledCourseIds.has(q.courseId)) return true;
    if (q.courseName && enrolledCourses.some(c => c.title?.toLowerCase() === q.courseName?.toLowerCase())) return true;
    if (q.subjectId && enrolledSubjectIds.has(q.subjectId)) return true;
    if (q.subjectName && enrolledSubjectNames.has(q.subjectName.toLowerCase().trim())) return true;
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

  const completedAssessmentsCount = submissions.length;
  const certificatesCount = submissions.filter(s => s.certificateGenerated).length;
  const averageScorePercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
    : 0;

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
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#475569]">Loading Learner Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#172033]">
      
      {/* ─── 1. LEARNER EXECUTIVE HEADER ─── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] font-semibold text-base shrink-0">
            {currentUser?.name?.split(" ").map(n => n[0]).join("") || "TR"}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Trainee
              </span>
            </div>
            <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
              Welcome back, {currentUser?.name || "Trainee"}
            </h1>
            <p className="text-xs text-[#475569]">
              {currentUser?.designation || "Learning Track"} • {currentUser?.station || "Main Training Portal"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 font-semibold rounded-lg text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Course Advisor</span>
          </button>

          <button
            onClick={() => onNavigateTab("courses")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-100" />
            <span>Browse Courses</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#475569] font-medium rounded-lg text-xs border border-[#E2E8F0] transition-colors"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* ─── 2. KPI METRICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Enrolled Tracks</span>
            <div className="text-2xl font-semibold text-[#172033]">{enrolledCourses.length}</div>
            <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" /> Active Programs
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Assessments Cleared</span>
            <div className="text-2xl font-semibold text-[#172033]">{completedAssessmentsCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Submissions
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Average Score</span>
            <div className="text-2xl font-semibold text-[#2563EB]">{averageScorePercentage}%</div>
            <span className="text-[11px] text-[#475569]">Performance Index</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Certificates</span>
            <div className="text-2xl font-semibold text-[#172033]">{certificatesCount}</div>
            <button 
              onClick={() => onNavigateTab("certificates")}
              className="text-[11px] text-[#2563EB] font-medium hover:underline"
            >
              View Credentials →
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── 3. ACTION CENTER: SCHEDULED ASSESSMENTS ─── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#172033] flex items-center gap-2">
                <span>Scheduled Assessments</span>
                {liveAssessments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {liveAssessments.length} Live Now
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#475569]">
                Scheduled evaluations for your active learning modules.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("assessments")}
            className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-blue-800 transition-colors self-start sm:self-center"
          >
            <span>View All ({officialQuizzes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live & Upcoming Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Live Exams */}
          {liveAssessments.map(exam => {
            const deadlineFormatted = exam.deadlineTime 
              ? new Date(exam.deadlineTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
              : "Open Window";
            const qCount = exam.questions?.length || 10;

            return (
              <div
                key={exam.id}
                className="p-4 rounded-xl bg-white border border-emerald-300 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      LIVE NOW
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {exam.durationMinutes || 30} Mins
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#172033] text-sm leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {exam.subjectName || exam.courseName || "Core Subject"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {qCount} Questions • {exam.totalMarks || 20} Marks
                    </span>
                  </div>

                  <div className="text-[11px] text-[#475569] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <b className="text-[#172033] font-medium">{deadlineFormatted}</b></span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Trainer: {exam.trainerName || "Faculty"}</span>
                  <button
                    onClick={() => onStartExam && onStartExam(exam)}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-blue-100" />
                    <span>Start Exam</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Upcoming Exams */}
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
                className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 uppercase tracking-wider flex items-center gap-1 border border-blue-200">
                      <Clock className="w-3 h-3 text-blue-600" />
                      UPCOMING • {diffDays === 1 ? "In 1 Day" : `In ${diffDays} Days`}
                    </span>
                    <span className="text-[11px] font-medium text-[#475569] bg-slate-100 px-2 py-0.5 rounded">
                      {exam.durationMinutes || 30} Mins
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#172033] text-sm leading-snug line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {exam.subjectName || exam.courseName || "Core Subject"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {qCount} Questions • {exam.totalMarks || 20} Marks
                    </span>
                  </div>

                  <div className="text-[11px] text-[#475569] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Starts: <b className="text-[#172033] font-medium">{startFormatted}</b></span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Trainer: {exam.trainerName || "Faculty"}</span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Locked</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {liveAssessments.length === 0 && upcomingAssessments.length === 0 && (
            <div className="col-span-full p-6 text-center bg-slate-50 rounded-xl border border-dashed border-[#E2E8F0] space-y-2">
              <Calendar className="w-6 h-6 text-slate-400 mx-auto" />
              <h4 className="font-medium text-[#172033] text-xs">No Active or Upcoming Scheduled Assessments</h4>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                All assigned assessments are up to date. When new exams are scheduled, they will appear here.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigateTab("assessments")}
                  className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
                >
                  Go to Assessments Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. AUTOMATED LEARNING GAP DETECTION ALERT ─── */}
      <div className="bg-amber-50/70 rounded-xl p-5 border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-white" />
              Learning Gap Identified
            </span>
            <span className="text-xs font-medium text-amber-800">
              Accuracy: 46% (Below Target Benchmark)
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-[#172033] tracking-tight">
            Targeted Review Suggested for Core Concepts &amp; Practice
          </h3>

          <p className="text-xs text-[#475569] leading-relaxed">
            The system detected topics needing practice. Concept summaries, lecture materials, and adaptive practice exercises are ready.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab("learning-gaps")}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-amber-100" />
            <span>Remediation Hub →</span>
          </button>
        </div>
      </div>

      {/* ─── 5. PRACTICE STUDIO & QUESTION BANK BANNER ─── */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> PRACTICE STUDIO
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-[#172033]">Adaptive Practice Testing & Question Bank</h3>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Generate customized practice question papers for any subject or topic, and explore the institutional Question Bank.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onNavigateTab("practice-papers")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Practice Papers</span>
          </button>

          <button
            onClick={() => onNavigateTab("questions")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-xs border border-[#E2E8F0] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Question Bank</span>
          </button>
        </div>
      </div>

      {/* ─── 6. ENROLLED COURSES & COMPETENCY RADAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Enrolled Courses */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="font-semibold text-[#172033] text-sm">Enrolled Training Programs</h3>
              <p className="text-xs text-[#475569]">Specialized lectures, labs, and interactive modules</p>
            </div>
            <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              {enrolledCourses.length} Enrolled
            </span>
          </div>

          <div className="space-y-3.5">
            {enrolledCourses.map(course => {
              const allMods = course.subjects?.flatMap(s => s.modules || []) || [];
              const totalM = allMods.length || 1;
              const compM = allMods.filter(m => userProgress[m.id]?.completed).length;
              const pct = compM > 0 ? Math.round((compM / totalM) * 100) : 0;

              const courseQuizzes = officialQuizzes.filter(q => 
                q.courseId === course.id || 
                q.courseName?.toLowerCase() === course.title?.toLowerCase() ||
                (course.subjects || []).some(s => s.id === q.subjectId || (s.name && q.subjectName && s.name.toLowerCase() === q.subjectName.toLowerCase()))
              );

              return (
                <div 
                  key={course.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-[#E2E8F0] hover:border-blue-200 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2563EB] text-white">
                        {course.code || "CRS"}
                      </span>
                      <h4 className="font-semibold text-[#172033] text-xs sm:text-sm">{course.title}</h4>
                    </div>
                    <span className="text-xs font-medium text-[#2563EB]">{pct}% Completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Subjects & Scheduled Assessments Grid */}
                  {(course.subjects || []).length > 0 && (
                    <div className="pt-1 space-y-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#475569] block">
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
                            <div key={sub.id || sIdx} className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 min-w-[140px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0"></span>
                                <span className="font-medium text-[#172033] text-[11px] truncate max-w-[220px]">
                                  {sub.name || sub.title}
                                </span>
                              </div>

                              {subQuiz ? (
                                isLive ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                                      Exam Available Now
                                    </span>
                                    <button
                                      onClick={() => onStartExam && onStartExam(subQuiz)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-[10px] shadow-xs transition-colors flex items-center gap-1"
                                    >
                                      <PlayCircle className="w-3 h-3 text-emerald-100" />
                                      <span>Start Exam</span>
                                    </button>
                                  </div>
                                ) : isUpcoming ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
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
                    <span className="text-[#475569] font-medium">
                      Trainer: <b className="text-[#172033] font-semibold">{course.leadTrainerName || "Assigned Faculty"}</b>
                    </span>
                    <button
                      onClick={() => onOpenCourse(course)}
                      className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
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
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#172033] text-sm">Competency Radar</h3>
            <p className="text-xs text-[#475569]">Subject proficiency ratings mapped dynamically</p>
          </div>

          {radarData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-1">
              <p className="font-medium text-slate-600">No competency data recorded yet.</p>
              <p className="text-[11px]">Complete courses and assessments to generate your skill radar.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94A3B8' }} />
                  <Radar name="Proficiency" dataKey="score" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-[#E2E8F0] flex items-center justify-between text-xs font-medium text-[#475569]">
            <span>Overall Readiness:</span>
            <span className="text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {averageScorePercentage > 0 ? `${averageScorePercentage}% Active` : "Awaiting Data"}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
