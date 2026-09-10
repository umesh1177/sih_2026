import React, { useState } from "react";
import { X, Plus, Trash2, BookOpen, Layers, FolderPlus, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const uuidv4 = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1504608524841-42584120d1d0?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1581093804475-577d72e35330?auto=format&fit=crop&q=80&w=800",
];

const CATEGORIES = [
  "Numerical Weather Prediction", "Radar Meteorology", "Cyclone Tracking & Warning",
  "Satellite Meteorology", "Agrometeorology", "Data Assimilation", "Climate Science",
  "Seismology & Marine", "Atmospheric Dynamics"
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    level: "Intermediate",
    duration: "4 Weeks",
    department: currentUser?.department || "India Meteorological Department",
    thumbnail: THUMBNAILS[0],
    subjects: []
  });

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSubject = () => {
    const newSubject = {
      id: `sub_${uuidv4().substring(0, 8)}`,
      name: `Subject ${form.subjects.length + 1}`,
      description: "",
      modules: []
    };
    setForm(prev => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
    setExpandedSubject(newSubject.id);
  };

  const updateSubject = (subId, key, val) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subId ? { ...s, [key]: val } : s)
    }));
  };

  const removeSubject = (subId) => {
    setForm(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== subId) }));
  };

  const addModule = (subId) => {
    const newModule = {
      id: `mod_${uuidv4().substring(0, 8)}`,
      title: `Module ${(form.subjects.find(s => s.id === subId)?.modules.length || 0) + 1}`,
      duration: "1 Week",
      materials: []
    };
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subId ? { ...s, modules: [...s.modules, newModule] } : s
      )
    }));
  };

  const updateModule = (subId, modId, key, val) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subId
          ? { ...s, modules: s.modules.map(m => m.id === modId ? { ...m, [key]: val } : m) }
          : s
      )
    }));
  };

  const removeModule = (subId, modId) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.map(s =>
        s.id === subId ? { ...s, modules: s.modules.filter(m => m.id !== modId) } : s
      )
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const courseData = {
        ...form,
        code: `MOES-IMD-${Math.floor(100 + Math.random() * 900)}`,
        leadTrainerId: currentUser?.id,
        leadTrainerName: currentUser?.name || "Assigned Trainer",
        enrolledTraineeIds: [],
        competenciesGained: [form.category]
      };
      const res = await api.createCourse(courseData);
      if (res.success) {
        setSaved(true);
        setTimeout(() => {
          onCourseCreated && onCourseCreated(res.course);
          handleClose();
        }, 1200);
      } else {
        alert("Failed to create course: " + res.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSaved(false);
    setSaving(false);
    setExpandedSubject(null);
    setForm({
      title: "", description: "", category: CATEGORIES[0], level: "Intermediate",
      duration: "4 Weeks", department: currentUser?.department || "India Meteorological Department",
      thumbnail: THUMBNAILS[0], subjects: []
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl border border-[#D9E2EC] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2EC] shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
              Create New Training Course
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === s ? "bg-[#1D4ED8] text-white" :
                    step > s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>{step > s ? "✓" : s}</div>
                  <span className={`text-[11px] font-semibold ${step === s ? "text-[#1D4ED8]" : "text-slate-400"}`}>
                    {s === 1 ? "Basic Info" : s === 2 ? "Curriculum" : "Review"}
                  </span>
                  {s < 3 && <div className="w-4 h-px bg-slate-200 mx-0.5" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  value={form.title}
                  onChange={e => updateForm("title", e.target.value)}
                  placeholder="e.g., Advanced Doppler Radar Operations & Interpretation"
                  className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm("description", e.target.value)}
                  rows={3}
                  placeholder="Describe learning objectives and operational goals..."
                  className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => updateForm("category", e.target.value)}
                    className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Level</label>
                  <select
                    value={form.level}
                    onChange={e => updateForm("level", e.target.value)}
                    className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    value={form.duration}
                    onChange={e => updateForm("duration", e.target.value)}
                    placeholder="e.g., 4 Weeks"
                    className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    value={form.department}
                    onChange={e => updateForm("department", e.target.value)}
                    className="w-full px-3 py-2 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Course Thumbnail</label>
                <div className="grid grid-cols-5 gap-2">
                  {THUMBNAILS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => updateForm("thumbnail", t)}
                      className={`h-14 rounded-lg overflow-hidden border-2 transition-all ${form.thumbnail === t ? "border-[#1D4ED8] ring-2 ring-blue-500/20" : "border-[#D9E2EC] hover:border-slate-400"}`}
                    >
                      <img src={t} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Build the curriculum by structuring subjects and modules.</p>
                <button
                  onClick={addSubject}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1D4ED8] text-white rounded-md text-xs font-semibold shadow-xs hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>

              {form.subjects.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">No subjects yet</p>
                  <p className="text-[11px]">Click "Add Subject" to configure your curriculum modules.</p>
                </div>
              )}

              {form.subjects.map((sub, sIdx) => (
                <div key={sub.id} className="border border-[#D9E2EC] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-[#D9E2EC]">
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <div className="w-6 h-6 rounded bg-[#155E75] text-white flex items-center justify-center text-[10px] font-bold">
                        S{sIdx + 1}
                      </div>
                      <input
                        value={sub.name}
                        onChange={e => { e.stopPropagation(); updateSubject(sub.id, "name", e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-transparent text-xs font-bold text-slate-800 focus:outline-none px-1"
                      />
                      {expandedSubject === sub.id
                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => removeSubject(sub.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {expandedSubject === sub.id && (
                    <div className="p-3.5 space-y-2.5">
                      <input
                        value={sub.description}
                        onChange={e => updateSubject(sub.id, "description", e.target.value)}
                        placeholder="Subject description..."
                        className="w-full px-3 py-1.5 border border-[#D9E2EC] rounded-md text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />

                      {sub.modules.map((mod, mIdx) => (
                        <div key={mod.id} className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-md border border-blue-100">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">M{mIdx + 1}</span>
                          <input
                            value={mod.title}
                            onChange={e => updateModule(sub.id, mod.id, "title", e.target.value)}
                            className="flex-1 bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
                          />
                          <input
                            value={mod.duration}
                            onChange={e => updateModule(sub.id, mod.id, "duration", e.target.value)}
                            placeholder="Duration"
                            className="w-20 bg-white text-xs px-2 py-0.5 border border-[#D9E2EC] rounded focus:outline-none"
                          />
                          <button onClick={() => removeModule(sub.id, mod.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addModule(sub.id)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-[#D9E2EC] rounded-md text-xs font-semibold text-slate-500 hover:border-blue-500 hover:text-[#1D4ED8] transition-colors"
                      >
                        <FolderPlus className="w-3.5 h-3.5" /> Add Module
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              {saved ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Course Successfully Created</h3>
                  <p className="text-xs text-slate-500 mt-0.5">The course is now active in the official catalog.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 rounded-lg border border-[#D9E2EC] space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img src={form.thumbnail} alt="" className="w-16 h-12 rounded-md object-cover" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{form.title || "(Untitled Course)"}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">{form.category}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">{form.level}</span>
                          <span className="text-[11px] text-slate-500">{form.duration}</span>
                        </div>
                      </div>
                    </div>
                    {form.description && <p className="text-xs text-slate-600 leading-relaxed">{form.description}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white border border-[#D9E2EC] rounded-lg">
                      <p className="text-lg font-bold text-[#155E75]">{form.subjects.length}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Subjects</p>
                    </div>
                    <div className="p-3 bg-white border border-[#D9E2EC] rounded-lg">
                      <p className="text-lg font-bold text-[#155E75]">{form.subjects.reduce((a, s) => a + s.modules.length, 0)}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Modules</p>
                    </div>
                    <div className="p-3 bg-white border border-[#D9E2EC] rounded-lg">
                      <p className="text-lg font-bold text-emerald-700">0</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Enrolled</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">Lead Faculty: <b>{currentUser?.name}</b> • Department: {form.department}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#D9E2EC] shrink-0">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40"
            >
              ← Previous
            </button>
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !form.title.trim()) { alert("Please enter a course title."); return; }
                  setStep(s => s + 1);
                }}
                className="px-5 py-2 bg-[#1D4ED8] text-white text-xs font-semibold rounded-md hover:bg-blue-700 shadow-xs transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#15803D] hover:bg-green-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? "Publishing..." : "Publish Course"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
