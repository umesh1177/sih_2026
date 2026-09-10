import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Plus, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "../../services/api";

export const QuizScheduleModal = ({ isOpen, onClose, currentUser, onQuizCreated }) => {
  const [courses, setCourses] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    courseId: "",
    courseName: "",
    durationMinutes: 30,
    totalMarks: 20,
    passMarks: 12,
    scheduledStartTime: new Date().toISOString().slice(0, 16), // datetime-local format
    deadlineTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (isOpen) {
      api.getCourses().then(res => {
        if (res.success && res.courses) {
          setCourses(res.courses);
          if (res.courses.length > 0) {
            setForm(prev => ({
              ...prev,
              courseId: res.courses[0].id,
              courseName: res.courses[0].title
            }));
          }
        }
      });

      api.getQuestions().then(res => {
        if (res.success && res.questions) {
          setQuestionBank(res.questions);
          // Auto select first 4 questions by default
          setSelectedQuestions(res.questions.slice(0, 4).map(q => q.id));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleQuestion = (id) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question for the quiz.");
      return;
    }

    setLoading(true);
    try {
      const questionsToInclude = questionBank.filter(q => selectedQuestions.includes(q.id));
      const totalMarks = questionsToInclude.reduce((acc, q) => acc + (q.marks || 2), 0);

      const payload = {
        title: form.title,
        courseId: form.courseId,
        courseName: form.courseName,
        trainerId: currentUser?.id || "u_trainer_1",
        trainerName: currentUser?.name || "Dr. Amit Sengupta",
        department: currentUser?.department || "Numerical Weather Prediction Division",
        durationMinutes: Number(form.durationMinutes),
        totalMarks: totalMarks,
        passMarks: Number(form.passMarks),
        scheduledStartTime: new Date(form.scheduledStartTime).toISOString(),
        deadlineTime: new Date(form.deadlineTime).toISOString(),
        status: "published",
        isKioskModeRequired: true,
        questions: questionsToInclude
      };

      const res = await api.createQuiz(payload);
      if (res.success) {
        if (onQuizCreated) onQuizCreated();
        onClose();
      }
    } catch (err) {
      alert("Failed creating assessment: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Schedule New Capacity Assessment Quiz
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure quiz card appearance time, proctored kiosk duration, and questions
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mid-Term Evaluation: Doppler Radar & Convective Nowcasting"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Course</label>
              <select
                value={form.courseId}
                onChange={(e) => {
                  const c = courses.find(item => item.id === e.target.value);
                  setForm({
                    ...form,
                    courseId: e.target.value,
                    courseName: c ? c.title : ""
                  });
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-800"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={10}
                max={180}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                📅 Card Visible / Start Time (Trainee Dashboard)
              </label>
              <input
                type="datetime-local"
                required
                value={form.scheduledStartTime}
                onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ⏳ Final Assessment Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Select Questions from Bank */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700">
                Select Questions from Question Bank ({selectedQuestions.length} selected)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedQuestions.length === questionBank.length) {
                    setSelectedQuestions([]);
                  } else {
                    setSelectedQuestions(questionBank.map(q => q.id));
                  }
                }}
                className="text-blue-700 font-bold hover:underline"
              >
                {selectedQuestions.length === questionBank.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-3 bg-slate-50">
              {questionBank.map(q => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Handled by parent div
                      className="w-4 h-4 text-[#0a2558] rounded"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-1">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span>{q.marks} Marks</span>
                        <span>•</span>
                        <span>{q.difficulty}</span>
                        <span>•</span>
                        <span>{q.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md transition-all transform hover:scale-105"
            >
              {loading ? "Publishing Assessment..." : "Schedule & Publish Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
