import React, { useState, useEffect } from "react";
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  User, 
  Building2, 
  X, 
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const HelpdeskView = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [expandedFaq, setExpandedFaq] = useState(null);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Technical & LMS Query",
    priority: "Medium",
    description: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getHelpdeskTickets();
      if (res.success && Array.isArray(res.tickets)) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error("Failed loading helpdesk tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;
    setSubmitting(true);
    try {
      const payload = {
        ...newTicket,
        submittedBy: currentUser?.name || "Meteorological Officer",
        submittedByEmail: currentUser?.email || "officer@imd.gov.in",
        station: currentUser?.station || "IMD Headquarters"
      };
      const res = await api.createHelpdeskTicket(payload);
      if (res.success) {
        setIsModalOpen(false);
        setNewTicket({ subject: "", category: "Technical & LMS Query", priority: "Medium", description: "" });
        await loadTickets();
      }
    } catch (err) {
      alert("Failed submitting ticket: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.submittedBy || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const faqs = [
    {
      q: "How do I access operational WRF simulation datasets for my station?",
      a: "Navigate to the Courses tab and open 'Advanced Numerical Weather Prediction & WRF Data Assimilation'. Authorized officers can stream domain files directly in the Learning Studio."
    },
    {
      q: "What is the procedure for obtaining Doppler Weather Radar (DWR) certification?",
      a: "Enroll in the 'S-Band Doppler Weather Radar Calibration & Convective Nowcasting' course, complete all 4 modules, and pass the final kiosk-proctored assessment with ≥75% marks."
    },
    {
      q: "How are Kiosk Exam passcodes issued for RMC station assessments?",
      a: "Kiosk access codes are automatically generated 24 hours prior to scheduled assessments and sent to registered @imd.gov.in email addresses."
    },
    {
      q: "How can I verify official digital certificates issued by MoES?",
      a: "Use the Certificate Verification barcode scanner on the public portal home page or enter the unique Certificate ID (e.g. MOES-IMD-CERT-2025-0981)."
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              MoES / IMD Helpdesk & Technical Support
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Support ticket hub for regional meteorologists, faculty, and cadet trainees
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, subject, or officer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "open", "in progress", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Tickets List + FAQ Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support Tickets Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Active Support Tickets ({filteredTickets.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              Loading support tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">No support tickets match your filter criteria.</p>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs hover:border-blue-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-medium text-slate-400">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        t.priority === "Urgent" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" :
                        t.priority === "High" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}>
                        {t.priority}
                      </span>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        {t.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {t.subject}
                    </h3>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                    t.status === "Resolved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" :
                    t.status === "In Progress" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" :
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}>
                    {t.status === "Resolved" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.description}
                </p>

                {t.responses && t.responses.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Staff Resolution Remark:
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      "{t.responses[t.responses.length - 1].text}"
                    </p>
                    <p className="text-[10px] text-slate-400 text-right">
                      — {t.responses[t.responses.length - 1].author}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {t.submittedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {t.station}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAQ Accordion Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Frequently Asked Questions (FAQ)
            </h2>

            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex justify-between items-center transition-colors"
                  >
                    <span>{faq.q}</span>
                    {expandedFaq === idx ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />}
                  </button>

                  {expandedFaq === idx && (
                    <div className="p-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Submit Support Ticket
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Direct technical inquiry to Ministry of Earth Sciences training cell
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Subject / Headline *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. WRF Grid Nesting Issue or DWR Data Ingestion Latency"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Technical & LMS Query</option>
                    <option>Data Sync & Telemetry</option>
                    <option>Certification & Cadre</option>
                    <option>Assessment Kiosk</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Provide technical details, station location, model domain parameters, or error messages..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting..." : "Submit Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskView;

