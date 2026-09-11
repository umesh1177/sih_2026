import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Building2, Sparkles, Menu } from "lucide-react";

export const TopNavbar = ({ 
  activeTab, 
  onOpenAnnouncements, 
  onOpenAiCourseAdvisor, 
  onToggleMobileSidebar 
}) => {
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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-2xs relative select-none">
      {/* Left: Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 text-xs overflow-hidden pr-2">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400 shrink-0">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-500">MoES / IMD</span>
          <span>/</span>
        </div>
        <span className="font-extrabold text-slate-800 tracking-tight text-xs sm:text-sm truncate">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Right Controls: AI Course Advisor + Verified Officer Tag + Notification Icon */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Dynamic AI Course Advisor Trigger Button for Trainees */}
        {currentUser?.role === "trainee" && (
          <button
            onClick={onOpenAiCourseAdvisor}
            title="Get Personalized AI Course Recommendations"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs hover:shadow-sm transition-all transform hover:scale-[1.02] active:scale-95 group border border-blue-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform shrink-0" />
            <span className="tracking-wide hidden xs:inline sm:inline">AI Advisor</span>
          </button>
        )}

        {/* Trainee Pending Approval Warning Pill */}
        {currentUser?.role === "trainee" && currentUser?.status === "pending" && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-bold animate-pulse shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
            <span>Under Review</span>
          </div>
        )}

        {/* Verified Officer Tag */}
        {currentUser?.status === "approved" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Verified Officer</span>
          </div>
        )}

        {/* Announcements Trigger Notification Icon */}
        <button
          onClick={onOpenAnnouncements}
          title="MoES Notifications"
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors relative border border-slate-200 shadow-2xs shrink-0"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
};


