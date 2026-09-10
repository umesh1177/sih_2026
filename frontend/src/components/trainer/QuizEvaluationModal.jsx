import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Award, 
  Send, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Eye, 
  FileCheck, 
  Sparkles,
  Check,
  RotateCcw,
  FileQuestion
} from "lucide-react";
import { api } from "../../services/api";

export const QuizEvaluationModal = ({ quiz, currentUser, onClose, onResultsPublished }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(quiz?.resultsPublished || false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMap, setFeedbackMap] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const res = await api.getQuizSubmissions(quiz?.id);
        if (res.success && res.submissions && Array.isArray(res.submissions)) {
          setSubmissions(res.submissions);
          const initialFeedback = {};
          res.submissions.forEach(s => {
            initialFeedback[s.id] = s.trainerFeedback || "";
          });
          setFeedbackMap(initialFeedback);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error("Submissions load error:", err);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (quiz?.id) loadSubmissions();
  }, [quiz, isPublished]);

  const handleSaveEvaluation = async (subId) => {
    setSavingId(subId);
    try {
      const feedback = feedbackMap[subId] || "";
      await api.evaluateSubmission(subId, { trainerFeedback: feedback });
      setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, trainerFeedback: feedback } : s));
    } catch (err) {
      console.error("Failed to save evaluation:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleGrantRetake = async (traineeId, traineeName) => {
    try {
      const res = await api.resetDisqualification(quiz?.id, traineeId);
      if (res.success) {
        setSubmissions(prev => prev.filter(s => s.traineeId !== traineeId));
        alert(`Disqualification cleared for ${traineeName || 'cadet'}. Assessment attempt reopened!`);
      } else {
        alert(res.message || "Failed to reset disqualification");
      }
    } catch (err) {
      alert("Error resetting disqualification: " + err.message);
    }
  };

  const handlePublishResults = async () => {
    setPublishing(true);
    try {
      await api.publishQuizResults(quiz?.id, { note: "Official results evaluated and ratified by Lead Trainer." });
      setIsPublished(true);
      setSubmissions(prev => prev.map(s => ({ ...s, evaluationStatus: "published" })));
      if (onResultsPublished) onResultsPublished(quiz.id);
    } catch (err) {
      console.error("Publish results failed:", err);
    } finally {
      setPublishing(false);
    }
  };

  const filteredSubmissions = submissions.filter(s =>
    (s.traineeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.station || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.cadreId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto">
        
        {/* ═════════ HEADER (CLEAN LIGHT THEME) ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 text-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                FACULTY EVALUATION DESK
              </span>
              {isPublished ? (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Results Published to Cadets
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Pending Result Publication
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {quiz?.title || "Subject Assessment Evaluation"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Course: <b className="text-slate-800">{quiz?.courseName || "Assigned Course"}</b> • Passing Threshold: {quiz?.passMarks || 20}/{quiz?.totalMarks || 40} Marks
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Publish Results Button */}
            {!isPublished ? (
              <button
                onClick={handlePublishResults}
                disabled={publishing || submissions.length === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>{publishing ? "Publishing..." : "Publish Quiz Results"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Scores Live on Cadet Portals</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═════════ INFO CALLOUT ═════════ */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <b>Grading Policy:</b> Trainees cannot view their scores or performance breakdown until you click <b>"Publish Quiz Results"</b>. Review candidate answers and add faculty feedback below.
            </span>
          </div>
          <span className="font-extrabold text-amber-950 shrink-0">
            {submissions.length} Submissions Logged
          </span>
        </div>

        {/* ═════════ SUBMISSIONS CONTENT ═════════ */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs bg-slate-50/50">
          
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">Loading candidate submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No Trainee Submissions Logged Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When cadets complete and submit this assessment, their answer records, score calculations, and feedback inputs will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, station, cadre ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <span className="text-slate-500 font-bold text-xs">
                  Showing {filteredSubmissions.length} of {submissions.length} candidates
                </span>
              </div>

              <div className="space-y-4">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all"
                  >
                    {(() => {
                      const isDisq = sub.isDisqualified || sub.integrityStatus === "disqualified";
                      const isWarn = !isDisq && (sub.tabSwitchCount === 1 || sub.integrityStatus === "warning");

                      return (
                        <>
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                                isDisq ? "bg-red-600" : isWarn ? "bg-amber-500" : "bg-blue-600"
                              }`}>
                                {sub.traineeName?.split(" ").map(n => n[0]).join("") || "TR"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-900 text-sm">{sub.traineeName || "Trainee"}</h4>
                                  {sub.cadreId && (
                                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                      {sub.cadreId}
                                    </span>
                                  )}
                                  {isDisq && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                                      ✕ Disqualified
                                    </span>
                                  )}
                                  {isWarn && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                      ⚠ 1 Warning
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span>{sub.station || "Regional Training Center"}</span>
                                </p>
                              </div>
                            </div>

                            {/* Score & Timing Badges & Retake */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-900 block">
                                  {sub.score} / {sub.totalMarks} Marks
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Time Spent: {sub.timeTakenMinutes ? `${sub.timeTakenMinutes} mins` : (sub.timeTaken || "N/A")}
                                </span>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                isDisq
                                  ? "bg-red-100 text-red-900 border border-red-300"
                                  : (sub.percentage || 0) >= 85
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : (sub.percentage || 0) >= 50
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-rose-100 text-rose-900 border border-rose-300"
                              }`}>
                                {isDisq ? "Disqualified" : `${sub.percentage || 0}% (${sub.status || (sub.passed ? "Passed" : "Needs Review")})`}
                              </span>

                              {isDisq && (
                                <button
                                  onClick={() => handleGrantRetake(sub.traineeId, sub.traineeName)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-transform hover:scale-105 flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Grant Re-take</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Feedback Input Row */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Enter faculty remarks or recommendations for this cadet..."
                              value={feedbackMap[sub.id] || ""}
                              onChange={(e) => setFeedbackMap({ ...feedbackMap, [sub.id]: e.target.value })}
                              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEvaluation(sub.id)}
                              disabled={savingId === sub.id}
                              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{savingId === sub.id ? "Saving..." : "Save Feedback"}</span>
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* ═════════ FOOTER ═════════ */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            Central Examination and Quality Assurance Cell
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            Close Evaluation Desk
          </button>
        </div>

      </div>
    </div>
  );
};
