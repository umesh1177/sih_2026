import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Clock } from "lucide-react";

export const PerformanceBadge = ({ scoreOrAccuracy, text = null, size = "md" }) => {
  let val = typeof scoreOrAccuracy === "number" ? scoreOrAccuracy : parseFloat(scoreOrAccuracy);
  if (isNaN(val)) val = 0;

  let label = text || `${val}%`;
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let Icon = Clock;

  if (val >= 80) {
    if (!text) label = `Mastered (${val}%)`;
    colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
    Icon = CheckCircle2;
  } else if (val >= 60) {
    if (!text) label = `Developing (${val}%)`;
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = AlertTriangle;
  } else {
    if (!text) label = `Needs Attention (${val}%)`;
    colorClasses = "bg-rose-50 text-rose-800 border-rose-200";
    Icon = XCircle;
  }

  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-[10px]" 
    : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${sizeClasses} ${colorClasses}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{label}</span>
    </span>
  );
};
