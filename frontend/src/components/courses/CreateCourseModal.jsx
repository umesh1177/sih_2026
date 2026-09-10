import React, { useState } from "react";
import { X, Plus, Trash2, BookOpen, Layers, FolderPlus, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
// Simple unique ID generator (no external dep needed)
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
  const [step, setStep] = useState(1); // 1=Basic, 2=Subjects, 3=Review
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
        }, 1500);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0a2558]" />
              Create New Training Course
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === s ? "bg-[#0a2558] text-white" :
                    step > s ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                  }`}>{step > s ? "✓" : s}</div>
                  <span className={`text-[10px] font-semibold ${step === s ? "text-[#0a2558]" : "text-slate-400"}`}>
                    {s === 1 ? "Basic Info" : s === 2 ? "Subjects & Modules" : "Review"}
                  </span>
                  {s < 3 && <div className="w-6 h-px bg-slate-200 mx-1" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-7 space-y-5">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Title *</label>
                <input
                  value={form.title}
                  onChange={e => updateForm("title", e.target.value)}
                  placeholder="e.g., Advanced Doppler Radar Operations & Interpretation"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm("description", e.target.value)}
                  rows={3}
                  placeholder="Describe what trainees will learn..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20 focus:border-[#0a2558] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => updateForm("category", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Level</label>
                  <select
                    value={form.level}
                    onChange={e => updateForm("level", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Duration</label>
                  <input
                    value={form.duration}
                    onChange={e => updateForm("duration", e.target.value)}
                    placeholder="e.g., 4 Weeks"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
                  <input
                    value={form.department}
                    onChange={e => updateForm("department", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a2558]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Course Thumbnail</label>
                <div className="grid grid-cols-5 gap-2">
                  {THUMBNAILS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => updateForm("thumbnail", t)}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition-all ${form.thumbnail === t ? "border-[#0a2558] ring-2 ring-[#0a2558]/30" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <img src={t} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Subjects & Modules */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Build the curriculum by adding subjects and modules.</p>
                <button
                  onClick={addSubject}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#071c42] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>

              {form.subjects.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No subjects yet</p>
                  <p className="text-xs">Click "Add Subject" to build your curriculum</p>
                </div>
              )}

              {form.subjects.map((sub, sIdx) => (
                <div key={sub.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50">
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0a2558] text-white flex items-center justify-center text-xs font-bold">
                        S{sIdx + 1}
                      </div>
                      <input
                        value={sub.name}
                        onChange={e => { e.stopPropagation(); updateSubject(sub.id, "name", e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-transparent text-sm font-bold text-slate-800 focus:outline-none border-b border-transparent focus:border-[#0a2558] px-1"
                      />
                      {expandedSubject === sub.id
                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => removeSubject(sub.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {expandedSubject === sub.id && (
                    <div className="p-4 space-y-3">
                      <input
                        value={sub.description}
                        onChange={e => updateSubject(sub.id, "description", e.target.value)}
                        placeholder="Subject description..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0a2558]"
                      />

                      {sub.modules.map((mod, mIdx) => (
                        <div key={mod.id} className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded shrink-0">M{mIdx + 1}</span>
                          <input
                            value={mod.title}
                            onChange={e => updateModule(sub.id, mod.id, "title", e.target.value)}
                            className="flex-1 bg-transparent text-xs font-semibold text-slate-800 focus:outline-none border-b border-transparent focus:border-[#0a2558]"
                          />
                          <input
                            value={mod.duration}
                            onChange={e => updateModule(sub.id, mod.id, "duration", e.target.value)}
                            placeholder="Duration"
                            className="w-20 bg-white text-xs px-2 py-1 border border-slate-200 rounded-lg focus:outline-none"
                          />
                          <button onClick={() => removeModule(sub.id, mod.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => addModule(sub.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:border-[#0a2558] hover:text-[#0a2558] transition-colors"
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
            <div className="space-y-5">
              {saved ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Course Created!</h3>
                  <p className="text-xs text-slate-500 mt-1">Your course is now live in the catalog.</p>
                </div>
              ) : (
                <>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={form.thumbnail} alt="" className="w-20 h-14 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{form.title || "(No title)"}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">{form.category}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">{form.level}</span>
                          <span className="text-[11px] text-slate-500">{form.duration}</span>
                        </div>
                      </div>
                    </div>
                    {form.description && <p className="text-xs text-slate-600">{form.description}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xl font-black text-[#0a2558]">{form.subjects.length}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Subjects</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xl font-black text-[#0a2558]">{form.subjects.reduce((a, s) => a + s.modules.length, 0)}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Modules</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl">
                      <p className="text-xl font-black text-emerald-600">0</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Enrolled</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">Lead Trainer: <b>{currentUser?.name}</b> • Department: {form.department}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
            >
              ← Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !form.title.trim()) { alert("Please enter a course title."); return; }
                  setStep(s => s + 1);
                }}
                className="px-6 py-2 bg-[#0a2558] text-white text-xs font-bold rounded-xl hover:bg-[#071c42] shadow-md transition-all"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                {saving ? "Creating..." : "Publish Course"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
