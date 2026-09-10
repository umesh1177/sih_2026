import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  Check
} from "lucide-react";
import { api } from "../../services/api";

export const AiCourseAdvisorModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  courses = [], 
  onSelectCourse,
  onEnrollCourse 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState("Google Gemini AI");

  // Non-enrolled courses available for recommendation
  const availableUnenrolledCourses = useMemo(() => {
    return courses.filter(c => !(c.enrolledTraineeIds || []).includes(currentUser?.id));
  }, [courses, currentUser]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.recommendCoursesWithAI(currentUser, availableUnenrolledCourses);
      if (res.success && res.recommendations) {
        // Double-check no enrolled courses are in the list
        const filtered = res.recommendations.filter(rec => {
          const match = courses.find(c => c.id === rec.courseId);
          return match && !(match.enrolledTraineeIds || []).includes(currentUser?.id);
        });
        setRecommendations(filtered);
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
  }, [isOpen, currentUser, courses]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header (Clean Light Theme) */}
        <div className="p-6 bg-white border-b border-slate-200 text-slate-900 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                  Gemini AI Advisor
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{aiSource}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                Personalized Training Recommendations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Curated for {currentUser?.name || "Officer"} based on role, department & competency radar (Unenrolled Tracks)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700">Analyzing your profile & skill matrices...</p>
              <p className="text-[11px] text-slate-400">Filtering un-enrolled tracks and matching course curricula...</p>
            </div>
          ) : (
            <>
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <BrainCircuit className="w-4 h-4 text-blue-600" />
                  <span>Profile Matched: {currentUser?.department || "Operations"} • {currentUser?.designation || "Officer Trainee"}</span>
                </div>
                <button
                  onClick={loadRecommendations}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2 p-6 shadow-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-slate-800 text-sm">All Recommended Courses Enrolled!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You are already enrolled in all relevant training courses for your department. Continue your coursework or check the Course Catalog for new upcoming batches.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => {
                    const courseObj = courses.find(c => c.id === rec.courseId);
                    if (!courseObj) return null;

                    return (
                      <div 
                        key={rec.courseId || index}
                        className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={courseObj.thumbnail} 
                              alt={rec.courseTitle || courseObj.title}
                              className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" 
                            />
                            <div>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                {courseObj.code || "TRACK"}
                              </span>
                              <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                                {rec.courseTitle || courseObj.title}
                              </h3>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right shrink-0">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black">
                              {rec.matchScore ?? 0}% Match
                            </span>
                          </div>
                        </div>

                        {/* AI Rationale Box */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                          <p className="text-[11px] text-slate-700">
                            <b className="text-blue-900">AI Justification:</b> {rec.reason}
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
                            {courseObj.duration || "4 Weeks"} • {courseObj.category}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onSelectCourse(courseObj);
                                onClose();
                              }}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                            >
                              Overview
                            </button>

                            <button
                              onClick={() => {
                                if (onEnrollCourse) onEnrollCourse(courseObj);
                                onClose();
                              }}
                              className="px-4 py-1.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <span>Enroll in Course</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>AI course recommendations update as new courses are published.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
