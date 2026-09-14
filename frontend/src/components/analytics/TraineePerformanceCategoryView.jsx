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
  Tag,
  Star,
  ThumbsUp,
  Ban
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
  assessmentWeight: 60,
  courseCompletionWeight: 20,
  practiceWeight: 10,
  consistencyWeight: 10
};

const CATEGORY_STYLES = {
  Excellent: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400",
    pill: "bg-emerald-600 text-white",
    cardBorder: "border-emerald-200 hover:border-emerald-400",
    IconComponent: Star,
    color: "#10b981",
    lightBg: "bg-emerald-50/70"
  },
  Good: {
    badge: "bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400",
    pill: "bg-blue-600 text-white",
    cardBorder: "border-blue-200 hover:border-blue-400",
    IconComponent: ThumbsUp,
    color: "#3b82f6",
    lightBg: "bg-blue-50/70"
  },
  "Needs Improvement": {
    badge: "bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400",
    pill: "bg-amber-500 text-white",
    cardBorder: "border-amber-200 hover:border-amber-400",
    IconComponent: AlertTriangle,
    color: "#f59e0b",
    lightBg: "bg-amber-50/70"
  },
  Poor: {
    badge: "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400",
    pill: "bg-rose-600 text-white",
    cardBorder: "border-rose-200 hover:border-rose-400",
    IconComponent: XCircle,
    color: "#ef4444",
    lightBg: "bg-rose-50/70"
  },
  Disqualified: {
    badge: "bg-slate-900 text-white border-slate-700",
    pill: "bg-slate-950 text-white",
    cardBorder: "border-slate-800",
    IconComponent: Ban,
    color: "#0f172a",
    lightBg: "bg-slate-100"
  }
};

export const TraineePerformanceCategoryView = ({ currentUser, onOpenStudio, onOpenCourse }) => {
  const isAdmin = currentUser?.role === "admin";
  const isTrainer = currentUser?.role === "trainer" || isAdmin;

  const [trainees, setTrainees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState("learners");
  const [toastMessage, setToastMessage] = useState(null);

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

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedCompetency, setSelectedCompetency] = useState("all");
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [completionRange, setCompletionRange] = useState({ min: 0, max: 100 });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [traineeFeedbackMap, setTraineeFeedbackMap] = useState(() => {
    const saved = localStorage.getItem("moes_trainer_remarks");
    return saved ? JSON.parse(saved) : {};
  });
  const [currentRemarksInput, setCurrentRemarksInput] = useState("");

  const showToast = (msg, type = "success") => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        (isAdmin
          ? api.getTrainerEnrolledTrainees()
          : api.getTrainerEnrolledTrainees(currentUser?.name, currentUser?.id)
        ).catch(() => ({ success: false, trainees: [] })),
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

  const processedTrainees = useMemo(() => {
    const totalWeight = (weights.assessmentWeight + weights.courseCompletionWeight + weights.practiceWeight + weights.consistencyWeight) || 100;

    return trainees.map(trainee => {
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

  const filteredTrainees = useMemo(() => {
    return processedTrainees.filter(t => {
      if (selectedCategoryFilter !== "All" && t.category !== selectedCategoryFilter) {
        return false;
      }

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

      if (selectedDepartment !== "all" && t.department !== selectedDepartment) {
        return false;
      }

      if (selectedCourseId !== "all" && t.courseId !== selectedCourseId) {
        return false;
      }

      if (t.compositeScore < scoreRange.min || t.compositeScore > scoreRange.max) {
        return false;
      }

      if (t.completionPercentage < completionRange.min || t.completionPercentage > completionRange.max) {
        return false;
      }

      if (selectedCompetency !== "all") {
        const hasComp = [...t.strengths, ...t.needsImprovement].some(c => c.toLowerCase().includes(selectedCompetency.toLowerCase()));
        if (!hasComp) return false;
      }

      return true;
    });
  }, [processedTrainees, selectedCategoryFilter, searchQuery, selectedDepartment, selectedCourseId, scoreRange, completionRange, selectedCompetency]);

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

  const uniqueDepartments = useMemo(() => {
    const set = new Set(processedTrainees.map(t => t.department).filter(Boolean));
    return Array.from(set);
  }, [processedTrainees]);

  const uniqueCompetencies = useMemo(() => {
    const set = new Set(processedTrainees.flatMap(t => [...(t.strengths || []), ...(t.needsImprovement || [])]).filter(Boolean));
    return Array.from(set);
  }, [processedTrainees]);

  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const courseAggregates = useMemo(() => {
    return courses.map(course => {
      const courseTrainees = processedTrainees.filter(t => t.courseId === course.id || (course.enrolledTraineeIds || []).includes(t.id || t.traineeId));
      const count = courseTrainees.length;
      const totalScore = courseTrainees.reduce((acc, t) => acc + (t.compositeScore || 0), 0);
      const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
      const totalComp = courseTrainees.reduce((acc, t) => acc + (t.completionPercentage || 0), 0);
      const avgCompletion = count > 0 ? Math.round(totalComp / count) : 0;

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
    showToast("Custom performance thresholds & multi-metric formula weights saved successfully!");
  };

  const handleSaveRemarks = (traineeId) => {
    const updated = { ...traineeFeedbackMap, [traineeId]: currentRemarksInput };
    setTraineeFeedbackMap(updated);
    localStorage.setItem("moes_trainer_remarks", JSON.stringify(updated));
    showToast("Trainer diagnostic feedback note saved!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${toastMessage.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-normal">{toastMessage.message}</span>
        </div>
      )}

      {/* 1. HEADER & CONFIGURATION ACTION BAR */}
      <div className="bg-white rounded-[var(--radius)] p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider">
              {isAdmin ? "Admin Institutional Intelligence" : "Trainer Assessment Analytics"}
            </span>
            <span className="text-xs font-normal text-slate-400">
              Multi-Metric Performance Categorization
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
            Learner Performance Classification & Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Calculates multi-dimensional performance categories using weighted metrics: Assessors ({weights.assessmentWeight}%) + Course Completion ({weights.courseCompletionWeight}%) + Practice ({weights.practiceWeight}%) + Consistency ({weights.consistencyWeight}%).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => {
              setTempThresholds(thresholds);
              setTempWeights(weights);
              setIsConfigModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-semibold rounded-[var(--radius)] text-xs border border-indigo-200 shadow-sm transition-all hover:scale-105"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Configure Weights & Cutoffs</span>
          </button>

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
              link.setAttribute("download", `Trainee_Performance_Classification_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast("Exported Performance Classification Report (CSV)");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal rounded-[var(--radius)] text-xs border border-slate-200 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Classification CSV</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN CROSS-ORGANIZATIONAL TABS */}
      {isAdmin && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[var(--radius)] border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab("learners")}
            className={`px-4 py-2 rounded-[var(--radius)] text-xs font-semibold transition-all flex items-center gap-2 ${activeAdminTab === "learners"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Learner Cards & Diagnostics</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("departments")}
            className={`px-4 py-2 rounded-[var(--radius)] text-xs font-semibold transition-all flex items-center gap-2 ${activeAdminTab === "departments"
                ? "bg-white text-indigo-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Cross-Department Classification</span>
          </button>

          <button
            onClick={() => setActiveAdminTab("courses")}
            className={`px-4 py-2 rounded-[var(--radius)] text-xs font-semibold transition-all flex items-center gap-2 ${activeAdminTab === "courses"
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
        <div className="py-20 text-center space-y-3 bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-normal text-slate-500">Loading learner performance telemetry...</p>
        </div>
      ) : processedTrainees.length === 0 ? (
        <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-14 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[var(--radius)] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold text-slate-900 text-lg">No Enrolled Learners Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {currentUser?.role === "trainer"
                ? "You have not been assigned to any course subjects with enrolled trainees yet. Once courses/subjects are assigned to your faculty profile and trainees enroll, their live performance metrics and diagnostic categorizations will appear here automatically."
                : "No trainee records currently found in the system. Enrolled cadets taking assessments will populate performance metrics automatically."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 3. PERFORMANCE CATEGORY PILLS & FILTER BAR */}
          <div className="bg-white rounded-[var(--radius)] p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Filter Category:
                </span>

                {Object.keys(categoryCounts).map(catKey => {
                  const count = categoryCounts[catKey];
                  const isSelected = selectedCategoryFilter === catKey;
                  const catConf = CATEGORY_STYLES[catKey];
                  const CategoryIcon = catConf?.IconComponent;

                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategoryFilter(catKey)}
                      className={`px-3.5 py-1.5 rounded-[var(--radius)] text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs ${isSelected
                          ? catKey === "All"
                            ? "bg-[#0a2558] text-white shadow-md ring-2 ring-blue-300"
                            : `${catConf?.pill || "bg-indigo-600 text-white"} shadow-md ring-2 ring-slate-300`
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                    >
                      {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                      <span>{catKey}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-normal ${isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-normal transition-colors ml-auto"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>{showAdvancedFilters ? "Hide Filter Options" : "Advanced Filters & Sliders"}</span>
              </button>
            </div>

            {/* Search Bar & Primary Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search officer name, cadre, station..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-normal focus:bg-white focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Departments / Groups</option>
                  {uniqueDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedCompetency}
                  onChange={(e) => setSelectedCompetency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="all">All Subject Competencies</option>
                  {uniqueCompetencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

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
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-normal rounded-[var(--radius)] text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="p-4 bg-slate-50/80 rounded-[var(--radius)] border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-normal">
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-normal">
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

          {/* 4. MAIN CONTENT VIEW */}
          {isAdmin && activeAdminTab === "departments" ? (
            <div className="bg-white rounded-[var(--radius)] p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-semibold text-base text-slate-900">
                  Departmental Performance & Category Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Comparative benchmark across institutional directorates and regional meteorological centres.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentAggregates.map(dept => (
                  <div key={dept.department} className="p-5 rounded-[var(--radius)] border border-slate-200 bg-slate-50/70 space-y-3 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
                        <h4 className="font-semibold text-sm text-slate-900">{dept.department}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-100 text-indigo-900">
                        Avg: {dept.avgScore}%
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Enrolled Learners: <span className="font-semibold">{dept.count} Officers</span></p>
                      <div className="flex items-center gap-2 font-normal">
                        <span className="text-emerald-700 flex items-center gap-1"><Star className="w-3 h-3 fill-emerald-600" /> {dept.excellent} Excellent</span>
                        <span>•</span>
                        <span className="text-blue-700 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {dept.good} Good</span>
                        <span>•</span>
                        <span className="text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {dept.needsImprovement} Needs Imp.</span>
                      </div>
                    </div>

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
            <div className="bg-white rounded-[var(--radius)] p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-base text-slate-900">
                    Course & Subject-wise Learner Performance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Institutional overview of enrolled trainees, course progress, and detailed subject-wise diagnostic scores.
                  </p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-[var(--radius)]">
                  {courses.length} Active Courses
                </span>
              </div>

              <div className="space-y-4">
                {courseAggregates.map(course => {
                  const isExpanded = expandedCourseId === course.id;
                  return (
                    <div key={course.id} className="border border-slate-200 rounded-[var(--radius)] overflow-hidden bg-slate-50/50 transition-all">
                      <div
                        onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                        className="p-5 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-[var(--radius)] bg-[#0a2558] text-white flex items-center justify-center font-semibold text-sm shrink-0 shadow-xs">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded-[var(--radius)] bg-indigo-50 text-indigo-700 font-mono font-normal text-[10px] border border-indigo-200">
                                {course.code || course.id}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                Lead Faculty: <span className="font-semibold">{course.leadTrainerName || "Directorate Faculty"}</span>
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm mt-0.5">{course.title}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Enrolled Trainees</p>
                            <p className="text-sm font-semibold text-slate-800">{course.enrolledCount} Officers</p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Avg Performance</p>
                            <p className={`text-sm font-semibold font-mono ${course.avgScore >= 75 ? "text-emerald-600" : course.avgScore >= 60 ? "text-blue-600" : "text-amber-600"}`}>
                              {course.avgScore}%
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-wider">Avg Completion</p>
                            <p className="text-sm font-semibold font-mono text-indigo-700">{course.avgCompletion}%</p>
                          </div>
                          <button className="p-2 rounded-[var(--radius)] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-4 animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Subject-Wise Performance & Assigned Faculty Breakdown</span>
                            </h5>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      )}

    </div>
  );
};