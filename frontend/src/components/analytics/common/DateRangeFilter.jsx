import React, { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

export const DateRangeFilter = ({
  value = "all",
  onChange,
  customStart = "",
  customEnd = "",
  onCustomChange
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startDate, setStartDate] = useState(customStart);
  const [endDate, setEndDate] = useState(customEnd);

  const OPTIONS = [
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "90d", label: "Last 90 Days" },
    { id: "this_year", label: "This Year" },
    { id: "all", label: "All Time" },
    { id: "custom", label: "Custom Range" }
  ];

  const handleSelect = (optId) => {
    if (optId === "custom") {
      setShowCustomModal(true);
    } else {
      onChange(optId);
    }
  };

  const applyCustom = () => {
    if (onCustomChange) {
      onCustomChange(startDate, endDate);
    }
    onChange("custom");
    setShowCustomModal(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[var(--radius)] p-1 text-xs font-semibold text-slate-700">
        <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
        <select
          value={value}
          onChange={(e) => handleSelect(e.target.value)}
          className="bg-transparent border-0 py-1 pr-2 pl-0.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
        >
          {OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id} className="text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl p-6 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Select Custom Date Range</span>
            </h4>

            <div className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={applyCustom}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
