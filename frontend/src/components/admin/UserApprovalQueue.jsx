import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  UserX, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2,
  Award,
  Search,
  Filter,
  ExternalLink,
  Clock,
  GraduationCap,
  Briefcase,
  X,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileCheck2,
  ChevronRight,
  Info,
  RefreshCw,
  Send,
  Sparkles
} from "lucide-react";
import { api } from "../../services/api";

export const UserApprovalQueue = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all"); // "all" | "trainee" | "trainer"
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectUser, setInspectUser] = useState(null);
  const [rejectionModalUser, setRejectionModalUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [certificatePreviewModal, setCertificatePreviewModal] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error("Failed loading users queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (user, notes = "") => {
    setActionLoading(true);
    try {
      const res = await api.verifyUser(user.id, true, notes || reviewNotes || "Profile authenticated by MoES Central Administrator.");
      if (res.success) {
        alert(`✅ Officer ${user.name} verified and approved successfully!`);
        setInspectUser(null);
        setReviewNotes("");
        await fetchUsers();
      }
    } catch (err) {
      alert("Verification action failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionModalUser) return;
    if (!rejectionReason.trim()) {
      alert("Please enter a specific reason or feedback for rejecting this officer profile.");
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.verifyUser(rejectionModalUser.id, false, rejectionReason.trim());
      if (res.success) {
        alert(`❌ Officer ${rejectionModalUser.name} profile rejected. Rejection reason has been recorded and will be shown to the officer.`);
        setRejectionModalUser(null);
        setInspectUser(null);
        setRejectionReason("");
        await fetchUsers();
      }
    } catch (err) {
      alert("Rejection action failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick rejection presets
  const rejectionPresets = [
    "Incomplete WMO Aviation / Meteorological certification documents. Please upload valid attested scan.",
    "Station Cadre ID mismatch with MoES Central Posting Registry. Please rectify and provide joining order.",
    "Missing attested scientific degree certificate (M.Sc./B.Tech) in profile dossier.",
    "Division Head / Regional Director transfer endorsement letter required.",
    "Uploaded credentials could not be verified with issuing training academy."
  ];

  // Helper to format arrays safely
  const toArray = (val) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string" && val.trim().length > 0) {
      if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
      if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
      return [val.trim()];
    }
    return [];
  };

  // Filtered list calculation
  const filteredUsers = users.filter(user => {
    // Role filter
    if (filterRole !== "all" && user.role !== filterRole) return false;

    // Status filter
    if (filterStatus !== "all" && user.status !== filterStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name?.toLowerCase().includes(q);
      const matchEmail = user.email?.toLowerCase().includes(q);
      const matchDept = user.department?.toLowerCase().includes(q);
      const matchStation = user.station?.toLowerCase().includes(q);
      const matchCadre = user.cadreId?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDept && !matchStation && !matchCadre) return false;
    }

    return true;
  });

  const pendingCount = users.filter(u => u.status === "pending").length;
  const approvedTraineeCount = users.filter(u => u.role === "trainee" && u.status === "approved").length;
  const approvedTrainerCount = users.filter(u => u.role === "trainer" && u.status === "approved").length;
  const rejectedCount = users.filter(u => u.status === "rejected").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none">
      
      {/* ═════════ HEADER WITH STATS (CLEAN LIGHT THEME) ═════════ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200/90 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 border border-blue-200 text-[#0a2558] uppercase tracking-wider">
              MoES Admin Verification Center
            </span>
            <span className="text-xs text-slate-400 font-medium">Governance & Cadre Security</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Officer Registration & Profile Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Verify academic credentials, WMO certificates, security clearances, and institute postings before granting active capacity building access and course enrollment permissions.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 z-10"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ═════════ KPI STATS CARDS (CLEAN & MODERN) ═════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setFilterStatus("pending"); setFilterRole("all"); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === "pending" 
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500 shadow-sm" 
              : "bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Review</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-2">{pendingCount}</p>
          <p className="text-[10px] text-blue-700 mt-0.5 font-medium">Awaiting Concurrence</p>
        </div>

        <div 
          onClick={() => { setFilterRole("trainee"); setFilterStatus("approved"); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterRole === "trainee" && filterStatus === "approved"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500 shadow-sm" 
              : "bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Verified Trainees</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-2">{approvedTraineeCount}</p>
          <p className="text-[10px] text-blue-700 mt-0.5 font-medium">Eligible for Courses</p>
        </div>

        <div 
          onClick={() => { setFilterRole("trainer"); setFilterStatus("approved"); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterRole === "trainer" && filterStatus === "approved"
              ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 shadow-sm" 
              : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Faculty Trainers</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-900 mt-2">{approvedTrainerCount}</p>
          <p className="text-[10px] text-purple-700 mt-0.5 font-medium">Accredited Instructors</p>
        </div>

        <div 
          onClick={() => { setFilterStatus("rejected"); setFilterRole("all"); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === "rejected" 
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400 shadow-md" 
              : "bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Rejected Profiles</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 mt-2">{rejectedCount}</p>
          <p className="text-[10px] text-rose-700 mt-0.5 font-medium">Feedback Dispatched</p>
        </div>
      </div>

      {/* ═════════ FILTERS AND SEARCH BAR ═════════ */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>
          
          {[
            { id: "all", label: "All Statuses" },
            { id: "pending", label: `Pending Review (${pendingCount})`, badge: pendingCount > 0 },
            { id: "approved", label: "Approved & Verified" },
            { id: "rejected", label: `Rejected (${rejectedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? "bg-[#0a2558] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

          {/* Role Filter Tabs */}
          {[
            { id: "all", label: "All Roles" },
            { id: "trainee", label: "Trainee Officers" },
            { id: "trainer", label: "Faculty Trainers" }
          ].map(roleTab => (
            <button
              key={roleTab.id}
              onClick={() => setFilterRole(roleTab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterRole === roleTab.id
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {roleTab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Officer Name, Email, Cadre ID (MOES-MET-...), Station or Department..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-xs outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(filterStatus !== "all" || filterRole !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterRole("all");
                setSearchQuery("");
              }}
              className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ═════════ MAIN TABLE OF OFFICERS ═════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-4 font-bold">Officer Profile & Cadre ID</th>
                <th className="py-4 px-3 font-bold">Role</th>
                <th className="py-4 px-3 font-bold">Station & Division</th>
                <th className="py-4 px-3 font-bold">Qualifications & Credentials</th>
                <th className="py-4 px-3 font-bold text-center">Status</th>
                <th className="py-4 px-4 font-bold text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <span>Loading officer dossiers and verification records...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No officer records match the current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const certs = Array.isArray(user.certificates) ? user.certificates : [];
                  const quals = toArray(user.qualifications);
                  const isPending = user.status === "pending";
                  const isApproved = user.status === "approved";
                  const isRejected = user.status === "rejected";

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Officer Profile & Cadre ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                            alt={user.name}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 text-xs">{user.name}</p>
                            </div>
                            <p className="text-[11px] text-slate-500">{user.email}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {user.cadreId || `MOES-MET-2026-${user.id.substring(user.id.length - 4)}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "trainer" 
                            ? "bg-purple-100 text-purple-800 border border-purple-200" 
                            : user.role === "admin"
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Station & Division */}
                      <td className="py-4 px-3 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">{user.department}</p>
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{user.station || "IMD HQ New Delhi"}</span>
                        </p>
                      </td>

                      {/* Qualifications & Certificates */}
                      <td className="py-4 px-3 max-w-xs">
                        <p className="text-slate-700 font-medium truncate">
                          {quals.length > 0 ? quals[0] : "Scientific Officer Degree"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>{certs.length} Certifications</span>
                          </span>
                          {user.experience && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              • {Array.isArray(user.experience) ? user.experience[0] : user.experience}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-extrabold uppercase animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isRejected && (
                          <div className="flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full text-[10px] font-extrabold uppercase">
                              <UserX className="w-3 h-3 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                            {user.rejectionReason && (
                              <span className="text-[9px] text-rose-600 max-w-[140px] truncate mt-0.5 font-medium" title={user.rejectionReason}>
                                {user.rejectionReason}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Full Dossier Modal Button */}
                          <button
                            onClick={() => setInspectUser(user)}
                            className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl transition-all font-bold flex items-center gap-1 text-[11px]"
                            title="Inspect Complete Officer Dossier & Certifications"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Dossier</span>
                          </button>

                          {/* Quick Approve button if not already approved */}
                          {!isApproved && (
                            <button
                              onClick={() => handleApprove(user)}
                              disabled={actionLoading}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs transition-transform hover:scale-105 flex items-center gap-1"
                              title="Approve & Grant Enrollment Privileges"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Reject button */}
                          {!isRejected && user.role !== "admin" && (
                            <button
                              onClick={() => {
                                setRejectionModalUser(user);
                                setRejectionReason("");
                              }}
                              disabled={actionLoading}
                              className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                              title="Reject Verification & Dispatch Feedback"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═════════ 1. COMPREHENSIVE OFFICER DOSSIER MODAL ═════════ */}
      {inspectUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Dossier Header */}
            <div className="bg-gradient-to-r from-[#0a2558] to-blue-900 p-6 text-white rounded-t-3xl relative overflow-hidden">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={inspectUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250"}
                    alt={inspectUser.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight">{inspectUser.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        inspectUser.role === "trainer" ? "bg-purple-300 text-purple-950" : "bg-blue-300 text-blue-950"
                      }`}>
                        {inspectUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-0.5">
                      {inspectUser.designation} • {inspectUser.department}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-blue-100 font-mono">
                      <span>Cadre ID: <b>{inspectUser.cadreId || `MOES-MET-2026-${inspectUser.id.substring(inspectUser.id.length - 4)}`}</b></span>
                      <span>•</span>
                      <span>Station: <b>{inspectUser.station || "IMD HQ New Delhi"}</b></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setInspectUser(null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dossier Body */}
            <div className="p-6 space-y-6 text-xs text-slate-700">
              
              {/* Status Alert Banner if rejected */}
              {inspectUser.status === "rejected" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Current Verification Status: REJECTED</span>
                  </div>
                  <p className="text-xs">
                    <b>Admin Rejection Message:</b> {inspectUser.rejectionReason || inspectUser.approvalNotes || "Credentials pending clarification."}
                  </p>
                </div>
              )}

              {/* Status Alert Banner if pending */}
              {inspectUser.status === "pending" && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Pending Verification Review — Action required by Admin</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Awaiting Decision
                  </span>
                </div>
              )}

              {/* Contact & Station Verification Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Email</span>
                  <p className="font-semibold text-slate-800 truncate mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{inspectUser.email}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                  <p className="font-semibold text-slate-800 truncate mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{inspectUser.phone || "+91 98765 43210"}</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Station</span>
                  <p className="font-semibold text-slate-800 truncate mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{inspectUser.station || "National Forecasting Centre"}</span>
                  </p>
                </div>
              </div>

              {/* Government ID Card Verification Link Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Official MoES Cadre ID & Service Record Document</h4>
                    <p className="text-[11px] text-slate-500">
                      Cadre ID: {inspectUser.cadreId || "MOES-MET-2026-4491"} • National Personnel Verification Database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`🔗 Verified Service Record: Document authenticated with MoES Central Personnel DB for ${inspectUser.name}.`)}
                  className="px-3.5 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verify Identity Record</span>
                </button>
              </div>

              {/* Qualifications & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Qualifications */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Scientific & Academic Qualifications</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {toArray(inspectUser.qualifications).map((q, idx) => (
                      <li key={idx} className="p-2 bg-slate-50 rounded-lg font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                    {toArray(inspectUser.qualifications).length === 0 && (
                      <li className="text-slate-400 italic">No academic degrees recorded.</li>
                    )}
                  </ul>
                </div>

                {/* Experience */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <span>Operational Postings & Experience</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {toArray(inspectUser.experience).map((exp, idx) => (
                      <li key={idx} className="p-2 bg-slate-50 rounded-lg font-medium flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </li>
                    ))}
                    {toArray(inspectUser.experience).length === 0 && (
                      <li className="text-slate-400 italic">Fresh posting / No prior history recorded.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Skills / Specializations */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Technical Competencies & Domain Specializations</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(toArray(inspectUser.skills).length > 0 
                    ? toArray(inspectUser.skills) 
                    : toArray(inspectUser.specialization)).map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-xs font-bold border border-blue-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ═════════ CERTIFICATIONS & CREDENTIALS SHOWCASE ═════════ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Certifications & Accredited Credentials ({inspectUser.certificates?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Digital Credentials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(inspectUser.certificates || []).map((cert, cIdx) => (
                    <div key={cIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-slate-900 text-xs leading-snug">{cert.title}</h5>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase shrink-0">
                          {cert.grade || "Verified"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Issuer: <b>{cert.issuer || "IMD Training Division"}</b> • Year: <b>{cert.year || "2024"}</b>
                      </p>
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {cert.credentialId || `IMD-CERT-2024-${cIdx + 101}`}
                        </span>
                        <button
                          onClick={() => setCertificatePreviewModal(cert)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Verify Link</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {(inspectUser.certificates || []).length === 0 && (
                    <div className="col-span-2 p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                      <Award className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                      <span>No certificates uploaded by this officer yet.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Endorsement Notes */}
              <div className="pt-2 space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  Administrative Endorsement / Review Notes
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Optional verification concurrence note for ministry audit trail..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dossier Footer Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setInspectUser(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {inspectUser.role !== "admin" && (
                  <button
                    onClick={() => {
                      setRejectionModalUser(inspectUser);
                      setRejectionReason("");
                    }}
                    disabled={actionLoading}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject Registration</span>
                  </button>
                )}

                <button
                  onClick={() => handleApprove(inspectUser, reviewNotes)}
                  disabled={actionLoading}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verify & Approve Officer Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ 2. ADMINISTRATIVE REJECTION REASON MODAL ═════════ */}
      {rejectionModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Reject Profile: {rejectionModalUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Role: <b className="uppercase">{rejectionModalUser.role}</b> • {rejectionModalUser.email}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRejectionModalUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Type the exact reason for rejecting this officer's profile. The <b>{rejectionModalUser.role}</b> will see this message prominently on their dashboard so they can rectify their credentials and resubmit.
            </p>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {rejectionPresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => setRejectionReason(preset)}
                    className="text-[10px] bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    {preset.substring(0, 42)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Rejection Message Textarea */}
            <div>
              <label className="block font-bold text-slate-800 text-xs mb-1">
                Official Rejection & Corrective Message <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what is missing or incorrect (e.g., Incomplete WMO Class-II certificate, cadre ID mismatch, missing transfer NOC)..."
                className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRejectionModalUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send Rejection Feedback</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════ 3. CERTIFICATE VERIFY LINK MODAL PREVIEW ═════════ */}
      {certificatePreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Digital Credential Authenticated
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-2">
                {certificatePreviewModal.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Issued by: <b>{certificatePreviewModal.issuer || "IMD Academy Pune"}</b> ({certificatePreviewModal.year || "2024"})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600 text-left space-y-1">
              <p>Credential ID: <b>{certificatePreviewModal.credentialId || "MOES-CERT-2024-8891"}</b></p>
              <p>Registry Status: <span className="text-emerald-700 font-bold">ACTIVE & VALID</span></p>
              <p>Accreditation: <span className="text-blue-700">WMO Competency Standard Class-I/II</span></p>
            </div>

            <button
              onClick={() => setCertificatePreviewModal(null)}
              className="w-full py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Concur & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
