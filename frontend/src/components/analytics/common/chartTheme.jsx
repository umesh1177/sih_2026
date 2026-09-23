import React from "react";

// =========================================================================
// PREMIUM RECHARTS THEME CONSTANTS & GRADIENTS
// =========================================================================

export const CHART_COLORS = {
  primary: "#3B82F6",    // Blue
  primaryGradient: ["#3B82F6", "#1D4ED8"],
  secondary: "#6366F1",  // Indigo
  secondaryGradient: ["#6366F1", "#4338CA"],
  success: "#10B981",    // Emerald
  successGradient: ["#10B981", "#047857"],
  warning: "#F59E0B",    // Amber
  warningGradient: ["#F59E0B", "#B45309"],
  danger: "#EF4444",     // Rose
  dangerGradient: ["#EF4444", "#B91C1C"],
  purple: "#8B5CF6",     // Purple
  purpleGradient: ["#8B5CF6", "#6D28D9"],
  cyan: "#06B6D4",       // Cyan
  cyanGradient: ["#06B6D4", "#0E7490"],
  pink: "#EC4899",       // Pink
  pinkGradient: ["#EC4899", "#BE185D"],
  slate: "#64748B",      // Slate
  grid: "#E2E8F0",
  text: "#64748B",
  textDark: "#1E293B"
};

// SVG Gradients Definition Component to place inside <defs> for charts
export const ChartGradients = () => (
  <defs>
    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#4338CA" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradDanger" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#0891B2" stopOpacity={0.7} />
    </linearGradient>
    <linearGradient id="gradAreaBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
    </linearGradient>
    <linearGradient id="gradAreaIndigo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
    </linearGradient>
    <linearGradient id="gradAreaSuccess" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
    </linearGradient>
  </defs>
);

// Modern Glassmorphic Custom Tooltip Component
export const CustomChartTooltip = ({ active, payload, label, unit = "%", titleFormatter = null }) => {
  if (!active || !payload || !payload.length) return null;

  const displayTitle = titleFormatter ? titleFormatter(label, payload) : label;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs text-white min-w-[170px] pointer-events-none z-50">
      {displayTitle && (
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between gap-2">
          <span className="truncate max-w-[180px]">{displayTitle}</span>
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const color = item.color || item.fill || "#3B82F6";
          const formattedVal = typeof item.value === "number" ? item.value : item.value;
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                <span className="text-slate-400 text-[11px] font-medium truncate max-w-[120px]">
                  {item.name || "Value"}:
                </span>
              </div>
              <span className="font-bold text-white text-right">
                {formattedVal}{unit && typeof formattedVal === "number" && !item.name?.includes("Count") && !item.name?.includes("Time") && !item.name?.includes("Attempts") ? unit : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
