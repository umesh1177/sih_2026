import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Building2 } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements }) => {
  const { currentUser } = useAuth();

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
      case "practice-papers": return "AI Practice Papers & Adaptive Tests";
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

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between z-20 shrink-0 shadow-sm relative select-none">
      {/* Breadcrumb matching Screenshot */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Building2 className="w-4 h-4 text-[#0a2558]" />
          <span className="font-semibold text-slate-500">MoES / IMD</span>
          <span>/</span>
        </div>
        <span className="font-extrabold text-slate-800 tracking-tight text-sm">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Controls: Verified Officer Tag + Notification Icon */}
      <div className="flex items-center gap-3">
        {/* Trainee Pending Approval Warning Pill */}
        {currentUser?.role === "trainee" && currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-bold animate-pulse shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>Profile In Administrative Review</span>
          </div>
        )}

        {/* Verified Officer Tag */}
        {currentUser?.status === "approved" && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Officer</span>
          </div>
        )}

        {/* Announcements Trigger Notification Icon */}
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
