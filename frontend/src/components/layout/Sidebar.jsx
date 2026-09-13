import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Layers,
  BarChart3,
  BellRing,
  UserCheck,
  GraduationCap,
  Award,
  LogOut,
  FolderKanban,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Star,
  Users,
  ShieldCheck
} from "lucide-react";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenLoginPage,
  onOpenAiAdvisor,
  isOpenMobile,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();

  // Role based navigation items per spec
  const getNavItems = () => {
    if (currentUser?.role === "trainer") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "courses", label: "Course Catalog", icon: BookOpen },
        { id: "trainee-performance", label: "Learner Performance", icon: TrendingUp },
        { id: "learning-gaps", label: "Learning Gaps", icon: ShieldAlert },
        { id: "schedule-assessment", label: "Assessments", icon: ClipboardList },
        { id: "questions", label: "Question Bank", icon: Layers },
        { id: "content-library", label: "Learning Resources", icon: FolderKanban },
        { id: "certificates", label: "Credentials", icon: Award },
        { id: "profile", label: "Professional Profile", icon: FileText }
      ];
    }

    if (currentUser?.role === "admin") {
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "courses", label: "Course Catalog", icon: BookOpen },
        { id: "trainer-matching", label: "People & Workload", icon: Users },
        { id: "trainee-performance", label: "Learning Progress", icon: TrendingUp },
        { id: "course-feedback", label: "Governance & Quality", icon: Star },
        { id: "learning-gaps", label: "Competency & Gaps", icon: ShieldAlert },
        { id: "approvals", label: "User Approvals", icon: UserCheck },
        { id: "announcements", label: "Communication", icon: BellRing },
        { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
        { id: "profile", label: "Professional Profile", icon: FileText }
      ];
    }

    // Trainee view
    return [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "courses", label: "Course Catalog", icon: BookOpen },
      { id: "learning-gaps", label: "Learning Gaps", icon: ShieldAlert },
      { id: "ai-course-advisor", label: "Course Advisor", icon: Sparkles, isModalTrigger: true },
      { id: "my-learning", label: "My Learning", icon: GraduationCap },
      { id: "trainee-quizzes", label: "Assessments", icon: ClipboardList },
      { id: "practice-papers", label: "Practice", icon: Sparkles },
      { id: "questions", label: "Question Bank", icon: Layers },
      { id: "certificates", label: "Certificates", icon: Award },
      { id: "profile", label: "Professional Profile", icon: FileText },
      { id: "analytics", label: "Competency Passport", icon: BarChart3 }
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    if (onOpenLoginPage) onOpenLoginPage();
  };

  const handleItemClick = (item) => {
    if (item.isModalTrigger && onOpenAiAdvisor) {
      onOpenAiAdvisor();
    } else {
      setActiveTab(item.id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const roleLabel = currentUser?.role === "admin" 
    ? "Administrator" 
    : currentUser?.role === "trainer" 
    ? "Faculty Trainer" 
    : "Trainee";

  const sidebarContent = (
    <div className="w-64 bg-white text-slate-700 flex flex-col h-full select-none shrink-0 border-r border-slate-200 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            CC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-tight">Capacity Connect</h1>
            <p className="text-[11px] text-slate-500 font-medium">Capacity Building Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdvisor = item.isModalTrigger;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
              {isAdvisor && (
                <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Role Footer */}
      <div className="border-t border-slate-200/80 p-3 space-y-2.5 bg-slate-50/50">
        <button
          type="button"
          onClick={() => { setActiveTab("profile"); if (onCloseMobile) onCloseMobile(); }}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 text-left transition-colors shadow-xs"
        >
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt={currentUser?.name || "User"}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
          />
          <div className="flex flex-col overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">{currentUser?.name || "Guest User"}</p>
            <span className="text-[10px] font-medium text-blue-600 truncate">{roleLabel}</span>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen shrink-0 z-30">{sidebarContent}</aside>
      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-50 h-full w-64 animate-in slide-in-from-left duration-200">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
