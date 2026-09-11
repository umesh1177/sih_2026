import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Award, 
  TrendingUp, 
  Filter, 
  Search, 
  Sliders, 
  SlidersHorizontal,
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  BookOpen, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  RotateCcw, 
  Download, 
  Check, 
  X, 
  Clock, 
  BarChart3, 
  Layers, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  HelpCircle,
  BrainCircuit,
  MessageSquare,
  Save,
  Tag
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

const DEFAULT_THRESHOLDS = {
  excellent: 85,
  good: 70,
  needsImprovement: 50
};

const DEFAULT_WEIGHTS = {
  assessmentWeight: 60,       // 60%
  courseCompletionWeight: 20, // 20%
  practiceWeight: 10,         // 10%
  consistencyWeight: 10       // 10%
};

const CATEGORY_STYLES = {
  Excellent: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400",
    pill: "bg-emerald-600 text-white",
    cardBorder: "border-emerald-200 hover:border-emerald-400",
    icon: "🌟",
    color: "#10b981",
    lightBg: "bg-emerald-50/70"
  },
  Good: {
    badge: "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400",
    pill: "bg-blue-600 text-white",
    cardBorder: "border-blue-200 hover:border-blue-400",
    icon: "👍",
    color: "#3b82f6",
    lightBg: "bg-blue-50/70"
  },
  "Needs Improvement": {
    badge: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400",
    pill: "bg-amber-500 text-white",
    cardBorder: "border-amber-200 hover:border-amber-400",
    icon: "⚠️",
    color: "#f59e0b",
    lightBg: "bg-amber-50/70"
  },
  Poor: {
    badge: "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400",
    pill: "bg-rose-600 text-white",
    cardBorder: "border-rose-200 hover:border-rose-400",
    icon: "❌",
    color: "#ef4444",
    lightBg: "bg-rose-50/70"
  },
  Disqualified: {
    badge: "bg-slate-900 text-white border-slate-700",
    pill: "bg-slate-950 text-white",
    cardBorder: "border-slate-800",
    icon: "🚫",
    color: "#0f172a",
    lightBg: "bg-slate-100"
  }
};

export const TraineePerformanceCategoryView = ({ currentUser, onOpenStudio, onOpenCourse }) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  // ─── CORE STATE ───
  const [trainees, setTrainees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("learners"); // "learners" | "departments" | "courses" | "trainers"
  const [toastMessage, setToastMessage] = useState(null);

  // ─── CONFIGURABLE THRESHOLDS & WEIGHTS STATE ───
  const [thresholds, setThresholds] = useState(() => {
    const saved = localStorage.getItem("moes_perf_thresholds");
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });

  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem("moes_perf_weights");
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempThresholds, setTempThresholds] = useState(thresholds);
  const [tempWeights, setTempWeights] = useState(weights);

  // ─── MULTI-DIMENSIONAL FILTERS STATE ───
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All"); // "All" | "Excellent" | "Good" | "Needs Improvement" | "Poor" | "Disqualified"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedCompetency, setSelectedCompetency] = useState("all");
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [completionRange, setCompletionRange] = useState({ min: 0, max: 100 });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ─── FEEDBACK / REMARKS STATE ───
  const [traineeFeedbackMap, setTraineeFeedbackMap] = useState(() => {
    const saved = localStorage.getItem("moes_trainer_remarks");
    return saved ? JSON.parse(saved) : {};
  });
  const [currentRemarksInput, setCurrentRemarksInput] = useState("");

  const showToast = (msg, type = "success") => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ─── LOAD TRAINEE & COURSE DATA ───
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id).catch(() => ({ success: false, trainees: [] })),
        api.getCourses().catch(() => ({ success: false, courses: [] }))
      ]);

      if (tRes.success && Array.isArray(tRes.trainees)) {
        setTrainees(tRes.trainees);
      } else {
        setTrainees([]);
      }

      if (cRes.success && Array.isArray(cRes.courses)) {
        setCourses(cRes.courses);
      }
    } catch (err) {
      console.error("Error loading performance data:", err);
      setTrainees([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── COMPOSITE OVERALL SCORE & CATEGORY CALCULATION ───
  const processedTrainees = useMemo(() => {
    const totalWeight = (weights.assessmentWeight + weights.courseCompletionWeight + weights.practiceWeight + weights.consistencyWeight) || 100;

    return trainees.map(trainee => {
      // 1. Calculate weighted overall score from actual trainee data
      const aScore = Number(trainee.assessmentScore ?? trainee.avgQuizScore ?? 0);
      const cScore = Number(trainee.completionPercentage ?? trainee.progressPercentage ?? 0);
      const pScore = Number(trainee.practiceScore ?? 0);
      const kScore = Number(trainee.consistencyScore ?? 0);

      const weightedSum = (
        (aScore * weights.assessmentWeight) +
        (cScore * weights.courseCompletionWeight) +
        (pScore * weights.practiceWeight) +
        (kScore * weights.consistencyWeight)
      );

      const compositeScore = Math.round(weightedSum / totalWeight);

      // 2. Classify into Performance Category using Admin-Configurable Thresholds
      let category = "Poor";
      if (trainee.isDisqualified) {
        category = "Disqualified";
      } else if (compositeScore >= thresholds.excellent) {
        category = "Excellent";
      } else if (compositeScore >= thresholds.good) {
        category = "Good";
      } else if (compositeScore >= thresholds.needsImprovement) {
        category = "Needs Improvement";
      } else {
        category = "Poor";
      }

      // 3. Extract Competencies & Mastery Diagnostics
      const strengths = trainee.strengths && trainee.strengths.length > 0 ? trainee.strengths : [];
      const needsImprovement = trainee.needsImprovement && trainee.needsImprovement.length > 0 ? trainee.needsImprovement : [];

      return {
        ...trainee,
        assessmentScore: aScore,
        completionPercentage: cScore,
        practiceScore: pScore,
        consistencyScore: kScore,
        compositeScore,
        category,
        strengths,
        needsImprovement,
        remarks: traineeFeedbackMap[trainee.id || trainee.traineeId] || trainee.remarks || ""
      };
    });
  }, [trainees, thresholds, weights, traineeFeedbackMap]);

  // ─── FILTERED TRAINEES ───
  const filteredTrainees = useMemo(() => {
    return processedTrainees.filter(t => {
      // Category quick filter
      if (selectedCategoryFilter !== "All" && t.category !== selectedCategoryFilter) {
        return false;
      }

      // Search query (Name, Email, Cadre ID, Station)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          (t.cadreId && t.cadreId.toLowerCase().includes(q)) ||
          (t.station && t.station.toLowerCase().includes(q)) ||
          (t.department && t.department.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Department filter
      if (selectedDepartment !== "all" && t.department !== selectedDepartment) {
        return false;
      }

      // Course filter
      if (selectedCourseId !== "all" && t.courseId !== selectedCourseId) {
        return false;
      }

      // Score Range filter
      if (t.compositeScore < scoreRange.min || t.compositeScore > scoreRange.max) {
        return false;
      }

      // Completion Range filter
      if (t.completionPercentage < completionRange.min || t.completionPercentage > completionRange.max) {
        return false;
      }

      // Competency filter
      if (selectedCompetency !== "all") {
        const hasComp = [...t.strengths, ...t.needsImprovement].some(c => c.toLowerCase().includes(selectedCompetency.toLowerCase()));
        if (!hasComp) return false;
      }

      return true;
    });
  }, [processedTrainees, selectedCategoryFilter, searchQuery, selectedDepartment, selectedCourseId, scoreRange, completionRange, selectedCompetency]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      All: processedTrainees.length,
      Excellent: 0,
      Good: 0,
      "Needs Improvement": 0,
      Poor: 0,
      Disqualified: 0
    };
    processedTrainees.forEach(t => {
      if (counts[t.category] !== undefined) counts[t.category]++;
    });
    return counts;
  }, [processedTrainees]);

  // Unique departments & competencies
  const uniqueDepartments = useMemo(() => {
    const set = new Set(processedTrainees.map(t => t.department).filter(Boolean));
    return Array.from(set);
  }, [processedTrainees]);

  const uniqueCompetencies = useMemo(() => {
    const set = new Set(processedTrainees.flatMap(t => [...(t.strengths || []), ...(t.needsImprovement || [])]).filter(Boolean));
    return Array.from(set);
  }, [processedTrainees]);

  // ─── ADMIN CROSS-ORGANIZATIONAL AGGREGATES ───
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const courseAggregates = useMemo(() => {
    return courses.map(course => {
      const courseTrainees = processedTrainees.filter(t => t.courseId === course.id || (course.enrolledTraineeIds || []).includes(t.id || t.traineeId));
      const count = courseTrainees.length;
      const totalScore = courseTrainees.reduce((acc, t) => acc + (t.compositeScore || 0), 0);
      const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
      const totalComp = courseTrainees.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      const avgCompletion = count > 0 ? Math.round(totalComp / count) : 0;

      // Subject-wise learner performance breakdown
      const subjectsWithPerformance = (course.subjects || []).map(subj => {
        const sName = subj.name || subj.title || "Subject";
        const sTrainer = subj.trainerName || subj.facultyName || subj.trainer || course.leadTrainerName || "Assigned Faculty";
        
        const traineesInSubj = courseTrainees.map(t => {
          const sData = (t.subjectBreakdown || []).find(sb => sb.subjectId === subj.id || (sb.subjectName && sb.subjectName.toLowerCase() === sName.toLowerCase()));
          return {
            id: t.id || t.traineeId,
            name: t.name,
            department: t.department,
            cadreId: t.cadreId,
            category: t.category,
            avgScore: sData ? sData.avgScore : t.assessmentScore,
            progressPercentage: sData ? sData.progressPercentage : t.completionPercentage
          };
        });

        const subjTotalScore = traineesInSubj.reduce((acc, t) => acc + (t.avgScore || 0), 0);
        const subjAvgScore = traineesInSubj.length > 0 ? Math.round(subjTotalScore / traineesInSubj.length) : 0;
        const subjTotalProg = traineesInSubj.reduce((acc, t) => acc + (t.progressPercentage || 0), 0);
        const subjAvgProg = traineesInSubj.length > 0 ? Math.round(subjTotalProg / traineesInSubj.length) : 0;

        return {
          id: subj.id,
          name: sName,
          trainer: sTrainer,
          modulesCount: subj.modules?.length || 0,
          traineesCount: traineesInSubj.length,
          avgScore: subjAvgScore,
          avgProgress: subjAvgProg,
          trainees: traineesInSubj
        };
      });

      return {
        ...course,
        enrolledCount: count,
        avgScore,
        avgCompletion,
        trainees: courseTrainees,
        subjects: subjectsWithPerformance
      };
    });
  }, [courses, processedTrainees]);

  const departmentAggregates = useMemo(() => {
    const map = {};
    processedTrainees.forEach(t => {
      const dept = t.department || "General Operational Pool";
      if (!map[dept]) {
        map[dept] = { department: dept, count: 0, totalScore: 0, excellent: 0, good: 0, needsImprovement: 0, poor: 0 };
      }
      map[dept].count++;
      map[dept].totalScore += t.compositeScore;
      if (t.category === "Excellent") map[dept].excellent++;
      else if (t.category === "Good") map[dept].good++;
      else if (t.category === "Needs Improvement") map[dept].needsImprovement++;
      else map[dept].poor++;
    });

    return Object.values(map).map(d => ({
      ...d,
      avgScore: Math.round(d.totalScore / d.count),
      excellentPct: Math.round((d.excellent / d.count) * 100),
      goodPct: Math.round((d.good / d.count) * 100)
    }));
  }, [processedTrainees]);

  // Save Thresholds & Weights Handler
  const handleSaveConfig = () => {
    const weightTotal = Number(tempWeights.assessmentWeight) + Number(tempWeights.courseCompletionWeight) + Number(tempWeights.practiceWeight) + Number(tempWeights.consistencyWeight);
    if (weightTotal !== 100) {
      alert(`Metric weights must sum to exactly 100%. Current sum: ${weightTotal}%`);
      return;
    }

    setThresholds(tempThresholds);
    setWeights(tempWeights);
    localStorage.setItem("moes_perf_thresholds", JSON.stringify(tempThresholds));
    localStorage.setItem("moes_perf_weights", JSON.stringify(tempWeights));
    setIsConfigModalOpen(false);
    showToast("✓ Custom performance thresholds & multi-metric formula weights saved successfully!");
  };

  // Save Trainer Remarks Handler
  const handleSaveRemarks = (traineeId) => {
    const updated = { ...traineeFeedbackMap, [traineeId]: currentRemarksInput };
    setTraineeFeedbackMap(updated);
    localStorage.setItem("moes_trainer_remarks", JSON.stringify(updated));
    showToast("✓ Trainer diagnostic feedback note saved!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-bold">{toastMessage.message}</span>
        </div>
      )}

      {/* ═════════ 1. HEADER & CONFIGURATION ACTION BAR ═════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              {isAdmin ? "Admin Institutional Intelligence" : "Trainer Assessment Analytics"}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Multi-Metric Performance Categorization
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Learner Performance Classification & Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Calculates multi-dimensional performance categories using weighted metrics: <b>Assessments ({weights.assessmentWeight}%)</b> + <b>Course Completion ({weights.courseCompletionWeight}%)</b> + <b>Practice ({weights.practiceWeight}%)</b> + <b>Consistency ({weights.consistencyWeight}%)</b>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Configure Thresholds & Weights Button */}
          <button
            onClick={() => {
              setTempThresholds(thresholds);
              setTempWeights(weights);
              setIsConfigModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-black rounded-2xl text-xs border border-indigo-200 shadow-sm transition-all hover:scale-105"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Configure Weights & Cutoffs</span>
          </button>

          {/* Export Report */}
          <button
            onClick={() => {
              const rows = [
                ["Name", "Cadre ID", "Department", "Overall Score", "Category", "Assessment", "Completion", "Practice", "Consistency"],
                ...processedTrainees.map(t => [t.name, t.cadreId || "", t.department || "", `${t.compositeScore}%`, t.category, `${t.assessmentScore}%`, `${t.completionPercentage}%`, `${t.practiceScore}%`, `${t.consistencyScore}%`])
              ];
              const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `MoES_Trainee_Performance_Classification_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast("✓ Exported Performance Classification Report (CSV)");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs border border-slate-200 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Classification CSV</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. ADMIN CROSS-ORGANIZATIONAL TABS (Admin Only) ═════════ */}
      {isAdmin && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab("learners")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeAdminTab === "learners" 
                ? "bg-white text-indigo-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Learner Cards & Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("departments")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeAdminTab === "departments" 
                ? "bg-white text-indigo-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Cross-Department Classification</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("courses")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeAdminTab === "courses" 
                ? "bg-white text-indigo-900 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course-wise Distribution</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading learner performance telemetry...</p>
        </div>
      ) : processedTrainees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-black text-slate-900 text-lg">No Enrolled Learners Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {currentUser?.role === "trainer"
                ? "You have not been assigned to any course subjects with enrolled trainees yet. Once courses/subjects are assigned to your faculty profile and trainees enroll, their live performance metrics and diagnostic categorizations will appear here automatically."
                : "No trainee records currently found in the system. Enrolled cadets taking assessments will populate performance metrics automatically."}
            </p>
          </div>
        </div>
      ) : (
      <>
      {/* ═════════ 3. PERFORMANCE CATEGORY PILLS & FILTER BAR ═════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        {/* Category Quick Filter Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1">
              Filter Category:
            </span>

            {Object.keys(categoryCounts).map(catKey => {
              const count = categoryCounts[catKey];
              const isSelected = selectedCategoryFilter === catKey;
              const catConf = CATEGORY_STYLES[catKey];

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategoryFilter(catKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
                    isSelected
                      ? catKey === "All" 
                        ? "bg-[#0a2558] text-white shadow-md ring-2 ring-blue-300"
                        : `${catConf?.pill || "bg-indigo-600 text-white"} shadow-md ring-2 ring-slate-300`
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {catConf?.icon && <span>{catConf.icon}</span>}
                  <span>{catKey}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors ml-auto"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>{showAdvancedFilters ? "Hide Filter Options" : "Advanced Filters & Sliders"}</span>
          </button>
        </div>

        {/* Search Bar & Primary Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer name, cadre, station..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">All Departments / Groups</option>
              {uniqueDepartments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Competency Filter */}
          <div>
            <select
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">All Subject Competencies</option>
              {uniqueCompetencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategoryFilter("All");
                setSearchQuery("");
                setSelectedDepartment("all");
                setSelectedCourseId("all");
                setSelectedCompetency("all");
                setScoreRange({ min: 0, max: 100 });
                setCompletionRange({ min: 0, max: 100 });
                showToast("Filters reset to default.");
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filter Drawer (Sliders for Score & Completion) */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
            {/* Score Range */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Minimum Overall Score:</span>
                <span className="font-mono text-indigo-700">{scoreRange.min}% - {scoreRange.max}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={scoreRange.min}
                onChange={(e) => setScoreRange({ ...scoreRange, min: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Course Completion Range */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Minimum Course Completion:</span>
                <span className="font-mono text-indigo-700">{completionRange.min}% - {completionRange.max}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={completionRange.min}
                onChange={(e) => setCompletionRange({ ...completionRange, min: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        )}

      </div>

      {/* ═════════ 4. MAIN CONTENT VIEW (LEARNERS CARDS vs ADMIN CROSS-DEPARTMENT / COURSES) ═════════ */}
      {isAdmin && activeAdminTab === "departments" ? (
        /* ─── ADMIN VIEW: CROSS-DEPARTMENT BENCHMARKING ─── */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Departmental Performance & Category Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Comparative benchmark across MoES institutional directorates and regional meteorological centres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentAggregates.map(dept => (
              <div key={dept.department} className="p-5 rounded-3xl border border-slate-200 bg-slate-50/70 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <h4 className="font-black text-sm text-slate-900">{dept.department}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-indigo-100 text-indigo-900">
                    Avg: {dept.avgScore}%
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p>Enrolled Cadets: <b>{dept.count} Officers</b></p>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-emerald-700">🌟 {dept.excellent} Excellent</span>
                    <span>•</span>
                    <span className="text-blue-700">👍 {dept.good} Good</span>
                    <span>•</span>
                    <span className="text-amber-700">⚠️ {dept.needsImprovement} Needs Imp.</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(dept.excellent / dept.count) * 100}%` }} className="bg-emerald-500 h-full" title="Excellent"></div>
                  <div style={{ width: `${(dept.good / dept.count) * 100}%` }} className="bg-blue-500 h-full" title="Good"></div>
                  <div style={{ width: `${(dept.needsImprovement / dept.count) * 100}%` }} className="bg-amber-500 h-full" title="Needs Improvement"></div>
                  <div style={{ width: `${(dept.poor / dept.count) * 100}%` }} className="bg-rose-500 h-full" title="Poor"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isAdmin && activeAdminTab === "courses" ? (
        /* ─── ADMIN VIEW: COURSE & SUBJECT-WISE LEARNER PERFORMANCE ─── */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Course & Subject-wise Learner Performance
              </h3>
              <p className="text-xs text-slate-500">
                Institutional overview of enrolled trainees, course progress, and detailed subject-wise diagnostic scores.
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black rounded-xl">
              {courses.length} Active Courses
            </span>
          </div>

          <div className="space-y-4">
            {courseAggregates.map(course => {
              const isExpanded = expandedCourseId === course.id;
              return (
                <div key={course.id} className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/50 transition-all">
                  {/* Course Summary Header */}
                  <div 
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="p-5 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] border border-indigo-200">
                            {course.code || course.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Lead Faculty: <b>{course.leadTrainerName || "Directorate Faculty"}</b>
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mt-0.5">{course.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Trainees</p>
                        <p className="text-sm font-black text-slate-800">{course.enrolledCount} Officers</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Performance</p>
                        <p className={`text-sm font-black font-mono ${course.avgScore >= 75 ? "text-emerald-600" : course.avgScore >= 60 ? "text-blue-600" : "text-amber-600"}`}>
                          {course.avgScore}%
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Completion</p>
                        <p className="text-sm font-black font-mono text-indigo-700">{course.avgCompletion}%</p>
                      </div>
                      <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Subject-wise Breakdown */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-4 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Subject-Wise Performance & Assigned Faculty Breakdown</span>
                        </h5>
                        <span className="text-xs text-slate-500 font-medium">
                          {course.subjects?.length || 0} Subject Units
                        </span>
                      </div>

                      {(!course.subjects || course.subjects.length === 0) ? (
                        <p className="text-xs text-slate-500 italic py-2">No subjects structured under this course yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.subjects.map((subj, sIdx) => (
                            <div key={subj.id || sIdx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    Unit {sIdx + 1} • {subj.modulesCount} Modules
                                  </span>
                                  <h6 className="font-black text-slate-900 text-sm mt-1">{subj.name}</h6>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Assigned Trainer: <span className="font-bold text-indigo-900">{subj.trainer}</span>
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-indigo-50 text-indigo-900 border border-indigo-200">
                                    Score: {subj.avgScore}%
                                  </span>
                                </div>
                              </div>

                              {/* Trainee list under this subject */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Enrolled Trainees ({subj.trainees?.length || 0})
                                </p>
                                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                                  {(subj.trainees || []).length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-1">No enrolled trainees.</p>
                                  ) : (
                                    (subj.trainees || []).map(t => (
                                      <div key={t.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-[#0a2558] text-white text-[9px] font-bold flex items-center justify-center">
                                            {t.name.charAt(0)}
                                          </div>
                                          <span className="font-bold text-slate-800">{t.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-slate-500 font-mono">{t.avgScore}%</span>
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                            {t.category}
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ─── TRAINER & ADMIN PRIMARY VIEW: TRAINEE PERFORMANCE CARDS ─── */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold">
            <span>Showing {filteredTrainees.length} of {processedTrainees.length} Trainees</span>
            <span>Category Formula: ({weights.assessmentWeight}% Assess + {weights.courseCompletionWeight}% Comp + {weights.practiceWeight}% Prac + {weights.consistencyWeight}% Cons)</span>
          </div>

          {processedTrainees.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">
                {!isAdmin ? "No Enrolled Learners Found for Your Assigned Subjects" : "No Enrolled Trainees Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {!isAdmin 
                  ? "You have not been assigned to any course subjects yet, or no trainees are enrolled in your assigned subjects. Once course subjects are assigned by an administrator, real-time learner diagnostics and test analytics will appear here."
                  : "No trainees are currently enrolled in any active courses."}
              </p>
            </div>
          ) : filteredTrainees.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <Users className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Trainees Match Selected Filter Criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your score/completion ranges or clearing category filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTrainees.map(trainee => {
                const catConf = CATEGORY_STYLES[trainee.category] || CATEGORY_STYLES.Good;

                return (
                  <div
                    key={trainee.id || trainee.traineeId}
                    className={`bg-white rounded-3xl border ${catConf.cardBorder} shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 cursor-pointer`}
                    onClick={() => {
                      setSelectedTrainee(trainee);
                      setCurrentRemarksInput(trainee.remarks || "");
                    }}
                  >
                    {/* Top Row: Officer Identity & Category Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          {trainee.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 text-sm">{trainee.name}</h3>
                          <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{trainee.department}</p>
                          <span className="text-[10px] font-mono text-slate-400">{trainee.cadreId || "MOES-CADET"}</span>
                        </div>
                      </div>

                      {/* Performance Category Badge */}
                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold inline-flex items-center gap-1 border shadow-2xs ${catConf.badge}`}>
                          <span>{catConf.icon}</span>
                          <span>{trainee.category}</span>
                        </span>
                        <p className="font-mono font-black text-sm text-slate-900 mt-1">
                          {trainee.compositeScore}%
                        </p>
                      </div>
                    </div>

                    {/* 4-Pillar Metric Bars */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Assessment Score ({weights.assessmentWeight}%):</span>
                        <b className="font-mono text-slate-900">{trainee.assessmentScore}%</b>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Course Completion ({weights.courseCompletionWeight}%):</span>
                        <b className="font-mono text-slate-900">{trainee.completionPercentage}%</b>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Practice Performance ({weights.practiceWeight}%):</span>
                        <b className="font-mono text-slate-900">{trainee.practiceScore}%</b>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Learning Consistency ({weights.consistencyWeight}%):</span>
                        <b className="font-mono text-slate-900">{trainee.consistencyScore}%</b>
                      </div>
                    </div>

                    {/* Strengths & Needs Improvement Quick Tags */}
                    <div className="space-y-1 text-xs">
                      {/* Strengths */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-600" /> Strengths:
                        </span>
                        {(trainee.strengths || []).slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 text-[10px] font-semibold border border-emerald-200">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Needs Improvement */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Focus:
                        </span>
                        {(trainee.needsImprovement || []).slice(0, 2).map((n, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {trainee.remarks ? "✓ Feedback Recorded" : "No Remarks Added"}
                      </span>
                      <span className="font-extrabold text-indigo-600 flex items-center gap-1 hover:underline">
                        <span>View Dossier & Diagnostics</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </>
      )}

      {/* ═════════ 5. TRAINEE PERFORMANCE DOSSIER & DIAGNOSTIC MODAL ═════════ */}
      {selectedTrainee && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0a2558] text-white flex items-center justify-center font-black text-sm shadow-md">
                  {selectedTrainee.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-lg text-slate-900">{selectedTrainee.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${CATEGORY_STYLES[selectedTrainee.category]?.badge}`}>
                      {selectedTrainee.category} — {selectedTrainee.compositeScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedTrainee.designation} • {selectedTrainee.department}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Cadre ID: {selectedTrainee.cadreId} • Station: {selectedTrainee.station || "IMD Field Station"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTrainee(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Weighted Pillars Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Assessment ({weights.assessmentWeight}%)</span>
                <p className="font-mono font-black text-base text-slate-900">{selectedTrainee.assessmentScore}%</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Completion ({weights.courseCompletionWeight}%)</span>
                <p className="font-mono font-black text-base text-slate-900">{selectedTrainee.completionPercentage}%</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Practice Quiz ({weights.practiceWeight}%)</span>
                <p className="font-mono font-black text-base text-slate-900">{selectedTrainee.practiceScore}%</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Consistency ({weights.consistencyWeight}%)</span>
                <p className="font-mono font-black text-base text-slate-900">{selectedTrainee.consistencyScore}%</p>
              </div>
            </div>

            {/* Detailed Diagnostic Strengths & Needs Improvement Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Identified Strengths */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <h4 className="font-black text-xs text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Demonstrated Strengths (Mastery):</span>
                </h4>
                <div className="space-y-1.5">
                  {(selectedTrainee.strengths || []).map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Needs Improvement Areas */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <h4 className="font-black text-xs text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Target Improvement Focus:</span>
                </h4>
                <div className="space-y-1.5">
                  {(selectedTrainee.needsImprovement || []).map((n, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trainer Qualitative Feedback & Notes */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Trainer Diagnostic Remarks & Action Plan:</span>
                </h4>
                <span className="text-[10px] text-slate-400">Visible on officer performance record</span>
              </div>

              <textarea
                rows={2}
                value={currentRemarksInput}
                onChange={(e) => setCurrentRemarksInput(e.target.value)}
                placeholder="Enter customized faculty feedback (e.g. 'Good understanding of sigma dynamics; recommend 2 additional practical runs on WRF boundary layers before certification')..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />

              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveRemarks(selectedTrainee.id || selectedTrainee.traineeId)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Faculty Remarks</span>
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedTrainee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close Dossier
              </button>

              <button
                onClick={() => {
                  showToast(`Assigned remedial practice quiz on "${selectedTrainee.needsImprovement?.[0] || 'Radar Meteorology'}" to ${selectedTrainee.name}`);
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Assign Targeted Practice Assessment</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═════════ 6. ADMIN/TRAINER CONFIGURATION MODAL (THRESHOLDS & WEIGHTS) ═════════ */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Configure Category Thresholds & Weights
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize institutional formula cutoffs and metric weight distributions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Category Score Cutoffs */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Performance Category Thresholds (Min %):
              </label>

              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    🌟 Excellent Cutoff (≥ %):
                  </span>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={tempThresholds.excellent}
                    onChange={(e) => setTempThresholds({ ...tempThresholds, excellent: Number(e.target.value) })}
                    className="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-800 flex items-center gap-1">
                    👍 Good Cutoff (% Range):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-slate-500">
                    <input
                      type="number"
                      min={40}
                      max={90}
                      value={tempThresholds.good}
                      onChange={(e) => setTempThresholds({ ...tempThresholds, good: Number(e.target.value) })}
                      className="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                    />
                    <span>to {tempThresholds.excellent - 1}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 flex items-center gap-1">
                    ⚠️ Needs Improvement Cutoff (% Range):
                  </span>
                  <div className="flex items-center gap-1 font-mono text-slate-500">
                    <input
                      type="number"
                      min={20}
                      max={70}
                      value={tempThresholds.needsImprovement}
                      onChange={(e) => setTempThresholds({ ...tempThresholds, needsImprovement: Number(e.target.value) })}
                      className="w-16 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                    />
                    <span>to {tempThresholds.good - 1}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-rose-800 font-semibold pt-1 border-t border-slate-200">
                  ❌ Poor: Below {tempThresholds.needsImprovement}%
                </div>
              </div>
            </div>

            {/* 2. Metric Weights Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  2. Metric Weight Formula Distribution:
                </label>
                <span className={`text-[11px] font-mono font-black ${
                  (Number(tempWeights.assessmentWeight) + Number(tempWeights.courseCompletionWeight) + Number(tempWeights.practiceWeight) + Number(tempWeights.consistencyWeight)) === 100
                    ? "text-emerald-700" 
                    : "text-rose-600"
                }`}>
                  Sum: {Number(tempWeights.assessmentWeight) + Number(tempWeights.courseCompletionWeight) + Number(tempWeights.practiceWeight) + Number(tempWeights.consistencyWeight)}% / 100%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Assessments %</label>
                  <input
                    type="number"
                    value={tempWeights.assessmentWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, assessmentWeight: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Course Completion %</label>
                  <input
                    type="number"
                    value={tempWeights.courseCompletionWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, courseCompletionWeight: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Practice Quizzes %</label>
                  <input
                    type="number"
                    value={tempWeights.practiceWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, practiceWeight: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Consistency / Streak %</label>
                  <input
                    type="number"
                    value={tempWeights.consistencyWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, consistencyWeight: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTempThresholds(DEFAULT_THRESHOLDS);
                  setTempWeights(DEFAULT_WEIGHTS);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Save & Apply Cutoffs
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
