import React, { useState } from "react";
import { 
  Star, 
  X, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  Award, 
  BookOpen, 
  FileText 
} from "lucide-react";

export const TraineeCourseFeedbackModal = ({ 
  isOpen, 
  onClose, 
  course, 
  currentUser,
  onSubmitFeedback 
}) => {
  if (!isOpen) return null;

  const [ratings, setRatings] = useState({
    contentQuality: 5,
    trainerEffectiveness: 5,
    learningMaterial: 4,
    assessmentQuality: 4
  });

  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const overallRating = (
    (ratings.contentQuality + ratings.trainerEffectiveness + ratings.learningMaterial + ratings.assessmentQuality) / 4
  ).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    const feedbackObj = {
      id: `rev_${Date.now()}`,
      courseId: course?.id || "course_nwp_01",
      courseTitle: course?.title || "NWP Course",
      traineeName: currentUser?.name || "Officer Trainee",
      station: currentUser?.station || "Regional Center",
      date: "Just now",
      overall: Number(overallRating),
      content: ratings.contentQuality,
      trainer: ratings.trainerEffectiveness,
      material: ratings.learningMaterial,
      assessment: ratings.assessmentQuality,
      comment: comment || "Comprehensive training program with relevant meteorological practice.",
      tags: [ratings.assessmentQuality <= 3 ? "Assessment Review Needed" : "Positive Feedback"]
    };

    if (onSubmitFeedback) {
      onSubmitFeedback(feedbackObj);
    }

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const renderStarSelector = (key, label, desc) => {
    const val = ratings[key];
    return (
      <div className="p-3.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-xs text-slate-900 block">{label}</span>
            <span className="text-[10px] text-slate-500">{desc}</span>
          </div>
          <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-[var(--radius)] border border-indigo-200">
            {val} / 5
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatings({ ...ratings, [key]: star })}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= val ? "fill-amber-400 text-amber-500" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-[var(--radius)] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[var(--radius)] bg-amber-50 border border-amber-200 flex items-center justify-center font-medium text-amber-600">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-800 uppercase">
                Post-Course Evaluation
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Course Quality Feedback Form
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[var(--radius)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-base text-slate-900">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your ratings and suggestions have been recorded and aggregated into the Faculty Course Improvement Studio.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed font-medium">
              Please rate your instructional experience for <b>{course?.title || "Advanced NWP"}</b> across the 4 core dimensions:
            </p>

            {/* 4 Dimension Selectors */}
            <div className="space-y-2.5">
              {renderStarSelector("contentQuality", "1. Content Quality", "Curriculum depth, topic relevance & rigor")}
              {renderStarSelector("trainerEffectiveness", "2. Trainer Effectiveness", "Clarity, pacing & responsiveness of instructor")}
              {renderStarSelector("learningMaterial", "3. Learning Material", "Clarity of video lectures, slides & PDFs")}
              {renderStarSelector("assessmentQuality", "4. Assessment Quality", "Fairness, phrasing & distractor precision")}
            </div>

            {/* Qualitative Comment Box */}
            <div className="space-y-1">
              <label className="font-extrabold text-slate-800">
                Specific Suggestions & Comments:
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific suggestions (e.g. clarify quiz wording, add more equation walkthroughs)..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Overall Score preview & Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-slate-600">Overall Rating:</span>
                <span className="font-black text-sm text-amber-800">{overallRating} / 5.0 ⭐</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-[var(--radius)] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-[var(--radius)] text-xs shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
