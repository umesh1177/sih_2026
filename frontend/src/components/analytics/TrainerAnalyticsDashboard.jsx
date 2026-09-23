import React, { useState, useEffect } from "react";
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  Filter,
  Search,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  HelpCircle,
  Zap,
  Activity,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  Mail,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { api } from "../../services/api";
import { MetricCard } from "./common/MetricCard";
import { AnalyticsChartCard } from "./common/AnalyticsChartCard";
import { EmptyAnalyticsState } from "./common/EmptyAnalyticsState";
import { DateRangeFilter } from "./common/DateRangeFilter";
import { PerformanceBadge } from "./common/PerformanceBadge";
import { RiskBadge } from "./common/RiskBadge";
import { ChartGradients, CustomChartTooltip } from "./common/chartTheme";

export const TrainerAnalyticsDashboard = ({ currentUser }) => {
  const trainerId = currentUser?.id || "u_trainer_1";

  const [activeTab, setActiveTab] = useState("my-classes"); // "my-classes" (Role 2) | "cohort-management" (Role 3)
  const [loading, setLoading] = useState(true);
  const [trainerData, setTrainerData] = useState(null);
  const [cohortData, setCohortData] = useState(null);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // At-Risk Table State
  const [atRiskSearch, setAtRiskSearch] = useState("");
  const [atRiskFilter, setAtRiskFilter] = useState("all"); // all | High | Moderate | Low
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  useEffect(() => {
    if (activeTab === "my-classes") {
      loadTrainerAnalytics();
    } else {
      loadCohortAnalytics();
    }
  }, [trainerId, activeTab, selectedCourseId, selectedSubjectId, selectedAssessmentId, dateRange, customStart, customEnd]);

  const loadTrainerAnalytics = async () => {
    setLoading(true);
    try {
      const params = { dateRange };
      if (selectedCourseId !== "all") params.courseId = selectedCourseId;
      if (selectedSubjectId !== "all") params.subjectId = selectedSubjectId;
      if (selectedAssessmentId !== "all") params.assessmentId = selectedAssessmentId;
      if (dateRange === "custom" && customStart) {
        params.customStart = customStart;
        if (customEnd) params.customEnd = customEnd;
      }
      const res = await api.getTrainerAnalytics(trainerId, params);
      if (res.success) {
        setTrainerData(res);
      } else {
        setTrainerData(null);
      }
    } catch (err) {
      console.error("Failed to load trainer analytics:", err);
      setTrainerData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadCohortAnalytics = async () => {
    setLoading(true);
    try {
      const params = { dateRange };
      if (dateRange === "custom" && customStart) {
        params.customStart = customStart;
        if (customEnd) params.customEnd = customEnd;
      }
      const res = await api.getAllTrainersAnalytics(params);
      if (res.success) {
        setCohortData(res);
      } else {
        setCohortData(null);
      }
    } catch (err) {
      console.error("Failed to load cohort analytics:", err);
      setCohortData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCourseId("all");
    setSelectedSubjectId("all");
    setSelectedAssessmentId("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
  };

  const handleTriggerIntervention = (trainee) => {
    setActionSuccessMsg(`Remedial training notification and specialized practice paper dispatched to ${trainee.trainee} (${trainee.cadreId}).`);
    setTimeout(() => setActionSuccessMsg(""), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Role 2 & 3 • Trainer Assessment Studio
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentUser?.name || "Dr. Amit Sengupta"} • {currentUser?.department || "Synoptic Meteorology Division"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                Classroom Assessment Performance & Item Discrimination
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic zero-hardcoded class analytics, question item calibration, distractor distributions, and at-risk remediation.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                onClick={() => setActiveTab("my-classes")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "my-classes"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-4 h-4" />
                My Assigned Classes (Role 2)
              </button>
              <button
                onClick={() => setActiveTab("cohort-management")}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "cohort-management"
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-4 h-4" />
                All Faculty & Subject Matrix (Role 3)
              </button>
            </div>
          </div>

          {/* Action notification banner */}
          {actionSuccessMsg && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg("")} className="text-emerald-700 font-bold hover:underline ml-4">
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* ROLE 2: INDIVIDUAL TRAINER VIEW */}
        {/* ========================================================================= */}
        {activeTab === "my-classes" && (
          <>
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>Filter Scope:</span>
                  </div>

                  {/* Course Dropdown */}
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="all">All Assigned Courses</option>
                    {(trainerData?.filters?.courses || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>

                  {/* Assessment Dropdown */}
                  <select
                    value={selectedAssessmentId}
                    onChange={(e) => setSelectedAssessmentId(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="all">All Assessments ({trainerData?.filters?.quizzes?.length || 0})</option>
                    {(trainerData?.filters?.quizzes || []).map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title}
                      </option>
                    ))}
                  </select>

                  {/* Date Range Filter */}
                  <DateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                    customStart={customStart}
                    customEnd={customEnd}
                    onCustomChange={(s, e) => {
                      setCustomStart(s);
                      setCustomEnd(e);
                    }}
                  />
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-600">Computing dynamic trainer analytics...</p>
              </div>
            ) : !trainerData || !trainerData.hasData ? (
              <EmptyAnalyticsState
                title="No Assessment Attempts Recorded"
                description="There is insufficient submission data for your assigned courses and assessments in the selected timeframe."
                icon={BookOpen}
                actionLabel="Reset Active Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="space-y-6">
                {/* 8 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Assigned Trainees"
                    value={trainerData.kpis.assignedTrainees}
                    subtitle={`${trainerData.kpis.activeTrainees} active attempted`}
                    icon={Users}
                    color="blue"
                  />
                  <MetricCard
                    title="Class Average Score"
                    value={`${trainerData.kpis.averagePercentage}%`}
                    subtitle={`Avg raw score: ${trainerData.kpis.averageScore}`}
                    icon={Award}
                    color={trainerData.kpis.averagePercentage >= 75 ? "emerald" : (trainerData.kpis.averagePercentage >= 60 ? "amber" : "rose")}
                  />
                  <MetricCard
                    title="Class Pass Rate"
                    value={`${trainerData.kpis.passRate}%`}
                    subtitle={`Completion: ${trainerData.kpis.completionRate}%`}
                    icon={CheckCircle2}
                    color={trainerData.kpis.passRate >= 75 ? "emerald" : "amber"}
                  />
                  <MetricCard
                    title="At-Risk Trainees"
                    value={trainerData.kpis.atRiskTraineesCount}
                    subtitle="Score < 75% or failing"
                    icon={AlertTriangle}
                    color={trainerData.kpis.atRiskTraineesCount > 0 ? "rose" : "emerald"}
                    badge={trainerData.kpis.atRiskTraineesCount > 0 ? "Action Needed" : "Optimal"}
                  />
                  <MetricCard
                    title="Total Submissions"
                    value={trainerData.kpis.attempts}
                    subtitle={`Across ${trainerData.kpis.assessments} assessments`}
                    icon={BookOpen}
                    color="indigo"
                  />
                  <MetricCard
                    title="Score Range"
                    value={`${trainerData.kpis.highestScore}%`}
                    subtitle={`Lowest: ${trainerData.kpis.lowestScore}%`}
                    icon={TrendingUp}
                    color="purple"
                  />
                  <MetricCard
                    title="Avg Assessment Time"
                    value={trainerData.kpis.averageAssessmentTimeText}
                    subtitle="Per candidate attempt"
                    icon={Clock}
                    color="slate"
                  />
                  <MetricCard
                    title="Pending Evaluation"
                    value={trainerData.kpis.pendingEvaluations}
                    subtitle="Awaiting grade publication"
                    icon={SlidersHorizontal}
                    color={trainerData.kpis.pendingEvaluations > 0 ? "amber" : "emerald"}
                  />
                </div>

                {/* Charts Grid Row 1: Score Distribution & Trainee Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 15: Score Distribution Histogram */}
                  <AnalyticsChartCard
                    title="Chart 15: Class Score Distribution Histogram"
                    subtitle="Frequency of candidate score brackets (0–100%)"
                    xAxisLabel="Candidate Score Brackets (0-40%, 41-60%, 61-80%, 81-100%)"
                    yAxisLabel="Candidate Frequency (Count)"
                    hasData={trainerData.charts.scoreDistribution?.some((d) => d.count > 0)}
                  >
                    <BarChart data={trainerData.charts.scoreDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                      <Tooltip content={<CustomChartTooltip unit=" Candidates" />} />
                      <Bar dataKey="count" name="Candidates Count" fill="url(#gradIndigo)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 16: Trainee Performance Bar Chart */}
                  <AnalyticsChartCard
                    title="Chart 16: Trainee Performance Comparison"
                    subtitle="Average score across candidate roster (Top 15)"
                    xAxisLabel="Candidate Trainee Officer"
                    yAxisLabel="Average Score (%) & Pass Rate (%)"
                    hasData={trainerData.charts.traineePerformance?.length > 0}
                  >
                    <BarChart data={trainerData.charts.traineePerformance} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="trainee" stroke="#64748B" fontSize={10} angle={-20} textAnchor="end" height={50} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>
                </div>

                {/* Charts Grid Row 2: Subject Performance & Weak Topics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 17: Subject Performance Bar Chart */}
                  <AnalyticsChartCard
                    title="Chart 17: Subject Performance Overview"
                    subtitle="Class average score and pass rate by subject"
                    xAxisLabel="Subject Discipline"
                    yAxisLabel="Class Average Score (%) & Pass Rate (%)"
                    hasData={trainerData.charts.subjectPerformance?.length > 0}
                  >
                    <BarChart data={trainerData.charts.subjectPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradPurple)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 18: Weak Topic Horizontal Bar Chart */}
                  <AnalyticsChartCard
                    title="Chart 18: Weak Topic Identification (Lowest Accuracy First)"
                    subtitle="Identifies learning gaps requiring curriculum remediation"
                    xAxisLabel="Question Accuracy Percentage (%)"
                    yAxisLabel="Technical Topic Area"
                    hasData={trainerData.charts.weakTopics?.length > 0}
                  >
                    <BarChart layout="vertical" data={trainerData.charts.weakTopics} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                      <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <YAxis dataKey="topic" type="category" stroke="#64748B" fontSize={10} width={130} />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 6, 6, 0]}>
                        {trainerData.charts.weakTopics.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.accuracy >= 75 ? "url(#gradSuccess)" : (entry.accuracy >= 60 ? "url(#gradWarning)" : "url(#gradDanger)")} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </AnalyticsChartCard>
                </div>

                {/* Charts Grid Row 3: Question Item Analysis (Accuracy & Option Distribution) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 19: Question Accuracy Bar */}
                  <AnalyticsChartCard
                    title="Chart 19: Question Item Accuracy Analysis"
                    subtitle="Question-level correctness percentage across attempts"
                    xAxisLabel="Question Number (Item #)"
                    yAxisLabel="Candidate Accuracy Rate (%)"
                    hasData={trainerData.charts.questionAccuracy?.length > 0}
                  >
                    <BarChart data={trainerData.charts.questionAccuracy} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="questionNumber" stroke="#64748B" fontSize={11} label={{ value: "Question #", position: "insideBottom", offset: -5, fontSize: 10 }} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Bar dataKey="accuracy" name="Accuracy %" fill="url(#gradCyan)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 20: Option Distribution / Distractor Analysis */}
                  <AnalyticsChartCard
                    title="Chart 20: Option Selection & Distractor Analysis"
                    subtitle="Stacked frequency of selected options (A, B, C, D) per question"
                    xAxisLabel="Question Number (Item #)"
                    yAxisLabel="Option Selection Share (%)"
                    hasData={trainerData.charts.optionDistribution?.length > 0}
                  >
                    <BarChart data={trainerData.charts.optionDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="questionNumber" stroke="#64748B" fontSize={11} label={{ value: "Question #", position: "insideBottom", offset: -5, fontSize: 10 }} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="OptionA" name="Option A (%)" stackId="a" fill="#3B82F6" />
                      <Bar dataKey="OptionB" name="Option B (%)" stackId="a" fill="#10B981" />
                      <Bar dataKey="OptionC" name="Option C (%)" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="OptionD" name="Option D (%)" stackId="a" fill="#EC4899" />
                    </BarChart>
                  </AnalyticsChartCard>
                </div>

                {/* Charts Grid Row 4: Timing & Difficulty vs Accuracy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 21: Average Time per Question */}
                  <AnalyticsChartCard
                    title="Chart 21: Average Response Time per Question"
                    subtitle="Identifies speed bottlenecks and question complexity (seconds)"
                    xAxisLabel="Question Number (Item #)"
                    yAxisLabel="Average Response Time (Seconds)"
                    hasData={trainerData.charts.averageTimePerQuestion?.length > 0}
                  >
                    <BarChart data={trainerData.charts.averageTimePerQuestion} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="questionNumber" stroke="#64748B" fontSize={11} label={{ value: "Question #", position: "insideBottom", offset: -5, fontSize: 10 }} />
                      <YAxis stroke="#94A3B8" fontSize={11} unit="s" />
                      <Tooltip content={<CustomChartTooltip unit="s" />} />
                      <Bar dataKey="avgTimeSeconds" name="Avg Time" fill="url(#gradWarning)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 22: Difficulty vs Accuracy */}
                  <AnalyticsChartCard
                    title="Chart 22: Difficulty Tier vs Accuracy Calibration"
                    subtitle="Verifies whether Hard questions show expected lower accuracy"
                    xAxisLabel="Difficulty Tier (Easy, Medium, Hard)"
                    yAxisLabel="Accuracy (%) & Total Attempts"
                    hasData={trainerData.charts.difficultyVsAccuracy?.length > 0}
                  >
                    <BarChart data={trainerData.charts.difficultyVsAccuracy} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="difficulty" stroke="#64748B" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="accuracy" name="Accuracy %" fill="url(#gradIndigo)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="attempts" name="Attempts Count" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>
                </div>

                {/* Charts Grid Row 5: Assessment Trend Line */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Chart 23 & 24: Assessment Average Score & Pass Rate Trend */}
                  <AnalyticsChartCard
                    title="Charts 23 & 24: Assessment Score & Pass Rate Chronological Trend"
                    subtitle="Tracks cohort performance progression across successive assessments"
                    xAxisLabel="Assessment Title & Chronological Sequence"
                    yAxisLabel="Class Average Score (%) & Pass Rate (%)"
                    hasData={trainerData.charts.assessmentScoreTrend?.length > 0}
                  >
                    <LineChart data={trainerData.charts.assessmentScoreTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="assessment" stroke="#64748B" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Line type="monotone" dataKey="averageScore" name="Avg Score %" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, fill: "#3B82F6" }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </AnalyticsChartCard>
                </div>

                {/* ========================================================================= */}
                {/* DYNAMIC AT-RISK TRAINEE IDENTIFICATION & REMEDIATION TABLE */}
                {/* ========================================================================= */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        <h2 className="text-base font-bold text-slate-900">
                          Dynamic At-Risk Trainee Roster & Learning Intervention
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Trainees automatically classified by real average scores, pass rates, and weak topics. Zero hardcoded thresholds.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search officer name / cadre..."
                          value={atRiskSearch}
                          onChange={(e) => setAtRiskSearch(e.target.value)}
                          className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-60"
                        />
                      </div>

                      {/* Risk filter */}
                      <select
                        value={atRiskFilter}
                        onChange={(e) => setAtRiskFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        <option value="all">All Risk Levels ({trainerData.atRiskTrainees?.length || 0})</option>
                        <option value="High">High Risk Only</option>
                        <option value="Moderate">Moderate Risk Only</option>
                        <option value="Low">Low Risk (On Track)</option>
                      </select>
                    </div>
                  </div>

                  {/* Table Content */}
                  <div className="overflow-x-auto">
                    {trainerData.atRiskTrainees?.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No trainee records found.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="py-3.5 px-4">Trainee Officer</th>
                            <th className="py-3.5 px-4">Cadre ID / Dept</th>
                            <th className="py-3.5 px-4 text-center">Avg Score</th>
                            <th className="py-3.5 px-4 text-center">Pass Rate</th>
                            <th className="py-3.5 px-4">Weakest Area</th>
                            <th className="py-3.5 px-4 text-center">Trend</th>
                            <th className="py-3.5 px-4 text-center">Risk Level</th>
                            <th className="py-3.5 px-4 text-right">Intervention</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {trainerData.atRiskTrainees
                            .filter((t) => {
                              if (atRiskFilter !== "all" && t.riskLevel !== atRiskFilter) return false;
                              if (atRiskSearch.trim()) {
                                const q = atRiskSearch.toLowerCase();
                                return t.trainee?.toLowerCase().includes(q) || t.cadreId?.toLowerCase().includes(q) || t.weakestSubject?.toLowerCase().includes(q);
                              }
                              return true;
                            })
                            .map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900">{t.trainee}</div>
                                  <div className="text-[11px] text-slate-400">{t.assessmentAttempts} attempts completed</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="text-slate-800 font-mono text-[11px]">{t.cadreId}</div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{t.department}</div>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <PerformanceBadge score={t.averageScore} />
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`font-bold ${t.passRate >= 75 ? "text-emerald-600" : (t.passRate >= 50 ? "text-amber-600" : "text-rose-600")}`}>
                                    {t.passRate}%
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="text-slate-800 text-xs font-semibold">{t.weakestSubject}</div>
                                  <div className="text-[11px] text-rose-500 font-normal">Topic: {t.weakestTopic}</div>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    t.performanceTrend === "Improving"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : t.performanceTrend === "Declining"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-slate-100 text-slate-700 border border-slate-200"
                                  }`}>
                                    {t.performanceTrend}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <RiskBadge level={t.riskLevel} />
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={() => handleTriggerIntervention(t)}
                                    className="px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-xs"
                                  >
                                    Assign Remedial
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ROLE 3: ALL TRAINERS & SUBJECT MANAGEMENT VIEW */}
        {/* ========================================================================= */}
        {activeTab === "cohort-management" && (
          <>
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>Cohort Date Filter:</span>
                  </div>
                  <DateRangeFilter
                    value={dateRange}
                    onChange={setDateRange}
                    customStart={customStart}
                    customEnd={customEnd}
                    onCustomChange={(s, e) => {
                      setCustomStart(s);
                      setCustomEnd(e);
                    }}
                  />
                </div>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-slate-600">Computing cross-trainer cohort assessment analytics...</p>
              </div>
            ) : !cohortData || !cohortData.hasData ? (
              <EmptyAnalyticsState
                title="No Assessment Attempts Recorded"
                description="There are no completed trainee submissions recorded across faculty in the selected date range."
                icon={BookOpen}
                actionLabel="Reset Date Filter"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="space-y-6">
                {/* 6 Role-3 Metric KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <MetricCard
                    title="Active Faculty"
                    value={cohortData.kpis.totalTrainers}
                    subtitle="Course instructors"
                    icon={Users}
                    color="indigo"
                  />
                  <MetricCard
                    title="Assigned Subjects"
                    value={cohortData.kpis.totalAssignedSubjects}
                    subtitle="Specialized disciplines"
                    icon={BookOpen}
                    color="blue"
                  />
                  <MetricCard
                    title="Trainee Candidates"
                    value={cohortData.kpis.totalTrainees}
                    subtitle={`${cohortData.kpis.totalAttempts} total attempts`}
                    icon={UserCheck}
                    color="purple"
                  />
                  <MetricCard
                    title="Cohort Avg Score"
                    value={`${cohortData.kpis.averageScore}%`}
                    subtitle="Cross-faculty mean"
                    icon={Award}
                    color={cohortData.kpis.averageScore >= 75 ? "emerald" : "amber"}
                  />
                  <MetricCard
                    title="Cohort Pass Rate"
                    value={`${cohortData.kpis.passRate}%`}
                    subtitle={`Completion: ${cohortData.kpis.completionRate}%`}
                    icon={CheckCircle2}
                    color={cohortData.kpis.passRate >= 75 ? "emerald" : "amber"}
                  />
                  <MetricCard
                    title="At-Risk Trainees"
                    value={cohortData.kpis.atRiskTrainees}
                    subtitle="Organization-wide (<60%)"
                    icon={AlertTriangle}
                    color={cohortData.kpis.atRiskTrainees > 0 ? "rose" : "emerald"}
                  />
                </div>

                {/* Charts 25 & 26 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 25: Trainer Cohort Performance Comparison */}
                  <AnalyticsChartCard
                    title="Chart 25: Trainer Cohort Class Performance"
                    subtitle="Class average score and pass rate by assigned instructor (Neutral Label)"
                    xAxisLabel="Instructor / Faculty Name"
                    yAxisLabel="Cohort Average Score (%) & Pass Rate (%)"
                    hasData={cohortData.charts.trainerCohortPerformance?.length > 0}
                  >
                    <BarChart data={cohortData.charts.trainerCohortPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="trainerName" stroke="#64748B" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradIndigo)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 26: Subject Performance Comparison */}
                  <AnalyticsChartCard
                    title="Chart 26: Subject Performance Comparison"
                    subtitle="Average score and pass rate across all technical subjects"
                    xAxisLabel="Subject Discipline / Domain"
                    yAxisLabel="Average Score (%) & Pass Rate (%)"
                    hasData={cohortData.charts.subjectPerformanceComparison?.length > 0}
                  >
                    <BarChart data={cohortData.charts.subjectPerformanceComparison} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="subject" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={45} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>
                </div>

                {/* Chart 27: Trainer-Subject Performance Heatmap Matrix */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Chart 27: Trainer-Subject Performance Matrix & Coverage Heatmap
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Visualizes dynamic average candidate performance across each instructor and subject discipline.
                  </p>

                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {cohortData.charts.heatmapMatrix?.map((hm, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border transition-all ${
                            !hm.hasData
                              ? "bg-slate-50 border-slate-200/60 opacity-60"
                              : hm.averageScore >= 75
                              ? "bg-emerald-50/70 border-emerald-200"
                              : hm.averageScore >= 60
                              ? "bg-amber-50/70 border-amber-200"
                              : "bg-rose-50/70 border-rose-200"
                          }`}
                        >
                          <div className="text-[11px] font-bold text-slate-700 truncate">{hm.subject}</div>
                          <div className="text-[11px] text-slate-500 truncate">{hm.trainer}</div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-lg font-bold text-slate-900">
                              {hm.hasData ? `${hm.averageScore}%` : "No Submissions"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {hm.attempts} attempts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Charts 28, 29, 30 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chart 28: Assessment Performance Trend Line */}
                  <AnalyticsChartCard
                    title="Chart 28: Cohort Performance Progression"
                    subtitle="Chronological timeline of cohort scores"
                    xAxisLabel="Assessment Submission Date"
                    yAxisLabel="Cohort Average Score (%)"
                    hasData={cohortData.charts.assessmentPerformanceTrend?.length > 0}
                  >
                    <AreaChart data={cohortData.charts.assessmentPerformanceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} unit="%" />
                      <Tooltip content={<CustomChartTooltip unit="%" />} />
                      <Area type="monotone" dataKey="cohortAverageScore" name="Cohort Avg Score %" stroke="#6366F1" strokeWidth={3} fill="url(#gradAreaIndigo)" />
                    </AreaChart>
                  </AnalyticsChartCard>

                  {/* Chart 29: Subject Score Distribution */}
                  <AnalyticsChartCard
                    title="Chart 29: Subject Score Distribution"
                    subtitle="Score bracket breakdown by subject"
                    xAxisLabel="Subject Discipline"
                    yAxisLabel="Candidate Count Across Score Tiers"
                    hasData={cohortData.charts.subjectScoreDistribution?.length > 0}
                  >
                    <BarChart data={cohortData.charts.subjectScoreDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="subject" stroke="#64748B" fontSize={9} angle={-15} textAnchor="end" height={40} />
                      <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                      <Tooltip content={<CustomChartTooltip unit=" Candidates" />} />
                      <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                      <Bar dataKey="0-40%" stackId="a" fill="#EF4444" />
                      <Bar dataKey="41-60%" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="61-80%" stackId="a" fill="#3B82F6" />
                      <Bar dataKey="81-100%" stackId="a" fill="#10B981" />
                    </BarChart>
                  </AnalyticsChartCard>

                  {/* Chart 30: Trainer Workload Bar Chart */}
                  <AnalyticsChartCard
                    title="Chart 30: Trainer Workload Index"
                    subtitle="Assigned courses and assessments count"
                    xAxisLabel="Faculty Instructor"
                    yAxisLabel="Active Courses & Assessments Conducted"
                    hasData={cohortData.charts.trainerWorkload?.length > 0}
                  >
                    <BarChart data={cohortData.charts.trainerWorkload} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                      <ChartGradients />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="trainer" stroke="#64748B" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                      <Tooltip content={<CustomChartTooltip unit="" />} />
                      <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                      <Bar dataKey="coursesCount" name="Courses" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="assessmentsCount" name="Assessments" fill="url(#gradPurple)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AnalyticsChartCard>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
