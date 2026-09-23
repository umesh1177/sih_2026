import React, { useState, useEffect } from "react";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  Target, 
  BookOpen, 
  ShieldCheck, 
  BarChart3, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Layers, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  Cell 
} from "recharts";
import { api } from "../../services/api";
import { MetricCard } from "./common/MetricCard";
import { AnalyticsChartCard } from "./common/AnalyticsChartCard";
import { EmptyAnalyticsState } from "./common/EmptyAnalyticsState";
import { DateRangeFilter } from "./common/DateRangeFilter";
import { ChartGradients, CustomChartTooltip } from "./common/chartTheme";

export const TraineeAnalyticsDashboard = ({ currentUser, initialQuizId = null }) => {
  const traineeId = currentUser?.id || "u_trainee_1";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(initialQuizId || "");
  const [dateRange, setDateRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Question Analysis Filters
  const [questionFilter, setQuestionFilter] = useState("all"); // all | correct | incorrect
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [traineeId, selectedQuizId, dateRange, customStart, customEnd]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = { dateRange };
      if (selectedQuizId) params.quizId = selectedQuizId;
      if (dateRange === "custom" && customStart) {
        params.customStart = customStart;
        if (customEnd) params.customEnd = customEnd;
      }
      const res = await api.getTraineeAnalytics(traineeId, params);
      if (res.success) {
        setData(res);
        if (!selectedQuizId && res.activeAssessment?.id) {
          setSelectedQuizId(res.activeAssessment.id);
        }
      } else {
        setData(null);
      }
    } catch (err) {
      console.error("Failed to load trainee analytics:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#0B3475] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center space-y-1">
          <h3 className="text-xs font-bold text-slate-800">Calculating Assessment Analytics</h3>
          <p className="text-[11px] text-slate-500">Processing stored assessment submissions...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.hasData || !data.kpis) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <h1 className="text-base font-bold text-slate-900">Personal Assessment Analytics</h1>
            <p className="text-xs text-slate-500 mt-0.5">Performance tracking and score analytics.</p>
          </div>
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            customStart={customStart}
            customEnd={customEnd}
            onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
          />
        </div>
        <EmptyAnalyticsState
          title="No Sufficient Assessment Data"
          description="You haven't completed any published assessments yet or there are no recorded attempts for the selected filter."
          icon={BookOpen}
          actionLabel="View Assessments"
          onAction={() => window.location.href = "/?tab=trainee-quizzes"}
        />
      </div>
    );
  }

  const { trainee, activeAssessment, availableAssessments, kpis, charts, questionAnalysis } = data;

  // Filter questions
  const filteredQuestions = (questionAnalysis || []).filter(q => {
    if (questionFilter === "correct" && !q.isCorrect) return false;
    if (questionFilter === "incorrect" && (q.isCorrect || q.result === "Unanswered")) return false;
    if (selectedTopicFilter !== "all" && q.topic !== selectedTopicFilter) return false;
    return true;
  });

  const uniqueTopics = Array.from(new Set((questionAnalysis || []).map(q => q.topic).filter(Boolean)));

  // Label Truncator helper
  const truncate = (str, maxLen = 18) => {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none font-sans bg-[#F8FAFC] min-h-screen text-slate-800">
      
      {/* ─── 1. HEADER & ASSESSMENT SELECTOR ─── */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0B3475] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#0B3475]" />
              Trainee Assessment Analytics
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {trainee?.cadreId || "IMD-MET-2026"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Personal Assessment Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Clear, real-time insights calculated from your actual exam submissions and accuracy rates.
          </p>
        </div>

        {/* Assessment & Time Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex-1 md:flex-initial">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Select Assessment</label>
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full md:w-64 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-[#0B3475]"
            >
              {availableAssessments?.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.score}/{a.totalMarks} • {a.percentage}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 md:flex-initial">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Time Range</label>
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomChange={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
            />
          </div>
        </div>
      </div>

      {/* ─── 2. ESSENTIAL KPI SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Score"
          value={`${kpis.score} / ${kpis.totalMarks}`}
          subtitle={`${kpis.percentage}% achieved`}
          icon={Award}
          color="blue"
        />
        <MetricCard
          title="Result Status"
          value={kpis.passed ? "PASSED" : "FAILED"}
          subtitle={kpis.passed ? "Benchmark Met" : "Cutoff Not Met"}
          icon={kpis.passed ? CheckCircle2 : XCircle}
          color={kpis.passed ? "emerald" : "rose"}
        />
        <MetricCard
          title="Accuracy"
          value={`${kpis.accuracy}%`}
          subtitle={`${kpis.correct} of ${kpis.questionsAttempted} correct`}
          icon={Target}
          color="cyan"
        />
        <MetricCard
          title="Questions"
          value={`${kpis.questionsAttempted} / ${kpis.totalQuestions}`}
          subtitle={`${kpis.unanswered || 0} unanswered`}
          icon={HelpCircle}
          color="indigo"
        />
        <MetricCard
          title="Time Spent"
          value={kpis.totalTimeText}
          subtitle={`Avg ${kpis.avgTimePerQuestionText || "40s"}/Q`}
          icon={Clock}
          color="slate"
        />
        <MetricCard
          title="Cohort Rank"
          value={`#${kpis.rank || 1}`}
          subtitle={`Top ${kpis.percentile || 100}% of class`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* ─── 3. THE 4 ESSENTIAL CHARTS (2x2 MODERN GRID) ─── */}
      <div className="space-y-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Chart 1: Score vs Passing Cutoff Benchmark */}
          <AnalyticsChartCard
            title="1. Score vs Passing Benchmark"
            subtitle="Your achieved marks compared against the required passing cutoff"
            xAxisLabel="Marks (Score Scale)"
            yAxisLabel="Benchmark Category"
            badge={`${kpis.score} / ${kpis.totalMarks} Marks`}
            badgeColor={kpis.passed ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}
            height={260}
          >
            <BarChart
              layout="vertical"
              data={charts?.scoreVsPassing || []}
              margin={{ top: 15, right: 30, left: 15, bottom: 5 }}
            >
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 'dataMax + 2']} stroke="#94A3B8" fontSize={11} />
              <YAxis 
                type="category" 
                dataKey="metric" 
                stroke="#64748B" 
                fontSize={11} 
                width={120} 
                tickFormatter={(val) => truncate(val, 16)}
              />
              <Tooltip content={<CustomChartTooltip unit=" Marks" />} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {(charts?.scoreVsPassing || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || "#0B3475"} />
                ))}
              </Bar>
            </BarChart>
          </AnalyticsChartCard>

          {/* Chart 2: Subject Performance & Accuracy */}
          <AnalyticsChartCard
            title="2. Subject-wise Accuracy"
            subtitle="Your accuracy percentage across core meteorological subjects"
            xAxisLabel="Meteorological Subject"
            yAxisLabel="Accuracy Percentage (%)"
            height={260}
          >
            <BarChart 
              data={charts?.subjectPerformance || []} 
              margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
            >
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="subject" 
                stroke="#64748B" 
                fontSize={10} 
                tickFormatter={(val) => truncate(val, 14)} 
                height={35} 
              />
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
              <Tooltip content={<CustomChartTooltip unit="%" />} />
              <Bar dataKey="accuracy" name="Accuracy %" fill="url(#gradPrimary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </AnalyticsChartCard>

          {/* Chart 3: Topic-Level Concept Mastery */}
          <AnalyticsChartCard
            title="3. Topic Concept Mastery"
            subtitle="Mastery rate by specific atmospheric physics and forecasting topic"
            xAxisLabel="Mastery Percentage (%)"
            yAxisLabel="Meteorological Topic"
            height={260}
          >
            <BarChart
              layout="vertical"
              data={charts?.topicMastery || []}
              margin={{ top: 15, right: 30, left: 15, bottom: 5 }}
            >
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
              <YAxis 
                type="category" 
                dataKey="topic" 
                stroke="#64748B" 
                fontSize={10} 
                width={120} 
                tickFormatter={(val) => truncate(val, 16)}
              />
              <Tooltip content={<CustomChartTooltip unit="%" />} />
              <Bar dataKey="masteryPercent" name="Mastery %" radius={[0, 6, 6, 0]}>
                {(charts?.topicMastery || []).map((entry, index) => {
                  const val = entry.masteryPercent || 0;
                  const color = val >= 80 ? "#10B981" : (val >= 60 ? "#0B3475" : "#F59E0B");
                  return <Cell key={`cell-top-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </AnalyticsChartCard>

          {/* Chart 4: Score Progression Timeline */}
          <AnalyticsChartCard
            title="4. Score Progression Timeline"
            subtitle="Performance trend across consecutive assessment attempts"
            xAxisLabel="Assessment Attempt Timeline"
            yAxisLabel="Score Percentage (%)"
            height={260}
          >
            <AreaChart 
              data={charts?.scoreProgression || []} 
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <ChartGradients />
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="title" 
                stroke="#64748B" 
                fontSize={10} 
                tickFormatter={(val) => truncate(val, 16)} 
              />
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
              <Tooltip content={<CustomChartTooltip unit="%" />} />
              <Area 
                type="monotone" 
                dataKey="scorePercent" 
                name="Score %" 
                stroke="#0B3475" 
                strokeWidth={2.5} 
                fill="url(#gradAreaBlue)" 
              />
            </AreaChart>
          </AnalyticsChartCard>

        </div>
      </div>

      {/* ─── 4. TOPIC LEARNING GAPS & REMEDIATION MATRIX ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-50 text-[#0B3475] border border-blue-200">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Topic Learning Gaps &amp; Concept Strengths
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Automated classification: Strong (≥80%), Developing (60–79%), and Needs Review (&lt;60%).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">Strong (≥80%)</span>
            <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">Developing (60–79%)</span>
            <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">Review (&lt;60%)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {(charts?.learningGapHeatmap || []).map((item, idx) => {
            const isStrong = item.accuracy >= 80;
            const isDev = item.accuracy >= 60 && item.accuracy < 80;
            
            return (
              <div 
                key={idx} 
                className={`p-3.5 rounded-lg border transition-all ${
                  isStrong
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : (isDev ? "bg-blue-50/40 border-blue-200" : "bg-amber-50/40 border-amber-200")
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate" title={item.topic}>{item.topic}</span>
                  <span className={`text-xs font-bold font-mono ${
                    isStrong ? "text-emerald-700" : (isDev ? "text-blue-700" : "text-amber-700")
                  }`}>
                    {item.accuracy}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isStrong ? "bg-emerald-500" : (isDev ? "bg-blue-600" : "bg-amber-500")
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.correctCount} of {item.questionsCount} Correct</span>
                  <span className="font-semibold text-slate-700">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. QUESTION RESPONSE DIAGNOSTICS & EXPLANATIONS ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Question-by-Question Response Review
            </h3>
            <p className="text-[11px] text-slate-500">
              Review your answers, correct options, and detailed meteorological explanations.
            </p>
          </div>

          {/* Question Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setQuestionFilter("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  questionFilter === "all" ? "bg-white text-[#0B3475] shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({questionAnalysis?.length || 0})
              </button>
              <button
                onClick={() => setQuestionFilter("correct")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  questionFilter === "correct" ? "bg-white text-emerald-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Correct ({questionAnalysis?.filter(q => q.isCorrect).length || 0})
              </button>
              <button
                onClick={() => setQuestionFilter("incorrect")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  questionFilter === "incorrect" ? "bg-white text-rose-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Incorrect ({questionAnalysis?.filter(q => !q.isCorrect && q.result !== "Unanswered").length || 0})
              </button>
            </div>

            {uniqueTopics.length > 0 && (
              <select
                value={selectedTopicFilter}
                onChange={(e) => setSelectedTopicFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:border-[#0B3475]"
              >
                <option value="all">All Topics ({uniqueTopics.length})</option>
                {uniqueTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Diagnostic Items List */}
        <div className="space-y-2.5">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.questionId;
            return (
              <div 
                key={q.questionId || idx}
                className={`p-3.5 rounded-lg border transition-all ${
                  q.isCorrect ? "bg-slate-50/60 border-slate-200" : "bg-rose-50/30 border-rose-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                      q.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {q.questionNumber || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#0B3475] border border-blue-200">
                          {q.topic}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {q.timeSpent}s spent
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 mt-1">{q.questionText}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {q.result} ({q.marksEarned}/{q.totalMarks} M)
                    </span>
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.questionId)}
                      className="text-xs font-semibold text-[#0B3475] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide" : "Details"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answer Analysis */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Your Answer</span>
                        <p className={`font-semibold mt-0.5 ${q.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                          {q.selectedAnswer || "Unanswered"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Correct Answer</span>
                        <p className="font-semibold text-emerald-700 mt-0.5">{q.correctAnswer}</p>
                      </div>
                    </div>
                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-700">
                        <span className="text-[10px] font-bold text-[#0B3475] uppercase block mb-0.5">Explanation</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
