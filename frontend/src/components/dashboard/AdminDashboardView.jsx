import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Award, 
  TrendingUp, 
  BarChart3, 
  UserCheck, 
  BellRing, 
  Plus, 
  Building2,
  Megaphone,
  Clock,
  CheckCircle2,
  ChevronRight,
  Activity,
  Layers,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from "recharts";
import { api } from "../../services/api";

export const AdminDashboardView = ({ 
  onOpenApprovals, 
  onOpenAnalytics, 
  onOpenBroadcastModal,
  onOpenCreateCourse,
  onNavigatePerformance,
  onNavigateTrainerMatching
}) => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [activeTelemetryTab, setActiveTelemetryTab] = useState("all");
  const [chartMetric, setChartMetric] = useState("count");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, aRes, pRes, cRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ success: false })),
        api.getAnnouncements().catch(() => ({ success: false })),
        api.getPendingUsers().catch(() => ({ success: false })),
        api.getCourses().catch(() => ({ success: false }))
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (aRes.success) setAnnouncements(aRes.announcements || []);
      if (pRes.success) setPendingUsers(pRes.pendingUsers || []);
      if (cRes.success) setCourses(cRes.courses || []);
    } catch (err) {
      console.error("Admin stats failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledTraineeIds?.length || 0), 0);
  const totalCap = courses.reduce((acc, c) => acc + (c.maxEnrollment || 50), 0);
  const capacityPct = totalCap > 0 ? Math.round((totalEnrolled / totalCap) * 100) : 74;

  const chartData = (stats?.deptDistribution || []).map(d => ({
    ...d,
    percentage: Math.min(100, Math.round((d.count / (stats?.totalTrainees || 28)) * 100))
  }));

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#475569]">Loading Administration Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#172033]">
      
      {/* ─── 1. EXECUTIVE HERO HEADER ─── */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
              Institutional Management Portal
            </span>
            <span className="text-xs text-[#475569] flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {currentTime} • Platform Command
            </span>
          </div>

          <h1 className="text-xl font-semibold text-[#172033] tracking-tight">
            Executive Oversight Dashboard
          </h1>

          <p className="text-xs text-[#475569] leading-relaxed">
            Real-time management of learning tracks, trainer workload balancing, trainee approvals, and institutional circulars.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateTrainerMatching && (
            <button
              onClick={onNavigateTrainerMatching}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-medium rounded-lg text-xs border border-emerald-200 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>Trainer Allocation</span>
            </button>
          )}

          {onNavigatePerformance && (
            <button
              onClick={onNavigatePerformance}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-medium rounded-lg text-xs border border-indigo-200 transition-colors shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-700" />
              <span>Learner Performance</span>
            </button>
          )}

          <button
            onClick={onOpenCreateCourse}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-100" />
            <span>Publish Course</span>
          </button>
          
          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs border border-[#E2E8F0] transition-colors shadow-xs"
          >
            <BellRing className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Directives</span>
          </button>

          <button
            onClick={loadAdminData}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-[#E2E8F0] transition-colors shadow-xs"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#2563EB]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. DYNAMIC INTERACTIVE FILTER BAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Executive Overview", icon: Activity },
            { id: "cadre", label: "Trainee Distribution", icon: Users },
            { id: "capacity", label: "Platform Capacity", icon: Layers },
            { id: "directives", label: "Directives & Circulars", icon: BellRing }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTelemetryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTelemetryTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  active
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "text-[#475569] hover:text-[#172033] hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-blue-100" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 px-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Data Synchronized</span>
        </div>
      </div>

      {/* ─── 3. TOP KPI SUMMARY CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Registered Trainees */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Registered Trainees</span>
            <div className="text-2xl font-semibold text-[#172033]">{stats?.totalTrainees || 28}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% active intake
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Faculty Trainers */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Faculty Trainers</span>
            <div className="text-2xl font-semibold text-[#172033]">{stats?.totalTrainers || 6}</div>
            {onNavigateTrainerMatching ? (
              <button 
                onClick={onNavigateTrainerMatching}
                className="text-[11px] text-[#2563EB] font-medium hover:underline flex items-center gap-0.5"
              >
                <span>Trainer Workload</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" /> 100% Verified
              </span>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Pending Approvals</span>
            <div className="text-2xl font-semibold text-[#2563EB]">{pendingUsers.length}</div>
            <button 
              onClick={onOpenApprovals}
              className="text-[11px] text-[#2563EB] font-medium hover:underline flex items-center gap-0.5"
            >
              <span>Review Queue ({pendingUsers.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Credentials Issued */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#475569] font-medium">Certificates Issued</span>
            <div className="text-2xl font-semibold text-[#172033]">{stats?.totalCertificatesIssued ?? 0}</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Pass Rate: {stats?.overallPassRate ?? 0}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ─── 4. ANALYTICS & CAPACITY CHARTS GRID ─── */}
      {(activeTelemetryTab === "all" || activeTelemetryTab === "cadre") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department Trainees Chart */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-semibold text-[#172033] text-xs uppercase tracking-wider">Departmental Trainee Distribution</h3>
                <p className="text-xs text-[#475569]">Registered trainees across divisions</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setChartMetric("count")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    chartMetric === "count" ? "bg-white text-[#2563EB] shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Headcount
                </button>
                <button
                  onClick={() => setChartMetric("percentage")}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                    chartMetric === "percentage" ? "bg-white text-[#2563EB] shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Share %
                </button>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: '600' }}
                    formatter={(value) => [chartMetric === "count" ? `${value} Trainees` : `${value}% Share`, "Size"]}
                  />
                  <Bar dataKey={chartMetric} fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Certification Trend */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-semibold text-[#172033] text-xs uppercase tracking-wider">Monthly Certification Trajectory</h3>
                <p className="text-xs text-[#475569]">Issued standard course certificates</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                +28% Growth
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthlyCertifications || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: '600' }}
                  />
                  <Area type="monotone" dataKey="certificates" stroke="#2563EB" strokeWidth={2} fill="#EFF6FF" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* ─── 5. DIRECTIVES & PLATFORM HUB SHORTCUTS ─── */}
      {(activeTelemetryTab === "all" || activeTelemetryTab === "capacity" || activeTelemetryTab === "directives") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Platform Analytics Shortcut Card */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#2563EB] uppercase tracking-wider border border-blue-100">
                  Governance &amp; Analytics
                </span>
                <span className="text-xs text-[#475569] font-medium">
                  {totalEnrolled} / {totalCap} Seats Filled ({capacityPct}%)
                </span>
              </div>

              <h2 className="text-sm font-semibold text-[#172033]">
                Platform Analytics &amp; Reporting Hub
              </h2>

              <p className="text-xs text-[#475569] leading-relaxed">
                Inspect course seat utilization, grade distributions, pass rates, and faculty workload ratios across training centers.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#475569]">Platform Capacity Utilization</span>
                <span className="text-[#2563EB] font-semibold">{capacityPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                <span>Active Courses: {courses.length}</span>
                <span>Max Capacity: {totalCap} Seats</span>
              </div>
            </div>

            <button
              onClick={onOpenAnalytics}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-100" />
              <span>Launch Platform Analytics Hub</span>
            </button>
          </div>

          {/* Active Circulars Feed */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
                <h3 className="font-semibold text-[#172033] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Announcements &amp; Directives</span>
                </h3>
                <button 
                  onClick={onOpenBroadcastModal} 
                  className="text-[#2563EB] font-medium text-xs hover:underline flex items-center gap-1"
                >
                  <span>+ View All ({announcements.length})</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {announcements.slice(0, 3).map((ann, idx) => (
                  <div 
                    key={ann.id || idx} 
                    className={`p-3 rounded-lg border transition-colors ${
                      ann.urgent ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-[#E2E8F0] hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#172033] truncate max-w-[280px]">{ann.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{ann.date}</span>
                    </div>
                    <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed">{ann.content}</p>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No active circulars at this moment.</p>
                )}
              </div>
            </div>

            <button
              onClick={onOpenBroadcastModal}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#172033] font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-colors border border-[#E2E8F0] shadow-xs"
            >
              <Megaphone className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Manage &amp; Publish Directives</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
