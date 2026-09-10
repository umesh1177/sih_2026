import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Layers, 
  UserCheck, 
  BellRing, 
  Plus, 
  ArrowRight,
  Building2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { api } from "../../services/api";

export const AdminDashboardView = ({ 
  currentUser, 
  onOpenApprovals, 
  onOpenCompetency, 
  onOpenBroadcastModal,
  onOpenCreateCourse
}) => {
  const [stats, setStats] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const [sRes, aRes] = await Promise.all([
          api.getAdminStats(),
          api.getAnnouncements()
        ]);

        if (sRes.success) setStats(sRes.stats);
        if (aRes.success) setAnnouncements(aRes.announcements);
      } catch (err) {
        console.error("Admin stats failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Executive Admin Banner */}
      <div className="bg-gradient-to-r from-[#0a2558] via-slate-900 to-blue-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              Director General Administrative Console
            </span>
            <span className="text-xs text-blue-200">Ministry of Earth Sciences (MoES)</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            National Capacity Building & Competency Governance Portal
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
            Real-time oversight of meteorological workforce certifications, trainer competency allocations, and national directives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBroadcastModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
          >
            <BellRing className="w-4 h-4 text-yellow-300" />
            <span>Publish Broadcast</span>
          </button>

          <button
            onClick={onOpenApprovals}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#0a2558] hover:bg-blue-50 font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
          >
            <UserCheck className="w-4 h-4 text-[#0a2558]" />
            <span>Pending Approvals ({stats?.pendingApprovalsCount || 1})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Trainees Enrolled</p>
          <p className="text-2xl font-black text-[#0a2558] mt-1">{stats?.totalTrainees || 28}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Senior Trainers</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats?.totalTrainers || 6}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Certifications</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.totalCertificatesIssued || 144}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">National Pass Rate</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{stats?.overallPassRate || 94}%</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Pending Approvals</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingApprovalsCount || 1}</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Department-Wise Active Trainee Participation
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.deptDistribution || []}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="activeTrainees" fill="#0a2558" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Certification Growth Trend */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Monthly Certified Officer Growth Trend
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyCertifications || []}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="certificates" stroke="#0284c7" fill="#e0f2fe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Directives & Fast Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Competency Mapping Shortcut */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-900 to-[#0a2558] rounded-3xl p-6 text-white flex flex-col justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              Workforce Intelligence
            </span>
            <h2 className="text-lg font-bold tracking-tight mt-2">
              Institutional Competency Mapping Matrix
            </h2>
            <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
              Match specialized trainers with courses in Doppler Radar, NWP Modeling, Cyclone Tracking, and Satellite Meteorology based on verified credentials.
            </p>
          </div>

          <button
            onClick={onOpenCompetency}
            className="mt-6 w-full py-2.5 bg-white text-[#0a2558] hover:bg-blue-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.02]"
          >
            <Layers className="w-4 h-4" />
            <span>Launch Competency Engine</span>
          </button>
        </div>

        {/* Recent Announcements Feed */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-[#0a2558]" />
                <span>Active MoES Announcements & Directives</span>
              </h3>
              <button onClick={onOpenBroadcastModal} className="text-blue-700 font-bold text-xs hover:underline">
                + New Alert
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {announcements.map((ann, idx) => (
                <div key={ann.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
