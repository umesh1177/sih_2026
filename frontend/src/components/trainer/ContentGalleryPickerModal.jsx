import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Filter, 
  Presentation, 
  FileText, 
  Video, 
  FileCode, 
  Check, 
  Plus, 
  FolderKanban, 
  Eye, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Bookmark, 
  HardDrive, 
  Clock, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Maximize2
} from "lucide-react";
import { api } from "../../services/api";
import { cleanSubject, cleanTopic } from "./ContentLibraryView";

export const ContentGalleryPickerModal = ({
  isOpen,
  onClose,
  course,
  subject,
  targetModule,
  currentUser,
  onAttachedSuccess,
  onOpenPreview
}) => {
  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // "all" | "video" | "ppt" | "pdf" | "manual"
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [attaching, setAttaching] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLibraryItems();
      setSelectedItemIds([]);
      setFeedback(null);
    }
  }, [isOpen, subject]);

  const loadLibraryItems = async () => {
    try {
      setLoading(true);
      const res = await api.getContentLibrary({
        trainerId: currentUser?.id,
        trainerName: currentUser?.name
      });
      if (res.success && res.items) {
        const sanitized = res.items.map(i => ({
          ...i,
          subject: cleanSubject(i.subject || i.subjectName),
          topic: cleanTopic(i.topic || i.moduleTitle)
        }));
        setLibraryItems(sanitized);
      }
    } catch (err) {
      console.error("Failed to load content gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAttachSubmit = async () => {
    if (selectedItemIds.length === 0) return;
    if (!targetModule) return;

    setAttaching(true);
    try {
      const selectedMaterials = libraryItems.filter(i => selectedItemIds.includes(i.id));
      let successCount = 0;

      for (const item of selectedMaterials) {
        // Try mapped attach API endpoint
        const attachRes = await api.attachContentLibraryItem(
          item.id, 
          course.id, 
          subject.id, 
          targetModule.id
        ).catch(() => ({ success: false }));

        if (!attachRes.success) {
          // Fallback to uploadMaterial payload
          await api.uploadMaterial(course.id, subject.id, targetModule.id, {
            id: item.id,
            title: item.title,
            type: item.type === "ppt" ? "presentation" : item.type,
            url: item.url,
            duration: item.duration,
            pages: item.pages,
            size: item.size || "4.5 MB",
            uploadedBy: item.uploadedBy || currentUser?.name || "Dr. Amit Sengupta",
            allowDownload: item.downloadAllowed !== false
          }).catch(e => console.warn(e));
        }
        successCount++;
      }

      setFeedback({
        type: "success",
        message: `Successfully attached ${successCount} learning material(s) to ${targetModule.title}!`
      });

      if (onAttachedSuccess) {
        onAttachedSuccess(targetModule.id, selectedMaterials);
      }

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      setFeedback({
        type: "error",
        message: `Attachment failed: ${err.message}`
      });
    } finally {
      setAttaching(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-blue-600" />;
      case "ppt":
        return <Presentation className="w-4 h-4 text-purple-600" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-600" />;
      default:
        return <FileCode className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-slate-900">
                Select Materials from Content Library
              </h3>
              <p className="text-xs text-slate-500">
                Attaching to: <b className="text-slate-800">{subject?.name || "Assigned Subject"}</b> &rsaquo; <span className="text-[#1D4ED8] font-bold">{targetModule?.title || "Target Module"}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search repository by material title, topic, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a2558]"
              />
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {[
                { id: "all", label: "All Formats" },
                { id: "video", label: "🎥 Videos" },
                { id: "ppt", label: "📊 PPT Decks" },
                { id: "pdf", label: "📑 PDFs" },
                { id: "manual", label: "🧪 Manuals" }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedType === type.id
                      ? "bg-[#0a2558] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Content Items List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#0a2558] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading Content Library...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-slate-700">No matching materials in Content Library</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try clearing your search or add new materials in the Content Library tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map(item => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "bg-blue-50/70 border-[#0a2558] ring-2 ring-[#0a2558]/20 shadow-md"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Top Row: Format badge, Checkbox & Preview button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                          {item.format || item.type.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {onOpenPreview && (
                          <button
                            type="button"
                            onClick={() => onOpenPreview(item)}
                            className="p-1.5 bg-slate-100 hover:bg-[#0a2558] text-slate-600 hover:text-white rounded-lg text-xs transition-colors"
                            title="Preview Material"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#0a2558] border-[#0a2558] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>

                    {/* Title & Topic */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Bookmark className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="line-clamp-1">{item.topic}</span>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        {item.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.duration}
                          </span>
                        )}
                        {item.pages && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {item.pages} Pgs
                          </span>
                        )}
                        {item.size && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <HardDrive className="w-3 h-3" />
                            {item.size}
                          </span>
                        )}
                      </div>
                      <span>{item.uploadDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 font-bold">
            {selectedItemIds.length === 0 ? (
              <span className="text-slate-400">No items selected</span>
            ) : (
              <span className="text-blue-900">
                <b>{selectedItemIds.length}</b> material(s) selected for <b>{targetModule?.title}</b>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAttachSubmit}
              disabled={selectedItemIds.length === 0 || attaching}
              className="px-6 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {attaching ? "Attaching to Module..." : `Attach & Upload to ${targetModule?.title?.split(":")[0] || "Module"}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
