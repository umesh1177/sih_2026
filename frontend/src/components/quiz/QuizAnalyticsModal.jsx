import React, { useState, useEffect } from "react";
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Check
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
import { ItemAnalysisDifficultQuestionsModal } from "../trainer/ItemAnalysisDifficultQuestionsModal";

const COLORS = ['#2563eb', '#0284c7', '#10b981', '#f59e0b', '#ef4444'];

export const QuizAnalyticsModal = ({ quizId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "rankings" | "questions"
  const [isItemAnalysisOpen, setIsItemAnalysisOpen] = useState(false);
  const [resettingId, setResettingId] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  const loadData = () => {
    if (quizId) {
      setLoading(true);
      api.getQuizAnalytics(quizId).then(res => {
        if (res.success) {
          setData(res);
        }
      }).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (isOpen && quizId) {
      loadData();
    }
  }, [isOpen, quizId]);

  if (!isOpen) return null;

  const handleResetDisqualification = async (traineeId, traineeName) => {
    if (!confirm(`Allow "${traineeName}" one more chance to re-take this assessment? Their disqualification and locked attempt will be cleared.`)) {
      return;
    }

    setResettingId(traineeId);
    try {
      const res = await api.resetDisqualification(quizId, traineeId);
      if (res.success) {
        setResetMessage(`Granted re-take for ${traineeName}. Exam card is now open for this trainee.`);
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
    const headers = "Rank,Trainee Name,Email,Score,Total Marks,Percentage,Integrity Status,Time (Mins),Tab Switches,Certificate ID\n";
    const rows = data.analytics.traineeRankings.map(r => 
      `"${r.rank}","${r.traineeName}","${r.traineeEmail}",${r.score},${r.totalMarks},${r.percentage}%,"${r.isDisqualified ? 'DISQUALIFIED' : (r.tabSwitchCount === 1 ? '1 WARNING' : 'CLEAR')}",${r.timeTakenMinutes},${r.tabSwitchCount},"${r.certificateId || 'N/A'}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Assessment_Analytics_${quizId}.csv`;
    a.click();
  };

  const analytics = data?.analytics || {};
  const quiz = data?.quiz || {};
  const rankings = analytics.traineeRankings || [];
  const disqualifiedCount = rankings.filter(r => r.isDisqualified).length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-[var(--radius)] max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-50 text-blue-600 flex items-center justify-center font-medium border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1-Click Capacity Assessment Analytics
              </h2>
              <p className="text-[11px] text-slate-500">
                {quiz.title} • {data?.totalSubmissions || 0} Trainees Assessed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[var(--radius)] text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-[var(--radius)] text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reset Feedback Notification */}
        {resetMessage && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[var(--radius)] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 my-4 text-xs font-semibold gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Score & Pass Distribution</span>
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`pb-2.5 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === "rankings" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Trainee Leaderboard ({rankings.length})</span>
            {disqualifiedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold">
                {disqualifiedCount} Disq
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2.5 px-4 border-b-2 font-medium transition-colors ${
              activeTab === "questions" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Question Accuracy Breakdown
          </button>
          <button
            onClick={() => setIsItemAnalysisOpen(true)}
            className="ml-auto pb-1 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Item Analysis & Difficult Questions</span>
          </button>
        </div>

        {/* Tab 1: Overview KPIs & Charts */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {disqualifiedCount > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-[var(--radius)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-rose-900 font-medium">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>{disqualifiedCount} Trainee(s) Disqualified due to repeated assessment context exits</span>
                </div>
                <button 
                  onClick={() => setActiveTab("rankings")} 
                  className="text-rose-700 underline font-extrabold text-[11px] hover:text-rose-900"
                >
                  View in Leaderboard & Grant Re-take
                </button>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-[var(--radius)] bg-blue-50/70 border border-blue-100">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-black text-blue-950 mt-1">{analytics.averageScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-4 rounded-[var(--radius)] bg-emerald-50/70 border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Pass Rate</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{analytics.passRate}%</p>
              </div>
              <div className="p-4 rounded-[var(--radius)] bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Highest Marks</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{analytics.highestScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-4 rounded-[var(--radius)] bg-purple-50/70 border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Evaluated Trainees</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{data?.totalSubmissions || 0}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Distribution Histogram */}
              <div className="p-4 bg-slate-50/60 rounded-[var(--radius)] border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800 mb-3">Score Bracket Distribution</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scoreDistribution || []}>
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Accuracy */}
              <div className="p-4 bg-slate-50/60 rounded-[var(--radius)] border border-slate-200">
                <h3 className="text-xs font-semibold text-slate-800 mb-3">Question-Wise Accuracy (%)</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.questionAccuracy || []} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="questionTitle" type="category" width={110} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#0284c7" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trainee Rankings Leaderboard with Integrity Column */}
        {activeTab === "rankings" && (
          <div className="overflow-x-auto border border-slate-200 rounded-[var(--radius)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Trainee</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Progress</th>
                  <th className="py-3 px-4 text-center">Integrity</th>
                  <th className="py-3 px-4 text-center">Time Spent</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No trainee attempts recorded for this assessment yet.
                    </td>
                  </tr>
                ) : (
                  rankings.map(r => {
                    const isDisq = r.isDisqualified;

                    return (
                      <tr key={r.rank} className={`hover:bg-slate-50 transition-colors ${isDisq ? "bg-rose-50/40" : ""}`}>
                        <td className="py-3 px-4 font-medium">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            r.rank === 1 ? "bg-amber-100 text-amber-800 font-black" :
                            r.rank === 2 ? "bg-slate-200 text-slate-800 font-medium" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            #{r.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{r.traineeName}</p>
                          <p className="text-[10px] text-slate-400">{r.traineeEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-blue-900">
                          {isDisq ? (
                            <span className="text-rose-600 font-black">0 / {r.totalMarks}</span>
                          ) : (
                            <span>{r.score} / {r.totalMarks}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            isDisq
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {isDisq ? "0%" : `${r.percentage}%`}
                          </span>
                        </td>
                        
                        {/* ─── INTEGRITY HIGHLIGHTING COLUMN ─── */}
                        <td className="py-3 px-4 text-center">
                          {isDisq ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                              <X className="w-3 h-3 text-rose-600" />
                              ✕ Disqualified
                            </span>
                          ) : r.tabSwitchCount === 1 ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              ⚠ 1 Warning
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ✓ Clear
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center text-slate-600 font-medium">
                          {r.timeTakenMinutes} mins
                        </td>

                        {/* ─── ACTION (GIVE ONE MORE CHANCE) ─── */}
                        <td className="py-3 px-4 text-center">
                          {isDisq ? (
                            <button
                              onClick={() => handleResetDisqualification(r.traineeId, r.traineeName)}
                              disabled={resettingId === r.traineeId}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-[var(--radius)] text-[11px] font-medium shadow-xs transition-all flex items-center gap-1 mx-auto"
                              title="Allow student to retake assessment"
                            >
                              <RotateCcw className={`w-3 h-3 ${resettingId === r.traineeId ? "animate-spin" : ""}`} />
                              <span>{resettingId === r.traineeId ? "Resetting..." : "Grant Re-take"}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {r.certificateId ? "Certified" : "Completed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Detailed Questions */}
        {activeTab === "questions" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {analytics.questionAccuracy && analytics.questionAccuracy.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">Q{idx + 1}: {q.questionTitle}</span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{q.marks} Marks</span>
                    <span>•</span>
                    <span>Difficulty: {q.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-blue-900">{q.accuracy}%</span>
                  <p className="text-[10px] text-slate-400">Trainee Accuracy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── RULE 11: WEAK QUESTIONS & DIFFICULT CONCEPT DETECTION MODAL ─── */}
      <ItemAnalysisDifficultQuestionsModal
        isOpen={isItemAnalysisOpen}
        onClose={() => setIsItemAnalysisOpen(false)}
        quizTitle={quiz?.title}
      />
    </div>
  );
};
