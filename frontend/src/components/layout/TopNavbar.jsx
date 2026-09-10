import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Sparkles, Building2 } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements, onOpenAiGenerator }) => {
  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Executive Dashboard";
      case "courses": return "Course Catalog & Curricula";
      case "my-learning": return "Enrolled Programs";
      case "content-library": return "Trainer Content Library";
      case "schedule-assessment": return "Schedule Assessments";
      case "questions": return "Question Bank Management";
      case "quizzes": return "Assessments Engine";
      case "trainee-quizzes": return "My Scheduled Assessments";
      case "certificates": return "Certified Credentials";
      case "profile": return "Professional Officer Profile";
      case "approvals": return "Officer Approvals Queue";
      case "credential-verification": return "Trainer Credential Verification";
      case "org-structure": return "Organization Hierarchy & Scope";
      case "competency": return "Competency Mapping Matrix";
      case "announcements": return "National Directives & Circulars";
      case "analytics": return "Platform Analytics & Radar";
      case "audit-logs": return "Governance & Security Audit Logs";
      default: return "Portal";
    }
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between z-20 shrink-0 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building2 className="w-4 h-4 text-[#0a2558]" />
          <span className="font-semibold text-slate-500">MoES / IMD</span>
          <span>/</span>
        </div>
        <span className="font-extrabold text-slate-800 tracking-tight text-sm">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Verification Status Pill */}
        {currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-bold animate-pulse shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Registration In Review</span>
          </div>
        )}

        {currentUser?.status === "approved" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Officer ({currentUser.role.toUpperCase()})</span>
          </div>
        )}

        {/* AI Generator Shortcut Button */}
        {(currentUser?.role === "trainer" || currentUser?.role === "admin") && onOpenAiGenerator && (
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 hover:from-blue-800 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Question Drafter</span>
          </button>
        )}

        {/* Announcements Trigger */}
        <button
          onClick={onOpenAnnouncements}
          title="MoES Directives & Circulars"
          className="p-2 rounded-xl text-slate-500 hover:text-[#0a2558] hover:bg-slate-100 transition-colors relative border border-slate-200 shadow-sm"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};
