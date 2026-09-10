import React from "react";
import { CheckCircle2, Clock3, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, Info } from "lucide-react";

export const StatusBadge = ({ status = "pending", size = "sm", className = "" }) => {
  const norm = String(status).toLowerCase().trim();

  let config = {
    label: status,
    icon: Info,
    classes: "bg-slate-100 text-slate-700 border-slate-200"
  };

  if (norm === "approved" || norm === "verified" || norm === "active" || norm === "completed" || norm === "passed" || norm === "success") {
    config = {
      label: norm === "approved" ? "Approved" : norm === "verified" ? "Verified" : norm === "completed" ? "Completed" : norm === "passed" ? "Passed" : "Active",
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-800 border-emerald-200"
    };
  } else if (norm === "pending" || norm === "in_review" || norm === "in review" || norm === "scheduled" || norm === "in_progress") {
    config = {
      label: norm === "in_progress" ? "In Progress" : norm === "scheduled" ? "Scheduled" : "Pending Review",
      icon: Clock3,
      classes: "bg-amber-50 text-amber-800 border-amber-200"
    };
  } else if (norm === "rejected" || norm === "failed" || norm === "suspended" || norm === "inactive") {
    config = {
      label: norm === "rejected" ? "Rejected" : norm === "failed" ? "Failed" : norm === "suspended" ? "Suspended" : "Inactive",
      icon: XCircle,
      classes: "bg-rose-50 text-rose-800 border-rose-200"
    };
  } else if (norm === "high" || norm === "critical") {
    config = {
      label: status,
      icon: ShieldAlert,
      classes: "bg-red-50 text-red-800 border-red-200"
    };
  } else if (norm === "moderate" || norm === "medium") {
    config = {
      label: status,
      icon: AlertTriangle,
      classes: "bg-amber-50 text-amber-800 border-amber-200"
    };
  } else if (norm === "low") {
    config = {
      label: status,
      icon: ShieldCheck,
      classes: "bg-teal-50 text-teal-800 border-teal-200"
    };
  }

  const Icon = config.icon;
  const sizeClasses = size === "xs" 
    ? "px-2 py-0.5 text-[10px] gap-1" 
    : size === "lg" 
    ? "px-3 py-1.5 text-xs gap-1.5" 
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span className={`inline-flex items-center font-medium rounded border ${config.classes} ${sizeClasses} ${className}`}>
      <Icon className={size === "xs" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};
