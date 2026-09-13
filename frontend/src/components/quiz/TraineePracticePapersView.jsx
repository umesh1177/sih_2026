import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  PlayCircle, 
  Layers, 
  Search, 
  BarChart3, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  Flame, 
  Brain, 
  X
} from "lucide-react";
import { api } from "../../services/api";

export const TraineePracticePapersView = ({ 
  currentUser, 
  onStartExam, 
  onOpenQuestionBank
}) => {
  const [practicePapers, setPracticePapers] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedAttemptForAnalytics, setSelectedAttemptForAnalytics] = useState(null);
  const [analyticsFilter, setAnalyticsFilter] = useState("all");

  const [generateForm, setGenerateForm] = useState({
    title: "Adaptive Practice Paper",
    source: "bank",
    topic: "Core Domain Practice & Review",
    subjectId: "all",
    questionCount: 10,
    durationMinutes: 20,
    initialDifficulty: "Medium",
    isAdaptive: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = currentUser?.id || "u_trainee_1";
      const cacheKey = `practice_papers_${userId}`;

      const [qRes, subRes] = await Promise.all([
        api.getQuizzes({ practiceOnly: "true", traineeId: userId }),
        api.getTraineeSubmissions(userId)
      ]);

      let backendPapers = [];
      if (qRes.success && qRes.quizzes) {
        backendPapers = qRes.quizzes
          .filter(q => q.createdBy === userId || q.isPractice === true || q.type === "practice")
          .map(q => ({
            ...q,
            isPractice: true,
            isAdaptive: q.isAdaptive !== undefined ? q.isAdaptive : true
          }));
      }

      let localPapers = [];
      try {
        localPapers = JSON.parse(localStorage.getItem(cacheKey) || "[]");
      } catch (e) {
        localPapers = [];
      }

      const paperMap = new Map();
      localPapers.forEach(p => { if (p && p.id) paperMap.set(p.id, p); });
      backendPapers.forEach(p => { if (p && p.id) paperMap.set(p.id, p); });

      const mergedPapers = Array.from(paperMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      try {
        localStorage.setItem(cacheKey, JSON.stringify(mergedPapers));
      } catch (e) {}

      setPracticePapers(mergedPapers);

      if (subRes.success && subRes.submissions) {
        const genuinePracticeAttempts = subRes.submissions.filter(sub => {
          if (sub.isPractice === true || sub.type === "practice") return true;
          if (sub.quizId && (sub.quizId.startsWith("paper_") || sub.quizId.startsWith("practice_"))) return true;
          if (mergedPapers.some(p => p.id === sub.quizId || (p.title && sub.quizTitle && p.title.toLowerCase() === sub.quizTitle.toLowerCase()))) return true;
          return false;
        });
        setScoreHistory(genuinePracticeAttempts);
      } else {
        setScoreHistory([]);
      }
    } catch (err) {
      console.error("Error loading practice papers:", err);
      try {
        const userId = currentUser?.id || "u_trainee_1";
        const localPapers = JSON.parse(localStorage.getItem(`practice_papers_${userId}`) || "[]");
        if (localPapers.length > 0) setPracticePapers(localPapers);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const [topicErrorMessage, setTopicErrorMessage] = useState("");

  const handleGeneratePracticePaper = async (e) => {
    e.preventDefault();
    setTopicErrorMessage("");
    setGenerating(true);

    try {
      let generatedQuestions = [];
      const enteredTopic = (generateForm.topic || "").trim();
      const userId = currentUser?.id || "u_trainee_1";

      if (generateForm.source === "ai") {
        const requestedCount = Number(generateForm.questionCount) || 10;
        const res = await api.generateAiQuestions({
          topic: enteredTopic || "General Meteorology & Forecasting",
          numQuestions: requestedCount,
          difficulty: generateForm.initialDifficulty || "Medium"
        });

        if (res?.success && Array.isArray(res.questions) && res.questions.length > 0) {
          generatedQuestions = res.questions;
        } else {
          setTopicErrorMessage("AI question generation could not find sufficient matching questions. Please try another topic query.");
          setGenerating(false);
          return;
        }
      } else {
        const qRes = await api.getQuestions({});
        let pool = qRes.success && Array.isArray(qRes.questions) ? qRes.questions : [];

        if (enteredTopic) {
          const topicLower = enteredTopic.toLowerCase();
          const topicTokens = topicLower.split(/[\s,./\-&]+/).map(t => t.trim()).filter(t => t.length > 2);

          const matched = pool.filter(q => {
            const text = `${q.question || ""} ${q.subjectName || ""} ${q.module || ""} ${q.topic || ""} ${q.explanation || ""}`.toLowerCase();
            if (text.includes(topicLower)) return true;
            return topicTokens.some(tok => text.includes(tok));
          });

          if (matched.length === 0) {
            setTopicErrorMessage(`No questions matching "${enteredTopic}" found in Question Bank.`);
            setGenerating(false);
            return;
          }
          pool = matched;
        }

        pool = pool.sort(() => 0.5 - Math.random());
        generatedQuestions = pool.slice(0, Number(generateForm.questionCount) || 10);
      }

      const newPaper = {
        id: `paper_practice_${Date.now()}`,
        title: generateForm.title || "Adaptive Practice Paper",
        courseId: "crs_nwp_101",
        courseName: "Adaptive Practice Track",
        trainerName: "Adaptive Engine",
        totalMarks: generatedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20,
        passMarks: Math.round((generatedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20) * 0.5),
        durationMinutes: Number(generateForm.durationMinutes) || 20,
        questionCount: generatedQuestions.length,
        isAdaptive: !!generateForm.isAdaptive,
        initialDifficulty: generateForm.initialDifficulty || "Medium",
        source: generateForm.source || "ai",
        topic: enteredTopic,
        questions: generatedQuestions,
        createdAt: new Date().toISOString()
      };

      try {
        const createRes = await api.createQuiz(newPaper);
        if (createRes?.quiz?.id) {
          newPaper.id = createRes.quiz.id;
        }
      } catch (err) {
        console.warn("Backend save warning for practice paper:", err);
      }

      try {
        const cacheKey = `practice_papers_${userId}`;
        const existingLocal = JSON.parse(localStorage.getItem(cacheKey) || "[]");
        const updatedLocal = [newPaper, ...existingLocal.filter(p => p.id !== newPaper.id)];
        localStorage.setItem(cacheKey, JSON.stringify(updatedLocal));
      } catch (e) {}

      setPracticePapers(prev => [newPaper, ...prev.filter(p => p.id !== newPaper.id)]);
      setIsGenerateModalOpen(false);
      setTopicErrorMessage("");
    } catch (err) {
      setTopicErrorMessage("Failed generating practice paper: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const filteredPapers = practicePapers.filter(paper => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (paper.title || "").toLowerCase().includes(q);
      const matchCourse = (paper.courseName || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#475569]">Loading Practice Studio...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#172033]">
      
      {/* ─── 1. HEADER SECTION ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 uppercase">
              Practice Studio
            </span>
            <span className="text-xs text-[#475569]">• {practicePapers.length} Papers Available</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#172033] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Practice Papers &amp; Assessment Studio</span>
          </h1>
          <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
            Generate customized practice question papers with AI or from the Question Bank with real-time adaptive difficulty.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Create Practice Paper</span>
          </button>

          {onOpenQuestionBank && (
            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs shadow-xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Question Bank</span>
            </button>
          )}

          <button
            onClick={loadData}
            title="Refresh Papers"
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 rounded-lg transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 2. ADAPTIVE BANNER ─── */}
      <div className="p-5 bg-white text-[#172033] rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Adaptive Testing Engine</span>
            </div>
            <h3 className="text-base font-semibold text-[#172033]">
              Smart Adaptive Practice
            </h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Practice sessions dynamically adjust question difficulty in real-time based on your responses.
            </p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-[#E2E8F0] text-center space-y-2 shrink-0 w-full lg:w-60">
            <Brain className="w-7 h-7 text-[#2563EB] mx-auto" />
            <p className="font-semibold text-[#172033] text-xs">Quick Practice</p>
            <button
              onClick={() => {
                if (practicePapers.length > 0 && onStartExam) {
                  onStartExam(practicePapers[0]);
                }
              }}
              disabled={practicePapers.length === 0}
              className="w-full py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
            >
              Launch Quick Drill ⚡
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. PAPERS GRID ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#172033] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2563EB]" />
              <span>Available Practice Papers ({filteredPapers.length})</span>
            </h2>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paper title..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#2563EB] shadow-xs"
            />
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0] space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-medium text-[#172033] text-xs">No practice papers match your search</h4>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="mt-2 px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium shadow-xs"
            >
              Create New Paper
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper, idx) => (
              <div
                key={paper.id || idx}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {paper.isAdaptive ? "ADAPTIVE" : "STANDARD"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {paper.durationMinutes || 20} mins
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#172033] text-sm line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-[#475569] line-clamp-1">
                    {paper.courseName || "Practice Module"}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                    <div>
                      <p className="font-semibold text-[#172033]">{paper.questionCount || (paper.questions ? paper.questions.length : 10)}</p>
                      <p className="text-[10px] text-slate-400">Questions</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#172033]">{paper.totalMarks || 30}</p>
                      <p className="text-[10px] text-slate-400">Marks</p>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-600">{paper.initialDifficulty || "Medium"}</p>
                      <p className="text-[10px] text-slate-400">Difficulty</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onStartExam && onStartExam(paper)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs transition-colors shadow-xs"
                >
                  <PlayCircle className="w-4 h-4 text-blue-100" />
                  <span>Start Practice Exam</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. SCORE HISTORY ─── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#172033] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Practice Scores &amp; History</span>
            </h2>
          </div>
          <span className="text-xs font-medium text-[#475569]">{scoreHistory.length} attempts</span>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="bg-slate-50 text-[11px] font-semibold text-[#475569] uppercase border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-3 py-3">Score</th>
                  <th className="px-3 py-3">Accuracy</th>
                  <th className="px-3 py-3">Time Spent</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scoreHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      No practice attempts recorded yet.
                    </td>
                  </tr>
                ) : (
                  scoreHistory.map((hist, i) => {
                    const isPassed = hist.percentage >= 50;
                    return (
                      <tr key={hist.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#172033] max-w-xs truncate">
                          {hist.quizTitle || "Practice Paper"}
                        </td>
                        <td className="px-3 py-3 font-mono font-medium">
                          {hist.score} / {hist.totalMarks || 30}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            isPassed ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {hist.percentage}% • {isPassed ? "PASSED" : "RETRY"}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-slate-500">
                          {Math.floor((hist.timeTakenSeconds || 600) / 60)}m {((hist.timeTakenSeconds || 600) % 60)}s
                        </td>
                        <td className="px-3 py-3 text-slate-400 text-[11px]">
                          {new Date(hist.submittedAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              const matchingPaper = practicePapers.find(p => p.title === hist.quizTitle || p.id === hist.quizId) || practicePapers[0];
                              setSelectedAttemptForAnalytics({
                                ...hist,
                                paper: matchingPaper
                              });
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-medium rounded-lg text-xs transition-colors border border-blue-200 inline-flex items-center gap-1"
                          >
                            <BarChart3 className="w-3 h-3 text-[#2563EB]" />
                            <span>Analytics</span>
                          </button>

                          <button
                            onClick={() => {
                              const matchingPaper = practicePapers.find(p => p.title === hist.quizTitle || p.id === hist.quizId) || practicePapers[0];
                              if (matchingPaper && onStartExam) onStartExam(matchingPaper);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg text-xs transition-colors"
                          >
                            Retake
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0] text-[#172033] relative my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#172033]">
                    Generate Practice Paper
                  </h2>
                  <p className="text-[11px] text-[#475569]">
                    Configure questions with AI or Question Bank
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePracticePaper} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#172033] mb-1">
                  Question Paper Title:
                </label>
                <input
                  type="text"
                  required
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  placeholder="e.g. Adaptive Practice Drill"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setGenerateForm({ ...generateForm, source: "bank" })}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    generateForm.source === "bank"
                      ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                      : "bg-slate-50 border-[#E2E8F0] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">Question Bank</div>
                  <p className="text-[10px] text-slate-500">From repository</p>
                </div>

                <div
                  onClick={() => setGenerateForm({ ...generateForm, source: "ai" })}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    generateForm.source === "ai"
                      ? "bg-blue-50 border-[#2563EB] text-[#2563EB]"
                      : "bg-slate-50 border-[#E2E8F0] text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>AI Generator</span>
                  </div>
                  <p className="text-[10px] text-slate-500">AI generated MCQs</p>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#172033] mb-1">
                  Topic / Focus:
                </label>
                <input
                  type="text"
                  required
                  value={generateForm.topic}
                  onChange={(e) => {
                    setGenerateForm({ ...generateForm, topic: e.target.value });
                    if (topicErrorMessage) setTopicErrorMessage("");
                  }}
                  placeholder="e.g. Core Topic Name"
                  className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {topicErrorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {topicErrorMessage}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">
                    Questions:
                  </label>
                  <select
                    value={generateForm.questionCount}
                    onChange={(e) => setGenerateForm({ ...generateForm, questionCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none"
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">
                    Duration:
                  </label>
                  <select
                    value={generateForm.durationMinutes}
                    onChange={(e) => setGenerateForm({ ...generateForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none"
                  >
                    <option value={10}>10 Mins</option>
                    <option value={20}>20 Mins</option>
                    <option value={30}>30 Mins</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors disabled:opacity-60"
                >
                  {generating ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-blue-100" />
                      <span>Save &amp; Start</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {selectedAttemptForAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#172033] my-auto text-xs">
            
            <div className="p-4 bg-[#172033] text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-semibold text-blue-300 uppercase">PRACTICE AUDIT</span>
                <h3 className="text-sm font-semibold text-white">
                  {selectedAttemptForAnalytics.quizTitle || selectedAttemptForAnalytics.paper?.title || "Practice Drill"}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAttemptForAnalytics(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-[#E2E8F0] shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-medium uppercase block">SCORE</span>
                  <p className="text-lg font-semibold text-[#2563EB]">
                    {selectedAttemptForAnalytics.score} / {selectedAttemptForAnalytics.totalMarks || 20}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-medium uppercase block">ACCURACY</span>
                  <p className="text-lg font-semibold text-emerald-600">
                    {selectedAttemptForAnalytics.accuracy || selectedAttemptForAnalytics.percentage}%
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-0.5">
                  <span className="text-slate-400 text-[10px] font-medium uppercase block">TIME SPENT</span>
                  <p className="text-lg font-semibold text-[#172033] font-mono">
                    {Math.floor((selectedAttemptForAnalytics.timeTakenSeconds || 600) / 60)}m {((selectedAttemptForAnalytics.timeTakenSeconds || 600) % 60)}s
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <span className="font-semibold text-[#172033] text-xs">Question Audit</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAnalyticsFilter("all")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${analyticsFilter === "all" ? "bg-[#172033] text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setAnalyticsFilter("correct")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${analyticsFilter === "correct" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Correct
                </button>
                <button
                  onClick={() => setAnalyticsFilter("incorrect")}
                  className={`px-2.5 py-1 rounded text-xs font-medium ${analyticsFilter === "incorrect" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  Incorrect
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
              {(() => {
                const qList = selectedAttemptForAnalytics.paper?.questions || [];
                const ansMap = selectedAttemptForAnalytics.answers || {};
                const filtered = qList.filter((q, qIdx) => {
                  const ans = ansMap[q.id] || ansMap[`q_${qIdx + 1}`] || {};
                  const isCorrect = ans.isCorrect !== undefined ? ans.isCorrect : (ans.selected === q.correctAnswer);
                  if (analyticsFilter === "correct") return isCorrect;
                  if (analyticsFilter === "incorrect") return !isCorrect;
                  return true;
                });

                if (filtered.length === 0) {
                  return <div className="p-8 text-center text-slate-400 text-xs">No questions match filter.</div>;
                }

                return filtered.map((q, idx) => {
                  const ans = ansMap[q.id] || ansMap[`q_${idx + 1}`] || {};
                  const isCorrect = ans.isCorrect !== undefined ? ans.isCorrect : (ans.selected === q.correctAnswer);

                  return (
                    <div key={q.id || idx} className="p-4 bg-white rounded-lg border border-[#E2E8F0] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#172033]">Question {idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <p className="text-xs text-[#172033] font-medium">{q.question}</p>
                      {q.explanation && (
                        <p className="text-[11px] text-[#475569] bg-slate-50 p-2 rounded border border-slate-100">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="p-3 bg-white border-t border-[#E2E8F0] flex justify-end shrink-0">
              <button
                onClick={() => setSelectedAttemptForAnalytics(null)}
                className="px-4 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
