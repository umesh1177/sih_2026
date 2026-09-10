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
  Target
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
  
  // Calculate key summary statistics
  const completedAssessmentsCount = submissions.length;
  const passedAssessmentsCount = submissions.filter(s => s.status === "passed" || s.score >= (s.passMarks || 10)).length;
  const certificatesCount = submissions.filter(s => s.certificateGenerated).length;
  const averageScorePercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
    : 85;

  const pendingQuizzes = quizzes.filter(q => !submissions.some(s => s.quizId === q.id));

  // Default radar data if not provided
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
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#0a2558] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Trainee Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ─── 1. OFFICER EXECUTIVE HEADER ─── */}
      <div className="bg-gradient-to-r from-[#0a2558] via-blue-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            {currentUser?.status === "approved" ? (
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full ring-2 ring-[#0a2558]" title="Verified Officer">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-400 text-slate-900 rounded-full ring-2 ring-[#0a2558]" title="Pending Verification">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-black tracking-tight">
                {currentUser?.name || "Trainee Officer"}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                currentUser?.status === "approved" 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" 
                  : "bg-amber-400/20 text-amber-300 border border-amber-400/30"
              }`}>
                {currentUser?.status === "approved" ? "Verified Officer" : "Pending Admin Review"}
              </span>
            </div>
            <p className="text-xs text-blue-200/90 font-medium">
              {currentUser?.designation || "Meteorologist / Trainee"} • {currentUser?.department || "India Meteorological Department (MoES)"}
            </p>
          </div>
        </div>

        {/* Quick Action Profile Button */}
        <div className="flex items-center gap-3">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0a2558] hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 shrink-0"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Officer Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── 2. EXECUTIVE SUMMARY KPI CARDS (4 SECTIONS SUMMARY) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Courses */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab("my-learning")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Courses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0a2558] flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {enrolledCourses.length} <span className="text-xs text-slate-400 font-normal">Active Programs</span>
            </div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
              <span>View Curriculum</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 2: Scheduled Assessments */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab("trainee-quizzes")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {pendingQuizzes.length} <span className="text-xs text-amber-600 font-bold">Pending Tests</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {completedAssessmentsCount} Attempted • {averageScorePercentage}% Avg Score
            </p>
          </div>
        </div>

        {/* Card 3: Earned Certificates */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab("certificates")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certified Credentials</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {certificatesCount} <span className="text-xs text-emerald-600 font-bold">Verified</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span>View Badges & PDFs</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </div>

        {/* Card 4: Competency Index */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab("analytics")}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Competency Index</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              88.4 <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-[11px] text-purple-700 font-bold mt-1">
              Tier-1 Certified Meteorologist
            </p>
          </div>
        </div>
      </div>

      {/* ─── AI RECOMMENDATION BANNER ─── */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-50 to-indigo-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-tr from-amber-400 to-yellow-400 text-slate-900 rounded-2xl shadow-md shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                Gemini AI Advisor
              </span>
              <span className="text-xs font-bold text-slate-800">
                Personalized Training Pathways Available
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Based on your specialization in {currentUser?.department || "Meteorology"}, AI has synthesized tailored training programs for your career advancement.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAiAdvisor}
          className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Explore AI Recommendations</span>
        </button>
      </div>

      {/* ─── 3. MAIN EXECUTIVE TWO-COLUMN SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ─── LEFT COLUMN (8 COLS): Key Actionable Summaries ─── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section A: Actionable Timed Assessments & Kiosk Exams */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#0a2558] rounded-lg">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Scheduled Capacity Assessments</h2>
                  <p className="text-[11px] text-slate-500">Timed proctored exams and evaluation tests</p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("trainee-quizzes")}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>View All ({quizzes.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {quizzes.slice(0, 3).map((quiz) => {
                const submission = submissions.find(s => s.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {quiz.courseName || "MoES Track"}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {quiz.durationMinutes} mins • {quiz.questions?.length || 10} Questions
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 leading-snug">{quiz.title}</h3>
                      <p className="text-[11px] text-slate-500">
                        Lead Trainer: <b>{quiz.trainerName || "Senior Meteorologist"}</b> • Pass Marks: {quiz.passMarks}/{quiz.totalMarks}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {submission ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {submission.score}/{submission.totalMarks} ({submission.percentage}%)
                          </span>
                          {submission.certificateGenerated && onOpenCertificate && (
                            <button
                              onClick={() => onOpenCertificate(submission, quiz.title, currentUser?.name)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1"
                              title="Download Certificate"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => onStartExam(quiz)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
                        >
                          <PlayCircle className="w-4 h-4 text-emerald-300" />
                          <span>Start Kiosk Exam</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: In-Progress Enrolled Courses Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Enrolled Training Curricula</h2>
                  <p className="text-[11px] text-slate-500">Active subjects, video modules, and lecture notes</p>
                </div>
              </div>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("courses")}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>Course Catalog ({courses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.slice(0, 3).map((course, idx) => {
                  const progressPct = idx === 0 ? 65 : 30; // representative progress
                  return (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                          }}
                          className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {course.code}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">{course.title}</h3>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all" 
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{progressPct}% Complete</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenCourse(course)}
                        className="px-4 py-2 bg-slate-100 hover:bg-[#0a2558] hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>Resume Course</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Enrolled Courses Yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Explore the MoES course catalog and enroll into meteorological programs.</p>
                <button
                  onClick={() => onNavigateTab && onNavigateTab("courses")}
                  className="mt-3 px-4 py-2 bg-[#0a2558] text-white rounded-xl text-xs font-bold shadow"
                >
                  Browse Course Catalog
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN (4 COLS): Radar, Badges & MoES Directives ─── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Section C: Competency Radar Chart Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Competency Radar
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tier-1
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                6-domain operational readiness profile
              </p>
            </div>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Officer Competency" dataKey="score" stroke="#0a2558" fill="#0a2558" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
              <span className="font-medium">Overall Proficiency</span>
              <b className="text-sm font-black text-[#0a2558]">88.4 / 100</b>
            </div>
          </div>

          {/* Section D: Latest MoES Circulars & Broadcasts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <BellRing className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  MoES Directives
                </h3>
              </div>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                Official
              </span>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {ann.category || "Circular"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.date || ann.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-[11px] leading-tight">
                    {ann.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {ann.content || ann.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
