import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, AlertTriangle, CheckCircle2, Building2, Sparkles, Menu } from "lucide-react";

export const TopNavbar = ({ activeTab, onOpenAnnouncements, onOpenAiCourseAdvisor, onToggleMobileSidebar }) => {
  const { currentUser } = useAuth();

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "courses": return "Course Catalog";
      case "subjects": return "Subject Modules";
      case "questions": return "Question Bank";
      case "quizzes": return "Assessments";
      case "schedule-assessment": return "Schedule Assessments";
      case "content-library": return "Learning Resources";
      case "trainee-quizzes": return "Assessments";
      case "practice-papers": return "Practice";
      case "my-learning": return "My Learning";
      case "certificates": return "Certificates";
      case "profile": return "Profile";
      case "approvals": return "Officer Approvals";
      case "competency": return "Competency Passport";
      case "announcements": return "Communication";
      case "analytics": return "Reports & Analytics";
      case "trainer-matching": return "People & Workload";
      case "trainee-performance": return "Learner Performance";
      case "learning-gaps": return "Learning Gaps";
      case "course-feedback": return "Governance & Quality";
      default: return "Portal";
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-[var(--radius)] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="font-medium text-slate-500 hidden sm:inline">Capacity Connect</span>
            <span className="hidden sm:inline">/</span>
          </div>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">{getBreadcrumbTitle()}</span>
        </div>
      </div>

      {/* Right Controls: AI Course Advisor + Verified Officer Tag + Notification Icon */}
      <div className="flex items-center gap-2.5">
        {/* Dynamic AI Course Advisor Trigger Button for Trainees */}
        {currentUser?.role === "trainee" && (
          <button
            onClick={onOpenAiCourseAdvisor}
            title="Get Smart Course Recommendations"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-[var(--radius)] text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Course Advisor</span>
          </button>
        )}

        {/* Trainee Pending Approval Warning Pill */}
        {currentUser?.role === "trainee" && currentUser?.status === "pending" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-[var(--radius)] text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Under Review</span>
          </div>
        )}

        {/* Verified Officer Tag */}
        {currentUser?.status === "approved" && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[var(--radius)] text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Verified</span>
          </div>
        )}

        {/* Announcements Trigger Notification Icon */}
        <button
          onClick={onOpenAnnouncements}
          title="Directives & Circulars"
          className="p-2 rounded-[var(--radius)] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative border border-slate-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};


