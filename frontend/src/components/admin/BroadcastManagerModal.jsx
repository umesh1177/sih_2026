import React, { useState } from "react";
import { X, BellRing, Send } from "lucide-react";
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
        alert("Broadcast published successfully to the homepage live ticker and notifications.");
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D9E2EC]">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D9E2EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center font-bold">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Publish MoES Directive / Circular</h2>
              <p className="text-[11px] text-slate-500">Live announcements broadcast across all regional centres</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
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
              placeholder="e.g. Mandatory Dual-Pol Radar Certification for Coastal Forecasters"
              className="w-full p-2.5 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none"
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
                className="w-full p-2 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:outline-none"
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
              className="w-full p-2.5 bg-slate-50 border border-[#D9E2EC] rounded-md focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-[#D9E2EC] flex items-center justify-between">
            <span className="font-semibold text-slate-800">Mark as Priority / Flash Alert</span>
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          <div className="pt-3 border-t border-[#D9E2EC] flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-md font-semibold shadow-xs transition-colors"
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
