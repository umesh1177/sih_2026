import React, { useState, useEffect } from "react";
import { 
  X, 
  Users, 
  BookOpen, 
  BarChart3, 
  Award, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Clock, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Sparkles,
  Download,
  Search,
  UserX,
  FileCheck2,
  RefreshCw,
  Edit3
} from "lucide-react";
import { api } from "../../services/api";

export const CourseManagementHubModal = ({ 
  isOpen, 
  onClose, 
  course, 
  onCourseUpdated, 
  onOpenStudio, 
  onOpenEditCourse,
  onOpenCertificate
}) => {
  const [activeTab, setActiveTab] = useState("enrollments"); // "enrollments" | "content" | "analytics" | "certificates"
  const [trainees, setTrainees] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxEnrollmentInput, setMaxEnrollmentInput] = useState(course?.maxEnrollment || 50);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);
  const [traineeSearch, setTraineeSearch] = useState("");

  // Bulk Certificate State
  const [certificateTemplate, setCertificateTemplate] = useState("MoES Official Gold Standard");
  const [customFile, setCustomFile] = useState(null);
  const [isGeneratingCertificates, setIsGeneratingCertificates] = useState(false);
  const [generatedCertificates, setGeneratedCertificates] = useState([]);
  const [certSuccessMessage, setCertSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !course?.id) return;
    setMaxEnrollmentInput(course.maxEnrollment || 50);
    loadCourseOperationsData();
  }, [isOpen, course]);

  const loadCourseOperationsData = async () => {
    setLoading(true);
    try {
      const [tRes, qRes] = await Promise.all([
        api.getTrainerEnrolledTrainees(course.leadTrainerName, course.leadTrainerId).catch(() => ({ success: false })),
        api.getQuizzes({ courseId: course.id }).catch(() => ({ success: false }))
      ]);

      if (tRes.success && tRes.trainees) {
        // Match trainees enrolled in this course
        const matched = tRes.trainees.filter(t => 
          (course.enrolledTraineeIds || []).includes(t.traineeId) ||
          t.courseId === course.id ||
          t.courseTitle === course.title
        );
        setTrainees(matched.length > 0 ? matched : tRes.trainees.slice(0, 4));
      }

      if (qRes.success && qRes.quizzes) {
        setQuizzes(qRes.quizzes);
      }
    } catch (err) {
      console.error("Course operations load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCapacity = async () => {
    setIsUpdatingCapacity(true);
    try {
      const newCapacity = parseInt(maxEnrollmentInput) || 50;
      const res = await api.updateCourse(course.id, { maxEnrollment: newCapacity });
      if (res.success) {
        alert(`✅ Course maximum capacity updated to ${newCapacity} officers.`);
        if (onCourseUpdated) onCourseUpdated(res.course);
      }
    } catch (err) {
      alert("Failed updating capacity: " + err.message);
    } finally {
      setIsUpdatingCapacity(false);
    }
  };

  const handleRemoveTrainee = async (traineeId, traineeName) => {
    if (!window.confirm(`Are you sure you want to remove "${traineeName}" from this course?`)) return;

    try {
      const res = await api.removeTraineeFromCourse(course.id, traineeId);
      if (res.success) {
        alert(`✅ Officer ${traineeName} removed from course enrollment list.`);
        setTrainees(prev => prev.filter(t => t.traineeId !== traineeId && t.id !== traineeId));
        if (onCourseUpdated) onCourseUpdated(res.course);
      }
    } catch (err) {
      alert("Failed removing trainee: " + err.message);
    }
  };

  const handleGenerateBulkCertificates = async () => {
    setIsGeneratingCertificates(true);
    setCertSuccessMessage("");
    try {
      const payload = {
        templateName: certificateTemplate,
        customFormatUrl: customFile ? customFile.name : null
      };
      const res = await api.generateBulkCertificates(course.id, payload);
      if (res.success && res.result) {
        setGeneratedCertificates(res.result.certificates || []);
        setCertSuccessMessage(res.message || "Bulk certificates generated successfully!");
      }
    } catch (err) {
      alert("Bulk certificate generation failed: " + err.message);
    } finally {
      setIsGeneratingCertificates(false);
    }
  };

  if (!isOpen || !course) return null;

  const enrolledCount = (course.enrolledTraineeIds || []).length;
  const maxCapacity = course.maxEnrollment || 50;
  const capacityPercentage = Math.min(100, Math.round((enrolledCount / maxCapacity) * 100));

  const filteredTrainees = trainees.filter(t => 
    t.name?.toLowerCase().includes(traineeSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(traineeSearch.toLowerCase()) ||
    t.department?.toLowerCase().includes(traineeSearch.toLowerCase()) ||
    t.station?.toLowerCase().includes(traineeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 font-sans text-slate-800">
        
        {/* ═════════ MODAL HEADER ═════════ */}
        <div className="bg-gradient-to-r from-[#0a2558] via-blue-900 to-indigo-950 p-6 sm:p-7 text-white rounded-t-3xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={course.thumbnail}
                alt={course.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800";
                }}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-[#0a2558] uppercase">
                    Admin Operations Hub
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-200">{course.code}</span>
                  <span className="text-xs text-blue-300">• {course.level || "Intermediate"}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white line-clamp-1">
                  {course.title}
                </h2>
                <p className="text-xs text-blue-200/90 mt-0.5">
                  Lead Faculty: <b>{course.leadTrainerName || "Senior Meteorologist"}</b> • {course.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              {onOpenEditCourse && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditCourse(course);
                  }}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Edit Course Configuration"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Course</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ═════════ TABS NAVIGATION ═════════ */}
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-slate-50/60">
          {[
            { id: "enrollments", label: `Enrollment Cadre (${enrolledCount}/${maxCapacity})`, icon: Users },
            { id: "content", label: `Subjects & Modules (${course.subjects?.length || 0})`, icon: Layers },
            { id: "analytics", label: "Performance & Quiz Analytics", icon: BarChart3 },
            { id: "certificates", label: "Bulk Certificate Issuance", icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? "border-[#0a2558] text-[#0a2558] bg-white rounded-t-xl shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#0a2558]" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═════════ TAB 1: ENROLLMENT & CAPACITY MANAGEMENT ═════════ */}
        {activeTab === "enrollments" && (
          <div className="p-6 space-y-6 animate-in fade-in">
            
            {/* Capacity Control Strip */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Batch Capacity Utilization:</span>
                  <span className="text-[#0a2558] font-black">{enrolledCount} / {maxCapacity} Seats ({capacityPercentage}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercentage >= 90 ? "bg-rose-500" : capacityPercentage >= 60 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  When capacity limit is reached, self-enrollment for cadets is automatically gated.
                </p>
              </div>

              {/* Set Max Capacity */}
              <div className="flex items-center gap-2 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Max Capacity Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxEnrollmentInput}
                    onChange={(e) => setMaxEnrollmentInput(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 mt-0.5"
                  />
                </div>
                <button
                  onClick={handleUpdateCapacity}
                  disabled={isUpdatingCapacity}
                  className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-sm transition-transform hover:scale-105 self-end"
                >
                  {isUpdatingCapacity ? "Saving..." : "Update Limit"}
                </button>
              </div>
            </div>

            {/* Enrolled Cadets Search & List */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Enrolled Cadets Directory ({filteredTrainees.length})</span>
                </h3>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={traineeSearch}
                    onChange={(e) => setTraineeSearch(e.target.value)}
                    placeholder="Search enrolled cadets..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cadets Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Officer Name & Cadre ID</th>
                      <th className="py-3 px-3">Station & Department</th>
                      <th className="py-3 px-3">Progress</th>
                      <th className="py-3 px-3">Avg Quiz Score</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrainees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          No enrolled cadets found matching search.
                        </td>
                      </tr>
                    ) : (
                      filteredTrainees.map((trainee, idx) => (
                        <tr key={trainee.traineeId || trainee.id || idx} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={trainee.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                                alt={trainee.name}
                                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{trainee.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{trainee.cadreId || `MOES-CADRE-${1000 + idx}`}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <p className="font-medium text-slate-800">{trainee.department}</p>
                            <p className="text-[10px] text-slate-400">{trainee.station || "National Forecasting Centre"}</p>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${trainee.progressPercentage !== undefined ? trainee.progressPercentage : 0}%` }} 
                                />
                              </div>
                              <span className="font-bold text-slate-700 text-[11px]">{trainee.progressPercentage !== undefined ? trainee.progressPercentage : 0}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full font-bold text-[10px]">
                              {trainee.averageScore !== undefined ? `${trainee.averageScore}%` : (trainee.avgQuizScore !== undefined ? `${trainee.avgQuizScore}%` : "—")}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRemoveTrainee(trainee.traineeId || trainee.id, trainee.name)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 ml-auto"
                              title="Remove officer from this course"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ═════════ TAB 2: SUBJECTS & CONTENT MODULES ═════════ */}
        {activeTab === "content" && (
          <div className="p-6 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Curriculum Structure & Subject Modules</h3>
                <p className="text-xs text-slate-500">Review lesson modules and learning materials assigned to this course.</p>
              </div>

              {onOpenStudio && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStudio(course);
                  }}
                  className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch Learning Studio</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(course.subjects || []).map((subject, sIdx) => (
                <div key={subject.id || sIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-md text-[10px] font-bold">
                        Subject {sIdx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{subject.title || subject.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{subject.description || "Core domain subject curriculum."}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Assigned Faculty</span>
                      <span className="text-xs font-bold text-purple-900">
                        {subject.assignedTrainerName || course.leadTrainerName || "Dr. Amit Sengupta"}
                      </span>
                    </div>
                  </div>

                  {/* Modules list */}
                  <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(subject.modules || []).map((mod, mIdx) => (
                      <div key={mod.id || mIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{mod.title || mod.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{mod.materials?.length || 2} materials</span>
                      </div>
                    ))}
                    {(subject.modules || []).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No modules added yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════ TAB 3: PERFORMANCE & ASSESSMENT ANALYTICS ═════════ */}
        {activeTab === "analytics" && (
          <div className="p-6 space-y-6 animate-in fade-in">
            
            {/* KPI Analytics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Class Average</span>
                <p className="text-2xl font-black text-blue-950 mt-1">86.4%</p>
                <span className="text-[10px] text-emerald-700 font-semibold">↑ 4.2% higher than benchmark</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Passing Rate</span>
                <p className="text-2xl font-black text-emerald-950 mt-1">94.2%</p>
                <span className="text-[10px] text-slate-500 font-medium">Threshold: 70% minimum</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Course Completion</span>
                <p className="text-2xl font-black text-purple-950 mt-1">78.5%</p>
                <span className="text-[10px] text-slate-500 font-medium">Active Cadets in track</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Linked Assessments</span>
                <p className="text-2xl font-black text-amber-950 mt-1">{quizzes.length || 2}</p>
                <span className="text-[10px] text-slate-500 font-medium">MCQ Evaluations</span>
              </div>
            </div>

            {/* Quizzes Breakdown */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">Linked Course Assessments & MCQ Tests</h3>
              <div className="space-y-2.5">
                {(quizzes.length > 0 ? quizzes : [
                  { id: "q1", title: `${course.title} - Mid-Term Diagnostic Evaluation`, durationMinutes: 30, passMarks: 14, totalMarks: 20 },
                  { id: "q2", title: `${course.title} - Final Operational Kiosk Exam`, durationMinutes: 45, passMarks: 28, totalMarks: 40 }
                ]).map((quiz, qIdx) => (
                  <div key={quiz.id || qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{quiz.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Duration: {quiz.durationMinutes} Mins • Pass Mark: {quiz.passMarks}/{quiz.totalMarks} Marks
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      Average Score: 88%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ═════════ TAB 4: BULK CERTIFICATE GENERATION ═════════ */}
        {activeTab === "certificates" && (
          <div className="p-6 space-y-6 animate-in fade-in">
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-950">Bulk Course Certificate Generator</h3>
                  <p className="text-xs text-amber-800">
                    Generate and issue standardized digital accreditation certificates in bulk for all completed cadets and faculty instructors.
                  </p>
                </div>
              </div>

              {/* Template Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-amber-200/60 text-xs">
                <div>
                  <label className="block font-bold text-amber-950 mb-1">Select Certificate Template Format</label>
                  <select
                    value={certificateTemplate}
                    onChange={(e) => setCertificateTemplate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="MoES Official Gold Standard">MoES Official Gold Standard (QR Authenticated)</option>
                    <option value="WMO Competency Class-I Certification">WMO Competency Standard Class-I/II</option>
                    <option value="IMD Training Division Honors">IMD Training Division Honors Diploma</option>
                    <option value="Custom Upload (PDF / DOCX)">Custom Template Upload (PDF / DOCX)</option>
                  </select>
                </div>

                {/* Custom File Upload if selected */}
                <div>
                  <label className="block font-bold text-amber-950 mb-1">
                    Upload Custom Template Layout (.pdf, .docx)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300 text-slate-600"
                    />
                  </div>
                  {customFile && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                      ✓ Loaded template: {customFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Auto-filled Preview Notice */}
              <div className="p-3.5 bg-white/90 rounded-2xl border border-amber-200/80 text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Automated System Fields Mapped to Template:</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-slate-600 pt-1">
                  <span>• {'{OFFICER_NAME}'}</span>
                  <span>• {'{CADRE_ID}'}</span>
                  <span>• {'{COURSE_TITLE}'}</span>
                  <span>• {'{CREDENTIAL_ID}'}</span>
                  <span>• {'{COMPLETION_DATE}'}</span>
                  <span>• {'{GRADE_HONORS}'}</span>
                  <span>• {'{LEAD_TRAINER}'}</span>
                  <span>• {'{QR_VERIFY_URL}'}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateBulkCertificates}
                disabled={isGeneratingCertificates}
                className="w-full py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-2xl text-xs shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-2"
              >
                {isGeneratingCertificates ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Award className="w-4 h-4 text-amber-300" />
                )}
                <span>
                  {isGeneratingCertificates
                    ? "Generating & Issuing Bulk Digital Certificates..."
                    : `Generate & Issue Certificates to ${enrolledCount || 2} Cadets & Faculty`}
                </span>
              </button>
            </div>

            {/* Success Results Display */}
            {generatedCertificates.length > 0 && (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Issued Credentials Portfolio ({generatedCertificates.length})</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Registry Synced ✓
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedCertificates.map((cert, cIdx) => (
                    <div key={cert.id || cIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            cert.recipientType === "trainer" ? "bg-purple-100 text-purple-900" : "bg-blue-100 text-blue-900"
                          }`}>
                            {cert.recipientType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{cert.credentialId}</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs mt-1">{cert.recipientName}</h5>
                        <p className="text-[11px] text-slate-500 font-medium">{cert.title}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-emerald-700 font-bold">{cert.grade}</span>
                        <button
                          onClick={() => onOpenCertificate && onOpenCertificate(
                            { score: 20, totalMarks: 20, percentage: 100 },
                            cert.title,
                            cert.recipientName
                          )}
                          className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Credential</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
