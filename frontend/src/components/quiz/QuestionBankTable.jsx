import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  MoreVertical, 
  FileEdit, 
  Copy, 
  Trash2, 
  Sparkles, 
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  X,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { ItemAnalysisDifficultQuestionsModal } from "../trainer/ItemAnalysisDifficultQuestionsModal";
import { api } from "../../services/api";

export const QuestionBankTable = ({ currentUser, onOpenAiGenerator, onNavigatePracticePapers, onStartExam, onOpenStudio }) => {
  const [questions, setQuestions] = useState([]);
  const [isItemAnalysisOpen, setIsItemAnalysisOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isGeneratePaperModalOpen, setIsGeneratePaperModalOpen] = useState(false);
  const [generatePaperCount, setGeneratePaperCount] = useState(10);
  const [generatePaperTitle, setGeneratePaperTitle] = useState("Adaptive Question Bank Drill");
  const [generatePaperTopic, setGeneratePaperTopic] = useState("");
  const [generatePaperError, setGeneratePaperError] = useState("");
  const [generatingPaper, setGeneratingPaper] = useState(false);

  const [newQuestionForm, setNewQuestionForm] = useState({
    question: "",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    module: "Module 1",
    marks: 2,
    type: "MCQ",
    difficulty: "Medium",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSubject !== "all") params.subjectId = selectedSubject;
      if (selectedType !== "all") params.type = selectedType;
      if (selectedDifficulty !== "all") params.difficulty = selectedDifficulty;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getQuestions(params);
      if (res?.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
      } else {
        const fallbackQuestions = [
          {
            id: "qb_nwp_101",
            subjectId: "sub_nwp_01",
            subjectName: "Governing Equations & Atmospheric Dynamics",
            module: "Module 1: Primitive Equations",
            question: "In operational NWP primitive equations, which vertical coordinate transformation is terrain-following?",
            options: [
              "Sigma Coordinate: σ = (p - p_top) / (p_sfc - p_top)",
              "Geometric Height z strictly above mean sea level",
              "Dry Static Energy Coordinate in the troposphere",
              "Geopotential Thickness Coordinate with fixed top"
            ],
            correctAnswer: 0,
            marks: 3,
            type: "MCQ",
            difficulty: "Medium",
            explanation: "Sigma terrain-following coordinates normalize surface pressure variations."
          },
          {
            id: "qb_nwp_102",
            subjectId: "sub_nwp_01",
            subjectName: "Governing Equations & Atmospheric Dynamics",
            module: "Module 1: Primitive Equations",
            question: "Why does the Arakawa C-grid staggering yield optimal gravity wave dispersion in hydrostatic atmospheric models?",
            options: [
              "It isolates mass and wind variables on opposite corners",
              "Velocity components u and v are staggered at flux cell faces while mass h resides at center",
              "It avoids solving horizontal pressure gradient terms",
              "It forces velocity to zero along closed boundaries"
            ],
            correctAnswer: 1,
            marks: 3,
            type: "MCQ",
            difficulty: "Hard",
            explanation: "The Arakawa C-grid evaluates divergence and pressure gradients over minimum grid distance Δx."
          },
          {
            id: "qb_dwr_103",
            subjectId: "sub_dwr_02",
            subjectName: "Radar Meteorology & Dual-Pol Processing",
            module: "Module 2: S-Band Radar Physics",
            question: "Which dual-polarization moment directly measures rain particle shape hydrometeor ellipticity?",
            options: [
              "Differential Reflectivity (ZDR)",
              "Specific Differential Phase (KDP)",
              "Copolar Correlation Coefficient (RHOHV)",
              "Radial Doppler Velocity (VR)"
            ],
            correctAnswer: 0,
            marks: 2,
            type: "MCQ",
            difficulty: "Medium",
            explanation: "ZDR measures horizontal vs vertical radar cross-section ratio."
          },
          {
            id: "qb_cyc_104",
            subjectId: "sub_cyc_03",
            subjectName: "Tropical Cyclogenesis & Storm Surge",
            module: "Module 3: Dvorak Technique",
            question: "What T-number corresponds to a Severe Cyclonic Storm (SCS) with maximum sustained winds of 48-63 knots?",
            options: ["T2.5", "T3.5", "T4.5", "T5.5"],
            correctAnswer: 1,
            marks: 3,
            type: "MCQ",
            difficulty: "Medium",
            explanation: "T3.5 corresponds to 55 knots on the Dvorak CI scale."
          }
        ];
        setQuestions(fallbackQuestions);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedType, selectedDifficulty]);

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const isOneWord = (newQuestionForm.type || "").toLowerCase().includes("word") || (newQuestionForm.type || "").toLowerCase().includes("short");
      const payload = {
        ...newQuestionForm,
        type: isOneWord ? "one_word" : "MCQ",
        expectedAnswer: isOneWord ? (newQuestionForm.expectedAnswer || newQuestionForm.options?.[0] || "") : "",
        acceptedAnswers: isOneWord && newQuestionForm.expectedAnswer ? [newQuestionForm.expectedAnswer] : [],
        createdBy: currentUser?.id || "u_trainer_1",
        createdByEmail: currentUser?.email || null,
        createdByName: currentUser?.name || null,
        createdByRole: currentUser?.role || "trainer"
      };

      const res = await api.createQuestion(payload);
      if (res?.success) {
        setIsCreateModalOpen(false);
        setNewQuestionForm({
          question: "",
          subjectId: "sub_nwp_01",
          subjectName: "Governing Equations & Dynamics",
          module: "Module 1",
          topic: "",
          marks: 2,
          type: "MCQ",
          difficulty: "Medium",
          options: ["", "", "", ""],
          correctAnswer: 0,
          expectedAnswer: "",
          explanation: ""
        });
        await fetchQuestions();
      } else {
        alert(res?.message || "Failed to create question");
      }
    } catch (err) {
      alert("Failed to create question: " + err.message);
    }
  };

  const handleDuplicate = async (id) => {
    setActiveMenuId(null);
    try {
      const res = await api.duplicateQuestion(id);
      if (res.success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  const handleDelete = async (id) => {
    setActiveMenuId(null);
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const displayedQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const qLower = searchQuery.toLowerCase();
    return q.question.toLowerCase().includes(qLower) || (q.module && q.module.toLowerCase().includes(qLower));
  });

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto text-[#172033]">
      {/* Top Header & Toolbar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left search & subject selector */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search question bank..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white text-[#172033]"
              />
            </div>

            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="sub_nwp_01">Subject 1: Governing Equations & Dynamics</option>
                <option value="sub_nwp_02">Subject 2: Data Assimilation & Radiance</option>
                <option value="sub_dwr_01">Subject 1: Radar Hardware & Base Products</option>
                <option value="sub_dwr_02">Subject 2: Severe Storm Signatures</option>
                <option value="sub_cyc_01">Subject 1: Cyclogenesis & Dvorak Technique</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsGeneratePaperModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              title="Assemble an adaptive practice test from the Question Bank"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Adaptive Drill</span>
            </button>

            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 shadow-xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </button>

            {onOpenAiGenerator && (
              <button
                onClick={onOpenAiGenerator}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>AI Generator</span>
              </button>
            )}

            <button
              onClick={() => setIsItemAnalysisOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium shadow-xs transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Item Analysis</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Create Question</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer */}
        {showFilterModal && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-[#475569] font-medium mr-2">Question Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg font-medium text-[#172033]"
              >
                <option value="all">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="Descriptive">Descriptive</option>
                <option value="One Word">One Word</option>
              </select>
            </div>

            <div>
              <span className="text-[#475569] font-medium mr-2">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-[#E2E8F0] rounded-lg font-medium text-[#172033]"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedType("all");
                setSelectedDifficulty("all");
                setSelectedSubject("all");
                setSearchQuery("");
              }}
              className="text-[#2563EB] font-medium hover:underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Questions Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50/70 text-[#475569] font-semibold select-none">
                <th className="py-3.5 px-4 w-1/2">
                  <div className="flex items-center gap-1.5">
                    <span>Question</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 w-20 text-center">Marks</th>
                <th className="py-3.5 px-4 w-28 text-center">Type</th>
                <th className="py-3.5 px-4 w-44">Labels</th>
                <th className="py-3.5 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Loading Question Bank...
                  </td>
                </tr>
              ) : displayedQuestions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No questions found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                displayedQuestions.map((q) => {
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 align-middle">
                        <p className="font-normal text-[#172033] leading-relaxed max-w-2xl line-clamp-2">
                          {q.question}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center font-medium text-[#172033] align-middle">
                        {q.marks || 2}
                      </td>

                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${
                            q.type === "MCQ"
                              ? "bg-blue-100 text-[#2563EB]"
                              : q.type === "Descriptive"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {q.type === "MCQ" ? "MCQ" : q.type === "Descriptive" ? "Descriptive" : "One Word"}
                        </span>
                      </td>

                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <div>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-medium ${
                                q.difficulty === "Hard"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : q.difficulty === "Medium"
                                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              Difficulty: {q.difficulty || "Medium"}
                            </span>
                          </div>
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              Module: {q.module || "Module 1"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center align-middle relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === q.id ? null : q.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === q.id && (
                          <div className="absolute right-6 top-8 w-36 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1.5 z-40 text-left">
                            <button
                              onClick={() => {
                                setPreviewQuestion(q);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#172033] hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => {
                                setNewQuestionForm({ ...q });
                                setIsCreateModalOpen(true);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#172033] hover:bg-slate-50 transition-colors"
                            >
                              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDuplicate(q.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[#172033] hover:bg-slate-50 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Duplicate</span>
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => handleDelete(q.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#2563EB] text-white">
                  {previewQuestion.type}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {previewQuestion.marks} Marks
                </span>
              </div>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <h3 className="text-base font-semibold text-[#172033] leading-snug">
                {previewQuestion.question}
              </h3>

              {previewQuestion.options && previewQuestion.options.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {previewQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs flex items-center gap-3 ${
                        previewQuestion.correctAnswer === i
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                          : "bg-slate-50 border-[#E2E8F0] text-slate-700"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-medium shrink-0 text-slate-600">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {previewQuestion.correctAnswer === i && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : previewQuestion.expectedAnswer ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-[#172033]">
                  <span className="font-semibold block text-amber-950">🔑 Expected Answer / Keyword:</span>
                  <p className="font-mono text-emerald-800 font-medium text-sm">{previewQuestion.expectedAnswer}</p>
                </div>
              ) : null}

              {previewQuestion.explanation && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900">
                  <span className="font-semibold block mb-1">Explanation:</span>
                  <p>{previewQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E2E8F0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  {newQuestionForm.id ? "Edit Assessment Question" : "Create New Assessment Question"}
                </h2>
                <p className="text-[11px] text-[#475569]">
                  Add domain questions directly into your Question Bank.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#172033] mb-1">Question Prompt *</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  placeholder="Enter the problem or question here..."
                  className="w-full p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:ring-1 focus:ring-[#2563EB] focus:outline-none text-[#172033] font-normal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Question Format</label>
                  <select
                    value={newQuestionForm.type}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium text-[#172033]"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="One Word">One Word / Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">Difficulty Level</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none"
                  >
                    <option value="Easy">Easy (Conceptual)</option>
                    <option value="Medium">Medium (Analytical)</option>
                    <option value="Hard">Hard (Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">Marks Assigned</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newQuestionForm.marks}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.subjectName}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subjectName: e.target.value })}
                    placeholder="e.g. Governing Equations & Dynamics"
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">Module</label>
                  <input
                    type="text"
                    value={newQuestionForm.module}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, module: e.target.value })}
                    placeholder="e.g. Module 1"
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">Topic Name</label>
                  <input
                    type="text"
                    value={newQuestionForm.topic || ""}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                    placeholder="e.g. Core Topic"
                    className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {newQuestionForm.type === "MCQ" && (
                <div className="space-y-2 pt-2">
                  <label className="block font-medium text-[#172033]">
                    Multiple Choice Options (Select radio button for the correct option)
                  </label>
                  {newQuestionForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestionForm.correctAnswer === i}
                        onChange={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: i })}
                        className="w-4 h-4 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="w-5 text-center font-medium text-slate-500">
                        {String.fromCharCode(65 + i)}:
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newQuestionForm.options];
                          updated[i] = e.target.value;
                          setNewQuestionForm({ ...newQuestionForm, options: updated });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 p-2 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* One Word / Short Answer Expected Answer */}
              {newQuestionForm.type === "One Word" && (
                <div className="space-y-1.5 pt-2">
                  <label className="block font-medium text-[#172033]">
                    Expected Single Word / Keyword Answer *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.expectedAnswer || ""}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, expectedAnswer: e.target.value })}
                    placeholder="e.g. Core Keyword"
                    className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-lg focus:bg-white focus:outline-none font-medium text-[#172033]"
                  />
                </div>
              )}

              <div>
                <label className="block font-medium text-[#172033] mb-1">Explanation / Solution Note</label>
                <textarea
                  rows={2}
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  placeholder="Reference notes or explanations..."
                  className="w-full p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-medium shadow-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE ADAPTIVE PAPER MODAL */}
      {isGeneratePaperModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-7 shadow-xl border border-[#E2E8F0] text-[#172033] relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#172033]">
                    Generate Adaptive Question Paper
                  </h2>
                  <p className="text-[11px] text-[#475569]">
                    Assemble practice test from {questions.length} questions in Question Bank
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGeneratePaperModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setGeneratePaperError("");
                setGeneratingPaper(true);
                try {
                  let pool = [...questions];
                  if (selectedSubject !== "all") {
                    pool = pool.filter(q => q.subjectId === selectedSubject);
                  }

                  const enteredTopic = (generatePaperTopic || "").trim();
                  if (enteredTopic) {
                    const topicLower = enteredTopic.toLowerCase();
                    const topicTokens = topicLower
                      .split(/[\s,./\-&]+/)
                      .map(t => t.trim())
                      .filter(t => t.length > 2);

                    const matchedQuestions = pool.filter(q => {
                      const searchableText = `${q.question || ""} ${q.subjectName || ""} ${q.module || ""} ${q.topic || ""} ${q.explanation || ""} ${(q.options || []).join(" ")}`.toLowerCase();
                      if (searchableText.includes(topicLower)) return true;
                      return topicTokens.some(token => searchableText.includes(token));
                    });

                    if (matchedQuestions.length === 0) {
                      setGeneratePaperError(`For this topic "${enteredTopic}", questions do not exist in the question bank.`);
                      setGeneratingPaper(false);
                      return;
                    }

                    pool = matchedQuestions;
                  }

                  if (pool.length === 0) {
                    setGeneratePaperError(`For this topic "${enteredTopic}", questions do not exist in the question bank.`);
                    setGeneratingPaper(false);
                    return;
                  }

                  pool = pool.sort(() => 0.5 - Math.random());
                  const pickedQuestions = pool.slice(0, Number(generatePaperCount) || 10);

                  const newQuiz = {
                    id: `paper_qb_${Date.now()}`,
                    title: generatePaperTitle || (enteredTopic ? `${enteredTopic} Adaptive Drill` : "Adaptive Question Bank Drill"),
                    courseId: "crs_nwp_101",
                    courseName: "Question Bank Adaptive Practice",
                    trainerName: "Adaptive Testing Engine",
                    totalMarks: pickedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20,
                    passMarks: Math.round((pickedQuestions.reduce((acc, q) => acc + (q.marks || 2), 0) || 20) * 0.5),
                    durationMinutes: Number(generatePaperCount) * 2,
                    questionCount: pickedQuestions.length,
                    isAdaptive: true,
                    initialDifficulty: "Medium",
                    questions: pickedQuestions,
                    createdAt: new Date().toISOString()
                  };

                  await api.createQuiz(newQuiz);
                  setIsGeneratePaperModalOpen(false);
                  setGeneratePaperError("");
                  
                  if (onStartExam) {
                    onStartExam(newQuiz);
                  } else if (onNavigatePracticePapers) {
                    onNavigatePracticePapers();
                  } else {
                    alert(`Generated "${newQuiz.title}" with ${pickedQuestions.length} questions! Saved to Practice Papers.`);
                  }
                } catch (err) {
                  setGeneratePaperError("Failed creating question paper: " + err.message);
                } finally {
                  setGeneratingPaper(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-medium text-[#172033] mb-1">
                  Practice Paper Title:
                </label>
                <input
                  type="text"
                  required
                  value={generatePaperTitle}
                  onChange={(e) => setGeneratePaperTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#172033] mb-1">
                  Topic / Domain Focus (Optional):
                </label>
                <input
                  type="text"
                  value={generatePaperTopic}
                  onChange={(e) => {
                    setGeneratePaperTopic(e.target.value);
                    if (generatePaperError) setGeneratePaperError("");
                  }}
                  placeholder="e.g. Radar, Dynamics, Cyclone"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              {generatePaperError && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-xs text-amber-900">
                        Topic Questions Not Found in Question Bank
                      </h4>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        {generatePaperError}
                      </p>
                    </div>
                  </div>
                  {onOpenAiGenerator && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsGeneratePaperModalOpen(false);
                        onOpenAiGenerator();
                      }}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Switch to AI Question Generator</span>
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#172033] mb-1">
                    Number of Questions:
                  </label>
                  <select
                    value={generatePaperCount}
                    onChange={(e) => setGeneratePaperCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none"
                  >
                    <option value={5}>5 Questions (Speed Drill)</option>
                    <option value={10}>10 Questions (Standard)</option>
                    <option value={15}>15 Questions (Full Drill)</option>
                    <option value={20}>20 Questions (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#172033] mb-1">
                    Subject Filter:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172033] focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Subjects Pool</option>
                    <option value="sub_nwp_01">Atmospheric Dynamics</option>
                    <option value="sub_nwp_02">Data Assimilation</option>
                    <option value="sub_dwr_01">Doppler Radar</option>
                    <option value="sub_cyc_01">Cyclone Warning</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-900 space-y-0.5">
                <span className="font-semibold flex items-center gap-1 text-[#2563EB]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Dynamic Adaptive Testing Enabled
                </span>
                <p className="text-blue-800">
                  Question difficulty dynamically scales to test concept coverage across selected subjects.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGeneratePaperModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-[#475569] font-medium rounded-lg text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingPaper}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors disabled:opacity-60"
                >
                  {generatingPaper ? "Generating..." : "Generate & Start Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ItemAnalysisDifficultQuestionsModal
        isOpen={isItemAnalysisOpen}
        onClose={() => setIsItemAnalysisOpen(false)}
        currentUser={currentUser}
        onOpenStudio={onOpenStudio}
      />

    </div>
  );
};
