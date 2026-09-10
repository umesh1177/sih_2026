import React, { useState, useEffect } from "react";
import { 
  Layers, 
  CheckCircle2, 
  XCircle,
  UserCheck, 
  ChevronRight,
  Info,
  Loader2
} from "lucide-react";
import { api } from "../../services/api";

export const CompetencyMatrixView = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState(null);
  const [suggestedTrainers, setSuggestedTrainers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchCompetencies = async () => {
    setLoading(true);
    try {
      const res = await api.getCompetencies();
      if (res.success && res.matrix) {
        setMatrix(res.matrix);
        if (res.matrix.length > 0) {
          handleSelectCompetency(res.matrix[0]);
        }
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
      const res = await api.suggestTrainers({
        requiredCompetencyId: comp.id,
        subjectName: comp.name,
        requiredLevel: 2
      });
      if (res.success) {
        setSuggestedTrainers(res.suggestedTrainers || []);
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
      const res = await api.assignTrainerToCompetency(selectedComp.id, trainer.trainerId);
      if (res.success) {
        setNotification({
          type: "success",
          message: `Trainer ${trainer.name} successfully assigned to ${selectedComp.name}.`
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Assignment failed." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 uppercase tracking-wider">
                Competency Framework
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Institutional Competency Mapping & Trainer Matching
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Multi-factor eligibility engine evaluating verified competency levels (40%), accredited certifications (25%), operational experience (20%), training feedback (10%), and workload availability (5%).
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-lg border text-xs flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="font-semibold ml-4 shrink-0">Dismiss</button>
          </div>
        )}

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Competency Domains */}
          <div className="lg:col-span-5 space-y-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Meteorological Domains ({matrix.length})
            </h2>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading competency framework...
              </div>
            ) : (
              <div className="space-y-2">
                {matrix.map((comp) => {
                  const isSelected = selectedComp?.id === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => handleSelectCompetency(comp)}
                      className={`p-4 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-[#164E63] shadow-sm ring-1 ring-[#164E63]/20"
                          : "bg-white border-[#D9E2EC] hover:border-slate-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                          {comp.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900 text-sm mb-1">{comp.name}</h3>
                      <p className="text-slate-500 line-clamp-2 mb-2">{comp.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                        <span className="text-slate-500 font-medium font-mono">
                          Code: {comp.code}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "translate-x-1 text-[#164E63]" : ""}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Faculty Matching Panel */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#D9E2EC] shadow-sm p-6 space-y-6">
            {selectedComp ? (
              <>
                {/* Selected Competency Header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-100">
                      Selected Domain
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedComp.id}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{selectedComp.name}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedComp.description}</p>
                </div>

                {/* Faculty Rankings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-700" />
                      Faculty Eligibility Rankings
                    </h3>
                    <span className="text-[11px] text-slate-400">Verified Evidence Only</span>
                  </div>

                  {loadingSuggestions ? (
                    <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Calculating eligibility...
                    </div>
                  ) : suggestedTrainers.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
                      No approved trainers currently mapped to this competency.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suggestedTrainers.map((t) => (
                        <div
                          key={t.trainerId}
                          className={`p-5 rounded-lg border text-xs space-y-3 ${
                            t.eligible
                              ? "bg-white border-[#D9E2EC]"
                              : "bg-red-50/40 border-red-200 opacity-80"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                                alt={t.name}
                                className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-slate-900 text-sm">{t.name}</h4>
                                  {t.eligible ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>{t.matchScore}% Match</span>
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" />
                                      <span>Ineligible</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">{t.designation} • {t.department}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAssignTrainer(t)}
                              disabled={!t.eligible}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#164E63] hover:bg-[#0f3d4f] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xs transition-colors shrink-0"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Select as Lead Faculty</span>
                            </button>
                          </div>

                          {/* Score Breakdown */}
                          {t.scoreBreakdown && (
                            <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-center">
                              <div>
                                <span className="text-slate-400 block mb-0.5">Competency</span>
                                <b className="text-slate-800">{t.scoreBreakdown.competency}/40</b>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Certifications</span>
                                <b className="text-slate-800">{t.scoreBreakdown.certification}/25</b>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Experience</span>
                                <b className="text-slate-800">{t.scoreBreakdown.experience}/20</b>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Performance</span>
                                <b className="text-slate-800">{t.scoreBreakdown.performance}/10</b>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Availability</span>
                                <b className="text-slate-800">{t.scoreBreakdown.availability}/5</b>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="font-semibold text-[#164E63] text-[11px] mb-0.5 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              Why Recommended?
                            </p>
                            <p className="text-[11px] text-slate-700 leading-relaxed">{t.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Layers className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                Select a meteorological competency domain from the left to inspect faculty matches.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
