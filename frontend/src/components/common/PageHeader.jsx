import React from "react";

export const PageHeader = ({ 
  title, 
  description, 
  badge,
  actions, 
  children,
  className = "" 
}) => {
  return (
    <div className={`bg-white border-b border-[#D9E2EC] px-6 py-4.5 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-tight">
              {title}
            </h1>
            {badge && <span>{badge}</span>}
          </div>
          {description && (
            <p className="text-xs md:text-sm text-[#64748B] max-w-3xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
