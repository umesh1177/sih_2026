import React from "react";

export const Button = ({
  children,
  variant = "primary", // "primary" | "secondary" | "success" | "danger" | "outline" | "ghost"
  size = "md", // "sm" | "md" | "lg"
  icon: Icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  title
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs select-none";

  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs md:text-sm gap-2",
    lg: "px-4 py-2.5 text-sm md:text-base gap-2"
  }[size] || "px-3.5 py-2 text-xs gap-2";

  const variantClasses = {
    primary: "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white focus:ring-[#1D4ED8]",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-[#D9E2EC] focus:ring-slate-300",
    success: "bg-[#15803D] hover:bg-[#166534] text-white focus:ring-[#15803D]",
    danger: "bg-[#B91C1C] hover:bg-[#991B1B] text-white focus:ring-[#B91C1C]",
    teal: "bg-[#0F766E] hover:bg-[#115E59] text-white focus:ring-[#0F766E]",
    outline: "bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-300 shadow-none"
  }[variant] || "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
