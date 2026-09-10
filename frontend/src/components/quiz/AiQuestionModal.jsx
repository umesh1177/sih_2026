import React, { useState } from "react";
import { Sparkles, X, CheckCircle2, ArrowRight, Loader2, BookOpen, Layers } from "lucide-react";
import { api } from "../../services/api";

export const AiQuestionModal = ({ isOpen, onClose, onQuestionsGenerated }) => {
  const [topic, setTopic] = useState("Numerical Weather Prediction (NWP) Dynamics");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(3);
  const [subjectName, setSubjectName] = useState("Subject 1: Governing Equations & Atmospheric Dynamics");
  const [module, setModule] = useState("Module 1");
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState({});

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.generateAiQuestions({
        topic,
        difficulty,
        count: Number(count),
        subjectName,
        module
      });

      if (res.success && res.generatedQuestions) {
        setGeneratedList(res.generatedQuestions);
        const selMap = {};
        res.generatedQuestions.forEach(q => {
          selMap[q.id] = true;
        });
        setSelectedToAdd(selMap);
      }
    } catch (err) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddSelectedToBank = async () => {
    const toAdd = generatedList.filter(q => selectedToAdd[q.id]);
    if (toAdd.length === 0) {
      alert("Please select at least one question to add.");
      return;
    }

    try {
      for (const q of toAdd) {
        await api.createQuestion({
          question: q.question,
          subjectId: "sub_nwp_01",
          subjectName: q.subjectName,
          module: q.module,
          marks: q.marks,
          type: q.type,
          difficulty: q.difficulty,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      }

      if (onQuestionsGenerated) onQuestionsGenerated();
      onClose();
    } catch (err) {
      alert("Failed saving AI questions: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                IMD Meteorological AI Question Generator
              </h2>
              <p className="text-[11px] text-slate-500">
                Auto-generate high-quality domain assessment questions with formulas and physics options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="py-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Meteorological Domain / Topic Prompt *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
              >
                <option value="Numerical Weather Prediction (NWP) Dynamics">Numerical Weather Prediction (NWP) & WRF Physics</option>
                <option value="Doppler Weather Radar (DWR) Dual-Polarization & Microbursts">Doppler Weather Radar (DWR) & Dual-Pol Moments</option>
                <option value="Tropical Cyclone Dvorak Technique & Storm Surge">Tropical Cyclone Dvorak Technique & Track Forecasting</option>
                <option value="Satellite Meteorology & INSAT-3DR Products">Satellite Meteorology & INSAT-3DR Radiance Ingestion</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subject Association
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-800"
              >
                <option value="Subject 1: Governing Equations & Atmospheric Dynamics">Subject 1: Governing Equations & Atmospheric Dynamics</option>
                <option value="Subject 2: Radar Hardware & Base Products">Subject 2: Radar Hardware & Base Products</option>
                <option value="Subject 3: Tropical Cyclogenesis">Subject 3: Tropical Cyclogenesis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                <option value="Easy">Easy (Conceptual / 2 Marks)</option>
                <option value="Medium">Medium (Analytical / 3 Marks)</option>
                <option value="Hard">Hard (Expert Mathematical / 5 Marks)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Number of Questions
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Module Tag
              </label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="e.g. Module 1"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md transition-all transform hover:scale-105"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Questions with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate Questions Now</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Results Preview List */}
        {generatedList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Generated Questions Preview ({generatedList.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Check questions to add to the Question Bank
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {generatedList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className={`p-4 rounded-xl border text-xs transition-colors ${
                    selectedToAdd[q.id]
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!selectedToAdd[q.id]}
                      onChange={() =>
                        setSelectedToAdd(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="mt-1 w-4 h-4 text-[#0a2558] rounded focus:ring-[#0a2558]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0a2558] text-white">
                          {q.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-100 text-teal-800">
                          {q.difficulty}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {q.marks} Marks
                        </span>
                      </div>

                      <p className="font-semibold text-slate-800 mb-2">{q.question}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-2 text-slate-600">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded-md ${
                              q.correctAnswer === optIdx
                                ? "bg-emerald-100/70 text-emerald-900 font-bold border border-emerald-300"
                                : "bg-white/80 border border-slate-200"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="mt-2 text-[11px] text-blue-800 bg-white p-2 rounded-lg border border-blue-100">
                          💡 <b>Key Concept:</b> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {Object.values(selectedToAdd).filter(Boolean).length} selected
              </span>
              <button
                onClick={handleAddSelectedToBank}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-transform hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Import to Question Bank</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
