import React, { useState } from "react";
import { X, BellRing, Send, Sparkles, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

export const BroadcastManagerModal = ({ isOpen, onClose, onPublished }) => {
  const [form, setForm] = useState({
    title: "",
    category: "National Directive",
    content: "",
    urgent: false,
    author: "Directorate General of Meteorology, MoES"
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.publishAnnouncement(form);
      if (res.success) {
        alert("Broadcast published successfully to the homepage live ticker and notifications!");
        if (onPublished) onPublished();
        onClose();
      }
    } catch (err) {
      alert("Broadcast failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0a2558] flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Publish MoES Directive / Broadcast</h2>
              <p className="text-[11px] text-slate-500">Live feed across all regional meteorological centres</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Mandatory Dual-Pol Radar Certification for All East Coast Forecasters"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="National Directive">National Directive</option>
                <option value="Training Cohort">Training Cohort</option>
                <option value="Milestone & Achievement">Milestone & Achievement</option>
                <option value="System Advisory">System Advisory</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Author / Division</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Circular Content *</label>
            <textarea
              rows={3}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Enter full circular or capacity building advisory details..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Mark as High Priority / Flash Alert</span>
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
              className="w-4 h-4 text-[#0a2558] rounded"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 rounded-lg font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white rounded-xl font-bold shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Broadcasting..." : "Publish Broadcast"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
