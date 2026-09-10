import React, { useState, useEffect } from "react";
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Award, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Download
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { api } from "../../services/api";

export const QuizAnalyticsModal = ({ quizId, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl border border-[#D9E2EC] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Assessment Analytics & Cohort Evaluation
              </h2>
              <p className="text-[11px] text-slate-500">
                {quiz.title} • {data?.totalSubmissions || 0} Candidates Evaluated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D9E2EC] my-3.5 text-xs font-semibold gap-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "overview" ? "border-[#1D4ED8] text-[#1D4ED8]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Score & Pass Distribution
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "rankings" ? "border-[#1D4ED8] text-[#1D4ED8]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Candidate Leaderboard ({analytics.traineeRankings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "questions" ? "border-[#1D4ED8] text-[#1D4ED8]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Question Accuracy Breakdown
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-100">
                <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Average Score</p>
                <p className="text-xl font-bold text-blue-950 mt-0.5">{analytics.averageScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Pass Rate</p>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">{analytics.passRate}%</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Highest Marks</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{analytics.highestScore} / {quiz.totalMarks || 20}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-100">
                <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">Evaluated</p>
                <p className="text-xl font-bold text-teal-900 mt-0.5">{data?.totalSubmissions || 0}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 bg-slate-50 rounded-lg border border-[#D9E2EC]">
                <h3 className="text-xs font-semibold text-slate-800 mb-2">Score Bracket Distribution</h3>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.scoreDistribution || []}>
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-[#D9E2EC]">
                <h3 className="text-xs font-semibold text-slate-800 mb-2">Question Accuracy (%)</h3>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.questionAccuracy || []} layout="vertical">
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="questionTitle" type="category" width={100} tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#0F766E" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rankings */}
        {activeTab === "rankings" && (
          <div className="overflow-x-auto border border-[#D9E2EC] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-[#D9E2EC]">
                <tr>
                  <th className="py-2.5 px-3.5">Rank</th>
                  <th className="py-2.5 px-3.5">Candidate Name</th>
                  <th className="py-2.5 px-3.5 text-center">Score</th>
                  <th className="py-2.5 px-3.5 text-center">Percentage</th>
                  <th className="py-2.5 px-3.5 text-center">Time</th>
                  <th className="py-2.5 px-3.5 text-center">Violations</th>
                  <th className="py-2.5 px-3.5 text-center">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.traineeRankings && analytics.traineeRankings.map(r => (
                  <tr key={r.rank} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-bold">
                      #{r.rank}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <p className="font-semibold text-slate-800">{r.traineeName}</p>
                      <p className="text-[10px] text-slate-400">{r.traineeEmail}</p>
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-bold text-slate-900">
                      {r.score} / {r.totalMarks}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center text-slate-600">
                      {r.timeTakenMinutes} mins
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {r.tabSwitchCount > 0 ? (
                        <span className="text-amber-700 font-medium inline-flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          {r.tabSwitchCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {r.certificateId ? (
                        <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
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

        {/* Tab 3: Questions */}
        {activeTab === "questions" && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
            {analytics.questionAccuracy && analytics.questionAccuracy.map((q, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-[#D9E2EC] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Q{idx + 1}: {q.questionTitle}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span>{q.marks} Marks</span>
                    <span>•</span>
                    <span>Difficulty: {q.difficulty}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#155E75]">{q.accuracy}%</span>
                  <p className="text-[10px] text-slate-400">Accuracy</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
