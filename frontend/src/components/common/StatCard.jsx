import React from "react";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  change,
  trend, // "up" | "down" | "neutral"
  iconBg = "bg-blue-50 text-[#1D4ED8]",
  onClick,
  className = ""
}) => {
  return (
    <div
      onClick={onClick}
      className={`gov-card p-4 flex flex-col justify-between ${onClick ? "cursor-pointer hover:border-slate-300 transition-colors" : ""} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            {label}
          </p>
          <div className="text-2xl font-bold text-[#1E293B] tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtext || change) && (
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] pt-2 border-t border-slate-100 mt-1">
          {change && (
            <span className={`font-semibold ${trend === "up" ? "text-emerald-700" : trend === "down" ? "text-red-700" : "text-slate-600"}`}>
              {change}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
