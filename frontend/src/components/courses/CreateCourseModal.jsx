import React, { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  BookOpen, 
  Layers, 
  FolderPlus, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Compass, 
  AlertTriangle, 
  Award,
  Clock,
  Building2,
  ShieldCheck,
  Send,
  RefreshCw,
  Edit3
} from "lucide-react";
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
  "Numerical Weather Prediction", 
  "Radar Meteorology", 
  "Cyclone Tracking & Warning",
  "Satellite Meteorology", 
  "Agrometeorology", 
  "Data Assimilation", 
  "Climate Science",
  "Seismology & Marine", 
  "Atmospheric Dynamics"
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const CreateCourseModal = ({ isOpen, onClose, onCourseCreated, courseToEdit = null }) => {
  const { currentUser } = useAuth();
  const isEditMode = !!courseToEdit;

  const [step, setStep] = useState(1); // 1=Basic, 2=Subjects & Competency Matrix, 3=Review
  const [saving, setSaving] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [trainersWorkload, setTrainersWorkload] = useState([]);
  const [loadingWorkload, setLoadingWorkload] = useState(false);

  const [form, setForm] = useState({
    title: "",
    code: "",
    category: CATEGORIES[0],
    level: "Intermediate",
    duration: "4 Weeks",
    creditHours: 3,
    maxEnrollment: 50,
    department: currentUser?.department || "India Meteorological Department",
    thumbnail: THUMBNAILS[0],
    description: "",
    prerequisites: "Atmospheric Dynamics, Synoptic Observations",
    subjects: []
  });

  // Load trainers workload for Competency Matrix Matching
  useEffect(() => {
    if (!isOpen) return;

    setLoadingWorkload(true);
    api.getTrainersWorkload()
      .then(res => {
        if (res.success && res.workloads) {
          setTrainersWorkload(res.workloads);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingWorkload(false));

    if (courseToEdit) {
      setForm({
        title: courseToEdit.title || "",
        code: courseToEdit.code || "",
        category: courseToEdit.category || CATEGORIES[0],
        level: courseToEdit.level || "Intermediate",
        duration: courseToEdit.duration || "4 Weeks",
        creditHours: courseToEdit.creditHours || 3,
        maxEnrollment: courseToEdit.maxEnrollment || 50,
        department: courseToEdit.department || currentUser?.department || "India Meteorological Department",
        thumbnail: courseToEdit.thumbnail || THUMBNAILS[0],
        description: courseToEdit.description || "",
        prerequisites: Array.isArray(courseToEdit.prerequisites) 
          ? courseToEdit.prerequisites.join(", ") 
          : (courseToEdit.prerequisites || "Atmospheric Dynamics"),
        subjects: (courseToEdit.subjects || []).map(s => ({
          id: s.id || `sub_${uuidv4().substring(0, 8)}`,
          name: s.name || s.title || "Subject",
          description: s.description || "",
          requiredSkills: s.requiredSkills || "Meteorology, Observations",
          assignedTrainerId: s.assignedTrainerId || "",
          assignedTrainerName: s.assignedTrainerName || "",
          modules: s.modules || []
        }))
      });
      if (courseToEdit.subjects?.[0]?.id) {
        setExpandedSubject(courseToEdit.subjects[0].id);
      }
    } else {
      setForm({
        title: "",
        code: `MOES-IMD-${Math.floor(100 + Math.random() * 900)}`,
        category: CATEGORIES[0],
        level: "Intermediate",
        duration: "4 Weeks",
        creditHours: 3,
        maxEnrollment: 50,
        department: currentUser?.department || "India Meteorological Department",
        thumbnail: THUMBNAILS[0],
        description: "",
        prerequisites: "Atmospheric Dynamics, Synoptic Observations",
        subjects: [
          {
            id: `sub_${uuidv4().substring(0, 8)}`,
            name: "Atmospheric Dynamics & Data Modeling",
            description: "Core physical foundations and synoptic analysis framework.",
            requiredSkills: "NWP, WRF Modeling, Numerical Prediction",
            assignedTrainerId: "",
            assignedTrainerName: "Dr. Amit Sengupta",
            modules: [
              { id: `mod_${uuidv4().substring(0, 8)}`, title: "Module 1: Governing Equations of Atmosphere", duration: "1 Week", materials: [] },
              { id: `mod_${uuidv4().substring(0, 8)}`, title: "Module 2: 4D-Var Data Assimilation", duration: "1 Week", materials: [] }
            ]
          }
        ]
      });
      setExpandedSubject(null);
    }
  }, [isOpen, courseToEdit]);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Subject actions
  const addSubject = () => {
    const newSub = {
      id: `sub_${uuidv4().substring(0, 8)}`,
      name: `Subject ${form.subjects.length + 1}: Specialized Domain`,
      description: "",
      requiredSkills: form.category,
      assignedTrainerId: "",
      assignedTrainerName: "",
      modules: [
        { id: `mod_${uuidv4().substring(0, 8)}`, title: "Module 1: Principles & Observation Basics", duration: "1 Week", materials: [] }
      ]
    };
    setForm(prev => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    setExpandedSubject(newSub.id);
  };

  // Competency Matrix Trainer Suggestion Matcher strictly evaluated on Subject Title
  const getSuggestedTrainersForSubject = (subject) => {
    const rawName = (subject.name || "").trim().toLowerCase();

    // MoES domain clusters
    const domainKnowledge = {
      nwp: {
        keywords: ["nwp", "numerical", "wrf", "gfs", "dynamics", "equation", "modeling", "model", "assimilation", "4d-var", "3d-var", "hpc", "arakawa", "primitive", "advection", "baroclinic", "atmospheric dynamics", "grid", "sigma", "continuity", "hydrostatic"],
        coreTrainerName: "Amit Sengupta"
      },
      radar: {
        keywords: ["radar", "dwr", "doppler", "polarimetr", "reflectivity", "zdr", "kdp", "nowcast", "titan", "hydrometeor", "echo", "velocity", "de-alias", "satellite", "insat", "sounder", "radiance", "remote sensing", "microwave", "precipitable", "band"],
        coreTrainerName: "Sunita Kulkarni"
      },
      cyclone: {
        keywords: ["cyclone", "cyclogenesis", "storm", "surge", "dvorak", "tropical", "marine", "ocean", "rsmc", "coastal", "inundation", "track", "alipore", "depression", "sea surface", "bay of bengal", "arabian sea", "cdo", "eye"],
        coreTrainerName: "Rajiv Roy"
      },
      agri: {
        keywords: ["agro", "crop", "agriculture", "fasal", "meghdoot", "drought", "soil", "yield", "advisory", "phenology", "agrometeorology"],
        coreTrainerName: "Sunita Deshmukh"
      },
      climate: {
        keywords: ["climate", "monsoon", "enso", "iod", "teleconnection", "variability", "long-range", "reanalysis", "ipcc", "seasonal", "climatology"],
        coreTrainerName: "Rajesh Pillai"
      }
    };

    // If subject name is empty or default generic text
    if (!rawName || rawName === "subject title..." || rawName.match(/^subject\s*\d*$/i)) {
      return trainersWorkload.map(tw => ({
        ...tw,
        matchScore: 0,
        matchLabel: "Enter Subject Title"
      }));
    }

    const tokens = rawName.split(/[\s,./\-&]+/).filter(tok => tok.length > 2);

    return trainersWorkload.map(tw => {
      const trainerText = [
        tw.trainerName || "",
        tw.department || "",
        tw.designation || "",
        ...(tw.skills || []),
        ...(tw.specialization || [])
      ].join(" ").toLowerCase();

      let matchScore = 0;
      let directMatches = 0;

      // 1. Check direct skill/specialization overlap (excluding generic stopwords)
      tokens.forEach(tok => {
        if (!["umesh", "admin", "officer", "scientist", "subject", "part", "test", "demo", "title", "study"].includes(tok)) {
          (tw.skills || []).forEach(sk => {
            if (sk.toLowerCase().includes(tok)) directMatches += 2;
          });
          (tw.specialization || []).forEach(sp => {
            if (sp.toLowerCase().includes(tok)) directMatches += 2;
          });
        }
      });

      // 2. Check domain knowledge clusters
      Object.entries(domainKnowledge).forEach(([domain, conf]) => {
        const hasTopicKeyword = conf.keywords.some(kw => rawName.includes(kw));
        const isCoreTrainer = (tw.trainerName && conf.coreTrainerName && tw.trainerName.toLowerCase().includes(conf.coreTrainerName.toLowerCase())) ||
                              conf.keywords.some(kw => trainerText.includes(kw));

        if (hasTopicKeyword && isCoreTrainer) {
          matchScore += 80;
        } else if (hasTopicKeyword) {
          matchScore -= 10;
        }
      });

      if (directMatches > 0) {
        matchScore += directMatches * 10;
      }

      // Clamp score
      if (matchScore <= 0) {
        matchScore = 0;
      } else {
        matchScore = Math.min(Math.max(matchScore, 10), 99);
      }

      return {
        ...tw,
        matchScore,
        matchLabel: matchScore >= 80 ? "Top Recommendation" : matchScore >= 40 ? "Moderate Match" : "Low Match"
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const updateSubject = (subId, key, val) => {
    setForm(prev => {
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id !== subId) return s;
        const updated = { ...s, [key]: val };

        // If subject name changed, dynamically update trainer suggestion if not manually overridden
        if (key === "name") {
          const suggestions = getSuggestedTrainersForSubject(updated);
          if (suggestions.length > 0 && suggestions[0].matchScore >= 60 && !s.isManuallyAssigned) {
            updated.assignedTrainerId = suggestions[0].trainerId;
            updated.assignedTrainerName = suggestions[0].trainerName;
          } else if (suggestions.length > 0 && suggestions[0].matchScore < 60 && !s.isManuallyAssigned) {
            updated.assignedTrainerId = "";
            updated.assignedTrainerName = "";
          }
        }
        return updated;
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Please enter a Course Title.");
      setStep(1);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        code: form.code || `MOES-IMD-${Math.floor(100 + Math.random() * 900)}`,
        category: form.category,
        level: form.level,
        duration: form.duration,
        creditHours: parseInt(form.creditHours) || 3,
        maxEnrollment: parseInt(form.maxEnrollment) || 50,
        department: form.department,
        thumbnail: form.thumbnail,
        description: form.description || "Operational curriculum for meteorologists and scientific officers.",
        prerequisites: typeof form.prerequisites === "string" 
          ? form.prerequisites.split(",").map(s => s.trim()).filter(Boolean) 
          : form.prerequisites,
        subjects: form.subjects,
        leadTrainerName: form.subjects?.[0]?.assignedTrainerName || "Dr. Amit Sengupta"
      };

      if (isEditMode) {
        const res = await api.updateCourse(courseToEdit.id, payload);
        if (res.success) {
          alert(`✅ Course "${form.title}" updated successfully!`);
          if (onCourseCreated) onCourseCreated(res.course);
          onClose();
        }
      } else {
        const res = await api.createCourse(payload);
        if (res.success) {
          alert(`✅ New Course "${form.title}" published and broadcast to all officers!`);
          if (onCourseCreated) onCourseCreated(res.course);
          onClose();
        }
      }
    } catch (err) {
      alert("Failed saving course: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 font-sans text-slate-800">
        
        {/* ═════════ HEADER ═════════ */}
        <div className="bg-gradient-to-r from-[#0a2558] via-blue-900 to-indigo-950 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-md">
              {isEditMode ? <Edit3 className="w-6 h-6 text-amber-300" /> : <BookOpen className="w-6 h-6 text-blue-200" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-[#0a2558] uppercase">
                  {isEditMode ? "Curriculum Configuration Editor" : "New Program Builder"}
                </span>
                <span className="text-xs text-blue-200">Competency Matrix Mapping</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                {isEditMode ? `Edit Course: ${courseToEdit.title}` : "Publish New Operational Course"}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═════════ STEP PROGRESS BAR ═════════ */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          {[
            { num: 1, label: "1. Basic Specifications & Capacity" },
            { num: 2, label: "2. Subjects & Competency Matrix Trainers" },
            { num: 3, label: "3. Review & Broadcast Launch" }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`font-bold flex items-center gap-2 transition-colors ${
                step === s.num
                  ? "text-[#0a2558] font-black"
                  : step > s.num
                  ? "text-emerald-700"
                  : "text-slate-400"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? "bg-[#0a2558] text-white"
                  : step > s.num
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-500"
              }`}>
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* ═════════ STEP 1: BASIC COURSE SPECIFICATIONS ═════════ */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Course Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g., Polarimetric Doppler Weather Radar Interpretation & Severe Nowcasting"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Course Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  placeholder="MOES-IMD-401"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Category / Domain</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Competency Level</label>
                <select
                  value={form.level}
                  onChange={(e) => updateForm("level", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => updateForm("duration", e.target.value)}
                  placeholder="4 Weeks / 60 Hours"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Max Cadets Capacity <span className="text-blue-600">({form.maxEnrollment})</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={form.maxEnrollment}
                  onChange={(e) => updateForm("maxEnrollment", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Course Overview & Operational Synopsis</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Comprehensive description of the operational training program and expected skill outcomes..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Mandatory Prerequisites (comma separated)</label>
              <input
                type="text"
                value={form.prerequisites}
                onChange={(e) => updateForm("prerequisites", e.target.value)}
                placeholder="Basic Atmospheric Sciences, Synoptic Observations, Python in Meteorology"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Thumbnail selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">Select Header Cover Visual</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {THUMBNAILS.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => updateForm("thumbnail", thumb)}
                    className={`h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                      form.thumbnail === thumb ? "border-blue-600 ring-2 ring-blue-300 scale-102" : "border-slate-200 hover:border-blue-300 opacity-80"
                    }`}
                  >
                    <img src={thumb} alt="cover" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═════════ STEP 2: SUBJECTS & COMPETENCY MATRIX TRAINER MATCHING ═════════ */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in text-xs">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Subjects & Competency Matrix Faculty Matching</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Assign domain subjects. The AI Competency Matrix suggests top matching trainers along with their current workload.
                </p>
              </div>

              <button
                type="button"
                onClick={addSubject}
                className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* Subjects List */}
            <div className="space-y-5">
              {form.subjects.map((subject, sIdx) => {
                const suggestedTrainers = getSuggestedTrainersForSubject(subject);
                const isExpanded = expandedSubject === subject.id;

                return (
                  <div key={subject.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    
                    {/* Subject Header Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-md font-bold text-[10px]">
                          Subject {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                          placeholder="Subject Title..."
                          className="font-bold text-slate-900 text-xs bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none flex-1 p-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          {isExpanded ? "Collapse ▲" : "Configure Faculty & Modules ▼"}
                        </button>
                        {form.subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Remove Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Competency Matrix Faculty Suggester with Workload */}
                    <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>AI Competency Matrix Faculty Matching:</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Assigned Faculty: <b className={subject.assignedTrainerName ? "text-purple-900 font-bold" : "text-slate-400 font-normal"}>{subject.assignedTrainerName || "None (Type subject or click Assign)"}</b>
                        </span>
                      </div>

                      {/* Guidance notice when no domain match */}
                      {suggestedTrainers[0]?.matchScore === 0 && (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="text-amber-500 font-bold">💡</span>
                          <span>
                            Type a meteorological subject title (e.g. <b>Doppler Radar, Tropical Cyclone, NWP Dynamics, Satellite Meteorology</b>) to see live AI Faculty Matching, or click <b>Assign</b> on any faculty below.
                          </span>
                        </div>
                      )}

                      {/* Top Trainers Grid with Workload Indicator */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {suggestedTrainers.slice(0, 4).map(tw => {
                          const isAssigned = subject.assignedTrainerName === tw.trainerName || subject.assignedTrainerId === tw.trainerId;
                          return (
                            <div 
                              key={tw.trainerId}
                              onClick={() => {
                                setForm(prev => ({
                                  ...prev,
                                  subjects: prev.subjects.map(s => s.id === subject.id ? {
                                    ...s,
                                    assignedTrainerId: tw.trainerId,
                                    assignedTrainerName: tw.trainerName,
                                    isManuallyAssigned: true
                                  } : s)
                                }));
                              }}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                                isAssigned 
                                  ? "bg-purple-50 border-purple-400 ring-2 ring-purple-300 shadow-sm" 
                                  : tw.matchScore >= 80
                                  ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-400"
                                  : "bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={tw.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                                  alt={tw.trainerName}
                                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-slate-900 text-xs">{tw.trainerName}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                      tw.matchScore >= 80 
                                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs" 
                                        : tw.matchScore >= 40 
                                        ? "bg-blue-100 text-blue-900 border-blue-200" 
                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                    }`}>
                                      {tw.matchScore > 0 ? `${tw.matchScore}% Match` : "0% Match"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{tw.designation}</p>
                                  
                                  {/* Workload balancing badge */}
                                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                                      tw.workloadStatus === "High Load" 
                                        ? "bg-rose-100 text-rose-800" 
                                        : tw.workloadStatus === "Optimal" 
                                        ? "bg-blue-100 text-blue-800" 
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}>
                                      {tw.workloadStatus}: {tw.assignedCoursesCount} Courses
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  isAssigned ? "bg-purple-700 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {isAssigned ? "Selected ✓" : "Assign"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Module Builder */}
                    {isExpanded && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">Curriculum Lesson Modules ({subject.modules?.length || 0}):</span>
                          <button
                            type="button"
                            onClick={() => addModule(subject.id)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson Module</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(subject.modules || []).map((mod, mIdx) => (
                            <div key={mod.id || mIdx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold text-slate-400 font-mono w-6">M{mIdx + 1}</span>
                              <input
                                type="text"
                                value={mod.title || mod.name}
                                onChange={(e) => updateModule(subject.id, mod.id, e.target.value)}
                                placeholder="Module title..."
                                className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none"
                              />
                              {(subject.modules?.length || 0) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeModule(subject.id, mod.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ═════════ STEP 3: REVIEW & BROADCAST NOTIFICATION ═════════ */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in text-xs">
            
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={form.thumbnail}
                  alt={form.title}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-300 shrink-0"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558] text-white">
                    {form.code} • {form.level}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-1.5">{form.title || "Untitled Course"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{form.category} • {form.duration} • Max Capacity: {form.maxEnrollment} Cadets</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
                  <p className="font-semibold text-slate-800">{form.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Credit Hours</span>
                  <p className="font-semibold text-slate-800">{form.creditHours} Credits</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Subjects Count</span>
                  <p className="font-semibold text-slate-800">{form.subjects.length} Subjects</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Modules</span>
                  <p className="font-semibold text-slate-800">
                    {form.subjects.reduce((acc, s) => acc + (s.modules?.length || 0), 0)} Modules
                  </p>
                </div>
              </div>

              {/* Broadcast Notice Info Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-blue-950 space-y-1">
                <div className="flex items-center gap-2 font-black text-blue-900">
                  <Send className="w-4 h-4" />
                  <span>Automated Ministry Broadcast Announcement:</span>
                </div>
                <p className="text-xs">
                  Upon submission, an official flash notification will be automatically dispatched to all officers across IMD/MoES state centers, and this course will immediately go live on the <b>Home Page</b> and <b>Course Catalog</b>.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ═════════ FOOTER ACTIONS ═════════ */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
              >
                <span>Continue to Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{saving ? "Publishing Course..." : isEditMode ? "Save & Update Course" : "Submit Course & Broadcast to All"}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
