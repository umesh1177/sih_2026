import React from "react";
import { AlertOctagon, AlertTriangle, ShieldCheck } from "lucide-react";

export const RiskBadge = ({ level = "Low", size = "md" }) => {
  const normalized = String(level).toLowerCase();

  let label = "Low Risk";
  let colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let Icon = ShieldCheck;

  if (normalized.includes("high")) {
    label = "High Risk";
    colorClasses = "bg-rose-50 text-rose-800 border-rose-200 animate-pulse";
    Icon = AlertOctagon;
  } else if (normalized.includes("mod") || normalized.includes("med")) {
    label = "Moderate Risk";
    colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = AlertTriangle;
  }

  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-[10px]" 
    : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold border uppercase tracking-wider ${sizeClasses} ${colorClasses}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{label}</span>
    </span>
  );
};
