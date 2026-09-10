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
  Layers,
  HelpCircle
} from "lucide-react";
import { api } from "../../services/api";

export const QuestionBankTable = ({ currentUser, onOpenAiGenerator, onNavigatePracticePapers, onStartExam }) => {
  const [questions, setQuestions] = useState([]);
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
  const [generatingPaper, setGeneratingPaper] = useState(false);

  // New Question Form state
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
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedType, selectedDifficulty]);

  // Handle manual question creation
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createQuestion(newQuestionForm);
      if (res.success) {
        setIsCreateModalOpen(false);
        setNewQuestionForm({
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
        fetchQuestions();
      }
    } catch (err) {
      alert("Failed to create question: " + err.message);
    }
  };

  // Duplicate question
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

  // Delete question
  const handleDelete = async (id) => {
    setActiveMenuId(null);
    if (!window.confirm("Are you sure you want to delete this question from the Question Bank?")) return;
    try {
      const res = await api.deleteQuestion(id);
      if (res.success) {
        fetchQuestions();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Filtered in-memory list if search text changes
  const displayedQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const qLower = searchQuery.toLowerCase();
    return q.question.toLowerCase().includes(qLower) || (q.module && q.module.toLowerCase().includes(qLower));
  });

  return (
    <div className="p-6 bg-[#f8fafc] min-h-full">
      {/* Top Header & Toolbar matching Screenshot 1 & 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left search & subject selector */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0a2558] focus:bg-white text-slate-800"
              />
            </div>

            {/* Subject Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0a2558] cursor-pointer"
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

          {/* Right Action Buttons matching Screenshot 1 & 3 */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            {/* Generate Adaptive Practice Paper CTA */}
            <button
              onClick={() => setIsGeneratePaperModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all transform hover:scale-[1.02]"
              title="Assemble an adaptive practice test from the Question Bank"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ Generate Adaptive Paper</span>
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
            </button>

            {/* AI Generate Button */}
            {onOpenAiGenerator && (
              <button
                onClick={onOpenAiGenerator}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all transform hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>AI Generate</span>
              </button>
            )}

            {/* + Create Question Button matching deep navy brand */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-lg text-xs font-bold shadow-md transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>+ Create Question</span>
            </button>
          </div>
        </div>

        {/* Filter Drawer if expanded */}
        {showFilterModal && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-150">
            <div>
              <span className="text-slate-500 font-medium mr-2">Question Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
              >
                <option value="all">All Types</option>
                <option value="MCQ">MCQ</option>
                <option value="Descriptive">Descriptive</option>
                <option value="One Word">One Word</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 font-medium mr-2">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
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
              className="text-blue-700 font-medium hover:underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Questions Data Table strictly matching Screenshots 1 & 3 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold select-none">
                <th className="py-3.5 px-4 w-1/2">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900">
                    <span>Question</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 w-20 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900">
                    <span>Marks</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
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
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Question Text */}
                      <td className="py-4 px-4 align-middle">
                        <p className="font-normal text-slate-800 leading-relaxed max-w-2xl line-clamp-2">
                          {q.question}
                        </p>
                      </td>

                      {/* Marks */}
                      <td className="py-4 px-4 text-center font-semibold text-slate-700 align-middle">
                        {q.marks || 2}
                      </td>

                      {/* Type Badge matching reference styling */}
                      <td className="py-4 px-4 text-center align-middle">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                            q.type === "MCQ"
                              ? "bg-[#0a2558] text-white"
                              : q.type === "Descriptive"
                              ? "bg-[#085287] text-white"
                              : "bg-[#0f766e] text-white"
                          }`}
                        >
                          {q.type === "MCQ" ? "MCQ" : q.type === "Descriptive" ? "Descriptive" : "One Word"}
                        </span>
                      </td>

                      {/* Labels Column (Difficulty & Module badges) */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col gap-1">
                          {/* Difficulty Pill */}
                          <div>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
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
                          {/* Module Pill */}
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              Module: {q.module || "Module 1"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions Popover Button matching Screenshot 1 & 3 */}
                      <td className="py-4 px-4 text-center align-middle relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === q.id ? null : q.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Menu Popup matching screenshot exactly */}
                        {activeMenuId === q.id && (
                          <div className="absolute right-6 top-8 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setPreviewQuestion(q);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
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
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDuplicate(q.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0a2558] text-white">
                  {previewQuestion.type}
                </span>
                <span className="text-xs font-semibold text-slate-500">
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
              <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {previewQuestion.question}
              </h3>

              {previewQuestion.options && previewQuestion.options.length > 0 && (
                <div className="space-y-2 mt-3">
                  {previewQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
                        previewQuestion.correctAnswer === i
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-medium"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold shrink-0 text-slate-600">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                      {previewQuestion.correctAnswer === i && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {previewQuestion.explanation && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                  <span className="font-bold block mb-1">Scientific Explanation:</span>
                  <p>{previewQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-[#0a2558] text-white rounded-lg text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {newQuestionForm.id ? "Edit Question" : "Create New Assessment Question"}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  placeholder="Enter the meteorological problem or question here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0a2558] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Type</label>
                  <select
                    value={newQuestionForm.type}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="Descriptive">Descriptive Question</option>
                    <option value="One Word">One Word / Numerical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks Assigned</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newQuestionForm.marks}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Association</label>
                  <select
                    value={newQuestionForm.subjectId}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subjectId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="sub_nwp_01">Subject 1: Governing Equations & Dynamics</option>
                    <option value="sub_nwp_02">Subject 2: Data Assimilation & Radiance</option>
                    <option value="sub_dwr_01">Subject 1: Radar Hardware & Base Products</option>
                    <option value="sub_dwr_02">Subject 2: Severe Storm Signatures</option>
                    <option value="sub_cyc_01">Subject 1: Cyclogenesis & Dvorak Technique</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Module Label</label>
                  <input
                    type="text"
                    value={newQuestionForm.module}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, module: e.target.value })}
                    placeholder="e.g. Module 1, Module 2"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {newQuestionForm.type === "MCQ" && (
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-slate-700">
                    Multiple Choice Options (Select radio for correct answer)
                  </label>
                  {newQuestionForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestionForm.correctAnswer === i}
                        onChange={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: i })}
                        className="w-4 h-4 text-[#0a2558] focus:ring-[#0a2558]"
                      />
                      <span className="w-5 text-center font-bold text-slate-500">
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
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Explanation / Solution Note</label>
                <textarea
                  rows={2}
                  value={newQuestionForm.explanation}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                  placeholder="Reference formulas, physics equations, or IMD SOP notes..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-lg font-bold shadow-md"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════ GENERATE ADAPTIVE PAPER FROM QUESTION BANK MODAL ═════════ */}
      {isGeneratePaperModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Generate Adaptive Question Paper
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Assemble practice test from {questions.length} questions in Question Bank
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGeneratePaperModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setGeneratingPaper(true);
                try {
                  let pool = [...questions];
                  if (selectedSubject !== "all") {
                    pool = pool.filter(q => q.subjectId === selectedSubject);
                  }
                  pool = pool.sort(() => 0.5 - Math.random());
                  const pickedQuestions = pool.slice(0, Number(generatePaperCount) || 10);

                  const newQuiz = {
                    id: `paper_qb_${Date.now()}`,
                    title: generatePaperTitle,
                    courseId: "crs_nwp_101",
                    courseName: "Question Bank Adaptive Practice",
                    trainerName: "MoES Adaptive Engine",
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
                  
                  if (onStartExam) {
                    onStartExam(newQuiz);
                  } else if (onNavigatePracticePapers) {
                    onNavigatePracticePapers();
                  } else {
                    alert(`✅ Generated "${newQuiz.title}" with ${pickedQuestions.length} questions! Saved to AI Practice Papers.`);
                  }
                } catch (err) {
                  alert("Failed creating question paper: " + err.message);
                } finally {
                  setGeneratingPaper(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Practice Paper Title:
                </label>
                <input
                  type="text"
                  required
                  value={generatePaperTitle}
                  onChange={(e) => setGeneratePaperTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Number of Questions:
                  </label>
                  <select
                    value={generatePaperCount}
                    onChange={(e) => setGeneratePaperCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Questions (Speed Drill)</option>
                    <option value={10}>10 Questions (Standard)</option>
                    <option value={15}>15 Questions (Full Drill)</option>
                    <option value={20}>20 Questions (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subject Filter:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Subjects Pool</option>
                    <option value="sub_nwp_01">Atmospheric Dynamics</option>
                    <option value="sub_nwp_02">Data Assimilation</option>
                    <option value="sub_dwr_01">Doppler Radar</option>
                    <option value="sub_cyc_01">Cyclone Warning</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1 text-[#0a2558]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Dynamic Adaptive Testing Enabled:
                </span>
                <p className="text-blue-800">
                  Real-time question difficulty calibration dynamically scales to ensure comprehensive concept coverage across selected subjects.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGeneratePaperModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingPaper}
                  className="px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-60"
                >
                  {generatingPaper ? "Generating..." : "⚡ Generate & Start Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

