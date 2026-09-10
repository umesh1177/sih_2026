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
  ChevronRight
} from "lucide-react";
import { api } from "../../services/api";

export const CompetencyMatrixView = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState(null);
  const [suggestedTrainers, setSuggestedTrainers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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
        alert(`Trainer ${trainer.name} successfully mapped to ${selectedComp.name}!`);
        fetchCompetencies();
      }
    } catch (err) {
      alert("Assignment failed: " + err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2558] to-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              AI Competency Engine
            </span>
            <span className="text-xs text-blue-200">MoES Human Capital Development</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Institutional Competency Mapping & Trainer Matching Matrix
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
            Automatically maps departmental skill requirements against verified senior scientist credentials and suggests optimal training leads for operational meteorology courses.
          </p>
        </div>
      </div>

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
                      Level: {comp.requiredLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{comp.name}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-3">{comp.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Mapped Trainers: <b>{comp.suggestedTrainers?.length || 0}</b>
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
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>AI Recommended Trainer Matches</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Ranked by Domain Match Score</span>
                </div>

                <div className="space-y-3">
                  {(suggestedTrainers.length > 0 ? suggestedTrainers : (selectedComp.matchedTrainers || [])).map((t, idx) => (
                    <div
                      key={t.trainerId || idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                          alt={t.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{t.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              {t.matchScore || 96}% MATCH
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{t.department || "IMD Headquarters"}</p>
                          <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                            Specialization: {(t.specialization || ["Meteorology"]).join(", ")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignTrainer(t)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-lg font-bold text-xs shadow-sm transition-transform hover:scale-105 shrink-0"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Assign as Lead Trainer</span>
                      </button>
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
