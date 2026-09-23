import React, { useState, useEffect } from "react";
import {
  Building2,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  FileCheck,
  Zap,
  Activity,
  UserCheck,
  Download,
  Flame,
  ChevronDown
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { api } from "../../services/api";
import { MetricCard } from "./common/MetricCard";
import { AnalyticsChartCard } from "./common/AnalyticsChartCard";
import { EmptyAnalyticsState } from "./common/EmptyAnalyticsState";
import { DateRangeFilter } from "./common/DateRangeFilter";
import { PerformanceBadge } from "./common/PerformanceBadge";
import { RiskBadge } from "./common/RiskBadge";
import { ChartGradients, CustomChartTooltip } from "./common/chartTheme";

export const AdminAnalyticsDashboard = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  // 7-Level Cascading Filters
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState("all");
  const [selectedTrainerId, setSelectedTrainerId] = useState("all");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    loadAdminAnalytics();
  }, [selectedCourseId, selectedSubjectId, selectedTrainerId, selectedAssessmentId, selectedDepartment, dateRange, customStart, customEnd]);

  const loadAdminAnalytics = async () => {
    setLoading(true);
    try {
      const params = { dateRange };
      if (selectedCourseId !== "all") params.courseId = selectedCourseId;
      if (selectedSubjectId !== "all") params.subjectId = selectedSubjectId;
      if (selectedTrainerId !== "all") params.trainerId = selectedTrainerId;
      if (selectedAssessmentId !== "all") params.assessmentId = selectedAssessmentId;
      if (selectedDepartment !== "all") params.department = selectedDepartment;
      if (dateRange === "custom" && customStart) {
        params.customStart = customStart;
        if (customEnd) params.customEnd = customEnd;
      }

      const res = await api.getAdminAssessmentAnalytics(params);
      if (res.success) {
        setAdminData(res);
      } else {
        setAdminData(null);
      }
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      setAdminData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCourseId("all");
    setSelectedSubjectId("all");
    setSelectedTrainerId("all");
    setSelectedAssessmentId("all");
    setSelectedDepartment("all");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
  };

  const exportReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans select-none">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Role 4 • Institutional Analytics Hub
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Capacity Connect LMS • IMD / MoES Directorate
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                Organization-Wide Assessment Analytics & Governance
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Full 7-level cascading drill-down pipeline, completion funnel, integrity metrics, and question quality calibration.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export Governance Summary
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* 7-LEVEL CASCADING DRILL-DOWN FILTER BAR */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs mb-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                7-Level Cascading Filter Pipeline
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Level 1: Course */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
              >
                <option value="all">All Courses</option>
                {(adminData?.filters?.courses || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2: Subject */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
              >
                <option value="all">All Subjects</option>
                {(adminData?.filters?.subjects || []).map((s, idx) => (
                  <option key={idx} value={s.id || s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 3: Trainer */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Trainer / Faculty</label>
              <select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
              >
                <option value="all">All Trainers</option>
                {(adminData?.filters?.trainers || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 4: Assessment */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Assessment Exam</label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
              >
                <option value="all">All Assessments</option>
                {(adminData?.filters?.assessments || []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 5: Department */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden truncate"
              >
                <option value="all">All Departments</option>
                {(adminData?.filters?.departments || []).map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 6: Date Range */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">6. Date Range</label>
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
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-600">Computing organization-wide assessment analytics...</p>
          </div>
        ) : !adminData || !adminData.hasData ? (
          <EmptyAnalyticsState
            title="No Sufficient Assessment Data"
            description="There is no completed submission data matching your current 7-level drill-down selection."
            icon={BookOpen}
            actionLabel="Reset Pipeline Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* 8 ORGANIZATION-WIDE KPIS */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Trainees / Officers"
                value={adminData.kpis.totalTrainees}
                subtitle={`${adminData.kpis.totalAttempts} total attempts`}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Overall Average Score"
                value={`${adminData.kpis.overallAverageScore}%`}
                subtitle="Across all assessments"
                icon={Award}
                color={adminData.kpis.overallAverageScore >= 75 ? "emerald" : "amber"}
              />
              <MetricCard
                title="Overall Pass Rate"
                value={`${adminData.kpis.overallPassRate}%`}
                subtitle={`Completion: ${adminData.kpis.completionRate}%`}
                icon={CheckCircle2}
                color={adminData.kpis.overallPassRate >= 75 ? "emerald" : "amber"}
              />
              <MetricCard
                title="Credentials Issued"
                value={adminData.kpis.certificatesIssued}
                subtitle="Verified certificates"
                icon={FileCheck}
                color="purple"
              />
              <MetricCard
                title="Active Assessments"
                value={adminData.kpis.totalAssessments}
                subtitle={`In ${adminData.kpis.totalCourses} courses`}
                icon={BookOpen}
                color="indigo"
              />
              <MetricCard
                title="Faculty Instructors"
                value={adminData.kpis.totalTrainers}
                subtitle="Conducting assessments"
                icon={UserCheck}
                color="slate"
              />
              <MetricCard
                title="At-Risk Trainees"
                value={adminData.kpis.atRiskTrainees}
                subtitle="Score < 60% across exams"
                icon={AlertTriangle}
                color={adminData.kpis.atRiskTrainees > 0 ? "rose" : "emerald"}
              />
              <MetricCard
                title="Disciplines / Subjects"
                value={adminData.kpis.totalSubjects}
                subtitle="Covered in curriculum"
                icon={Layers}
                color="blue"
              />
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 31 & 32: OVERALL SCORE & PASS RATE TREND */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 31: Overall Score Trend */}
              <AnalyticsChartCard
                title="Chart 31: Organization Score Progression Trend"
                subtitle="Timeline of institutional candidate average score over time"
                xAxisLabel="Assessment Submission Date / Timeline"
                yAxisLabel="Institutional Mean Score (%)"
                hasData={adminData.charts.overallScoreTrend?.length > 0}
              >
                <LineChart data={adminData.charts.overallScoreTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Line type="monotone" dataKey="averageScore" name="Institutional Mean %" stroke="#2563EB" strokeWidth={3} dot={{ r: 5, fill: "#2563EB" }} activeDot={{ r: 7 }} />
                </LineChart>
              </AnalyticsChartCard>

              {/* Chart 32: Pass Rate Trend */}
              <AnalyticsChartCard
                title="Chart 32: Organization Pass Rate Trend"
                subtitle="Timeline of institutional pass percentage compliance"
                xAxisLabel="Assessment Submission Date / Timeline"
                yAxisLabel="Institutional Pass Rate Percentage (%)"
                hasData={adminData.charts.passRateTrend?.length > 0}
              >
                <LineChart data={adminData.charts.passRateTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Line type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: "#10B981" }} activeDot={{ r: 7 }} />
                </LineChart>
              </AnalyticsChartCard>
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 33 & 34: COURSE & SUBJECT PERFORMANCE */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 33: Course Performance */}
              <AnalyticsChartCard
                title="Chart 33: Course-Level Performance Benchmark"
                subtitle="Average score and pass rate by enrolled curriculum program"
                xAxisLabel="Curriculum Course Program"
                yAxisLabel="Average Score (%) & Pass Rate (%)"
                hasData={adminData.charts.coursePerformance?.length > 0}
              >
                <BarChart data={adminData.charts.coursePerformance} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="course" stroke="#64748B" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>

              {/* Chart 34: Subject Performance */}
              <AnalyticsChartCard
                title="Chart 34: Subject Performance Comparison"
                subtitle="Cross-discipline score benchmark across technical competencies"
                xAxisLabel="Subject Discipline / Domain"
                yAxisLabel="Average Score (%) & Pass Rate (%)"
                hasData={adminData.charts.subjectPerformance?.length > 0}
              >
                <BarChart data={adminData.charts.subjectPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="subject" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={45} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradPurple)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="passRate" name="Pass Rate %" fill="url(#gradSuccess)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 35 & 36: DEPARTMENT & SCORE DISTRIBUTION */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 35: Department Performance */}
              <AnalyticsChartCard
                title="Chart 35: Departmental Assessment Performance"
                subtitle="Average candidate score by station division"
                xAxisLabel="Institutional Department / Division"
                yAxisLabel="Department Average Score (%)"
                hasData={adminData.charts.departmentPerformance?.length > 0}
              >
                <BarChart data={adminData.charts.departmentPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="department" stroke="#64748B" fontSize={10} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Bar dataKey="averageScore" name="Avg Score %" fill="url(#gradCyan)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>

              {/* Chart 36: Organization Score Distribution Histogram */}
              <AnalyticsChartCard
                title="Chart 36: Institutional Score Distribution Histogram"
                subtitle="Candidate count across performance tiers (0–100%)"
                xAxisLabel="Score Brackets (0-40%, 41-60%, 61-80%, 81-100%)"
                yAxisLabel="Candidate Frequency (Count)"
                hasData={adminData.charts.organizationScoreHistogram?.some((d) => d.count > 0)}
              >
                <BarChart data={adminData.charts.organizationScoreHistogram} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="range" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip unit=" Candidates" />} />
                  <Bar dataKey="count" name="Candidates Count" fill="url(#gradIndigo)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 37 & 38: ATTEMPTS TIMELINE & COMPLETION FUNNEL */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 37: Assessment Attempts Over Time */}
              <AnalyticsChartCard
                title="Chart 37: Assessment Examination Volume Timeline"
                subtitle="Total submission attempts logged over time"
                xAxisLabel="Date Timeline"
                yAxisLabel="Total Examination Attempts Logged"
                hasData={adminData.charts.attemptsTimeline?.length > 0}
              >
                <AreaChart data={adminData.charts.attemptsTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip unit=" Attempts" />} />
                  <Area type="monotone" dataKey="attempts" name="Attempts Logged" stroke="#3B82F6" strokeWidth={3} fill="url(#gradAreaBlue)" />
                </AreaChart>
              </AnalyticsChartCard>

              {/* Chart 38: Assessment Completion Funnel */}
              <AnalyticsChartCard
                title="Chart 38: Assessment Pipeline & Certification Funnel"
                subtitle="Tracks candidate conversion from enrollment to credential issuance"
                xAxisLabel="Candidates Count (Volume)"
                yAxisLabel="Pipeline Progression Stage"
                hasData={adminData.charts.completionFunnel?.length > 0}
              >
                <BarChart layout="vertical" data={adminData.charts.completionFunnel} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="stage" type="category" stroke="#64748B" fontSize={10} width={130} />
                  <Tooltip content={<CustomChartTooltip unit=" Candidates" />} />
                  <Bar dataKey="count" name="Candidates Count" radius={[0, 6, 6, 0]}>
                    {adminData.charts.completionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || "#3B82F6"} />
                    ))}
                  </Bar>
                </BarChart>
              </AnalyticsChartCard>
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 39 & 40: CERTIFICATE ISSUANCE & LEARNING GAPS */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 39: Certificate Issuance Trend */}
              <AnalyticsChartCard
                title="Chart 39: Credential & Certificate Issuance Velocity"
                subtitle="Count of competency certificates generated upon passing"
                xAxisLabel="Date Timeline"
                yAxisLabel="Certificates & Credentials Issued"
                hasData={adminData.charts.certificateIssuanceTrend?.length > 0}
              >
                <BarChart data={adminData.charts.certificateIssuanceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip unit=" Issued" />} />
                  <Bar dataKey="certificates" name="Certificates Issued" fill="url(#gradWarning)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>

              {/* Chart 40: Organization Learning Gaps */}
              <AnalyticsChartCard
                title="Chart 40: Institutional Learning Gaps Identification"
                subtitle="Topic accuracy across organization (<60% needs attention)"
                xAxisLabel="Accuracy Rate Percentage (%)"
                yAxisLabel="Curriculum Topic Area"
                hasData={adminData.charts.organizationLearningGaps?.length > 0}
              >
                <BarChart layout="vertical" data={adminData.charts.organizationLearningGaps} margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <YAxis dataKey="topic" type="category" stroke="#64748B" fontSize={10} width={130} />
                  <Tooltip content={<CustomChartTooltip unit="%" />} />
                  <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 6, 6, 0]}>
                    {adminData.charts.organizationLearningGaps.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </AnalyticsChartCard>
            </div>

            {/* ========================================================================= */}
            {/* CHARTS 41, 42, 44: QUALITY, INTEGRITY & WORKLOAD */}
            {/* ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 41: Question Quality Distribution */}
              <AnalyticsChartCard
                title="Chart 41: Question Bank Calibration & Quality"
                subtitle="Accuracy distribution across question items"
                xAxisLabel="Question Calibration Category"
                yAxisLabel="Question Items Count"
                hasData={adminData.charts.questionQualityDistribution?.some((d) => d.count > 0)}
              >
                <BarChart data={adminData.charts.questionQualityDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="category" stroke="#64748B" fontSize={9} angle={-15} textAnchor="end" height={45} />
                  <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip unit=" Questions" />} />
                  <Bar dataKey="count" name="Questions Count" radius={[6, 6, 0, 0]}>
                    {adminData.charts.questionQualityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || "#3B82F6"} />
                    ))}
                  </Bar>
                </BarChart>
              </AnalyticsChartCard>

              {/* Chart 42: Integrity Violation Donut */}
              <AnalyticsChartCard
                title="Chart 42: Exam Integrity Compliance"
                subtitle="Anti-cheating kiosk & tab-switch telemetry breakdown"
                xAxisLabel="Compliance Category"
                yAxisLabel="Submissions Share (%)"
                hasData={adminData.charts.integrityViolationDonut?.length > 0}
              >
                <PieChart>
                  <Pie
                    data={adminData.charts.integrityViolationDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {adminData.charts.integrityViolationDonut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip unit=" Submissions" />} />
                  <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
                </PieChart>
              </AnalyticsChartCard>

              {/* Chart 44: Trainer Workload Bar Chart */}
              <AnalyticsChartCard
                title="Chart 44: Faculty Assessment Workload"
                subtitle="Courses and assessments conducted per faculty"
                xAxisLabel="Faculty Instructor"
                yAxisLabel="Courses & Assessments Count"
                hasData={adminData.charts.trainerWorkload?.length > 0}
              >
                <BarChart data={adminData.charts.trainerWorkload} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <ChartGradients />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="trainer" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<CustomChartTooltip unit="" />} />
                  <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                  <Bar dataKey="courses" name="Courses" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="assessments" name="Assessments" fill="url(#gradPurple)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </AnalyticsChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
