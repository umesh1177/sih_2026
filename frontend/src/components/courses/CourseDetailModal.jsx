import React, { useState } from "react";
import { 
  X, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Download, 
  Lock, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Layers, 
  Award,
  Clock,
  User,
  Plus
} from "lucide-react";
import { api } from "../../services/api";

const formatVideoEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return "https://www.youtube.com/embed/NRE2up9GxAI";
  let cleanUrl = url.trim();
  if (cleanUrl.includes("youtu.be/")) {
    const parts = cleanUrl.split("youtu.be/")[1];
    const videoId = parts ? parts.split("?")[0].split("&")[0].split("/")[0] : null;
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }
  if (cleanUrl.includes("youtube.com/watch")) {
    try {
      const urlObj = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
      const v = urlObj.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (e) {}
  }
  if (cleanUrl.includes("youtube.com/embed/")) {
    return cleanUrl;
  }
  return cleanUrl;
};

export const CourseDetailModal = ({ course, isOpen, onClose, currentUser, onEnrollSuccess }) => {
  const [activeTab, setActiveTab] = useState("curriculum"); // "curriculum" | "feedback" | "upload"
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Feedback state
  const [feedbackForm, setFeedbackForm] = useState({
    trainerRating: 5,
    contentRating: 5,
    relevanceRating: 5,
    comment: ""
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Trainer Material Upload state
  const [uploadForm, setUploadForm] = useState({
    subjectId: course?.subjects?.[0]?.id || "",
    moduleId: course?.subjects?.[0]?.modules?.[0]?.id || "",
    title: "",
    type: "pdf",
    url: "",
    duration: "45 mins",
    allowDownload: true
  });

  if (!isOpen || !course) return null;

  const isEnrolled = (course.enrolledTraineeIds || []).includes(currentUser?.id);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const res = await api.enrollCourse(course.id, currentUser?.id);
      if (res.success) {
        if (onEnrollSuccess) onEnrollSuccess();
        alert("Successfully enrolled in " + course.title);
      }
    } catch (err) {
      alert("Enrollment failed: " + err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        courseId: course.id,
        traineeId: currentUser?.id || "u_trainee_1",
        traineeName: currentUser?.name || currentUser?.email || "Officer Trainee",
        ...feedbackForm
      };
      const res = await api.submitFeedback(payload);
      if (res.success) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      alert("Feedback submission failed: " + err.message);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await api.uploadMaterial(course.id, uploadForm.subjectId, uploadForm.moduleId, {
        title: uploadForm.title,
        type: uploadForm.type,
        url: uploadForm.url || "https://example.com/material.pdf",
        duration: uploadForm.duration,
        allowDownload: uploadForm.allowDownload
      });
      if (res.success) {
        alert("Learning material uploaded successfully with download permissions configured!");
        onClose();
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {course.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {course.department}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {course.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lead Trainer: <b>{course.leadTrainerName}</b> • Duration: {course.duration}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEnrolled && currentUser?.role === "trainee" && (
              <button
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl text-xs font-bold shadow-md transition-all transform hover:scale-105"
              >
                {isEnrolling ? "Enrolling..." : "Enroll in Course"}
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === "curriculum" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
            }`}
          >
            📚 Subjects & Learning Modules
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === "feedback" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
            }`}
          >
            ⭐ Course & Trainer Feedback
          </button>
          {(currentUser?.role === "trainer" || currentUser?.role === "admin") && (
            <button
              onClick={() => setActiveTab("upload")}
              className={`pb-2 px-4 border-b-2 transition-colors ${
                activeTab === "upload" ? "border-[#0a2558] text-[#0a2558]" : "border-transparent text-slate-400"
              }`}
            >
              📤 Upload Content (Trainer Library)
            </button>
          )}
        </div>

        {/* Tab 1: Curriculum & Materials */}
        {activeTab === "curriculum" && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs">
            <p className="text-slate-600 leading-relaxed">{course.description}</p>

            {/* Subjects and Modules List */}
            <div className="space-y-4 mt-3">
              {course.subjects && course.subjects.map(subject => (
                <div key={subject.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-sm text-[#0a2558] mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span>{subject.name}</span>
                  </h3>

                  <div className="space-y-2.5 pl-2">
                    {subject.modules && subject.modules.map(mod => (
                      <div key={mod.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800">{mod.title}</span>
                          <span className="text-[10px] text-slate-400">{mod.duration}</span>
                        </div>

                        {/* Learning Materials items */}
                        <div className="space-y-1.5 mt-2">
                          {mod.materials && mod.materials.map(mat => (
                            <div
                              key={mat.id}
                              className="p-2 bg-slate-50 hover:bg-blue-50/50 rounded-lg flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {mat.type === "video" ? (
                                  <PlayCircle className="w-4 h-4 text-rose-600" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-600" />
                                )}
                                <span className="font-medium text-slate-700">{mat.title}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {mat.type === "video" ? (
                                  <button
                                    onClick={() => setActiveMaterial(mat)}
                                    className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded text-[10px] hover:bg-rose-100"
                                  >
                                    Watch Video
                                  </button>
                                ) : mat.allowDownload ? (
                                  <button
                                    onClick={() => alert("Downloading: " + mat.title)}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded text-[10px] hover:bg-blue-100"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download PDF</span>
                                  </button>
                                ) : (
                                  <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 font-medium rounded text-[10px]" title="Trainer restricted download">
                                    <Lock className="w-3 h-3" />
                                    <span>View Only (Protected)</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Feedback Submission */}
        {activeTab === "feedback" && (
          <div className="py-2 text-xs">
            {feedbackSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-emerald-900">Thank you for your feedback!</h3>
                <p className="text-emerald-700 text-[11px] mt-1">
                  Your review has been submitted to the MoES Academic Oversight Committee.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4 max-w-lg mx-auto">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1">Trainer Delivery</label>
                    <select
                      value={feedbackForm.trainerRating}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, trainerRating: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-bold text-center"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1">Content Quality</label>
                    <select
                      value={feedbackForm.contentRating}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, contentRating: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-bold text-center"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="block font-semibold text-slate-700 mb-1">IMD Relevance</label>
                    <select
                      value={feedbackForm.relevanceRating}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, relevanceRating: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-bold text-center"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Observations & Suggestions</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    placeholder="Share how this training directly impacted your operational shift duties at IMD..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md"
                  >
                    Submit Official Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Trainer Upload Content */}
        {activeTab === "upload" && (
          <form onSubmit={handleUploadMaterial} className="py-2 space-y-4 max-w-lg mx-auto text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Subject</label>
                <select
                  value={uploadForm.subjectId}
                  onChange={(e) => setUploadForm({ ...uploadForm, subjectId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {course.subjects && course.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Type</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="pdf">PDF Study Document</option>
                  <option value="presentation">PPT Presentation</option>
                  <option value="video">Recorded Video Lecture</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Material Title *</label>
              <input
                type="text"
                required
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g. Masterclass: Dual-Pol Hydrometeor Classification Deck"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Download permission toggle */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">Allow Trainees to Download</p>
                <p className="text-[11px] text-slate-500">If disabled, file will be restricted to in-portal view only</p>
              </div>
              <input
                type="checkbox"
                checked={uploadForm.allowDownload}
                onChange={(e) => setUploadForm({ ...uploadForm, allowDownload: e.target.checked })}
                className="w-4 h-4 text-[#0a2558] rounded"
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                className="px-6 py-2 bg-[#0a2558] text-white rounded-xl font-bold shadow-md"
              >
                Upload to Module
              </button>
            </div>
          </form>
        )}

        {/* Video Player Modal */}
        {activeMaterial && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/10 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="font-bold text-sm">{activeMaterial.title}</h3>
                <button onClick={() => setActiveMaterial(null)} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src={formatVideoEmbedUrl(activeMaterial?.url)}
                  title={activeMaterial?.title || "Lecture Video"}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
