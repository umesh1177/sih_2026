import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Sparkles, Building2, Globe, ChevronDown, Languages } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements, onOpenAiGenerator }) => {
  const { currentUser } = useAuth();
  const [selectedLang, setSelectedLang] = useState("EN");
  const [isBhashiniOpen, setIsBhashiniOpen] = useState(false);

  const languages = [
    { code: "EN", name: "English", native: "English" },
    { code: "HI", name: "Hindi", native: "हिन्दी" },
    { code: "BN", name: "Bengali", native: "বাংলা" },
    { code: "TE", name: "Telugu", native: "తెలుగు" },
    { code: "TA", name: "Tamil", native: "தமிழ்" },
    { code: "MR", name: "Marathi", native: "मराठी" },
    { code: "GU", name: "Gujarati", native: "ગુજરાતી" },
    { code: "KN", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ML", name: "Malayalam", native: "മലയാളം" },
    { code: "PA", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "OR", name: "Odia", native: "ଓଡ଼ିଆ" },
    { code: "AS", name: "Assamese", native: "অসমীয়া" }
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Executive Dashboard";
      case "courses": return "Course Catalog & Curricula";
      case "subjects": return "Subject Modules";
      case "questions": return "Questions";
      case "quizzes": return "Assessments & Quizzes";
      case "schedule-assessment": return "Schedule Assessments";
      case "content-library": return "Trainer Content Library";
      case "trainee-quizzes": return "Scheduled Assessments";
      case "my-learning": return "Enrolled Programs";
      case "certificates": return "Certified Credentials";
      case "profile": return "Professional Officer Profile";
      case "approvals": return "Officer Approvals Queue";
      case "competency": return "Competency Mapping Matrix";
      case "announcements": return "Directives & Circulars";
      case "analytics": return "Performance Analytics";
      default: return "Portal";
    }
  };

  const handleSelectLang = (code) => {
    setSelectedLang(code);
    setIsBhashiniOpen(false);
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between z-20 shrink-0 shadow-sm relative">
      {/* Breadcrumb matching Screenshot 1 & 3 */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building2 className="w-4 h-4 text-[#0a2558]" />
          <span className="font-semibold text-slate-500">MoES / IMD</span>
          <span>/</span>
        </div>
        <span className="font-extrabold text-slate-800 tracking-tight text-sm">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* BHASHINI AI Multilingual Dropdown (Govt of India Initiative) */}
        <div className="relative">
          <button
            onClick={() => setIsBhashiniOpen(!isBhashiniOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl text-xs font-bold text-slate-800 shadow-xs transition-all"
            title="Bhashini - National Language Translation Mission"
          >
            <div className="w-4 h-4 rounded-full bg-[#0a2558] flex items-center justify-center text-[8px] text-white font-black">
              भा
            </div>
            <span className="font-bold text-[11px] text-[#0a2558]">BHASHINI</span>
            <span className="px-1.5 py-0.5 bg-white text-blue-900 border border-blue-200 rounded text-[9px] font-mono font-bold">
              {selectedLang}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isBhashiniOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-extrabold text-slate-900">Bhashini AI Translator</span>
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 max-h-56 overflow-y-auto">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLang(l.code)}
                    className={`flex flex-col items-start px-2 py-1.5 rounded-lg text-left transition-colors ${
                      selectedLang === l.code ? "bg-[#0a2558] text-white" : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold">{l.native}</span>
                    <span className={`text-[9px] ${selectedLang === l.code ? "text-blue-200" : "text-slate-400"}`}>
                      {l.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trainee Pending Approval Warning Pill */}
        {currentUser?.role === "trainee" && currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-bold animate-pulse shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>Profile In Administrative Review</span>
          </div>
        )}

        {currentUser?.status === "approved" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Officer</span>
          </div>
        )}

        {/* AI Generator Shortcut Button */}
        {(currentUser?.role === "trainer" || currentUser?.role === "admin") && onOpenAiGenerator && (
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Quiz Generator</span>
          </button>
        )}

        {/* Announcements Trigger */}
        <button
          onClick={onOpenAnnouncements}
          title="MoES Notifications"
          className="p-2 rounded-xl text-slate-500 hover:text-[#0a2558] hover:bg-slate-100 transition-colors relative border border-slate-200 shadow-sm"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
