import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  Clock3, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Target, 
  Sparkles, 
  PlayCircle,
  BarChart3,
  Megaphone,
  UserCircle,
  ArrowUpRight
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
import { StatCard } from "../common/StatCard";
import { StatusBadge } from "../common/StatusBadge";
import { PageHeader } from "../common/PageHeader";

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
  
  const completedAssessmentsCount = submissions.length;
  const certificatesCount = submissions.filter(s => s.certificateGenerated).length;
  const averageScorePercentage = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
    : 85;

  const pendingQuizzes = quizzes.filter(q => !submissions.some(s => s.quizId === q.id));

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
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#164E63] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-[#64748B]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Institutional Officer Banner / Header ─── */}
      <PageHeader
        title="Trainee Dashboard"
        description={`Welcome back, ${currentUser?.name || "Officer"}. Overview of your capacity building progress, assigned assessments, and competency profiles.`}
        badge={
          <StatusBadge status={currentUser?.status === "approved" ? "verified" : "pending"} size="xs" />
        }
        actions={
          <div className="flex items-center gap-2">
            {onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#164E63] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Course Advisor</span>
              </button>
            )}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors"
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>Officer Profile</span>
              </button>
            )}
          </div>
        }
      />

      <div className="px-6 space-y-6 max-w-7xl mx-auto">
        {/* ─── Compact KPI Summary Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Enrolled Courses"
            value={enrolledCourses.length}
            subtext="Active training curricula"
            iconBg="bg-blue-50 text-[#1D4ED8]"
            onClick={() => onNavigateTab && onNavigateTab("my-learning")}
          />

          <StatCard
            icon={ClipboardCheck}
            label="Assessments"
            value={pendingQuizzes.length}
            subtext={`${completedAssessmentsCount} completed • ${averageScorePercentage}% avg`}
            iconBg="bg-amber-50 text-amber-700"
            onClick={() => onNavigateTab && onNavigateTab("trainee-quizzes")}
          />

          <StatCard
            icon={Award}
            label="Certificates"
            value={certificatesCount}
            subtext="Cryptographically verified"
            iconBg="bg-emerald-50 text-emerald-700"
            onClick={() => onNavigateTab && onNavigateTab("certificates")}
          />

          <StatCard
            icon={Target}
            label="Competency Score"
            value="88.4 / 100"
            subtext="Tier-1 Operational Level"
            iconBg="bg-teal-50 text-[#0F766E]"
            onClick={() => onNavigateTab && onNavigateTab("profile")}
          />
        </div>

        {/* ─── Two-Column Section ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 cols): Current Learning & Assessments */}
          <div className="lg:col-span-8 space-y-6">

            {/* In-Progress Curricula */}
            <div className="gov-card p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D9E2EC]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#164E63]" />
                  <h2 className="text-sm font-bold text-[#1E293B]">Current Learning Programs</h2>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("courses")}
                    className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1"
                  >
                    <span>Browse Catalog</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="space-y-3">
                  {enrolledCourses.slice(0, 3).map((course, idx) => {
                    const progressPct = idx === 0 ? 65 : 30;
                    return (
                      <div
                        key={course.id}
                        className="p-3.5 rounded border border-[#D9E2EC] bg-white hover:border-slate-400 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 text-[#164E63] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {course.code || "MET"}
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-[#0F766E] uppercase tracking-wider">
                              {course.category || "Meteorology"}
                            </span>
                            <h3 className="text-xs font-bold text-[#1E293B] mt-0.5 line-clamp-1">{course.title}</h3>
                            <div className="flex items-center gap-2.5 mt-1.5">
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-[#15803D] h-full rounded-full" 
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-[#64748B] font-medium">{progressPct}% Complete</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenCourse(course)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#1D4ED8] border border-[#D9E2EC] rounded text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-1"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] rounded border border-dashed border-[#D9E2EC]">
                  <p className="text-xs font-semibold text-[#1E293B]">No courses enrolled yet</p>
                  <p className="text-[11px] mt-0.5">Explore the official course catalog to begin learning.</p>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab("courses")}
                    className="mt-3 px-3 py-1.5 bg-[#1D4ED8] text-white text-xs font-semibold rounded"
                  >
                    View Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Scheduled Assessments */}
            <div className="gov-card p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D9E2EC]">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#164E63]" />
                  <h2 className="text-sm font-bold text-[#1E293B]">Upcoming & Assigned Assessments</h2>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("trainee-quizzes")}
                    className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] inline-flex items-center gap-1"
                  >
                    <span>All Tests ({quizzes.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {quizzes.slice(0, 3).map((quiz) => {
                  const submission = submissions.find(s => s.quizId === quiz.id);

                  return (
                    <div
                      key={quiz.id}
                      className="p-3.5 rounded border border-[#D9E2EC] bg-white hover:border-slate-400 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {quiz.courseName || "Assessment"}
                          </span>
                          <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                            <Clock3 className="w-3 h-3 text-[#94A3B8]" />
                            {quiz.durationMinutes} mins • {quiz.questions?.length || 10} MCQs
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-[#1E293B]">{quiz.title}</h3>
                        <p className="text-[11px] text-[#64748B]">
                          Passing threshold: {quiz.passMarks}/{quiz.totalMarks} Marks ({Math.round((quiz.passMarks/quiz.totalMarks)*100)}%)
                        </p>
                      </div>

                      <div className="shrink-0">
                        {submission ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {submission.score}/{submission.totalMarks} ({submission.percentage}%)
                            </span>
                            {submission.certificateGenerated && onOpenCertificate && (
                              <button
                                onClick={() => onOpenCertificate(submission, quiz.title, currentUser?.name)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-xs font-semibold flex items-center gap-1"
                                title="Certificate Available"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => onStartExam(quiz)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold transition-colors"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Take Exam</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Competency Radar & Circulars */}
          <div className="lg:col-span-4 space-y-6">

            {/* Competency Radar */}
            <div className="gov-card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#164E63]" />
                  <h3 className="font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                    Competency Profile
                  </h3>
                </div>
                <span className="text-[10px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Level 4 / Autonomous
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                6-domain meteorological readiness mapping
              </p>

              <div className="h-48 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#475569', fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Competency" dataKey="score" stroke="#164E63" fill="#164E63" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#D9E2EC] text-xs text-[#1E293B] flex items-center justify-between">
                <span className="text-[#64748B] text-[11px]">Aggregated Index</span>
                <b className="font-bold text-[#164E63]">88.4 / 100</b>
              </div>
            </div>

            {/* MoES Directives & Circulars */}
            <div className="gov-card p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D9E2EC]">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#164E63]" />
                  <h3 className="font-bold text-xs text-[#1E293B] uppercase tracking-wider">
                    MoES Directives
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Official</span>
              </div>

              <div className="space-y-2">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="p-2.5 bg-[#F8FAFC] rounded border border-[#D9E2EC]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {ann.category || "Circular"}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(ann.date || ann.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#1E293B] text-xs leading-tight">
                      {ann.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                      {ann.content || ann.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
