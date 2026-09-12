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
            description: "",
            requiredSkills: "",
            assignedTrainerId: "",
            assignedTrainerName: "", // Will be auto-assigned by competency matrix on workload load
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

  // Auto-assign best-matched trainer via Competency Matrix when workload data loads
  useEffect(() => {
    if (!trainersWorkload.length) return;
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject => {
        // Skip subjects that were explicitly manually assigned
        if (subject.isManuallyAssigned) return subject;
        // Skip if already assigned (e.g. edit-mode pre-populated from DB)
        if (subject.assignedTrainerId && subject.assignedTrainerName) return subject;

        const suggestions = getSuggestedTrainersForSubject(subject);
        const best = suggestions[0];
        if (best && best.matchScore >= 40) {
          return {
            ...subject,
            assignedTrainerId: best.trainerId,
            assignedTrainerName: best.trainerName
          };
        }
        return { ...subject, assignedTrainerId: "", assignedTrainerName: "" };
      })
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainersWorkload]);


  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Subject actions
  const addSubject = () => {
    const newSub = {
      id: `sub_${uuidv4().substring(0, 8)}`,
      name: "",
      description: "",
      requiredSkills: "",
      assignedTrainerId: "",
      assignedTrainerName: "",
      modules: [
        { id: `mod_${uuidv4().substring(0, 8)}`, title: "Module 1: Principles & Observation Basics", duration: "1 Week", materials: [] }
      ]
    };
    setForm(prev => ({ ...prev, subjects: [...prev.subjects, newSub] }));
    setExpandedSubject(newSub.id);
  };

  // Dynamic Multi-Dimensional Competency Matrix Matcher (Skills, Certificates, Qualifications, Role, Expertise, Faculty Name)
  const getSuggestedTrainersForSubject = (subject) => {
    const rawName = (subject.name || "").trim();
    const requiredSkills = (subject.requiredSkills || "").trim();
    const description = (subject.description || "").trim();
    // Only use category as fallback if subject has no name specified
    const category = !rawName ? (form.category || "").trim() : "";

    // Query is strictly based on what the user typed for this subject
    const queryCombined = [rawName, requiredSkills, description, category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .trim();

    // If subject name is empty or default generic placeholder
    if (!queryCombined || queryCombined === "subject title..." || queryCombined.match(/^subject\s*\d*$/i)) {
      return trainersWorkload.map(tw => ({
        ...tw,
        matchScore: 0,
        matchLabel: "Enter Subject Title",
        matchedPills: []
      }));
    }

    // Meteorological Domain Taxonomy for high-precision differentiation
    const DOMAINS = {
      NWP: {
        terms: ["nwp", "numerical", "wrf", "data assimilation", "4d-var", "governing equations", "grid", "arakawa", "simulation", "atmospheric dynamics", "equations", "physics", "modeling", "mathematical"],
        primaryTrainer: "Amit Sengupta"
      },
      RADAR: {
        terms: ["radar", "doppler", "dwr", "polarimetry", "dual-pol", "nowcasting", "mesocyclone", "reflectivity", "z-r", "convection", "echo"],
        primaryTrainer: "Meenakshi Roy"
      },
      CYCLONE: {
        terms: ["cyclone", "cyclogenesis", "tropical", "dvorak", "storm track", "central pressure", "eye", "depression", "warning"],
        primaryTrainer: "Rajesh Kumar Sharma"
      },
      MARINE: {
        terms: ["marine", "ocean", "storm surge", "wave", "coastal", "adcirc", "inundation", "hydrodynamic", "sea surface"],
        primaryTrainer: "Rajiv Roy"
      },
      AGROMET: {
        terms: ["agro", "agrometeorology", "crop", "fasal", "soil moisture", "evapotranspiration", "drought", "phenology", "agriculture", "farmer"],
        primaryTrainer: "Ananya Mukherjee"
      },
      SATELLITE: {
        terms: ["satellite", "insat", "insat-3dr", "sounder", "radiance", "infrared", "visible", "water vapor", "remote sensing", "geostationary"],
        primaryTrainer: "Vikram Rathore"
      }
    };

    const GENERIC_COMMON_WORDS = new Set(["data", "modeling", "dynamics", "prediction", "analysis", "system", "science", "meteorology", "study", "principles", "basics", "core", "theory", "part", "unit", "overview"]);

    const stopwords = new Set([
      "the", "a", "an", "and", "or", "for", "with", "from", "in", "on", "at", "to", "by", "of",
      "is", "are", "was", "were", "subject", "chapter", "module", "demo", "test", "topic", "session", "lecture"
    ]);

    const rawTokens = queryCombined
      .replace(/[^\w\s\-/]/g, " ")
      .split(/[\s,./\-&]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length >= 2 && !stopwords.has(t));

    const queryTokens = Array.from(new Set(rawTokens));

    return trainersWorkload.map(tw => {
      const trainerSkills = (tw.skills || []).map(s => String(s).trim());
      const trainerSpecs = (tw.specialization || []).map(s => String(s).trim());
      const allSkills = Array.from(new Set([...trainerSkills, ...trainerSpecs])).filter(Boolean);

      const rawCerts = tw.certificates || tw.certifications || tw.matchedCredentials?.certifications || [];
      const certTitles = rawCerts.map(c => typeof c === "string" ? c : (c.title || c.name || "")).filter(Boolean);

      const rawQuals = tw.qualifications || tw.matchedCredentials?.qualification || [];
      const qualifications = (Array.isArray(rawQuals) ? rawQuals : [rawQuals]).map(q => String(q).trim()).filter(Boolean);

      const designation = String(tw.designation || "");
      const department = String(tw.department || "");

      let rawScore = 0;
      const matchedPills = [];

      // 1. Skill & Specialization Matching (Weight ~ 45%)
      allSkills.forEach(sk => {
        const skLower = sk.toLowerCase();
        if (queryCombined.includes(skLower) || skLower.includes(queryCombined)) {
          rawScore += 35;
          matchedPills.push(`Skill: ${sk}`);
        } else {
          const matchingTokens = queryTokens.filter(qTok => 
            qTok.length >= 3 && skLower.includes(qTok)
          );
          if (matchingTokens.length > 0) {
            const points = matchingTokens.reduce((acc, tok) => acc + (GENERIC_COMMON_WORDS.has(tok) ? 4 : 14), 0);
            rawScore += Math.min(points, 25);
            matchedPills.push(`Skill: ${sk}`);
          }
        }
      });

      // 2. Certificates & Professional Accreditations Matching (Weight ~ 25%)
      certTitles.forEach(cert => {
        const certLower = cert.toLowerCase();
        if (queryCombined.includes(certLower) || certLower.includes(queryCombined)) {
          rawScore += 25;
          matchedPills.push(`Cert: ${cert}`);
        } else {
          const matchingTokens = queryTokens.filter(qTok => 
            qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok) && certLower.includes(qTok)
          );
          if (matchingTokens.length > 0) {
            rawScore += Math.min(matchingTokens.length * 15, 25);
            matchedPills.push(`Cert: ${cert}`);
          }
        }
      });

      // 3. Qualifications & Academic Degrees Alignment (Weight ~ 15%)
      const qualLower = qualifications.join(" ").toLowerCase();
      queryTokens.forEach(qTok => {
        if (qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok)) {
          if (qualLower.includes(qTok)) {
            rawScore += 12;
            matchedPills.push(`Qual: ${qTok}`);
          }
        }
      });

      // 4. Role & Departmental Operational Mandate (Weight ~ 15%)
      const desigLower = designation.toLowerCase();
      const deptLower = department.toLowerCase();
      queryTokens.forEach(qTok => {
        if (qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok)) {
          if (desigLower.includes(qTok)) {
            rawScore += 14;
            matchedPills.push(`Role: ${designation.split("&")[0].trim()}`);
          } else if (deptLower.includes(qTok)) {
            rawScore += 10;
            matchedPills.push(`Dept: ${department.split(",")[0]}`);
          }
        }
      });

      // If there are zero matching skills, certs, qualifications, or roles:
      if (rawScore === 0) {
        return {
          ...tw,
          matchScore: 0,
          matchedPills: [],
          matchLabel: "No Competency Match"
        };
      }

      // 5. Workload factor
      if (tw.workloadLevel === "High" || tw.recommendationTone === "warning") {
        rawScore -= 4;
      } else if (tw.workloadLevel === "Optimal" || tw.declaredAvailability === "Full-Time") {
        rawScore += 3;
      }
      if (tw.isColdStart && rawScore >= 30) {
        rawScore += 2;
      }

      // Normalize final percentage
      let finalScore = 0;
      if (rawScore > 0) {
        if (rawScore >= 70) {
          finalScore = Math.min(98, 90 + Math.round((rawScore - 70) * 0.35));
        } else if (rawScore >= 40) {
          finalScore = 70 + Math.round((rawScore - 40) * 0.65);
        } else if (rawScore >= 18) {
          finalScore = 40 + Math.round((rawScore - 18) * 1.1);
        } else {
          finalScore = Math.max(12, Math.min(35, rawScore * 2));
        }
      }

      const uniquePills = Array.from(new Set(matchedPills)).slice(0, 3);

      return {
        ...tw,
        matchScore: finalScore,
        matchedPills: uniquePills,
        matchLabel: finalScore >= 85 ? "Top Recommendation" : finalScore >= 65 ? "High Competency Match" : finalScore >= 40 ? "Moderate Match" : "Low Match"
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const updateSubject = (subId, key, val) => {
    setForm(prev => {
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id !== subId) return s;
        const updated = { ...s, [key]: val };

        // If subject name or required skills changed, dynamically update trainer suggestion if not manually overridden
        if (key === "name" || key === "requiredSkills") {
          const suggestions = getSuggestedTrainersForSubject(updated);
          if (suggestions.length > 0 && suggestions[0].matchScore >= 40 && !s.isManuallyAssigned) {
            updated.assignedTrainerId = suggestions[0].trainerId;
            updated.assignedTrainerName = suggestions[0].trainerName;
          } else if (suggestions.length > 0 && suggestions[0].matchScore < 40 && !s.isManuallyAssigned) {
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
      <div className="bg-white rounded-[var(--radius)] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 font-sans text-slate-800">
        
        {/* ═════════ HEADER ═════════ */}
        <div className="bg-gradient-to-r from-[#0a2558] via-blue-900 to-indigo-950 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-[var(--radius)] bg-white/10 backdrop-blur-md flex items-center justify-center font-medium text-white shadow-md">
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
              className={`font-medium flex items-center gap-2 transition-colors ${
                step === s.num
                  ? "text-[#0a2558] font-black"
                  : step > s.num
                  ? "text-emerald-700"
                  : "text-slate-400"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
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
                <label className="block font-medium text-slate-800 mb-1">
                  Course Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="e.g., Polarimetric Doppler Weather Radar Interpretation & Severe Nowcasting"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">
                  Course Code <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => updateForm("code", e.target.value)}
                  placeholder="MOES-IMD-401"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-mono font-medium focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-medium text-slate-800 mb-1">Category / Domain</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">Competency Level</label>
                <select
                  value={form.level}
                  onChange={(e) => updateForm("level", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => updateForm("duration", e.target.value)}
                  placeholder="4 Weeks / 60 Hours"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-800 mb-1">
                  Max Cadets Capacity <span className="text-blue-600">({form.maxEnrollment})</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={form.maxEnrollment}
                  onChange={(e) => updateForm("maxEnrollment", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium text-blue-900 focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-800 mb-1">Course Overview & Operational Synopsis</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Comprehensive description of the operational training program and expected skill outcomes..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs leading-relaxed focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-800 mb-1">Mandatory Prerequisites (comma separated)</label>
              <input
                type="text"
                value={form.prerequisites}
                onChange={(e) => updateForm("prerequisites", e.target.value)}
                placeholder="Basic Atmospheric Sciences, Synoptic Observations, Python in Meteorology"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:border-blue-500 focus:bg-white outline-none"
              />
            </div>

            {/* Thumbnail selector */}
            <div>
              <label className="block font-medium text-slate-800 mb-1.5">Select Header Cover Visual</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {THUMBNAILS.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => updateForm("thumbnail", thumb)}
                    className={`h-20 rounded-[var(--radius)] overflow-hidden cursor-pointer border-2 transition-all ${
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
                className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-semibold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 shrink-0"
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
                  <div key={subject.id} className="p-5 rounded-[var(--radius)] bg-slate-50 border border-slate-200 space-y-4">
                    
                    {/* Subject Header Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-[var(--radius)] font-medium text-[10px]">
                          Subject {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                          placeholder="Subject Title..."
                          className="font-medium text-slate-900 text-xs bg-transparent border-b border-slate-300 focus:border-blue-600 outline-none flex-1 p-1"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
                        >
                          {isExpanded ? "Collapse ▲" : "Configure Faculty & Modules ▼"}
                        </button>
                        {form.subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(subject.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-[var(--radius)]"
                            title="Remove Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Competency Matrix Faculty Suggester with Workload & Manual Selection */}
                    <div className="p-4 bg-white rounded-[var(--radius)] border border-blue-100 space-y-3.5">
                      
                      {/* Top Bar: Assignment Status & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="font-extrabold text-slate-900 text-xs">
                            Subject Faculty Assignment:
                          </span>
                          {subject.isManuallyAssigned && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                              Manual Override
                            </span>
                          )}
                        </div>

                        {subject.assignedTrainerName && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-600 font-medium">
                              Assigned: <b className="text-purple-900 font-medium">{subject.assignedTrainerName}</b>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setForm(prev => ({
                                  ...prev,
                                  subjects: prev.subjects.map(s => s.id === subject.id ? {
                                    ...s,
                                    assignedTrainerId: "",
                                    assignedTrainerName: "",
                                    isManuallyAssigned: false
                                  } : s)
                                }));
                              }}
                              className="text-[10px] text-rose-600 hover:text-rose-800 font-medium underline"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ─── MANUAL TRAINER SELECTION DROPDOWN (ADMIN CONTROLS) ─── */}
                      <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-[var(--radius)] border border-blue-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-extrabold text-[#0a2558] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>Manual Faculty Selection (All Registered Trainers):</span>
                          </label>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {trainersWorkload.length} Faculty Available
                          </span>
                        </div>
                        
                        <select
                          value={subject.assignedTrainerId || ""}
                          onChange={(e) => {
                            const selId = e.target.value;
                            if (!selId) {
                              setForm(prev => ({
                                ...prev,
                                subjects: prev.subjects.map(s => s.id === subject.id ? {
                                  ...s,
                                  assignedTrainerId: "",
                                  assignedTrainerName: "",
                                  isManuallyAssigned: false
                                } : s)
                              }));
                            } else {
                              const found = trainersWorkload.find(t => t.trainerId === selId);
                              if (found) {
                                setForm(prev => ({
                                  ...prev,
                                  subjects: prev.subjects.map(s => s.id === subject.id ? {
                                    ...s,
                                    assignedTrainerId: found.trainerId,
                                    assignedTrainerName: found.trainerName,
                                    isManuallyAssigned: true
                                  } : s)
                                }));
                              }
                            }
                          }}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-[var(--radius)] text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none shadow-sm cursor-pointer"
                        >
                          <option value="">-- Choose / Assign Any Faculty from Complete List --</option>
                          {trainersWorkload.map(tw => (
                            <option key={tw.trainerId} value={tw.trainerId}>
                              {tw.trainerName} — {tw.designation} ({tw.department}) • [Workload: {tw.workloadLevel || "Optimal"} ({tw.assignedCoursesCount || 0} Courses)]
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Guidance notice when no domain match */}
                      {suggestedTrainers[0]?.matchScore === 0 && (
                        <div className="p-2.5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="text-amber-500 font-medium">💡</span>
                          <span>
                            Type any subject title, skill, or certificate keyword (e.g. <b>Python, Radar, WRF, Cyclone, GIS, Agrometeorology</b>). Faculty profiles will be dynamically ranked across their <b>skills, certificates, expertise, qualifications, and role</b>.
                          </span>
                        </div>
                      )}

                      {/* Top AI Suggested Faculty Grid */}
                      <div>
                        <div className="text-[11px] font-medium text-slate-700 mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>AI Dynamic Faculty Recommendations (Ranked by Competency & Workload):</span>
                          </div>
                          {suggestedTrainers[0]?.matchScore > 0 && (
                            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Top Match: {suggestedTrainers[0]?.matchScore}% ({suggestedTrainers[0]?.trainerName})
                            </span>
                          )}
                        </div>

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
                                className={`p-3 rounded-[var(--radius)] border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                                  isAssigned 
                                    ? "bg-purple-50/90 border-purple-400 ring-2 ring-purple-300 shadow-sm" 
                                    : tw.matchScore >= 80
                                    ? "bg-emerald-50/60 border-emerald-300 hover:border-emerald-500 hover:shadow-xs"
                                    : tw.matchScore >= 60
                                    ? "bg-blue-50/50 border-blue-200 hover:border-blue-400"
                                    : tw.matchScore >= 35
                                    ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                                    : "bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5">
                                    <img
                                      src={tw.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                                      alt={tw.trainerName}
                                      className="w-10 h-10 rounded-[var(--radius)] object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                                    />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-medium text-slate-900 text-xs">{tw.trainerName}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                          tw.matchScore >= 80 
                                            ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs" 
                                            : tw.matchScore >= 60 
                                            ? "bg-blue-100 text-blue-900 border-blue-200" 
                                            : tw.matchScore >= 35
                                            ? "bg-amber-100 text-amber-900 border-amber-200"
                                            : "bg-slate-100 text-slate-500 border-slate-200"
                                        }`}>
                                          {tw.matchScore > 0 ? `${tw.matchScore}% Match` : "0% Match"}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
                                        {tw.designation} • {tw.department?.split(",")[0]}
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className={`px-2.5 py-1 rounded-[var(--radius)] text-[10px] font-medium shrink-0 transition-all ${
                                      isAssigned ? "bg-purple-700 text-white shadow-xs" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    }`}
                                  >
                                    {isAssigned ? "Assigned ✓" : "Assign"}
                                  </button>
                                </div>

                                {/* Matched Dimensions Reason Badges */}
                                {tw.matchedPills && tw.matchedPills.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                    {tw.matchedPills.map((pill, pIdx) => (
                                      <span key={pIdx} className="px-1.5 py-0.5 rounded-[var(--radius)] bg-indigo-50 border border-indigo-200/90 text-indigo-950 text-[9px] font-medium">
                                        ✦ {pill}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Workload & Qualification Footer */}
                                <div className="flex items-center justify-between gap-1 flex-wrap pt-1 border-t border-slate-200/60 text-[9px]">
                                  <span className={`px-2 py-0.2 rounded-full font-black ${
                                    tw.workloadLevel === "High" || tw.recommendationTone === "warning"
                                      ? "bg-rose-100 text-rose-800 border border-rose-200" 
                                      : tw.workloadLevel === "Moderate" || tw.recommendationTone === "balanced"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}>
                                    {tw.finalRecommendation || (tw.workloadStatus === "High Load" ? "⚠ High Workload" : "🌟 Optimal Availability")}
                                  </span>
                                  <span className="text-slate-400 font-mono">
                                    ({tw.assignedCoursesCount || tw.currentCourseLoad || 0} active courses)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Module Builder */}
                    {isExpanded && (
                      <div className="p-4 bg-white rounded-[var(--radius)] border border-slate-200 space-y-4 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                          <div>
                            <label className="block font-medium text-slate-700 text-[11px] mb-1">
                              Subject Competencies & Keywords (Matches Faculty Skills & Certs):
                            </label>
                            <input
                              type="text"
                              value={subject.requiredSkills || ""}
                              onChange={(e) => updateSubject(subject.id, "requiredSkills", e.target.value)}
                              placeholder="e.g. Python, WRF Modeling, Radar, GIS, Agrometeorology..."
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:bg-white focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 text-[11px] mb-1">
                              Subject Syllabus Description:
                            </label>
                            <input
                              type="text"
                              value={subject.description || ""}
                              onChange={(e) => updateSubject(subject.id, "description", e.target.value)}
                              placeholder="Operational syllabus overview and learning outcomes..."
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs focus:bg-white focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 text-xs">Curriculum Lesson Modules ({subject.modules?.length || 0}):</span>
                          <button
                            type="button"
                            onClick={() => addModule(subject.id)}
                            className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson Module</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(subject.modules || []).map((mod, mIdx) => (
                            <div key={mod.id || mIdx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-[var(--radius)] border border-slate-200">
                              <span className="text-[10px] font-medium text-slate-400 font-mono w-6">M{mIdx + 1}</span>
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
            
            <div className="bg-slate-50 rounded-[var(--radius)] p-6 border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={form.thumbnail}
                  alt={form.title}
                  className="w-20 h-20 rounded-[var(--radius)] object-cover ring-2 ring-slate-300 shrink-0"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#0a2558] text-white">
                    {form.code} • {form.level}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-1.5">{form.title || "Untitled Course"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{form.category} • {form.duration} • Max Capacity: {form.maxEnrollment} Cadets</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Department</span>
                  <p className="font-semibold text-slate-800">{form.department}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Credit Hours</span>
                  <p className="font-semibold text-slate-800">{form.creditHours} Credits</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Subjects Count</span>
                  <p className="font-semibold text-slate-800">{form.subjects.length} Subjects</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">Total Modules</span>
                  <p className="font-semibold text-slate-800">
                    {form.subjects.reduce((acc, s) => acc + (s.modules?.length || 0), 0)} Modules
                  </p>
                </div>
              </div>

              {/* Subjects & Faculty Assignment Review Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Curriculum Subjects & Assigned Faculty ({form.subjects.length}):</span>
                </h4>

                <div className="space-y-2">
                  {form.subjects.map((sub, idx) => (
                    <div key={sub.id || idx} className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-[var(--radius)] bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                            S{idx + 1}
                          </span>
                          <span className="font-medium text-slate-900 text-xs">{sub.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sub.modules?.length || 0} Lesson Modules
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium uppercase">Faculty:</span>
                        <span className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-medium ${
                          sub.assignedTrainerName 
                            ? "bg-purple-100 text-purple-900 border border-purple-200" 
                            : "bg-amber-100 text-amber-900 border border-amber-200"
                        }`}>
                          {sub.assignedTrainerName ? `👨‍🏫 ${sub.assignedTrainerName}` : "⚠ Unassigned"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broadcast Notice Info Box */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[var(--radius)] border border-blue-200 text-blue-950 space-y-1">
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
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-[var(--radius)] text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-[var(--radius)] text-xs"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
              >
                <span>Continue to Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
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
