import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { DateRangeFilter } from "./DateRangeFilter";

export const AnalyticsFilterBar = ({
  filters = {},
  selectedValues = {},
  onFilterChange,
  onResetFilters,
  searchQuery = "",
  onSearchChange = null,
  showDateFilter = true,
  dateRange = "all",
  onDateRangeChange = null,
  customStart = "",
  customEnd = "",
  onCustomDateChange = null,
  extraActions = null
}) => {
  return (
    <div className="bg-white rounded-[var(--radius)] border border-slate-200/90 p-4 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search + Dynamic Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search bar */}
          {onSearchChange && (
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              />
            </div>
          )}

          {/* Dynamic Filter Dropdowns */}
          {Object.entries(filters).map(([key, options]) => {
            if (!Array.isArray(options) || options.length === 0) return null;
            const currentVal = selectedValues[key] || "all";
            const labelKey = key.charAt(0).toUpperCase() + key.slice(1);

            return (
              <div key={key} className="flex items-center">
                <select
                  value={currentVal}
                  onChange={(e) => onFilterChange(key, e.target.value)}
                  className="px-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="all">All {labelKey}s</option>
                  {options.map((opt) => {
                    const optId = typeof opt === "object" ? (opt.id || opt.value) : opt;
                    const optLabel = typeof opt === "object" ? (opt.title || opt.name || opt.label || opt.id) : opt;
                    return (
                      <option key={optId} value={optId} className="text-slate-900">
                        {optLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>

        {/* Right: Date Range + Reset + Actions */}
        <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
          {showDateFilter && onDateRangeChange && (
            <DateRangeFilter
              value={dateRange}
              onChange={onDateRangeChange}
              customStart={customStart}
              customEnd={customEnd}
              onCustomChange={onCustomDateChange}
            />
          )}

          {onResetFilters && (
            <button
              onClick={onResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius)] border border-slate-200 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {extraActions}
        </div>
      </div>
    </div>
  );
};
