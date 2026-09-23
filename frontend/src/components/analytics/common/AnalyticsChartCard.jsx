import React from "react";
import { ResponsiveContainer } from "recharts";
import { Info, ArrowRight, ArrowUp, BarChart2 } from "lucide-react";

export const AnalyticsChartCard = ({
  title,
  subtitle,
  children,
  xAxisLabel = null,
  yAxisLabel = null,
  badge = null,
  badgeColor = "bg-blue-50 text-blue-800 border-blue-200",
  headerAction = null,
  tooltip = null,
  height = 260,
  minHeight = 200,
  className = "",
  hasData = true,
  emptyMessage = "No sufficient assessment data"
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden ${className}`}>
      {/* Top Card Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {title}
              </h3>
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                  {badge}
                </span>
              )}
              {tooltip && (
                <div className="group/tip relative cursor-pointer text-slate-400 hover:text-slate-600">
                  <Info className="w-3.5 h-3.5" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:block w-52 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 font-normal leading-relaxed pointer-events-none">
                    {tooltip}
                  </div>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {headerAction && (
            <div className="shrink-0 flex items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>

        {/* Compact, Clean Sub-Axis Indicator */}
        {(xAxisLabel || yAxisLabel) && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            {xAxisLabel && (
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70 font-medium">
                <span className="text-blue-700 font-semibold">X:</span> {xAxisLabel}
              </span>
            )}
            {yAxisLabel && (
              <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/70 font-medium">
                <span className="text-emerald-700 font-semibold">Y:</span> {yAxisLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full flex-1 p-3.5 relative flex items-center justify-center bg-white" style={{ minHeight: `${minHeight}px`, height: `${height}px` }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
              <BarChart2 className="w-4 h-4 stroke-[1.75]" />
            </div>
            <p className="text-xs font-semibold text-slate-600">{emptyMessage}</p>
            <p className="text-[10px] text-slate-400 max-w-xs">Complete assessments to view dynamically calculated analytics</p>
          </div>
        )}
      </div>
    </div>
  );
};
