import React from "react";
import { FolderOpen } from "lucide-react";

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There is currently no data to display for this section.",
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`gov-card p-10 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#1E293B] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
