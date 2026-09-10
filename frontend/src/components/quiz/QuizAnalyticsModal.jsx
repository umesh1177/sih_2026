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
  ShieldCheck
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

const COLORS = ['#0a2558', '#0284c7', '#10b981', '#f59e0b', '#ef4444'];

export const QuizAnalyticsModal = ({ quizId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "rankings" | "questions"

  useEffect(() => {
    if (isOpen && quizId) {
      setLoading(true);
      api.getQuizAnalytics(quizId).then(res => {
        if (res.success) {
          setData(res);
        }
      }).finally(() => setLoading(false));
    }
  }, [isOpen, quizId]);

  if (!isOpen) return null;

  const exportCSV = () => {
    if (!data?.analytics?.traineeRankings) return;
    const headers = "Rank,Trainee Name,Email,Score,Total Marks,Percentage,Passed,Time (Mins),Tab Switches,Certificate ID\n";
    const rows = data.analytics.traineeRankings.map(r => 
      `"${r.rank}","${r.traineeName}","${r.traineeEmail}",${r.score},${r.totalMarks},${r.percentage}%,${r.passed ? 'PASSED' : 'FAILED'},${r.timeTakenMinutes},${r.tabSwitchCount},"${r.certificateId || 'N/A'}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMD_Quiz_Analytics_${quizId}.csv`;
    a.click();
  };

  const analytics = data?.analytics || {};
  const quiz = data?.quiz || {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a2558] flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === "overview" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
            }`}
          >
            📊 Score & Pass Distribution
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === "rankings" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
            }`}
          >
            🏆 Trainee Leaderboard ({analytics.traineeRankings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === "questions" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
            }`}
          >
            🎯 Question Accuracy Breakdown
          </button>
        </div>

        {/* Tab 1: Overview KPIs & Charts */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-black text-[#0a2558] mt-1">{analytics.averageScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Pass Rate</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{analytics.passRate}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Highest Marks</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{analytics.highestScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Evaluated Trainees</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{data?.totalSubmissions || 0}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Distribution Histogram */}
              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 mb-3">Score Bracket Distribution</h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scoreDistribution || []}>
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0a2558" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Accuracy */}
              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 mb-3">Question-Wise Accuracy (%)</h3>
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

        {/* Tab 2: Trainee Rankings Leaderboard */}
        {activeTab === "rankings" && (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Trainee Name</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Time Spent</th>
                  <th className="py-3 px-4 text-center">Tab Switches</th>
                  <th className="py-3 px-4 text-center">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.traineeRankings && analytics.traineeRankings.map(r => (
                  <tr key={r.rank} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                        r.rank === 1 ? "bg-amber-100 text-amber-800 font-black" :
                        r.rank === 2 ? "bg-slate-200 text-slate-800 font-bold" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        #{r.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{r.traineeName}</p>
                      <p className="text-[10px] text-slate-400">{r.traineeEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0a2558]">
                      {r.score} / {r.totalMarks}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {r.timeTakenMinutes} mins
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.tabSwitchCount > 0 ? (
                        <span className="text-amber-600 font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {r.tabSwitchCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.certificateId ? (
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {r.certificateId}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Detailed Questions */}
        {activeTab === "questions" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {analytics.questionAccuracy && analytics.questionAccuracy.map((q, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">Q{idx + 1}: {q.questionTitle}</span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{q.marks} Marks</span>
                    <span>•</span>
                    <span>Difficulty: {q.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#0a2558]">{q.accuracy}%</span>
                  <p className="text-[10px] text-slate-400">Trainee Accuracy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
