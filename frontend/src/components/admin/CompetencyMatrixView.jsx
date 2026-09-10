import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  UserCheck, 
  Award, 
  Search, 
  ShieldCheck, 
  ChevronRight,
  Info,
  Clock,
  Briefcase,
  Star
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
          message: `Trainer ${trainer.name} successfully assigned to ${selectedComp.name}!`
        });
      }
    } catch (err) {
      setNotification({ type: "error", message: err.message || "Assignment failed." });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2558] to-blue-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              Phase 6 Explainable Engine
            </span>
            <span className="text-xs text-blue-200">MoES Rule-Based Faculty Matching</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Institutional Competency Mapping & Trainer Matching Matrix
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
            Multi-factor explainable engine evaluating verified competency levels (40%), accredited certifications (25%), verified operational experience (20%), past training feedback (10%), and workload availability (5%).
          </p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          notification.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold">Dismiss</button>
        </div>
      )}

      {/* Grid: Left Competency Domains, Right Matched Trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Domains List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Institutional Meteorological Domains ({matrix.length})
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
                      Active Domain
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{comp.name}</h3>
                  <p className="text-slate-500 line-clamp-2 mb-3">{comp.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600 font-medium font-mono text-[10px]">
                      Code: {comp.code}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "translate-x-1 text-[#0a2558]" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details & Explainable Recommendation Engine */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {selectedComp ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800">
                    Selected Specialization
                  </span>
                  <span className="text-xs font-semibold text-slate-400">ID: {selectedComp.id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedComp.name}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedComp.description}</p>
              </div>

              {/* Matched Trainers with 5-Factor Score Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Explainable Faculty Rankings & Eligibility</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Evaluated on Verified Evidence Only</span>
                </div>

                {loadingSuggestions ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Calculating multi-factor competency eligibility...
                  </div>
                ) : suggestedTrainers.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
                    No approved trainers currently mapped to this competency.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestedTrainers.map((t) => (
                      <div
                        key={t.trainerId}
                        className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
                          t.eligible
                            ? "bg-slate-50 border-slate-200"
                            : "bg-rose-50/40 border-rose-200 opacity-80"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"}
                              alt={t.name}
                              className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{t.name}</h4>
                                {t.eligible ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{t.matchScore}% MATCH</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    <span>INELIGIBLE</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500">{t.designation} • {t.department}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAssignTrainer(t)}
                            disabled={!t.eligible}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0a2558] hover:bg-[#071c42] disabled:bg-slate-300 text-white rounded-xl font-bold text-xs shadow-sm transition-transform hover:scale-105 shrink-0"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Select as Lead Faculty</span>
                          </button>
                        </div>

                        {/* 5-Factor Score Bar Display */}
                        {t.scoreBreakdown && (
                          <div className="grid grid-cols-5 gap-2 p-2.5 bg-white rounded-xl border border-slate-100 text-[10px] text-center">
                            <div>
                              <span className="text-slate-400 block">Competency</span>
                              <b className="text-slate-800">{t.scoreBreakdown.competency}/40</b>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Certifications</span>
                              <b className="text-slate-800">{t.scoreBreakdown.certification}/25</b>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Experience</span>
                              <b className="text-slate-800">{t.scoreBreakdown.experience}/20</b>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Performance</span>
                              <b className="text-slate-800">{t.scoreBreakdown.performance}/10</b>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Availability</span>
                              <b className="text-slate-800">{t.scoreBreakdown.availability}/5</b>
                            </div>
                          </div>
                        )}

                        {/* Why Recommended / Explanation Callout */}
                        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-slate-700">
                          <p className="font-bold text-[#0a2558] mb-0.5 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" />
                            <span>Why Recommended?</span>
                          </p>
                          <p className="leading-relaxed">{t.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a meteorological competency domain from the left to inspect faculty matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
