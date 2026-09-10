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
    scheduledStartTime: new Date().toISOString().slice(0, 16),
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#D9E2EC] my-8">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2EC]">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Schedule New Capacity Assessment Quiz
            </h2>
            <p className="text-[11px] text-slate-500">
              Configure assessment window, proctored kiosk duration, and curated questions
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assessment Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mid-Term Evaluation: Doppler Radar & Convective Nowcasting"
              className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none text-slate-800"
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
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Time (Go-Live)
              </label>
              <input
                type="datetime-local"
                required
                value={form.scheduledStartTime}
                onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Final Submission Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Select Questions from Bank */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                Select Questions from Bank ({selectedQuestions.length} selected)
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
                className="text-[#1D4ED8] font-semibold hover:underline"
              >
                {selectedQuestions.length === questionBank.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-[#D9E2EC] rounded-md p-2 bg-slate-50">
              {questionBank.map(q => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-2.5 rounded border text-xs cursor-pointer flex items-center gap-2.5 transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 text-[#1D4ED8] rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1">{q.question}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
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

          <div className="pt-3.5 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-md font-semibold shadow-xs transition-colors"
            >
              {loading ? "Publishing Assessment..." : "Schedule & Publish Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
