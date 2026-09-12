import React, { useState, useEffect } from "react";
import { 
  BellRing, 
  Send, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Users, 
  Plus, 
  Clock, 
  Pin, 
  Eye, 
  FileText, 
  Download, 
  Sparkles,
  RefreshCw,
  Megaphone,
  Radio,
  Share2,
  X
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = [
  "All",
  "Operational Weather Warning",
  "Curriculum & Syllabus Update",
  "Administrative Circular",
  "Assessment & Exam Notice",
  "Faculty Duty Advisory",
  "System Notification"
];

export const NationalBroadcastsView = ({ onRefreshData }) => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All"); // "All" | "Urgent" | "Normal"
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);

  // Form state for composing a new broadcast
  const [formData, setFormData] = useState({
    title: "",
    category: "Operational Weather Warning",
    content: "",
    urgent: false,
    targetAudience: "All Operational Cadres (Trainees + Faculty)",
    regionalScope: "All Regional Meteorological Centres (National)",
    sendPushAlert: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Please provide both a directive title and detailed circular content.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        urgent: formData.urgent,
        targetAudience: formData.targetAudience,
        regionalScope: formData.regionalScope,
        author: currentUser?.name || "MoES Directorate General",
        date: new Date().toISOString().split("T")[0]
      };

      const res = await api.publishAnnouncement(payload);
      if (res.success) {
        alert("✅ National Broadcast Directive successfully published and broadcast across all IMD/MoES channels!");
        setIsComposerOpen(false);
        setFormData({
          title: "",
          category: "Operational Weather Warning",
          content: "",
          urgent: false,
          targetAudience: "All Operational Cadres (Trainees + Faculty)",
          regionalScope: "All Regional Meteorological Centres (National)",
          sendPushAlert: true
        });
        await loadAnnouncements();
        if (onRefreshData) onRefreshData();
      } else {
        alert("Failed to publish broadcast: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error publishing broadcast: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id, title) => {
    if (!window.confirm(`Are you sure you want to withdraw and archive broadcast:\n"${title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        if (onRefreshData) onRefreshData();
      } else {
        alert("Failed to delete: " + res.message);
      }
    } catch (err) {
      alert("Error deleting broadcast: " + err.message);
    }
  };

  const togglePin = (id) => {
    setPinnedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted list
  const filteredAnnouncements = announcements
    .filter(a => {
      const matchesSearch = searchQuery === "" || 
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "All" || a.category === selectedCategory;
      const matchesUrg = selectedUrgency === "All" || 
        (selectedUrgency === "Urgent" && a.urgent) ||
        (selectedUrgency === "Normal" && !a.urgent);

      return matchesSearch && matchesCat && matchesUrg;
    })
    .sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

  const urgentCount = announcements.filter(a => a.urgent).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ─── HEADER BANNER (CLEAN LIGHT THEME) ─── */}
      <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 text-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-200/90 relative overflow-hidden">
        <div className="space-y-1.5 max-w-2xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0a2558] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
              National Dispatch Center
            </span>
            <span className="text-xs text-slate-400 font-medium">• Ministry of Earth Sciences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-blue-700" />
            National Broadcasts & Circulars Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Issue emergency operational bulletins, syllabus updates, exam advisories, and administrative circulars to all regional centres and training divisions.
          </p>
        </div>

        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#0a2558] hover:bg-[#071c42] text-white font-medium rounded-[var(--radius)] text-xs shadow-md transition-all transform hover:scale-105 active:scale-95 shrink-0 z-10"
        >
          <Plus className="w-4 h-4 text-blue-200" />
          <span>+ Compose New National Broadcast</span>
        </button>
      </div>

      {/* ─── QUICK METRICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Active Directives</p>
            <p className="text-2xl font-black text-slate-900">{announcements.length}</p>
            <p className="text-[10px] text-blue-600 font-semibold">Live in ticker & portal</p>
          </div>
          <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BellRing className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Urgent Bulletins</p>
            <p className="text-2xl font-black text-rose-600">{urgentCount}</p>
            <p className="text-[10px] text-rose-500 font-semibold">High-priority alerts</p>
          </div>
          <div className="w-12 h-12 rounded-[var(--radius)] bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Cadre Reach</p>
            <p className="text-2xl font-black text-emerald-600">100%</p>
            <p className="text-[10px] text-emerald-600 font-semibold">6 RMCs + IMD HQ + NCMRWF</p>
          </div>
          <div className="w-12 h-12 rounded-[var(--radius)] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[var(--radius)] border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Read & Compliance</p>
            <p className="text-2xl font-black text-indigo-600">96.8%</p>
            <p className="text-[10px] text-indigo-500 font-semibold">Audited delivery logs</p>
          </div>
          <div className="w-12 h-12 rounded-[var(--radius)] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ─── FILTERS & SEARCH BAR ─── */}
      <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search circulars by headline, keywords, operational directives or division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius)] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-2.5 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Priority Levels</option>
              <option value="Urgent">🚨 Urgent / Critical Only</option>
              <option value="Normal">ℹ️ Normal Priority Only</option>
            </select>

            <button
              onClick={loadAnnouncements}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[var(--radius)] transition-colors"
              title="Refresh Broadcast List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[var(--radius)] font-medium whitespace-nowrap transition-all text-xs ${
                selectedCategory === cat
                  ? "bg-[#0a2558] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── BROADCAST DIRECTIVES LIST ─── */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => {
          const isPinned = pinnedIds.includes(ann.id);

          return (
            <div
              key={ann.id}
              className={`rounded-[var(--radius)] border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                ann.urgent
                  ? "bg-rose-50/50 border-rose-200"
                  : isPinned
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-5 sm:p-6 space-y-3">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {ann.urgent ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> URGENT DIRECTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-900 border border-blue-200">
                        {ann.category || "Official Notice"}
                      </span>
                    )}

                    {isPinned && (
                      <span className="px-2 py-0.5 rounded-[var(--radius)] text-[10px] font-medium bg-amber-200 text-amber-900 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ann.date || "Today"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(ann.id)}
                      className={`p-1.5 rounded-[var(--radius)] text-xs transition-colors ${
                        isPinned ? "text-amber-600 bg-amber-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      }`}
                      title={isPinned ? "Unpin Broadcast" : "Pin Broadcast to Top"}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const printable = `MINISTRY OF EARTH SCIENCES / INDIA METEOROLOGICAL DEPARTMENT\nOFFICIAL NATIONAL BROADCAST DIRECTIVE\n\nTitle: ${ann.title}\nCategory: ${ann.category}\nDate: ${ann.date}\nUrgency: ${ann.urgent ? 'CRITICAL / URGENT' : 'NORMAL'}\n\nContent:\n${ann.content}\n\nDispatched to all Regional Meteorological Centres & Centers of Excellence.`;
                        const blob = new Blob([printable], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `MoES_Broadcast_${ann.id || 'Directive'}.txt`;
                        a.click();
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-[var(--radius)] transition-colors"
                      title="Download Official Circular"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {currentUser?.role === "admin" && (
                      <button
                        onClick={() => handleDeleteBroadcast(ann.id, ann.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius)] transition-colors ml-1"
                        title="Withdraw and Delete Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Directive Title */}
                <h3 className={`text-base font-black ${ann.urgent ? "text-rose-950" : "text-slate-900"}`}>
                  {ann.title}
                </h3>

                {/* Directive Content Body */}
                <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white/80 p-4 rounded-[var(--radius)] border border-slate-100">
                  {ann.content}
                </div>

                {/* Footer Metadata */}
                <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-100/80 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-600">
                      Dispatched By: <span className="text-slate-900 font-medium">{ann.author || "Directorate General of Meteorology"}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Target: <span className="font-medium text-slate-700">{ann.targetAudience || "All Registered Cadres"}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Broadcast Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[var(--radius)] border border-dashed border-slate-300 p-8">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No matching circulars or broadcasts found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing your search terms or filter criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedUrgency("All");
              }}
              className="mt-4 px-4 py-2 bg-[#0a2558] text-white rounded-[var(--radius)] text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ─── MODAL: COMPOSE NEW NATIONAL BROADCAST ─── */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[var(--radius)] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#0a2558] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[var(--radius)] bg-white/10 text-amber-300">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Compose National Broadcast Directive</h2>
                  <p className="text-[11px] text-blue-200">Dispatches instantly to portal banner, ticker, and circular feeds</p>
                </div>
              </div>
              <button 
                onClick={() => setIsComposerOpen(false)}
                className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateBroadcast} className="p-6 space-y-4 text-xs">
              
              {/* Directive Title */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Directive Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyclone Alert - Bay of Bengal Deep Depression Advisory or Revised Radar Syllabus 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Broadcast Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-[var(--radius)] border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority Level</label>
                  <div className="flex items-center gap-3 pt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="urgency"
                        checked={!formData.urgent}
                        onChange={() => setFormData({ ...formData, urgent: false })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Normal</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded-[var(--radius)] border border-rose-200">
                      <input
                        type="radio"
                        name="urgency"
                        checked={formData.urgent}
                        onChange={() => setFormData({ ...formData, urgent: true })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>🚨 Urgent / Critical</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Target Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="All Operational Cadres (Trainees + Faculty)">All Operational Cadres (Trainees + Faculty)</option>
                    <option value="Senior Trainers & Faculty Only">Senior Trainers & Faculty Only</option>
                    <option value="Trainee Officers Only">Trainee Officers Only</option>
                    <option value="RMC Division Heads & Directors">RMC Division Heads & Directors</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Regional Scope</label>
                  <select
                    value={formData.regionalScope}
                    onChange={(e) => setFormData({ ...formData, regionalScope: e.target.value })}
                    className="w-full px-3 py-2 rounded-[var(--radius)] border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="All Regional Meteorological Centres (National)">All Regional Meteorological Centres (National)</option>
                    <option value="Northern Region (New Delhi / NWP Hub)">Northern Region (New Delhi / NWP Hub)</option>
                    <option value="Southern Region (RMC Chennai / IMD Pune)">Southern Region (RMC Chennai / IMD Pune)</option>
                    <option value="Eastern & NE Region (RMC Kolkata / Guwahati)">Eastern & NE Region (RMC Kolkata / Guwahati)</option>
                    <option value="Western Region (RMC Mumbai / Coastal)">Western Region (RMC Mumbai / Coastal)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Circular / Directive Body <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter complete circular text, instructions, deadlines, operational procedures, or guidelines..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Footer Dispatch Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-[var(--radius)] text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-semibold rounded-[var(--radius)] text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Broadcasting..." : "Dispatch & Broadcast Directive"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
