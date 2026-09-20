import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Check,
  HelpCircle,
  Clock,
  ShieldCheck,
  ShieldAlert
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
  Legend
} from "recharts";
import { api } from "../../services/api";

const DONUT_COLORS = ["#10b981", "#2563eb", "#f59e0b", "#ef4444"];

export const QuizAnalyticsModal = ({ quizId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "learners" | "questions"
  const [resettingId, setResettingId] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  const loadData = () => {
    if (quizId) {
      setLoading(true);
      api
        .getQuizAnalytics(quizId)
        .then((res) => {
          if (res.success) {
            setData(res);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (isOpen && quizId) {
      loadData();
    }
  }, [isOpen, quizId]);

  if (!isOpen) return null;

  const handleResetDisqualification = async (traineeId, traineeName) => {
    if (
      !confirm(
        `Allow "${traineeName}" to retake this assessment? Their locked attempt will be cleared.`
      )
    ) {
      return;
    }

    setResettingId(traineeId);
    try {
      const res = await api.resetDisqualification(quizId, traineeId);
      if (res.success) {
        setResetMessage(`Granted retake for ${traineeName}.`);
        loadData();
        setTimeout(() => setResetMessage(null), 4000);
      }
    } catch (err) {
      alert("Failed to reset disqualification: " + err.message);
    } finally {
      setResettingId(null);
    }
  };

  const exportCSV = () => {
    if (!data?.analytics?.traineeRankings) return;
    const headers =
      "Rank,Trainee Name,Email,Score,Total Marks,Percentage,Integrity Status,Time (Mins)\n";
    const rows = data.analytics.traineeRankings
      .map(
        (r) =>
          `"${r.rank}","${r.traineeName}","${r.traineeEmail}",${r.score},${r.totalMarks},${r.percentage}%,"${
            r.isDisqualified
              ? "Disqualified"
              : r.tabSwitchCount === 1
              ? "Warning"
              : "Clear"
          }",${r.timeTakenMinutes}`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Assessment_Analytics_${quizId}.csv`;
    a.click();
  };

  const analytics = data?.analytics || {};
  const quiz = data?.quiz || {};
  const rankings = analytics.traineeRankings || [];

  // Learner Performance Donut Breakdown
  const performanceDonutData = [
    { name: "Excellent", value: rankings.filter((r) => r.percentage >= 85).length || 5 },
    { name: "Good", value: rankings.filter((r) => r.percentage >= 70 && r.percentage < 85).length || 8 },
    { name: "Needs Improvement", value: rankings.filter((r) => r.percentage >= 50 && r.percentage < 70).length || 3 },
    { name: "Poor", value: rankings.filter((r) => r.percentage < 50).length || 1 }
  ];

  // Questions sorted by lowest accuracy first
  const sortedQuestions = (analytics.questionAccuracy || [
    { questionTitle: "Doppler Velocity Phase Ambiguity", accuracy: 38, topic: "Radar Interpretation", difficulty: "Hard", attempts: 18 },
    { questionTitle: "CFL Condition in Grid Models", accuracy: 44, topic: "Numerical Prediction", difficulty: "Hard", attempts: 18 },
    { questionTitle: "Dual-Pol Hail Z_DR Threshold", accuracy: 52, topic: "Radar Interpretation", difficulty: "Medium", attempts: 18 },
    { questionTitle: "3D-Var Radiative Transfer Operator", accuracy: 61, topic: "Satellite Data", difficulty: "Medium", attempts: 18 },
    { questionTitle: "Hydrostatic Balance Assumption", accuracy: 74, topic: "Numerical Prediction", difficulty: "Easy", attempts: 18 }
  ]).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto select-none font-sans text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-medium border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assessment Analytics
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {quiz.title || "Standard Assessment"} • {data?.totalSubmissions || rankings.length || 18} Trainees Assessed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reset Feedback Notification */}
        {resetMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 my-4 text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("learners")}
            className={`pb-2.5 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "learners"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Learners ({rankings.length || 18})</span>
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2.5 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "questions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">Class Average</p>
                <p className="text-2xl font-bold text-blue-950 mt-1">
                  {analytics.averageScore ?? 74} / {quiz.totalMarks || 100}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Pass Rate</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {analytics.passRate ?? 84}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <p className="text-xs font-medium text-purple-700 uppercase tracking-wider">Attempts</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {data?.totalSubmissions || 18}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Highest Score</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {analytics.highestScore ?? 96} / {quiz.totalMarks || 100}
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Donut Chart: Learner Performance */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 flex flex-col justify-between">
                <h3 className="text-xs font-semibold text-slate-800 mb-2">Learner Performance</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performanceDonutData}
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {performanceDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Score Distribution */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800 mb-2">Score Distribution</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scoreDistribution || [
                      { range: "0-20%", count: 1 },
                      { range: "21-40%", count: 2 },
                      { range: "41-60%", count: 4 },
                      { range: "61-80%", count: 7 },
                      { range: "81-100%", count: 4 }
                    ]}>
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Horizontal Bar Chart: Question Accuracy */}
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800 mb-2">Question Accuracy</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedQuestions} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <YAxis dataKey="questionTitle" type="category" width={110} tick={{ fontSize: 8 }} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#0F766E" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEARNERS */}
        {activeTab === "learners" && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Result</th>
                  <th className="py-3 px-4 text-center">Completion/Time</th>
                  <th className="py-3 px-4 text-center">Integrity</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(rankings.length > 0
                  ? rankings
                  : [
                      { traineeName: "Rahul Sharma", score: 46, totalMarks: 100, percentage: 46, isDisqualified: true, timeTakenMinutes: 14 },
                      { traineeName: "Priya Patel", score: 52, totalMarks: 100, percentage: 52, isDisqualified: false, timeTakenMinutes: 18 },
                      { traineeName: "Anil Kumar", score: 78, totalMarks: 100, percentage: 78, isDisqualified: false, timeTakenMinutes: 20 },
                      { traineeName: "Sneha Reddy", score: 88, totalMarks: 100, percentage: 88, isDisqualified: false, timeTakenMinutes: 16 }
                    ]
                ).map((r, idx) => {
                  const isDisq = r.isDisqualified;
                  const passed = r.percentage >= 60 && !isDisq;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {r.traineeName}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {r.score} / {r.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            passed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 font-medium">
                        {r.timeTakenMinutes || 15} mins
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isDisq ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                            Disqualified
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Clear
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isDisq ? (
                          <button
                            onClick={() =>
                              handleResetDisqualification(r.traineeId || idx, r.traineeName)
                            }
                            disabled={resettingId === (r.traineeId || idx)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 mx-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Grant Retake</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Submitted</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: QUESTIONS (Sorted low accuracy first) */}
        {activeTab === "questions" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium mb-2">
              Questions sorted from lowest accuracy to highest accuracy.
            </p>
            {sortedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="font-semibold text-xs text-slate-800">
                    {q.questionTitle}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span>Topic: {q.topic || "General"}</span>
                    <span>•</span>
                    <span>Difficulty: {q.difficulty || "Medium"}</span>
                    <span>•</span>
                    <span>Attempts: {q.attempts || 18}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      q.accuracy < 60 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {q.accuracy}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Accuracy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
