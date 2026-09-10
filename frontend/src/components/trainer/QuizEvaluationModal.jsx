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
  RotateCcw
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
        if (res.success && res.submissions?.length > 0) {
          setSubmissions(res.submissions);
          const initialFeedback = {};
          res.submissions.forEach(s => {
            initialFeedback[s.id] = s.trainerFeedback || "";
          });
          setFeedbackMap(initialFeedback);
        } else {
          // Default mock candidate submissions for this quiz
          const mockSubs = [
            {
              id: "sub_eval_1",
              quizId: quiz?.id || "quiz_nwp_01",
              traineeId: "u_trainee_1",
              traineeName: "Rahul Sharma",
              cadreId: "MOES-MET-2026-4491",
              station: "Meteorological Centre, Jaipur",
              department: "NWP Division",
              score: 29,
              totalMarks: quiz?.totalMarks || 40,
              percentage: 72.5,
              timeTakenMinutes: 13,
              submittedAt: "14th Aug 2026 20:36",
              status: "Passed",
              evaluationStatus: isPublished ? "published" : "pending_publish",
              trainerFeedback: "Strong analytical clarity in Arakawa-C grid and 4D-Var principles."
            },
            {
              id: "sub_eval_2",
              quizId: quiz?.id || "quiz_nwp_01",
              traineeId: "u_trainee_2",
              traineeName: "Priya Varma",
              cadreId: "MOES-MET-2026-5512",
              station: "Cyclone Warning Centre, Visakhapatnam",
              department: "Cyclone Warning Division",
              score: 38,
              totalMarks: quiz?.totalMarks || 40,
              percentage: 95.0,
              timeTakenMinutes: 11,
              submittedAt: "14th Aug 2026 21:10",
              status: "Distinction",
              evaluationStatus: isPublished ? "published" : "pending_publish",
              trainerFeedback: "Exceptional mastery in convective cloud parameterization."
            },
            {
              id: "sub_eval_3",
              quizId: quiz?.id || "quiz_nwp_01",
              traineeId: "u_trainee_3",
              traineeName: "Vikram Malhotra",
              cadreId: "MOES-MET-2026-7821",
              station: "RMC Chennai",
              department: "Radar Operations Division",
              score: 31,
              totalMarks: quiz?.totalMarks || 40,
              percentage: 77.5,
              timeTakenMinutes: 18,
              submittedAt: "15th Aug 2026 10:15",
              status: "Passed",
              evaluationStatus: isPublished ? "published" : "pending_publish",
              trainerFeedback: "Good work. Review vertical advection in sigma coordinate systems."
            }
          ];
          setSubmissions(mockSubs);
          const initialFeedback = {};
          mockSubs.forEach(s => {
            initialFeedback[s.id] = s.trainerFeedback || "";
          });
          setFeedbackMap(initialFeedback);
        }
      } catch (err) {
        console.error("Submissions load error:", err);
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-in fade-in duration-150 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto">
        
        {/* ═════════ HEADER ═════════ */}
        <div className="p-6 bg-white border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#1D4ED8] border border-blue-200 uppercase tracking-wider">
                Faculty Evaluation Desk
              </span>
              {isPublished ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-[#15803D] border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#15803D]" /> Results Published to Cadets
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-[#B45309] border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#B45309]" /> Pending Result Publication
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
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
                disabled={publishing}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-100" />
                <span>{publishing ? "Publishing..." : "Publish Quiz Results to Cadets"}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-[#15803D] font-semibold rounded-lg text-xs">
                <Check className="w-4 h-4" />
                <span>Scores Live on Cadet Portals</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═════════ INFO CALLOUT ═════════ */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
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

        {/* ═════════ SUBMISSIONS TABLE ═════════ */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate by name, station, cadre ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0a2558] to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {sub.traineeName?.split(" ").map(n => n[0]).join("") || "TR"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">{sub.traineeName}</h4>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {sub.cadreId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{sub.station}</span>
                      </p>
                    </div>
                  </div>

                  {/* Score & Timing Badges */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">
                        {sub.score} / {sub.totalMarks} Marks
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Time Spent: {sub.timeTakenMinutes || 15} mins
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      sub.percentage >= 85
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : sub.percentage >= 50
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-rose-100 text-rose-900 border border-rose-300"
                    }`}>
                      {sub.percentage}% ({sub.status || "Passed"})
                    </span>
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
                    className="px-4 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{savingId === sub.id ? "Saving..." : "Save Feedback"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ═════════ FOOTER ═════════ */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            MoES Central Examination and Quality Assurance Cell
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold rounded-xl text-xs"
          >
            Close Evaluation Desk
          </button>
        </div>

      </div>
    </div>
  );
};
