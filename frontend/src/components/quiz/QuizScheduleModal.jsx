import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Plus, CheckCircle2, ShieldAlert, Users, UserCheck, Search, ShieldCheck } from "lucide-react";
import { api } from "../../services/api";

export const QuizScheduleModal = ({ isOpen, onClose, currentUser, onQuizCreated }) => {
  const [courses, setCourses] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Target Trainees State
  const [targetType, setTargetType] = useState("all"); // "all" | "specific"
  const [enrolledTrainees, setEnrolledTrainees] = useState([]);
  const [selectedTraineeIds, setSelectedTraineeIds] = useState([]);
  const [traineeSearch, setTraineeSearch] = useState("");

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

      api.getTrainerEnrolledTrainees().then(res => {
        if (res.success && res.trainees) {
          setEnrolledTrainees(res.trainees);
        } else {
          // Fallback trainees if empty
          setEnrolledTrainees([
            { id: "u_trainee_1", name: "Rahul Sharma", email: "rahul.sharma@imd.gov.in", station: "New Delhi HQ", department: "Numerical Weather Prediction Division" },
            { id: "u_trainee_2", name: "Priya Nair", email: "priya.nair@imd.gov.in", station: "RMC Chennai", department: "Satellite Meteorology Division" },
            { id: "u_trainee_3", name: "Amitav Roy", email: "amitav.roy@imd.gov.in", station: "RMC Kolkata", department: "Radar & Convective Storms Division" },
            { id: "u_trainee_4", name: "Sunita Deshmukh", email: "sunita.deshmukh@imd.gov.in", station: "RMC Mumbai", department: "Aviation & Severe Weather Center" }
          ]);
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

  const handleToggleTrainee = (id) => {
    if (selectedTraineeIds.includes(id)) {
      setSelectedTraineeIds(selectedTraineeIds.filter(tId => tId !== id));
    } else {
      setSelectedTraineeIds([...selectedTraineeIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question for the quiz.");
      return;
    }

    if (targetType === "specific" && selectedTraineeIds.length === 0) {
      alert("Please select at least one trainee when scheduling for specific trainees.");
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
        targetTraineeIds: targetType === "specific" ? selectedTraineeIds : [],
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

  const filteredTrainees = enrolledTrainees.filter(t => 
    (t.name || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.email || "").toLowerCase().includes(traineeSearch.toLowerCase()) ||
    (t.station || "").toLowerCase().includes(traineeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                Assessment Designer
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti-Cheat Integrity Monitored
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Schedule New Capacity Assessment Quiz
            </h2>
            <p className="text-xs text-slate-500">
              Configure quiz scheduling, trainee targeting, proctored kiosk constraints, and questions
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">Assessment Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mid-Term Evaluation: Doppler Radar & Convective Nowcasting"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Associated Course</label>
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
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none text-slate-800 font-semibold"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Proctored Duration (Minutes)</label>
              <input
                type="number"
                min={10}
                max={180}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                📅 Scheduled Start / Go-Live Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.scheduledStartTime}
                onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                ⏳ Final Assessment Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={form.deadlineTime}
                onChange={(e) => setForm({ ...form, deadlineTime: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* ─── TARGET TRAINEES CONFIGURATION ─── */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Target Candidates / Trainees</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Choose whether this assessment appears for all course participants or a designated candidate subset.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    targetType === "all"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Enrolled Trainees
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("specific")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    targetType === "specific"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Specific Trainees ({selectedTraineeIds.length})
                </button>
              </div>
            </div>

            {targetType === "specific" && (
              <div className="space-y-3 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search trainees by name or station..."
                      value={traineeSearch}
                      onChange={(e) => setTraineeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedTraineeIds(enrolledTrainees.map(t => t.id))}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Select All ({enrolledTrainees.length})
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTraineeIds([])}
                      className="text-xs font-bold text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-slate-200">
                  {filteredTrainees.map(t => {
                    const isSelected = selectedTraineeIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTrainee(t.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-blue-50 border-blue-300 text-blue-950 font-medium"
                            : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div>
                            <span className="font-bold text-slate-900">{t.name}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({t.email})</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {t.station || "National HQ"}
                        </span>
                      </div>
                    );
                  })}
                  {filteredTrainees.length === 0 && (
                    <p className="text-center text-slate-400 py-3 text-xs">No trainees match search filter.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Select Questions from Bank */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800">
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
                className="text-blue-600 font-bold hover:underline"
              >
                {selectedQuestions.length === questionBank.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-2xl p-3 bg-slate-50">
              {questionBank.map(q => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleToggleQuestion(q.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-950 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-1 font-medium">{q.question}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <span className="font-bold text-blue-700">{q.marks || 2} Marks</span>
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
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all transform hover:scale-[1.02]"
            >
              {loading ? "Publishing Assessment..." : "Schedule & Publish Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
