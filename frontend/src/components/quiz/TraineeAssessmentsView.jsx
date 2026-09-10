import React, { useState } from "react";
import { 
  Clock, 
  Award, 
  PlayCircle, 
  CheckCircle2, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  BarChart3, 
  ChevronRight, 
  Building2, 
  Layers, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import { ExamAnalyticsModal } from "./ExamAnalyticsModal";

export const TraineeAssessmentsView = ({ quizzes = [], currentUser, onStartExam }) => {
  const [activeSubTab, setActiveSubTab] = useState("available"); // "available" | "upcoming" | "completed"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamForAnalytics, setSelectedExamForAnalytics] = useState(null);

  const now = new Date();

  // Dynamic official IMD / MoES past completed exams list with relevant scientific data
  const completedExamsData = [
    {
      id: "comp_1",
      title: "#30 Atmospheric Dynamics & NWP 4D-Var Assimilation",
      subjects: ["Atmospheric Dynamics", "Sigma Coordinates", "Radar Assimilation", "NWP 4D-Var"],
      score: "29 (72.5%)",
      scoreNum: 29,
      totalMarks: 40,
      percentage: 72.5,
      status: "Submitted",
      submittedAt: "14th Aug 2026 20:36",
      timeTaken: "13m 16s",
      durationMinutes: 30,
      accuracy: 72.5,
      attempted: 40,
      correctCount: 29,
      subjectPerformance: [
        {
          subject: "Atmospheric Dynamics & Primitive Equations",
          performance: 90,
          timeUtilization: 29.66,
          timeSpent: "0m 13s",
          timeRequired: "0m 44s",
          totalQuestions: 10,
          correct: 9
        },
        {
          subject: "Doppler Weather Radar (DWR) Assimilation",
          performance: 90,
          timeUtilization: 56.05,
          timeSpent: "0m 23s",
          timeRequired: "0m 41s",
          totalQuestions: 10,
          correct: 9
        },
        {
          subject: "Satellite Water Vapor & Baroclinic Waves",
          performance: 60,
          timeUtilization: 35.76,
          timeSpent: "0m 18s",
          timeRequired: "0m 45s",
          totalQuestions: 10,
          correct: 6
        },
        {
          subject: "NWP 4D-Var Cost Function Optimization",
          performance: 50,
          timeUtilization: 68.69,
          timeSpent: "0m 32s",
          timeRequired: "0m 50s",
          totalQuestions: 10,
          correct: 5
        }
      ]
    },
    {
      id: "comp_2",
      title: "#29 Satellite Meteorology & INSAT-3DR Imager Processing",
      subjects: ["INSAT-3DR Processing", "Thermal Infrared (TIR)", "Cloud Motion Vectors", "Rainfall Estimation (HEM)"],
      score: "17 (85%)",
      scoreNum: 17,
      totalMarks: 20,
      percentage: 85.0,
      status: "Submitted",
      submittedAt: "12th Aug 2026 13:06",
      timeTaken: "34m 53s",
      durationMinutes: 45,
      accuracy: 85.0,
      attempted: 20,
      correctCount: 17,
      subjectPerformance: [
        {
          subject: "Thermal Infrared Calibration",
          performance: 90,
          timeUtilization: 30.5,
          timeSpent: "1m 15s",
          timeRequired: "1m 45s",
          totalQuestions: 10,
          correct: 9
        },
        {
          subject: "Cloud Motion Vector Tracking",
          performance: 80,
          timeUtilization: 45.2,
          timeSpent: "1m 30s",
          timeRequired: "2m 00s",
          totalQuestions: 10,
          correct: 8
        }
      ]
    },
    {
      id: "comp_3",
      title: "#28 Doppler Weather Radar & Severe Storm Nowcasting",
      subjects: ["Dual-Polarization (ZDR/KDP)", "Hydrometeor Classification", "Nyquist De-aliasing"],
      score: "Results Pending",
      scoreNum: null,
      totalMarks: 30,
      percentage: null,
      status: "Submitted",
      submittedAt: "11th Aug 2026 17:01",
      timeTaken: "60m 01s",
      durationMinutes: 60,
      isPending: true
    },
    {
      id: "comp_4",
      title: "#27 Tropical Cyclogenesis & Dvorak Technique Master Test",
      subjects: ["Tropical Meteorology", "Dvorak T-Number", "Storm Surge Modeling", "INSAT-3DR"],
      score: "15.5 (77.5%)",
      scoreNum: 15.5,
      totalMarks: 20,
      percentage: 77.5,
      status: "Submitted",
      submittedAt: "11th Aug 2026 13:12",
      timeTaken: "41m 09s",
      durationMinutes: 45,
      accuracy: 77.5,
      attempted: 20,
      correctCount: 15
    },
    {
      id: "comp_5",
      title: "#26 Agro-Meteorological Advisories & FASAL Modeling",
      subjects: ["Crop Weather Modeling", "Evapotranspiration", "Soil Moisture Guidance"],
      score: "16 (80%)",
      scoreNum: 16,
      totalMarks: 20,
      percentage: 80.0,
      status: "Submitted",
      submittedAt: "10th Aug 2026 13:09",
      timeTaken: "15m 27s",
      durationMinutes: 30,
      accuracy: 80.0,
      attempted: 20,
      correctCount: 16
    },
    {
      id: "comp_6",
      title: "#25 Hydrometeorology & Flash Flood Guidance System (FFGS)",
      subjects: ["Catchment Hydrology", "FFGS Threat Assessment", "Rainfall-Runoff Modeling", "Nowcasting"],
      score: "33 (82.5%)",
      scoreNum: 33,
      totalMarks: 40,
      percentage: 82.5,
      status: "Submitted",
      submittedAt: "7th Aug 2026 21:20",
      timeTaken: "17m 13s",
      durationMinutes: 30,
      accuracy: 82.5,
      attempted: 40,
      correctCount: 33
    },
    {
      id: "comp_7",
      title: "#24 Ocean State Forecast & Coastal Hazard Warning Protocols",
      subjects: ["Wave Modeling (SWAN/WW3)", "Tsunami Travel Time", "INCOIS Buoy Telemetry"],
      score: "30 (75%)",
      scoreNum: 30,
      totalMarks: 40,
      percentage: 75.0,
      status: "Submitted",
      submittedAt: "5th Aug 2026 08:56",
      timeTaken: "14m 43s",
      durationMinutes: 30,
      accuracy: 75.0,
      attempted: 40,
      correctCount: 30
    }
  ];

  // Available Exams (Live now for trainee to enter)
  const availableQuizzes = quizzes.length > 0 ? quizzes.map((q, idx) => ({
    ...q,
    takersCount: 25 + (idx * 9) % 35,
    startsDate: "9th Aug 2026 09:00",
    startsRelative: "Live Now",
    endsDate: "31st Oct 2026 23:59",
    endsRelative: "in about 2 months",
    subjects: q.courseName ? [q.courseName, "Atmospheric Dynamics", "+2 more"] : ["Atmospheric Dynamics", "NWP Modeling", "+2 more"],
    isSubmitted: idx === 0
  })) : [
    {
      id: "mock_30",
      title: "#30 Atmospheric Dynamics & NWP 4D-Var Assimilation",
      takersCount: 34,
      startsDate: "9th Aug 2026 09:00",
      startsRelative: "Live Now",
      endsDate: "31st Oct 2026 23:59",
      endsRelative: "in about 2 months",
      subjects: ["Atmospheric Dynamics", "Sigma Coordinates", "+2 more"],
      durationMinutes: 30,
      totalMarks: 40,
      isSubmitted: true,
      questions: []
    },
    {
      id: "mock_29",
      title: "#29 Radar Meteorology & Polarimetric Hydrometeor Classification",
      takersCount: 43,
      startsDate: "8th Aug 2026 09:00",
      startsRelative: "Live Now",
      endsDate: "31st Oct 2026 23:59",
      endsRelative: "in about 2 months",
      subjects: ["ZDR/KDP Analysis", "Nyquist De-aliasing", "+2 more"],
      durationMinutes: 30,
      totalMarks: 40,
      isSubmitted: false,
      questions: []
    },
    {
      id: "mock_28",
      title: "#28 Tropical Cyclogenesis & Satellite Dvorak Technique",
      takersCount: 27,
      startsDate: "7th Aug 2026 09:00",
      startsRelative: "Live Now",
      endsDate: "31st Oct 2026 23:59",
      endsRelative: "in about 2 months",
      subjects: ["Dvorak T-Number", "Storm Surge Forecast", "+2 more"],
      durationMinutes: 30,
      totalMarks: 40,
      isSubmitted: false,
      questions: []
    }
  ];

  // Upcoming scheduled exams (Scheduled by Trainer with release time, NO TAKERS COUNT)
  const upcomingQuizzes = [
    {
      id: "up_1",
      title: "#31 National Weather Forecasting Certification Exam (Tier-1)",
      scheduledByTrainer: "Dr. S. K. Roy (Head, IMD Training Faculty)",
      scheduledDate: "15th Oct 2026 10:00 IST",
      unlocksIn: "in 12 days (15 Oct 10:00 AM)",
      startsDate: "15th Oct 2026 10:00",
      startsRelative: "in 12 days",
      endsDate: "15th Oct 2026 13:00",
      endsRelative: "in 12 days",
      subjects: ["4D-Var Data Assimilation", "Planetary Boundary Layer", "WRF/GFS Ensembles"],
      durationMinutes: 60,
      totalMarks: 100,
      isSubmitted: false
    },
    {
      id: "up_2",
      title: "#32 Doppler Weather Radar Network & Severe Storm Nowcasting",
      scheduledByTrainer: "Dr. Priya Sharma (Radar Operations Division)",
      scheduledDate: "20th Oct 2026 11:00 IST",
      unlocksIn: "in 17 days (20 Oct 11:00 AM)",
      startsDate: "20th Oct 2026 11:00",
      startsRelative: "in 17 days",
      endsDate: "20th Oct 2026 12:30",
      endsRelative: "in 17 days",
      subjects: ["Nyquist Velocity", "Dual-Polarization (ZDR/KDP)", "CAPPI Nowcasting"],
      durationMinutes: 45,
      totalMarks: 60,
      isSubmitted: false
    },
    {
      id: "up_3",
      title: "#33 Agro-Meteorology & Crop-Weather Advisory Certification",
      scheduledByTrainer: "Prof. Anil Kumar (Agricultural Meteorology Division)",
      scheduledDate: "25th Oct 2026 09:30 IST",
      unlocksIn: "in 22 days (25 Oct 09:30 AM)",
      startsDate: "25th Oct 2026 09:30",
      startsRelative: "in 22 days",
      endsDate: "25th Oct 2026 11:00",
      endsRelative: "in 22 days",
      subjects: ["FASAL Guidance", "Soil Moisture Indices", "Micro-climate Modeling"],
      durationMinutes: 45,
      totalMarks: 50,
      isSubmitted: false
    }
  ];

  const filteredCompleted = completedExamsData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans select-none text-slate-800">
      
      {/* ═════════ TOP HEADER BANNER ═════════ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Scheduled Assessments & Exams
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Attempt proctored assessments in fullscreen kiosk mode before deadlines to earn certified credentials.
          </p>
        </div>

        {/* 3 Main Navigation Sub-Tabs (Available | Upcoming | Completed) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveSubTab("available")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "available"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Available ({availableQuizzes.length})
          </button>

          <button
            onClick={() => setActiveSubTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "upcoming"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Upcoming ({upcomingQuizzes.length})
          </button>

          <button
            onClick={() => setActiveSubTab("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === "completed"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedExamsData.length})
          </button>
        </div>
      </div>

      {/* ═════════ SUB-TAB 1 & 2: AVAILABLE & UPCOMING (PHOTO 1 CARD FORMAT) ═════════ */}
      {(activeSubTab === "available" || activeSubTab === "upcoming") && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {(activeSubTab === "available" ? availableQuizzes : upcomingQuizzes).map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                
                {/* Header: Title + Takers Badge (Available only) / Trainer Scheduled Badge (Upcoming) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>CapacityConnect</span>
                    </div>
                  </div>

                  {/* Navy Takers Badge ONLY for Available Live Exams */}
                  {activeSubTab === "available" ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#0a2558] text-white rounded-full text-[11px] font-black shrink-0 shadow-sm">
                      <Users className="w-3.5 h-3.5 text-blue-200" />
                      <span>{quiz.takersCount || 34} takers</span>
                    </div>
                  ) : (
                    /* Trainer Scheduled Badge for Upcoming Exams */
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-800 border border-amber-300/60 rounded-full text-[11px] font-black shrink-0 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>{quiz.unlocksIn || "Starts Soon"}</span>
                    </div>
                  )}
                </div>

                {/* Starts & Ends Timeline Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>STARTS</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs">{quiz.startsDate}</p>
                    <p className="text-[11px] text-slate-400 italic">{quiz.startsRelative}</p>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>ENDS</span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs">{quiz.endsDate}</p>
                    <p className="text-[11px] text-slate-400 italic">{quiz.endsRelative}</p>
                  </div>
                </div>

                {/* Upcoming Specific Banner: Trainer Scheduled Go-Live Notice */}
                {activeSubTab === "upcoming" && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-950">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        Go-Live: {quiz.scheduledDate || quiz.startsDate}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Uploaded by: <span className="font-bold text-amber-950">{quiz.scheduledByTrainer || "IMD Division Faculty"}</span>
                    </p>
                  </div>
                )}

                {/* Subjects Pills Row (Exact Match Photo 1) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <Layers className="w-3 h-3" />
                    <span>SUBJECTS</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {quiz.subjects.map((sub, sIdx) => {
                      const isMore = sub.includes("+");
                      return (
                        <span
                          key={sIdx}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isMore
                              ? "bg-slate-100 text-slate-600"
                              : sIdx % 2 === 0
                              ? "bg-cyan-50 text-cyan-900 border border-cyan-100"
                              : "bg-indigo-50 text-indigo-900 border border-indigo-100"
                          }`}
                        >
                          {sub}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Submitted Tag if already attempted */}
                {quiz.isSubmitted && activeSubTab === "available" && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Submitted
                    </span>
                  </div>
                )}

              </div>

              {/* Bottom Footer: Duration, Marks & Start Action */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{quiz.durationMinutes || 30} minutes</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    <span>{quiz.totalMarks || 40} marks</span>
                  </span>
                </div>

                {activeSubTab === "available" ? (
                  <button
                    onClick={() => onStartExam(quiz)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071c42] text-white font-extrabold rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Start</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Locked Until {quiz.startsDate.split(" ")[0]} {quiz.startsDate.split(" ")[1]}</span>
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ═════════ SUB-TAB 3: COMPLETED EXAMS TABLE VIEW (EXACT MATCH PHOTO 2) ═════════ */}
      {activeSubTab === "completed" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 animate-in fade-in duration-150">
          
          {/* Top Search & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search completed assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Total Attempts: {filteredCompleted.length}
              </span>
            </div>
          </div>

          {/* Table (Columns: Quiz | Score | Status | Submitted | Time Taken | Action) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Quiz</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompleted.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Quiz Column */}
                    <td className="py-4 px-4 space-y-1.5">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition-colors">
                        {row.title}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {row.subjects.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="py-4 px-4 font-bold text-xs">
                      {row.isPending ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          🔒 Results Pending
                        </span>
                      ) : (
                        <span className="text-slate-900 font-extrabold">
                          {row.score}
                        </span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                      </span>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-4 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {row.submittedAt}
                    </td>

                    {/* Time Taken */}
                    <td className="py-4 px-4 text-slate-600 font-mono font-bold whitespace-nowrap">
                      {row.timeTaken}
                    </td>

                    {/* Action: Analysis Button */}
                    <td className="py-4 px-4 text-right">
                      {!row.isPending ? (
                        <button
                          onClick={() => setSelectedExamForAnalytics(row)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-extrabold text-xs transition-transform hover:scale-105 border border-blue-200 shadow-sm"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Analysis</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Evaluating</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ═════════ DETAILED EXAM ANALYTICS MODAL (PHOTOS 3, 4, 5) ═════════ */}
      {selectedExamForAnalytics && (
        <ExamAnalyticsModal
          exam={selectedExamForAnalytics}
          currentUser={currentUser}
          onClose={() => setSelectedExamForAnalytics(null)}
        />
      )}

    </div>
  );
};
