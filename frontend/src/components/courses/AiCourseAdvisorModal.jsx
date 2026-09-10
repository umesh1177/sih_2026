import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Target, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  BrainCircuit, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { api } from "../../services/api";

export const AiCourseAdvisorModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  courses, 
  onSelectCourse,
  onEnrollCourse 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState("Google Gemini 1.5 Flash");

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.recommendCoursesWithAI(currentUser, courses);
      if (res.success && res.recommendations) {
        setRecommendations(res.recommendations);
        if (res.source) setAiSource(res.source);
      }
    } catch (err) {
      console.error("AI recommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecommendations();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0a2558] via-indigo-900 to-blue-900 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-inner text-yellow-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-[9px] font-black uppercase tracking-wider">
                  Gemini AI Advisor
                </span>
                <span className="text-[10px] text-blue-200">{aiSource}</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight mt-0.5">
                Personalized Training Recommendations
              </h2>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Curated for {currentUser?.name || "Trainee"} based on role, department & competency radar
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#0a2558] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700">Gemini is analyzing your officer profile & competency matrix...</p>
              <p className="text-[11px] text-slate-400">Synthesizing personalized training recommendations...</p>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-semibold">
                  <BrainCircuit className="w-4 h-4 text-[#0a2558]" />
                  <span>Profile Matched: {currentUser?.department || "Regional Meteorological Centre"} • {currentUser?.designation || "Scientist 'B'"}</span>
                </div>
                <button
                  onClick={loadRecommendations}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const courseObj = courses.find(c => c.id === rec.courseId) || courses[index % courses.length];
                  const isEnrolled = (courseObj?.enrolledTraineeIds || []).includes(currentUser?.id);

                  return (
                    <div 
                      key={index}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={courseObj?.thumbnail} 
                            alt={rec.courseTitle || courseObj?.title}
                            className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" 
                          />
                          <div>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {courseObj?.code || "MOES-TRACK"}
                            </span>
                            <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                              {rec.courseTitle || courseObj?.title}
                            </h3>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black">
                            {rec.matchScore || 94}% Match
                          </span>
                        </div>
                      </div>

                      {/* AI Rationale Box */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <p className="text-[11px] text-slate-700">
                          <b className="text-[#0a2558]">AI Justification:</b> {rec.reason}
                        </p>
                        {rec.careerImpact && (
                          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Operational Impact: {rec.careerImpact}</span>
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
                          {courseObj?.duration || "4 Weeks"} • {courseObj?.category}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelectCourse(courseObj);
                              onClose();
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                          >
                            Course Overview
                          </button>

                          <button
                            onClick={() => {
                              if (onEnrollCourse) onEnrollCourse(courseObj);
                              onClose();
                            }}
                            className={`px-4 py-1.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-1 ${
                              isEnrolled 
                                ? "bg-emerald-600 text-white" 
                                : "bg-[#0a2558] hover:bg-[#071c42] text-white"
                            }`}
                          >
                            <span>{isEnrolled ? "Resume Learning" : "Enroll in Course"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Recommendations update automatically as you complete assessments and quizzes.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
