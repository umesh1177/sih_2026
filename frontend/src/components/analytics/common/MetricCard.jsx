import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-blue-50 text-blue-700 border-blue-200",
  trend = null, // "up" | "down" | "neutral"
  trendValue = null,
  badge = null,
  badgeColor = "bg-slate-100 text-slate-700",
  onClick = null
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[var(--radius)] border border-slate-200/90 p-4.5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between ${onClick ? "cursor-pointer hover:border-blue-300" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {value !== undefined && value !== null ? value : "—"}
          </div>
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-[var(--radius)] flex items-center justify-center font-medium border shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 font-medium truncate">
          {subtitle || "Computed from verified records"}
        </span>

        {badge ? (
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 uppercase tracking-wider ${badgeColor}`}>
            {badge}
          </span>
        ) : trend ? (
          <span className={`inline-flex items-center gap-1 font-semibold text-[11px] shrink-0 ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"
          }`}>
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
            {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
            {trendValue}
          </span>
        ) : null}
      </div>
    </div>
  );
};
