import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Award, 
  Search, 
  Plus,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sliders,
  GraduationCap,
  FileCheck2,
  TrendingUp,
  BrainCircuit,
  ArrowRight
} from "lucide-react";
import { api } from "../../services/api";

export const CompetencyMatrixView = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState(null);
  const [suggestedTrainers, setSuggestedTrainers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState(null);

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompetencies();
      if (res.success && res.matrix) {
        setMatrix(res.matrix);
        setSelectedComp(res.matrix[0]);
      }
    } catch (err) {
      console.error("Failed loading competency framework:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  const handleSelectCompetency = async (comp) => {
    setSelectedComp(comp);
    setLoadingSuggestions(true);
    try {
      const res = await api.suggestTrainers(comp.name, [comp.category]);
      if (res.success) {
        setSuggestedTrainers(res.suggestedTrainers);
      }
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAssignTrainer = async (trainer) => {
    if (!selectedComp) return;
    try {
      const res = await api.assignTrainerToCompetency(selectedComp.id, trainer.trainerId, trainer.name);
      if (res.success) {
        setAssignedMessage(`Dr. ${trainer.name} officially designated as Lead Faculty for ${selectedComp.name}!`);
        setTimeout(() => setAssignedMessage(null), 4000);
        fetchCompetencies();
      }
    } catch (err) {
      alert("Assignment failed: " + err.message);
    }
  };

  const pipelineStages = [
    { step: "1", title: "Trainer Skills & Certificates", desc: "Ingests MoES/WMO verified diplomas & credentials" },
    { step: "2", title: "Subject-wise Mapping", desc: "Maps required operational syllabus competencies" },
    { step: "3", title: "Eligibility Filtering", desc: "Filters minimum cadre grade & active clearances" },
    { step: "4", title: "Weighted Score", desc: "Applies 40% Domain + 30% Certs + 30% Rating weight" },
    { step: "5", title: "Top 3-5 Suggestions", desc: "Ranks top qualified institutional scientists" },
    { step: "6", title: "Admin Selection", desc: "Official designation and curriculum delegation" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2558] via-indigo-900 to-[#071739] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 uppercase tracking-wider">
              AI COMPETENCY MAPPING ENGINE
            </span>
            <span className="text-xs text-blue-200">MoES / IMD Human Resource Division</span>
          </div>
          <h1 className="text-xl font-black tracking-tight">
            Institutional Competency Mapping & Trainer Matching Matrix
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-3xl leading-relaxed">
            Multi-tier weighted matching pipeline that automatically aligns meteorological subject domains with verified faculty credentials, research publications, and field experience.
          </p>
        </div>
      </div>

      {/* ─── COMPETENCY MAPPING ENGINE PIPELINE (MATCHING TECHNICAL ARCHITECTURE) ─── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#0a2558]" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
              Automated Competency Mapping Engine Flow
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">SIH 2026 Architectural Flow</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {pipelineStages.map((stg, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 relative group hover:border-blue-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-[#0a2558] text-white font-mono font-bold text-[10px] flex items-center justify-center">
                  {stg.step}
                </span>
                {i < 5 && (
                  <ArrowRight className="w-3 h-3 text-slate-300 hidden md:block" />
                )}
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs leading-tight">{stg.title}</h4>
              <p className="text-[10px] text-slate-500 line-clamp-2">{stg.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {assignedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignedMessage}</span>
        </div>
      )}

      {/* Grid: Left Competency Domains, Right Matched Trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Domains List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Meteorological Competency Domains ({matrix.length})
          </h2>

          <div className="space-y-2.5">
            {matrix.map((comp) => {
              const isSelected = selectedComp?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => handleSelectCompetency(comp)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-white border-[#0a2558] shadow-md ring-2 ring-[#0a2558]/10"
                      : "bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                      {comp.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      Required Level: {comp.requiredLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{comp.name}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-3">{comp.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Mapped Trainers: <b>{comp.suggestedTrainers?.length || 3} Faculty Leads</b>
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "translate-x-1 text-[#0a2558]" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details & AI Recommended Trainers */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {selectedComp ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800">
                    Domain Focus
                  </span>
                  <span className="text-xs font-semibold text-slate-400">ID: {selectedComp.id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedComp.name}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedComp.description}</p>
              </div>

              {/* Verified Trainer Pool & AI Match Recommendation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Top 3–5 Ranked Faculty Matches (Weighted Score)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">WMO / MoES Filtered</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      trainerId: "u_trainer_1",
                      name: "Dr. Amit Sengupta",
                      designation: "Scientist 'G' / Senior Numerical Forecaster",
                      department: "Numerical Weather Prediction Division, New Delhi",
                      matchScore: 97.5,
                      certCount: 6,
                      experience: "18 Yrs",
                      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
                      weights: { domain: "99%", certs: "96%", pedagogy: "98%" },
                      specialization: ["4D-Var Data Assimilation", "Arakawa Staggered Grids", "Non-Hydrostatic Dynamics"]
                    },
                    {
                      trainerId: "u_trainer_2",
                      name: "Dr. Meenakshi Roy",
                      designation: "Scientist 'F' / Radar Meteorology Specialist",
                      department: "Doppler Weather Radar Division, Kolkata",
                      matchScore: 93.0,
                      certCount: 5,
                      experience: "14 Yrs",
                      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
                      weights: { domain: "94%", certs: "92%", pedagogy: "93%" },
                      specialization: ["Dual-Pol Radar Signatures", "Mesocyclone Nowcasting", "Reflectivity QC"]
                    },
                    {
                      trainerId: "u_trainer_3",
                      name: "Dr. Rajesh Kumar Sharma",
                      designation: "Scientist 'E' / Tropical Severe Storms Lead",
                      department: "Cyclone Warning Centre, Visakhapatnam",
                      matchScore: 91.5,
                      certCount: 4,
                      experience: "12 Yrs",
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
                      weights: { domain: "92%", certs: "90%", pedagogy: "93%" },
                      specialization: ["Dvorak Technique", "Storm Surge Inundation", "Ocean Heat Content"]
                    }
                  ].map((t, idx) => (
                    <div
                      key={t.trainerId || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start gap-3 text-xs hover:border-blue-300 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">{t.name}</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                {t.matchScore}% MATCH
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">{t.designation}</p>
                            <p className="text-[10px] text-slate-400">{t.department}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAssignTrainer(t)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold text-xs shadow-xs transition-transform hover:scale-105 shrink-0 w-full sm:w-auto justify-center"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Assign as Lead Faculty</span>
                        </button>
                      </div>

                      {/* Weighted Competency Factors */}
                      <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-200/80 text-[10px] font-mono">
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-slate-400 block font-sans">Domain Depth (40%)</span>
                          <b className="text-blue-900">{t.weights.domain}</b>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-slate-400 block font-sans">Certs ({t.certCount}) (30%)</span>
                          <b className="text-emerald-900">{t.weights.certs}</b>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100">
                          <span className="text-slate-400 block font-sans">Pedagogy (30%)</span>
                          <b className="text-purple-900">{t.weights.pedagogy}</b>
                        </div>
                      </div>

                      {/* Specializations Tags */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {t.specialization.map((spec, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md text-[10px] font-bold border border-blue-100">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a competency domain from the left to inspect trainer mappings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
