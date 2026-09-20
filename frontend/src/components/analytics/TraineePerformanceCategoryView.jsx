import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Award,
  TrendingUp,
  Filter,
  Search,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Building2,
  BookOpen,
  Sparkles,
  GraduationCap,
  FileText,
  RotateCcw,
  Download,
  Clock,
  BarChart3,
  Layers,
  ArrowRight,
  PlayCircle,
  Eye
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from "recharts";
import { api } from "../../services/api";

const CATEGORY_COLORS = {
  Excellent: "#10b981",
  Good: "#2563eb",
  "Needs Improvement": "#f59e0b",
  Poor: "#ef4444"
};

export const TraineePerformanceCategoryView = ({
  currentUser,
  onOpenStudio,
  onOpenCourse,
  onStartExam,
  onNavigateTab
}) => {
  const isTrainee = currentUser?.role === "trainee";
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  // Data states
  const [trainees, setTrainees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("learners");

  // Controls for Trainer View
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Trainee mock/real topics & assessment data
  const [traineeTopicPerformance, setTraineeTopicPerformance] = useState([
    { topic: "Radar Interpretation", score: 46, status: "Needs Attention", wrongCount: 8, total: 15 },
    { topic: "Numerical Prediction", score: 52, status: "Needs Attention", wrongCount: 9, total: 18 },
    { topic: "Satellite Data", score: 68, status: "Good", wrongCount: 5, total: 16 },
    { topic: "Hydro Meteorology", score: 78, status: "Good", wrongCount: 3, total: 14 },
    { topic: "Disaster Management", score: 88, status: "Excellent", wrongCount: 1, total: 12 }
  ]);

  const [traineeAssessmentScores, setTraineeAssessmentScores] = useState([
    { title: "Radar Meteorology", score: 46 },
    { title: "NWP Basics", score: 52 },
    { title: "Sat Remote Sensing", score: 68 },
    { title: "Hydrology Intro", score: 78 },
    { title: "Cyclone Tracking", score: 88 }
  ]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, qRes] = await Promise.all([
        api.getTrainerEnrolledTrainees().catch(() => ({ success: false, trainees: [] })),
        api.getCourses().catch(() => ({ success: false, courses: [] })),
        api.getQuizzes().catch(() => ({ success: false, quizzes: [] }))
      ]);

      if (tRes.success && Array.isArray(tRes.trainees)) {
        setTrainees(tRes.trainees);
      }
      if (cRes.success && Array.isArray(cRes.courses)) {
        setCourses(cRes.courses);
      }
      if (qRes.success && Array.isArray(qRes.quizzes)) {
        setQuizzes(qRes.quizzes);
      }
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter trainees by controls
  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      if (selectedCourseId !== "all" && t.courseId !== selectedCourseId) {
        return false;
      }
      if (selectedStatusFilter === "excellent" && (t.compositeScore || t.assessmentScore || 0) < 85) return false;
      if (selectedStatusFilter === "needsImprovement" && (t.compositeScore || t.assessmentScore || 0) >= 70) return false;
      return true;
    });
  }, [trainees, selectedCourseId, selectedStatusFilter]);

  // Compute Trainer KPIs
  const trainerKpis = useMemo(() => {
    const list = filteredTrainees.length > 0 ? filteredTrainees : trainees;
    if (!list || list.length === 0) {
      return { classAvg: 76, passRate: 84, attempts: 42, completion: 79 };
    }
    const totalScore = list.reduce((acc, t) => acc + (t.compositeScore || t.assessmentScore || 75), 0);
    const totalComp = list.reduce((acc, t) => acc + (t.completionPercentage || t.progressPercentage || 80), 0);
    const passed = list.filter((t) => (t.compositeScore || t.assessmentScore || 75) >= 60).length;

    return {
      classAvg: Math.round(totalScore / list.length),
      passRate: Math.round((passed / list.length) * 100),
      attempts: list.length * 2,
      completion: Math.round(totalComp / list.length)
    };
  }, [filteredTrainees, trainees]);

  // Donut chart performance breakdown counts
  const categoryCounts = useMemo(() => {
    const list = filteredTrainees.length > 0 ? filteredTrainees : trainees;
    const counts = [
      { name: "Excellent", value: 0, color: "#10b981" },
      { name: "Good", value: 0, color: "#2563eb" },
      { name: "Needs Improvement", value: 0, color: "#f59e0b" },
      { name: "Poor", value: 0, color: "#ef4444" }
    ];

    if (!list || list.length === 0) {
      return [
        { name: "Excellent", value: 12, color: "#10b981" },
        { name: "Good", value: 18, color: "#2563eb" },
        { name: "Needs Improvement", value: 6, color: "#f59e0b" },
        { name: "Poor", value: 2, color: "#ef4444" }
      ];
    }

    list.forEach((t) => {
      const score = t.compositeScore || t.assessmentScore || 0;
      if (score >= 85) counts[0].value++;
      else if (score >= 70) counts[1].value++;
      else if (score >= 50) counts[2].value++;
      else counts[3].value++;
    });

    return counts;
  }, [filteredTrainees, trainees]);

  // Question accuracy (sorted lowest to highest accuracy)
  const questionAccuracyData = useMemo(() => {
    const raw = [
      { question: "Q4: Doppler Velocity Phase Ambiguity", accuracy: 38, topic: "Radar Interpretation" },
      { question: "Q2: CFL Condition in Grid Models", accuracy: 44, topic: "Numerical Prediction" },
      { question: "Q7: Dual-Pol Hail Z_DR Threshold", accuracy: 52, topic: "Radar Interpretation" },
      { question: "Q1: 3D-Var Radiative Transfer Operator", accuracy: 61, topic: "Satellite Data" },
      { question: "Q5: Hydrostatic Balance Assumption", accuracy: 74, topic: "Numerical Prediction" },
      { question: "Q3: Marshall-Palmer Rain Relation", accuracy: 82, topic: "Hydro Meteorology" },
      { question: "Q6: Geostrophic Wind Relation", accuracy: 91, topic: "Atmospheric Dynamics" }
    ];
    return raw.sort((a, b) => a.accuracy - b.accuracy);
  }, []);

  // Topic performance data
  const topicPerformanceData = useMemo(() => {
    return [
      { topic: "Radar Interpretation", avgScore: 46 },
      { topic: "Numerical Prediction", avgScore: 52 },
      { topic: "Satellite Data", avgScore: 68 },
      { topic: "Hydro Meteorology", avgScore: 78 },
      { topic: "Disaster Mgmt", avgScore: 88 }
    ];
  }, []);

  // Score distribution data
  const scoreDistributionData = useMemo(() => {
    return [
      { range: "0-20%", count: 1 },
      { range: "21-40%", count: 3 },
      { range: "41-60%", count: 8 },
      { range: "61-80%", count: 16 },
      { range: "81-100%", count: 10 }
    ];
  }, []);

  // Course progress distribution
  const courseProgressDistribution = useMemo(() => {
    return [
      { name: "Completed", value: 45, fill: "#10b981" },
      { name: "In Progress", value: 40, fill: "#2563eb" },
      { name: "Not Started", value: 15, fill: "#94a3b8" }
    ];
  }, []);

  // ----------------------------------------------------
  // RENDER: TRAINEE ANALYTICS ("My Learning Performance")
  // ----------------------------------------------------
  if (isTrainee) {
    const overallScore = 78;
    const courseProgress = 82;
    const assessmentsPassed = 8;
    const learningGapsCount = 2;

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans text-slate-800 bg-[#F7F9FC] min-h-screen">
        {/* Page Title Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 uppercase tracking-wider">
                Personal Analytics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Learning Performance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Track progress, assessment results and learning gaps.
            </p>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Score</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{overallScore}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Course Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{courseProgress}%</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assessments Passed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{assessmentsPassed}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Learning Gaps</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{learningGapsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Assessment Scores Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Assessment Scores</h3>
              <span className="text-xs text-slate-400 font-medium">Recent Assessments</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={traineeAssessmentScores}>
                  <XAxis dataKey="title" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Competency Progress Radar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Competency Progress</h3>
              <span className="text-xs text-slate-400 font-medium">Domain Mastery</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={traineeTopicPerformance}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: "#172033" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Accuracy" dataKey="score" stroke="#0F766E" fill="#0F766E" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Topic Performance Horizontal Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Topic Performance</h3>
              <p className="text-xs text-slate-500 font-medium">Weak topics highlighted for targeted practice</p>
            </div>
          </div>

          <div className="space-y-3">
            {traineeTopicPerformance.map((item, idx) => {
              const isWeak = item.score < 60;
              return (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{item.topic}</span>
                      <span className={`text-xs font-mono font-semibold ${isWeak ? "text-amber-600" : "text-emerald-600"}`}>
                        {item.score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.score}%` }}
                        className={`h-full rounded-full transition-all ${isWeak ? "bg-amber-500" : "bg-blue-600"}`}
                      />
                    </div>
                  </div>

                  {isWeak && (
                    <button
                      onClick={() => onNavigateTab && onNavigateTab("practice-papers")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Practice Now</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: TRAINER & ADMIN ANALYTICS ("Learner Performance")
  // ----------------------------------------------------
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans text-slate-800 bg-[#F7F9FC] min-h-screen">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 uppercase tracking-wider">
              {isAdmin ? "Platform Intelligence" : "Faculty Analytics"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Learner Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Course → Assessment → Learner Performance
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Assessments</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="excellent">Excellent (&ge;85%)</option>
              <option value="needsImprovement">Needs Attention (&lt;70%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab("learners")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeAdminTab === "learners"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Learners</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("departments")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeAdminTab === "departments"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("courses")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeAdminTab === "courses"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses</span>
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Class Average</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{trainerKpis.classAvg}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pass Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{trainerKpis.passRate}%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Attempts</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{trainerKpis.attempts}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completion</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{trainerKpis.completion}%</p>
        </div>
      </div>

      {/* Main Tab Views */}
      {isAdmin && activeAdminTab === "departments" ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Department Performance</h3>
          <p className="text-xs text-slate-500">Benchmark across operational departments.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Atmospheric Physics", "Radar Meteorology", "Hydrology Services"].map((d, i) => (
              <div key={d} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-800">{d}</h4>
                  <span className="text-xs font-semibold text-blue-600">{72 + i * 5}% Avg</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${72 + i * 5}%` }} className="bg-blue-600 h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isAdmin && activeAdminTab === "courses" ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Course Performance</h3>
          <p className="text-xs text-slate-500">Distribution across active courses.</p>
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">{c.title}</h4>
                  <p className="text-[11px] text-slate-500">{c.category || "Standard Program"}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">82% Completion</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Learners Default View — Charts + Table */
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart A: Donut Chart - Learner Performance */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Learner Performance</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Question Accuracy Horizontal Bar (Lowest first!) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Question Accuracy</h3>
                <span className="text-xs text-slate-400 font-medium">Sorted lowest to highest</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionAccuracyData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="question" type="category" width={140} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart C: Topic Performance Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Topic Performance</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicPerformanceData}>
                    <XAxis dataKey="topic" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart D & E: Score Distribution & Course Progress */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Score Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData}>
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Learner Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Learner Performance</h3>
              <span className="text-xs text-slate-400 font-medium">{filteredTrainees.length || 5} Enrolled Trainees</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-5">Trainee</th>
                    <th className="py-3.5 px-5 text-center">Score</th>
                    <th className="py-3.5 px-5 text-center">Completion</th>
                    <th className="py-3.5 px-5 text-center">Category</th>
                    <th className="py-3.5 px-5">Learning Gap</th>
                    <th className="py-3.5 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(filteredTrainees.length > 0 ? filteredTrainees : [
                    { name: "Rahul Sharma", email: "rahul@moes.gov.in", score: 46, completion: 60, category: "Poor", gap: "Radar Interpretation" },
                    { name: "Priya Patel", email: "priya@moes.gov.in", score: 52, completion: 65, category: "Needs Improvement", gap: "Numerical Prediction" },
                    { name: "Anil Kumar", email: "anil@moes.gov.in", score: 78, completion: 85, category: "Good", gap: "None" },
                    { name: "Sneha Reddy", email: "sneha@moes.gov.in", score: 88, completion: 95, category: "Excellent", gap: "None" }
                  ]).map((t, i) => {
                    const score = t.compositeScore || t.assessmentScore || t.score || 70;
                    const completion = t.completionPercentage || t.completion || 80;
                    const category = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs Improvement" : "Poor";
                    const gap = t.needsImprovement?.[0] || t.gap || "None";

                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900">
                          <div>{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{t.email}</div>
                        </td>
                        <td className="py-3.5 px-5 text-center font-bold text-slate-800">{score}%</td>
                        <td className="py-3.5 px-5 text-center font-medium text-slate-600">{completion}%</td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              category === "Excellent"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : category === "Good"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : category === "Needs Improvement"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">{gap}</td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => setSelectedTrainee(t)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 border border-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};