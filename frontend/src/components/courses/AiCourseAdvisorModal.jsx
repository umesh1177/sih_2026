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
  RefreshCw
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-[#D9E2EC] overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#D9E2EC] flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  AI Course Advisor
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{aiSource}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                Personalized Training Recommendations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated for {currentUser?.name || "Officer"} based on department, posting, and verified competency matrix.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {loading ? (
            <div className="py-14 text-center space-y-2.5">
              <div className="w-8 h-8 border-3 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-semibold text-slate-700">Analyzing officer profile & competency framework...</p>
              <p className="text-[11px] text-slate-400">Synthesizing personalized training pathways...</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-950 font-medium">
                  <span>Profile Matched: <b>{currentUser?.department || "Regional Meteorological Centre"}</b> • {currentUser?.designation || "Scientist 'B'"}</span>
                </div>
                <button
                  onClick={loadRecommendations}
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, index) => {
                  const courseObj = courses.find(c => c.id === rec.courseId) || courses[index % courses.length];
                  const isEnrolled = (courseObj?.enrolledTraineeIds || []).includes(currentUser?.id);

                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-[#D9E2EC] hover:border-slate-300 bg-white shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={courseObj?.thumbnail} 
                            alt={rec.courseTitle || courseObj?.title}
                            className="w-12 h-12 rounded-md object-cover border border-slate-200 shrink-0" 
                          />
                          <div>
                            <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              {courseObj?.code || "MOES-TRACK"}
                            </span>
                            <h3 className="font-bold text-slate-900 text-xs mt-1 leading-tight">
                              {rec.courseTitle || courseObj?.title}
                            </h3>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
                            {rec.matchScore || 94}% Match
                          </span>
                        </div>
                      </div>

                      {/* AI Rationale Box */}
                      <div className="p-2.5 bg-slate-50 rounded-md border border-slate-100 text-xs space-y-1">
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          <b className="text-slate-900">Justification:</b> {rec.reason}
                        </p>
                        {rec.careerImpact && (
                          <p className="text-[11px] text-teal-800 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-teal-600" />
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
                            className="px-3 py-1.5 rounded-md border border-[#D9E2EC] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            Overview
                          </button>

                          <button
                            onClick={() => {
                              if (onEnrollCourse) onEnrollCourse(courseObj);
                              onClose();
                            }}
                            className={`px-3.5 py-1.5 rounded-md font-semibold text-xs shadow-xs transition-colors flex items-center gap-1 ${
                              isEnrolled 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                : "bg-[#1D4ED8] hover:bg-blue-700 text-white"
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
        <div className="p-3.5 bg-slate-50 border-t border-[#D9E2EC] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">Recommendations dynamically adapt as assessments and quizzes are completed.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-[#D9E2EC] rounded-md text-slate-700 font-semibold hover:bg-slate-50 text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
