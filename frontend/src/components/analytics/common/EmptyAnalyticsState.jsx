import React from "react";
import { HelpCircle, FileText, AlertCircle, ArrowRight } from "lucide-react";

export const EmptyAnalyticsState = ({
  title = "No sufficient assessment data",
  description = "No attempts recorded yet for the selected scope or timeframe. Metrics will automatically calculate once assessments are completed and published.",
  icon: Icon = HelpCircle,
  actionText = null,
  onAction = null
}) => {
  return (
    <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-8 shadow-xs space-y-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#0B3475] hover:bg-[#08285C] text-white font-semibold rounded-[var(--radius)] text-xs transition-all shadow-xs"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
