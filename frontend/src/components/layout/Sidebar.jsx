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
        { id: "profile", label: "Professional Profile", icon: FileText },
        { id: "helpdesk", label: "Helpdesk", icon: ShieldCheck }
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
        { id: "profile", label: "Professional Profile", icon: FileText },
        { id: "helpdesk", label: "Helpdesk", icon: ShieldCheck }
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
      { id: "analytics", label: "Competency Passport", icon: BarChart3 },
      { id: "helpdesk", label: "Helpdesk", icon: ShieldCheck }
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
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full select-none shrink-0 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white-600 text-white flex items-center justify-center  text-sm shadow-md shadow-white-900/50">
            <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQApAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcBBQgDBAL/xAA8EAABBAECAggDBQYGAwAAAAABAAIDBAUGESExBxITQVFhcYEUIjJCcoKRoSNSorHB0RUkNWKD8AgXM//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABYRAQEBAAAAAAAAAAAAAAAAAAARAf/aAAwDAQACEQMRAD8AvFERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBFgnZQDVHSxgsJakp1WyZG1GdniAgRsPgXHmfTdBYCKoqfTfWMu17CTxxb/VFMHkex2Vk6e1BjdRURcxNls0XJw22cw+DgeIKDaIiICIiAiIgIiICIiAiIgIiICIiAiIgrvpp1HPhdOx0qUro7WRcY+u07FkY4uI8CeA91z4OAAHADkFcH/kJWlM2Dt8exAmiPk49Uj9GlVAi4wpDoTUU2mdS1bscjhXe8RWmdz4zz38xzB/uo+sshksyMrwgmWVwjYB3uJ2H6lCOw4zuwHffcc1+l5VWGOtFG47ljA0n0C9UQREQEREBERAREQEREBERARE3QEXhbtV6Vd9i3PHBAwbvkkcGtHuVWupumPFUw+HAQnIzjcCZ27IQfXm724HxQTTWen6mpdP2cdcf2QcA+Obh+yeOTv6HyXNupdN5bTVl0WWqujj3+Sw3jFIPEO/oeK9dR6tzmpX75a698Q4itF8kQ/D3++6+nBa81Fg63wtS62aqODa9uPtWNHgOO4HluiozG4SyNjhPaPdwDGfMSfAAcSrd6KujyzDk4M1qCM1zF89SnIR13u/fcO4DuHuo1/7S1AwH4WphabjwMlaj1XH3Lj/JRS3l8ndyH+I2shakujbq2O1Ie37pG3V9Bsg65HJZVAaY6XszjTHBmo25OsOBk+iZvvyd77eqtvTOtsDqUBuNvN+I+1WmHUkb7Hn6jcIiSIsbhZQEREBERAREQEREBERAWg1tnptNadsZeCo238O5nXic/qfK5waTvseW+/put+o50gXMfR0fk5Mu2R1N8XZPbEAXuLz1QBvw33PegqTM6z0jq2Rr9S4rMV3t+l9e512M9G77fwrXx6T0rlyG6c1exk7j8tbKQ9k4+h2APsCo/lMXVbj4sphrFiai6TsZm2QBNXl23AdtwII5OHDgRzWmIBBBAI8wit9n9H5/TzXSZTHvFYDcWoT2kRHj1hy9wFolvdO6wzunXAY+641/tVZwZInD7pPD2IUjdjsFr2GSXT8MeI1Gxpe/G7gQ2u8mM8gf+kd6Cv161Kti7ZZWpwSzzyfTFEwucfYKQ6Y0fYystqxlZDisVQcRetTDYxuHNjQebv5ea2d7XMGJryY3QdJuMqbdV117OtZn/wB25+n33Pog8qvRxkIa7bepshQwFYjcfFzNMh/CDt+vsv2yDo4xb935HN5qaM7/ALBvw8e/kdmn33KhlmxPbndYtzy2JnHcyzPL3H3PFZqVp7lqGpVjMk8zwyNg73HkguzRvSWMtm8dgMZhrDYZC4Ge3bMr2sa0uJPPfltxd3q1ByVHdFp09htbNoR2rVvJyRPr/EBrRW644uaz7X2D8x4HbzCvFvIIjKIiAiIgIiICIiAiIgKEdMtOW50f3+waXOgfFMQO9rXgu/Ibn2U3XlYijnhfDMwSRPaWvY4bhwPMIOW9L/t4s3jXkGKzjZJfSSHaRh/Q/mtErL1zpenoCCebHSWLDsu19SAyAdWrGSC8b83EgbA9w8VWiLgvSvPNVsRWK0r4p4nh8cjDs5pHeCvNEVLdca4taqr0KxYK8EUTX2I2cGy2PtOPiOW3qoksLKEFvNJO+GnyWSb/APWhjZ5YfKRwEbT7dcrRrZ6cuMqZLs54XT1bsTqdiFh2c9knD5fAh3VI9ENbjonpSWtfYdsLXFlZ75pD+61rHDj7kD3XTQUQ0DoWjpBlh8c8lu5PsHzyNDS1o5NAHLz8fyUwRkREQEREBERAREQEREBaHVGYGP8AgaEMnVvZOwK8A34gc3v9m77eey3pK546QtWWD0lf4hUcHjDyiGBjj8pLTu/03JIJ8ggsnpkw/wAboWV1aEukoSRysa0bkN36rtvwuJ9lzvuNyNxuDsR4LpXB9JOlsvCwnJw05yPmr23dm4HwBPA+xX1X6GjdRD/NxYe4/kJAYy8ejhxH5oOYUVx6o6Gonxus6WuFp5ipYd1mk+DX8x77+yqTI0LmLuSU8jWkrWo/rikGxHn4EeYRqvnRO7dS/RvR5mtUdSw1opY48rUzd+v9xvAn14BBEFJujLGHMa2xcYjMleKbtpnAbhoYC4b/AIg0e6uHEdG+jsDGHX4obsw+qTIua4b/AHD8o/Jb9+odLYmD/VcVWiZw6rZWNA8gAjJqXKMwMtHJTuDaks7atk7/AEh/0u9nbezit+0gjcHfdUR0s6/o6iqMw2G3mqCQSTzuYWh5HJrQeO3eT6Kx+ijNuzei6T5nl9irvVmJO5JZsAT5luxQTFERAREQEREBERAREQYK5z1n0f6jq6gyM9bGz3atizJPHNXb19w9xdsQOII38O5dGog5araG1ZaIbDp+8fORojH8ZCkVDoW1BZaH25cfUd3BxMhH5f3XQaIKbo9FGqcaQ/H6w+GeOQiErW/l1tj7hfRqDTGqchRFTUtKrnImDaLIUi2O3X8w07B48W8N1biIOetO6Eux3XTSYtuXlY//AC9dzuzr7d0kzncf+MfNvzAUzyGj9f5tgF7VNfHw7cKtFj2MaPDdpBPuVaOwHILKCjLnQpmZd3uzlSy4cR20b9yfUkqOZLot1Zj3OdHimW2fv1JWO/QkH9CulkQcqt0dqdz+oNP5Hrb7bfDkcfXl+qvHoj0zf0zpyaLKgMtWrHbmEODuzHVa0AkcN/l7lOUQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREH/9k=" alt="" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">Capacity Connect</h1>
            <p className="text-[11px] text-slate-400 font-medium">Capacity Building Platform</p>
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                ? "bg-blue-600/20 text-blue-400 font-semibold border-r-2 border-blue-500"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
              {isAdvisor && (
                <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User & Role Footer */}
      <div className="border-t border-slate-800 p-3 space-y-2.5 bg-slate-950/50">
        <button
          type="button"
          onClick={() => { setActiveTab("profile"); if (onCloseMobile) onCloseMobile(); }}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-blue-500/50 text-left transition-all shadow-xs"
        >
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
            alt={currentUser?.name || "User"}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
          />
          <div className="flex flex-col overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{currentUser?.name || "Guest User"}</p>
            <span className="text-[10px] font-medium text-blue-400 truncate">{roleLabel}</span>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800/50 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800/60 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition-all"
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-50 h-full w-64 animate-in slide-in-from-left duration-200">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};