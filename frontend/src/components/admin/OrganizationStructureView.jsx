import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  MapPin, 
  ShieldCheck
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="px-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-200">
                Institutional Model
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

          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D9E2EC] rounded-lg shadow-sm text-xs">
            <ShieldCheck className="w-4 h-4 text-[#164E63]" />
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">Your Authorized Scope</span>
              <span className="font-bold text-slate-800">{adminScope}-WIDE GOVERNANCE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-3 py-12 text-center text-slate-400 text-xs">
              Loading departmental hierarchy...
            </div>
          ) : (
            structure.map(dept => (
              <div
                key={dept.departmentId}
                className="bg-white rounded-lg border border-[#D9E2EC] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded font-mono font-semibold text-xs">
                      {dept.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {dept.totalUsers} Officers
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{dept.name}</h3>
                  <p className="text-[11px] text-slate-500 mb-3">{dept.centreName}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{dept.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Trainees</span>
                    <b className="text-slate-800 text-xs font-semibold">{dept.traineesCount}</b>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Trainers</span>
                    <b className="text-slate-800 text-xs font-semibold">{dept.trainersCount}</b>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Courses</span>
                    <b className="text-slate-800 text-xs font-semibold">{dept.coursesCount}</b>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
