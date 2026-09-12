import React, { useState, useEffect } from "react";
import { Sparkles, X, CheckCircle2, ArrowRight, Loader2, BookOpen, Layers, Hash, FileQuestion, HelpCircle, Check } from "lucide-react";
import { api } from "../../services/api";

export const AiQuestionModal = ({ isOpen, onClose, onQuestionsGenerated, currentUser }) => {
  const [topic, setTopic] = useState("Numerical Weather Prediction (NWP) Dynamics");
  const [subjectName, setSubjectName] = useState("Governing Equations & Atmospheric Dynamics");
  const [selectedModule, setSelectedModule] = useState("");
  const [customModule, setCustomModule] = useState("");
  const [questionType, setQuestionType] = useState("mcq"); // "mcq" | "one_word"
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  
  const [availableModules, setAvailableModules] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState({});
  const [importing, setImporting] = useState(false);

  // Load modules from trainer's assigned courses
  useEffect(() => {
    if (!isOpen) return;

    const loadModules = async () => {
      try {
        const cRes = await api.getCourses();
        if (cRes?.success && Array.isArray(cRes.courses)) {
          // Filter assigned courses for trainer
          const assignedCourses = cRes.courses.filter(c => {
            if (currentUser?.role === "admin") return true;
            if (currentUser?.id && (c.leadTrainerId === currentUser.id || c.trainerId === currentUser.id)) return true;
            if (currentUser?.name && c.leadTrainerName && c.leadTrainerName.toLowerCase() === currentUser.name.toLowerCase()) return true;
            if (c.subjects && Array.isArray(c.subjects)) {
              return c.subjects.some(s => 
                (currentUser?.id && (s.trainerId === currentUser.id || s.facultyId === currentUser.id || s.assignedTrainerId === currentUser.id)) ||
                (currentUser?.name && (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName) && 
                  (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName).toLowerCase().includes(currentUser.name.toLowerCase()))
              );
            }
            return false;
          });

          const modulesList = [];
          assignedCourses.forEach(c => {
            (c.subjects || []).forEach(s => {
              const isSubjTrainer = currentUser?.role === "admin" || 
                (currentUser?.id && (s.trainerId === currentUser.id || s.facultyId === currentUser.id || s.assignedTrainerId === currentUser.id || c.leadTrainerId === currentUser.id)) ||
                (currentUser?.name && (s.trainerName || s.facultyName || s.trainer || c.leadTrainerName || "").toLowerCase().includes(currentUser.name.toLowerCase()));
              
              if (isSubjTrainer) {
                (s.modules || []).forEach((m, mIdx) => {
                  modulesList.push({
                    id: m.id || `mod_${mIdx}`,
                    courseTitle: c.title,
                    subjectName: s.name || s.title || "Subject Unit",
                    moduleTitle: m.title || `Module ${mIdx + 1}`,
                    fullLabel: `${s.name || s.title} — ${m.title || `Module ${mIdx + 1}`}`,
                    topics: m.topics || []
                  });
                });
              }
            });
          });

          setAvailableModules(modulesList);
          if (modulesList.length > 0) {
            setSelectedModule(modulesList[0].fullLabel);
            setSubjectName(modulesList[0].subjectName);
            if (modulesList[0].topics && modulesList[0].topics.length > 0) {
              setTopic(modulesList[0].topics[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed loading course modules for AI Generator:", err);
      }
    };

    loadModules();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleModuleSelectChange = (val) => {
    setSelectedModule(val);
    if (val !== "custom") {
      const found = availableModules.find(m => m.fullLabel === val);
      if (found) {
        setSubjectName(found.subjectName);
        if (found.topics && found.topics.length > 0) {
          setTopic(found.topics[0]);
        }
      }
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedList([]);
    try {
      const activeModule = selectedModule === "custom" 
        ? (customModule.trim() || "General Module") 
        : (selectedModule || "Module 1");

      const res = await api.generateAiQuestions({
        topic: topic.trim(),
        subjectName: subjectName.trim(),
        module: activeModule,
        difficulty,
        count: Math.max(1, Number(count) || 5),
        type: questionType,
        questionType
      });

      if (res.success && Array.isArray(res.generatedQuestions)) {
        setGeneratedList(res.generatedQuestions);
        const selMap = {};
        res.generatedQuestions.forEach(q => {
          selMap[q.id] = true;
        });
        setSelectedToAdd(selMap);
      } else {
        alert(res.message || "Failed to generate questions. Please try a different topic or prompt.");
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
      alert("Please select at least one question to import into the Question Bank.");
      return;
    }

    setImporting(true);
    try {
      const activeModule = selectedModule === "custom" ? (customModule || "Module 1") : (selectedModule || "Module 1");

      for (const q of toAdd) {
        await api.createQuestion({
          question: q.question,
          subjectName: q.subjectName || subjectName,
          topic: q.topic || topic,
          module: q.module || activeModule,
          marks: Number(q.marks) || (questionType === "one_word" ? 2 : 3),
          type: q.type || questionType,
          difficulty: q.difficulty || difficulty,
          options: q.options || [],
          correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
          expectedAnswer: q.expectedAnswer || (q.options ? q.options[0] : ""),
          acceptedAnswers: q.acceptedAnswers || (q.expectedAnswer ? [q.expectedAnswer] : []),
          explanation: q.explanation || "",
          createdBy: currentUser?.id || "u_trainer_1",
          createdByEmail: currentUser?.email || null,
          createdByName: currentUser?.name || null,
          createdByRole: currentUser?.role || "trainer"
        });
      }

      if (onQuestionsGenerated) {
        await onQuestionsGenerated();
      }
      onClose();
    } catch (err) {
      alert("Failed saving AI questions: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-[var(--radius)] max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius)] bg-[#0B3475] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                AI Question Generator
              </h2>
              <p className="text-[11px] text-slate-500">
                Generate high-quality technical MCQs or One-Word questions tailored to assigned modules and topics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius)] text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Parameters Form */}
        <form onSubmit={handleGenerate} className="py-4 space-y-4 text-xs">
          
          {/* Question Format Selector (MCQ vs One Word) */}
          <div className="space-y-1.5">
            <label className="block font-medium text-slate-700">
              Select Question Format *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQuestionType("mcq")}
                className={`p-3 rounded-[var(--radius)] border flex items-center gap-2.5 font-semibold transition-colors text-left ${
                  questionType === "mcq"
                    ? "bg-blue-50/80 border-[#0B3475] text-[#0B3475] shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`w-7 h-7 rounded-[var(--radius)] flex items-center justify-center font-medium text-xs ${
                  questionType === "mcq" ? "bg-[#0B3475] text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  A
                </div>
                <div>
                  <p className="text-xs font-medium">Multiple Choice (MCQ)</p>
                  <p className="text-[10px] text-slate-500 font-normal">4 options with 1 verified correct choice</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setQuestionType("one_word")}
                className={`p-3 rounded-[var(--radius)] border flex items-center gap-2.5 font-semibold transition-colors text-left ${
                  questionType === "one_word"
                    ? "bg-blue-50/80 border-[#0B3475] text-[#0B3475] shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className={`w-7 h-7 rounded-[var(--radius)] flex items-center justify-center font-medium text-xs ${
                  questionType === "one_word" ? "bg-[#0B3475] text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  1
                </div>
                <div>
                  <p className="text-xs font-medium">One Word / Short Answer</p>
                  <p className="text-[10px] text-slate-500 font-normal">Single scientific term, acronym, or metric</p>
                </div>
              </button>
            </div>
          </div>


          {/* Module Dropdown (Populated from assigned subjects) */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700">
              Assigned Course Module *
            </label>
            <select
              value={selectedModule}
              onChange={(e) => handleModuleSelectChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
            >
              {availableModules.length > 0 ? (
                <>
                  {availableModules.map((m, idx) => (
                    <option key={m.id || idx} value={m.fullLabel}>
                      {m.fullLabel}
                    </option>
                  ))}
                  <option value="custom">✏️ Custom Module (Type module name below)</option>
                </>
              ) : (
                <>
                  <option value="Module 1: Atmospheric Dynamics">Module 1: Atmospheric Dynamics & Primitive Equations</option>
                  <option value="Module 2: Polarimetric Radar">Module 2: Doppler Weather Radar Polarimetric Analysis</option>
                  <option value="Module 3: Tropical Cyclogenesis">Module 3: Tropical Cyclogenesis & Dvorak Technique</option>
                  <option value="custom">✏️ Custom Module (Type module name below)</option>
                </>
              )}
            </select>
          </div>

          {/* Custom Module Input if selected */}
          {selectedModule === "custom" && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="block font-medium text-slate-700">
                Custom Module Name *
              </label>
              <input
                type="text"
                value={customModule}
                onChange={(e) => setCustomModule(e.target.value)}
                placeholder="e.g. Module 4: Numerical Boundary Layer Schemes"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
              />
            </div>
          )}

          {/* Subject & Topic Text Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Subject Name *
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Governing Equations & Dynamics"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Specific Topic / Prompt *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. CFL Numerical Stability Criterion, 4D-Var Assimilation"
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Target Difficulty & Question Count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Target Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="Easy">Easy (Conceptual / 2 Marks)</option>
                <option value="Medium">Medium (Analytical / 3 Marks)</option>
                <option value="Hard">Hard (Expert Scenario / 4 Marks)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                Number of Questions to Generate
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white rounded-[var(--radius)] font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate {count} {questionType === "one_word" ? "One-Word" : "MCQ"} Questions</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Results Preview List */}
        {generatedList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Generated Questions Preview ({generatedList.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select questions to import directly into your Question Bank.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allSelected = Object.keys(selectedToAdd).length === generatedList.length && Object.values(selectedToAdd).every(Boolean);
                  const selMap = {};
                  generatedList.forEach(q => {
                    selMap[q.id] = !allSelected;
                  });
                  setSelectedToAdd(selMap);
                }}
                className="text-xs font-semibold text-[#0B3475] hover:underline"
              >
                {Object.values(selectedToAdd).filter(Boolean).length === generatedList.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {generatedList.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className={`p-3.5 rounded-[var(--radius)] border text-xs transition-colors ${
                    selectedToAdd[q.id]
                      ? "bg-blue-50/40 border-blue-200"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={!!selectedToAdd[q.id]}
                      onChange={() =>
                        setSelectedToAdd(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className="mt-0.5 w-4 h-4 text-[#0B3475] rounded focus:ring-[#0B3475]"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          (q.type || "").includes("word") ? "bg-amber-100 text-amber-900" : "bg-[#0B3475] text-white"
                        }`}>
                          {(q.type || "").includes("word") ? "One Word" : "MCQ"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-[#0B3475]">
                          {q.difficulty}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {q.marks} Marks
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900">{q.question}</p>

                      {/* Display based on format */}
                      {(q.type || "").includes("word") || q.expectedAnswer ? (
                        <div className="p-2.5 rounded-[var(--radius)] bg-amber-50/80 border border-amber-200 space-y-1 text-slate-800">
                          <p className="font-medium text-amber-950">
                            Expected Answer: <span className="font-mono text-emerald-700">{q.expectedAnswer}</span>
                          </p>
                          {q.acceptedAnswers && q.acceptedAnswers.length > 1 && (
                            <p className="text-[10px] text-slate-500">
                              Accepted variants: {q.acceptedAnswers.join(", ")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-1 text-slate-700">
                          {(q.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-[var(--radius)] text-xs ${
                                q.correctAnswer === optIdx
                                  ? "bg-emerald-50 text-emerald-950 font-semibold border border-emerald-300"
                                  : "bg-white border border-slate-200"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-[11px] text-slate-700 bg-white p-2 rounded-[var(--radius)] border border-slate-200">
                          <b>Explanation:</b> {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {Object.values(selectedToAdd).filter(Boolean).length} of {generatedList.length} questions selected
              </span>
              <button
                type="button"
                onClick={handleAddSelectedToBank}
                disabled={importing || Object.values(selectedToAdd).filter(Boolean).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-[var(--radius)] text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing into Question Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Import Selected to Question Bank</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
