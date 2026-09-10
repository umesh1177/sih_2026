import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  ShieldCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import { api } from "../../services/api";

export const OrganizationStructureView = () => {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminScope, setAdminScope] = useState("ORGANIZATION");

  const fetchStructure = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartmentStructure();
      if (res.success) {
        setStructure(res.structure || []);
        setAdminScope(res.adminScope || "ORGANIZATION");
      }
    } catch (err) {
      console.error("Failed loading organization structure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
              Phase 3 Institutional Model
            </span>
            <span className="text-xs text-slate-400">Governance & Hierarchy</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Organization Hierarchy & Departmental Scope
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational structure of the India Meteorological Department (IMD) / Ministry of Earth Sciences across divisions and regional centres.
          </p>
        </div>

        <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0a2558]" />
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Your Authorized Scope</span>
            <span className="font-extrabold text-slate-800">{adminScope}-WIDE GOVERNANCE</span>
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
            Loading departmental hierarchy...
          </div>
        ) : (
          structure.map(dept => (
            <div key={dept.departmentId} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-xl font-black text-xs font-mono">
                    {dept.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {dept.totalUsers} Officers
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{dept.name}</h3>
                <p className="text-[11px] text-slate-500 mb-3">{dept.centreName}</p>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{dept.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Trainees</span>
                  <b className="text-slate-800 text-xs font-bold">{dept.traineesCount}</b>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Trainers</span>
                  <b className="text-slate-800 text-xs font-bold">{dept.trainersCount}</b>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Courses</span>
                  <b className="text-slate-800 text-xs font-bold">{dept.coursesCount}</b>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
