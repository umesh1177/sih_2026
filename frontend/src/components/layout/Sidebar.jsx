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
  Building2,
  FolderKanban,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Star,
  Users,
  X
} from "lucide-react";

export const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  onOpenLoginPage, 
  onOpenHomePage, 
  onOpenAiAdvisor,
  isOpenMobile,
  onCloseMobile
}) => {
  const { currentUser, logout } = useAuth();

  // Role based navigation links
  const getNavItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "courses", label: "Course Catalog", icon: BookOpen },
    ];

    if (currentUser?.role === "trainer") {
      return [
        ...baseItems,
        { id: "trainee-performance", label: "Learner Performance", icon: TrendingUp },
        { id: "learning-gaps", label: "Learning Gap Detection", icon: ShieldAlert },
        { id: "schedule-assessment", label: "Assessments", icon: ClipboardList },
        { id: "questions", label: "Question Bank", icon: Layers },
        { id: "content-library", label: "Learning Resources", icon: FolderKanban },
        { id: "certificates", label: "Credentials", icon: Award },
        { id: "profile", label: "Profile", icon: FileText },
      ];
    }

    if (currentUser?.role === "admin") {
      return [
        ...baseItems,
        { id: "trainer-matching", label: "People & Workload", icon: Users },
        { id: "trainee-performance", label: "Learning", icon: TrendingUp },
        { id: "course-feedback", label: "Governance & Quality", icon: Star },
        { id: "learning-gaps", label: "Competency & Gaps", icon: ShieldAlert },
        { id: "approvals", label: "Officer Approvals", icon: UserCheck },
        { id: "announcements", label: "Communication", icon: BellRing },
        { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
        { id: "profile", label: "Profile", icon: FileText },
      ];
    }

    // Trainee view
    return [
      ...baseItems,
      { id: "learning-gaps", label: "Learning Gaps", icon: ShieldAlert },
      { id: "ai-course-advisor", label: "Course Advisor", icon: Sparkles, isModalTrigger: true },
      { id: "my-learning", label: "My Learning", icon: GraduationCap },
      { id: "trainee-quizzes", label: "Assessments", icon: ClipboardList },
      { id: "practice-papers", label: "Practice", icon: Sparkles },
      { id: "questions", label: "Question Bank", icon: Layers },
      { id: "certificates", label: "Certificates", icon: Award },
      { id: "profile", label: "Profile", icon: FileText },
      { id: "analytics", label: "Competency Passport", icon: BarChart3 },
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

  const sidebarContent = (
    <div className="w-64 bg-[#0B3475] text-slate-200 flex flex-col h-full select-none shrink-0 border-r border-[#123F82] shadow-sm">
      {/* Brand Header */}
      <div className="p-4.5 border-b border-white/10 flex items-center justify-between bg-[#08285C]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-xs tracking-wider shadow-sm shrink-0">
            CC
          </div>
          <div className="overflow-hidden">
            <h1 className="font-semibold text-sm tracking-tight text-white uppercase truncate">
              CAPACITY CONNECT
            </h1>
            <p className="text-[10px] text-blue-200/80 font-normal tracking-wide truncate">
              Learning & Assessment Portal
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {onOpenHomePage && (
          <button
            onClick={() => {
              onOpenHomePage();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/20 transition-all text-left mb-2"
          >
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Public Portal & Verify</span>
          </button>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAdvisor = item.isModalTrigger;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-left ${
                isActive
                  ? "bg-white/15 text-white font-semibold border-l-3 border-blue-400 shadow-2xs"
                  : isAdvisor
                  ? "bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 border border-amber-400/20"
                  : "text-slate-200 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-300" : isAdvisor ? "text-amber-300" : "text-slate-300"}`} />
              <span className="truncate">{item.label}</span>
              {isAdvisor && (
                <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-medium uppercase tracking-wider">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile Card & Sign Out */}
      <div className="border-t border-white/10 bg-[#07214A] p-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab("profile");
            if (onCloseMobile) onCloseMobile();
          }}
          title="Click to view Profile"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 shadow-2xs overflow-hidden transition-all text-left cursor-pointer group"
        >
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt="User"
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20 shrink-0"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium text-white truncate group-hover:text-blue-200 transition-colors">
              {currentUser?.name || "Officer"}
            </p>
            <p className="text-[10px] text-slate-300 truncate capitalize">
              {currentUser?.designation || currentUser?.department || currentUser?.role || "Cadre Member"}
            </p>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/20 text-rose-200 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

