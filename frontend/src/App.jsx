import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNavbar } from "./components/layout/TopNavbar";
import { QuestionBankTable } from "./components/quiz/QuestionBankTable";
import { KioskExamMode } from "./components/quiz/KioskExamMode";
import { TraineeAssessmentsView } from "./components/quiz/TraineeAssessmentsView";
import { AiQuestionModal } from "./components/quiz/AiQuestionModal";
import { QuizScheduleModal } from "./components/quiz/QuizScheduleModal";
import { QuizAnalyticsModal } from "./components/quiz/QuizAnalyticsModal";
import { CourseLearningStudio } from "./components/courses/CourseLearningStudio";
import { CourseCatalogView } from "./components/courses/CourseCatalogView";
import { CourseOverviewPage } from "./components/courses/CourseOverviewPage";
import { PrerequisiteCheckModal } from "./components/courses/PrerequisiteCheckModal";
import { AiCourseAdvisorModal } from "./components/courses/AiCourseAdvisorModal";
import { CreateCourseModal } from "./components/courses/CreateCourseModal";
import { OfficerProfileView } from "./components/profile/OfficerProfileView";
import { CredentialsCertificationsView } from "./components/certificates/CredentialsCertificationsView";
import { CertificateModal } from "./components/profile/CertificateModal";
import { CompetencyMatrixView } from "./components/admin/CompetencyMatrixView";
import { UserApprovalQueue } from "./components/admin/UserApprovalQueue";
import { CredentialVerificationView } from "./components/admin/CredentialVerificationView";
import { OrganizationStructureView } from "./components/admin/OrganizationStructureView";
import { AuditLogView } from "./components/admin/AuditLogView";
import { BroadcastManagerModal } from "./components/admin/BroadcastManagerModal";
import { TraineeDashboardView } from "./components/dashboard/TraineeDashboardView";
import { TrainerDashboardView } from "./components/dashboard/TrainerDashboardView";
import { AdminDashboardView } from "./components/dashboard/AdminDashboardView";
import { ContentLibraryView } from "./components/trainer/ContentLibraryView";
import { TrainerCurriculumStudio } from "./components/trainer/TrainerCurriculumStudio";
import { TrainerScheduleAssessmentView } from "./components/trainer/TrainerScheduleAssessmentView";
import { PublicHomePage } from "./pages/PublicHomePage";
import { LoginPage } from "./pages/LoginPage";
import { PublicCertificateVerifyPage } from "./pages/PublicCertificateVerifyPage";
import { api } from "./services/api";
import { 
  Plus, 
  BarChart3, 
  X
} from "lucide-react";

const MainApp = () => {
  const { currentUser, refreshProfile } = useAuth();
  
  // Rule 16 Navigation: If authenticated -> portal; if not -> landing
  const [viewMode, setViewMode] = useState(() => (currentUser ? "portal" : "landing"));
  const [activeTab, setActiveTab] = useState("dashboard");

  // Keep viewMode synced if user logs in or out
  useEffect(() => {
    if (!currentUser && viewMode === "portal") {
      setViewMode("landing");
    }
  }, [currentUser]);

  // Course Overview and Learning Studio
  const [selectedOverviewCourse, setSelectedOverviewCourse] = useState(null);
  const [activeStudioCourse, setActiveStudioCourse] = useState(null);
  const [activeTrainerStudioCourse, setActiveTrainerStudioCourse] = useState(null);

  // Active Modals & Exam states
  const [activeExamQuiz, setActiveExamQuiz] = useState(null);
  const [selectedQuizAnalyticsId, setSelectedQuizAnalyticsId] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const [verifyCertificateCode, setVerifyCertificateCode] = useState("");
  
  const [prereqModalCourse, setPrereqModalCourse] = useState(null);
  const [isAiCourseAdvisorOpen, setIsAiCourseAdvisorOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [contentLibrarySubjectFilter, setContentLibrarySubjectFilter] = useState("all");

  // Global Data
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const refreshGlobalData = async () => {
    try {
      const [cRes, qRes, aRes] = await Promise.all([
        api.getCourses(),
        api.getQuizzes(),
        api.getAnnouncements()
      ]);
      if (cRes.success) setCourses(cRes.courses || []);
      if (qRes.success) setQuizzes(qRes.quizzes || []);
      if (aRes.success) setAnnouncements(aRes.announcements || []);
    } catch (err) {
      console.error("Global data refresh failed:", err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  const handleEnrollCourseSuccess = async (courseId) => {
    try {
      const res = await api.enrollCourse(courseId);
      if (res.success) {
        await refreshGlobalData();
        if (selectedOverviewCourse && selectedOverviewCourse.id === courseId) {
          setSelectedOverviewCourse(prev => ({
            ...prev,
            enrolledTraineeIds: [...(prev.enrolledTraineeIds || []), currentUser?.id]
          }));
        }
      }
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  // 1. Landing page view (Rule 16: Public Default)
  if (viewMode === "landing") {
    return (
      <PublicHomePage
        onEnterPortal={() => setViewMode(currentUser ? "portal" : "login")}
        onOpenLoginPage={() => setViewMode("login")}
        onOpenVerifyCertificate={(code) => {
          setVerifyCertificateCode(code || "");
          setViewMode("verify-cert");
        }}
        onOpenCourse={(c) => {
          setSelectedOverviewCourse(c);
          setViewMode("portal");
        }}
      />
    );
  }

  // 2. Dedicated Login / Register page
  if (viewMode === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => setViewMode("portal")}
        onBack={() => setViewMode("landing")}
      />
    );
  }

  // 3. Public Certificate Verification page
  if (viewMode === "verify-cert") {
    return (
      <PublicCertificateVerifyPage
        initialCode={verifyCertificateCode}
        onBack={() => setViewMode("landing")}
      />
    );
  }

  // If Trainer Curriculum Studio is active -> Render Trainer Curriculum Studio!
  if (activeTrainerStudioCourse) {
    return (
      <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden select-none">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTrainerStudioCourse(null);
            setSelectedOverviewCourse(null);
            setActiveStudioCourse(null);
            setActiveTab(tab);
          }}
          onOpenLoginPage={() => setViewMode("login")}
        />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <TrainerCurriculumStudio
            course={activeTrainerStudioCourse.course}
            initialSubjectId={activeTrainerStudioCourse.subjectId}
            currentUser={currentUser}
            onBack={() => setActiveTrainerStudioCourse(null)}
            onOpenContentLibrary={(subjectId) => {
              setActiveTrainerStudioCourse(null);
              setContentLibrarySubjectFilter(subjectId || "all");
              setActiveTab("content-library");
            }}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
            onOpenAnalytics={(qId) => setSelectedQuizAnalyticsId(qId || "quiz_nwp_01")}
          />
        </div>
      </div>
    );
  }

  // If Full-Tab Course Studio is active -> Render full studio
  if (activeStudioCourse) {
    return (
      <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden select-none">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveStudioCourse(null);
            setSelectedOverviewCourse(null);
            setActiveTab(tab);
          }}
          onOpenLoginPage={() => setViewMode("login")}
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <CourseLearningStudio
            course={activeStudioCourse}
            currentUser={currentUser}
            onBack={() => setActiveStudioCourse(null)}
            onEnrollSuccess={() => refreshGlobalData()}
          />
        </div>
      </div>
    );
  }

  // If Course Overview Page is selected
  if (selectedOverviewCourse) {
    return (
      <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden select-none">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setSelectedOverviewCourse(null);
            setActiveTab(tab);
          }}
          onOpenLoginPage={() => setViewMode("login")}
        />
        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <CourseOverviewPage
            course={selectedOverviewCourse}
            currentUser={currentUser}
            onBack={() => setSelectedOverviewCourse(null)}
            onOpenStudio={(c) => {
              setSelectedOverviewCourse(null);
              if (currentUser?.role === "trainer") {
                setActiveTrainerStudioCourse({ course: c, subjectId: c.subjects?.[0]?.id });
              } else {
                setActiveStudioCourse(c);
              }
            }}
            onEnrollClick={(c) => setPrereqModalCourse(c)}
          />
        </div>

        {prereqModalCourse && (
          <PrerequisiteCheckModal
            isOpen={!!prereqModalCourse}
            course={prereqModalCourse}
            currentUser={currentUser}
            onClose={() => setPrereqModalCourse(null)}
            onEnrollSuccess={handleEnrollCourseSuccess}
            onOpenProfile={() => {
              setPrereqModalCourse(null);
              setSelectedOverviewCourse(null);
              setActiveTab("profile");
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden select-none">
      {/* Deep Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLoginPage={() => setViewMode("login")}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          onOpenAnnouncements={() => setShowAnnouncementsModal(true)}
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
          onOpenLoginPage={() => setViewMode("login")}
        />

        {/* Dynamic Tab Pane */}
        <main className="flex-1 overflow-y-auto">
          {/* 1. DASHBOARD VIEW (Role-Specific) */}
          {activeTab === "dashboard" && (
            <>
              {currentUser?.role === "trainee" && (
                <TraineeDashboardView
                  currentUser={currentUser}
                  onStartExam={(q) => setActiveExamQuiz(q)}
                  onOpenCourse={(c) => setSelectedOverviewCourse(c)}
                  onOpenProfile={() => setActiveTab("profile")}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenAiAdvisor={() => setIsAiCourseAdvisorOpen(true)}
                  onOpenCertificate={(submission, courseTitle, traineeName) => {
                    setCertificateData({ submission, courseTitle, traineeName });
                  }}
                />
              )}

              {currentUser?.role === "trainer" && (
                <TrainerDashboardView
                  currentUser={currentUser}
                  onOpenQuestionBank={() => setActiveTab("questions")}
                  onOpenAiGenerator={() => setIsAiModalOpen(true)}
                  onOpenScheduleQuiz={() => setIsScheduleModalOpen(true)}
                  onOpenAnalytics={(qId) => setSelectedQuizAnalyticsId(qId)}
                  onOpenCourse={(c) => setSelectedOverviewCourse(c)}
                  onOpenTrainerStudio={(c, subjectId) => setActiveTrainerStudioCourse({ course: c, subjectId })}
                  onOpenCreateCourse={() => setIsCreateCourseModalOpen(true)}
                  onOpenContentLibrary={(subjectId) => {
                    setContentLibrarySubjectFilter(subjectId || "all");
                    setActiveTab("content-library");
                  }}
                />
              )}

              {currentUser?.role === "admin" && (
                <AdminDashboardView
                  onOpenApprovals={() => setActiveTab("approvals")}
                  onOpenCredentialVerification={() => setActiveTab("credential-verification")}
                  onOpenOrgStructure={() => setActiveTab("org-structure")}
                  onOpenCompetency={() => setActiveTab("competency")}
                  onOpenAnnouncements={() => setIsBroadcastModalOpen(true)}
                  onOpenCreateCourse={() => setIsCreateCourseModalOpen(true)}
                  onOpenAuditLogs={() => setActiveTab("audit-logs")}
                />
              )}
            </>
          )}

          {/* 2. CONTENT LIBRARY (Trainer Media & Learning Materials) */}
          {activeTab === "content-library" && (
            <ContentLibraryView
              currentUser={currentUser}
              initialSubjectFilter={contentLibrarySubjectFilter}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
            />
          )}

          {/* 3. QUESTION BANK (Trainer & Admin Only) */}
          {activeTab === "questions" && (
            <div className="p-6 space-y-6">
              <QuestionBankTable
                currentUser={currentUser}
                onOpenAiGenerator={() => setIsAiModalOpen(true)}
                onOpenScheduleQuiz={() => setIsScheduleModalOpen(true)}
              />
            </div>
          )}

          {/* 4. TRAINER SCHEDULE ASSESSMENT */}
          {(activeTab === "schedule-assessment" || (currentUser?.role === "trainer" && activeTab === "quizzes")) && (
            <TrainerScheduleAssessmentView
              currentUser={currentUser}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
              onOpenContentLibrary={() => setActiveTab("content-library")}
            />
          )}

          {/* 5. SCHEDULED QUIZZES & ASSESSMENTS */}
          {((activeTab === "quizzes" && currentUser?.role !== "trainer") || activeTab === "trainee-quizzes") && (
            currentUser?.role === "trainee" ? (
              <TraineeAssessmentsView
                quizzes={quizzes}
                currentUser={currentUser}
                onStartExam={(quiz) => setActiveExamQuiz(quiz)}
              />
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      Assessment Operations & Controlled Kiosk Mode
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create timed MCQ evaluations with strict start windows, pass marks, and automated grading.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0a2558] hover:bg-[#071c42] text-white font-bold rounded-2xl text-xs shadow-lg transition-transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule New Assessment</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold">
                            {quiz.courseName || "Meteorology Assessment"}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {quiz.durationMinutes} Mins • {quiz.questions?.length || 10} MCQs
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-2">{quiz.title}</h3>
                        <div className="text-xs text-slate-500 space-y-1 mb-4">
                          <p>Trainer: <b>{quiz.trainerName}</b></p>
                          <p>Passing Threshold: <b>{quiz.passMarks}/{quiz.totalMarks} Marks ({Math.round((quiz.passMarks/quiz.totalMarks)*100)}%)</b></p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Active: {new Date(quiz.scheduledStartTime).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => setSelectedQuizAnalyticsId(quiz.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
                        >
                          <BarChart3 className="w-4 h-4 text-[#0a2558]" />
                          <span>Inspect Class Performance</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* 6. COURSES & SUBJECTS CATALOG */}
          {(activeTab === "courses" || activeTab === "subjects" || activeTab === "my-learning") && (
            <CourseCatalogView
              courses={courses}
              currentUser={currentUser}
              onSelectCourse={(course) => setSelectedOverviewCourse(course)}
              onEnrollClick={(course) => setPrereqModalCourse(course)}
              onOpenAiAdvisor={() => setIsAiCourseAdvisorOpen(true)}
            />
          )}

          {/* 7. COMPETENCY MAPPING (Phase 6) */}
          {activeTab === "competency" && <CompetencyMatrixView />}

          {/* 8. OFFICER APPROVALS (Phase 1 & 2) */}
          {activeTab === "approvals" && <UserApprovalQueue />}

          {/* 9. CREDENTIAL VERIFICATION (Phase 7) */}
          {activeTab === "credential-verification" && <CredentialVerificationView />}

          {/* 10. ORGANIZATION STRUCTURE (Phase 3) */}
          {activeTab === "org-structure" && <OrganizationStructureView />}

          {/* 11. GOVERNANCE AUDIT LOGS (Phase 9) */}
          {activeTab === "audit-logs" && <AuditLogView />}

          {/* 12. CERTIFIED CREDENTIALS SHOWCASE */}
          {activeTab === "certificates" && (
            <CredentialsCertificationsView
              currentUser={currentUser}
              onOpenCertificate={(submission, courseTitle, traineeName) => {
                setCertificateData({ submission, courseTitle, traineeName });
              }}
            />
          )}

          {/* 13. OFFICER PROFESSIONAL PROFILE */}
          {activeTab === "profile" && (
            <OfficerProfileView
              onOpenCertificate={(submission, courseTitle, traineeName) => {
                setCertificateData({ submission, courseTitle, traineeName });
              }}
            />
          )}
        </main>
      </div>

      {/* FULLSCREEN CONTROLLED KIOSK EXAM OVERLAY (Phase 5) */}
      {activeExamQuiz && (
        <KioskExamMode
          quiz={activeExamQuiz}
          currentUser={currentUser}
          onClose={() => setActiveExamQuiz(null)}
          onFinish={() => {
            refreshGlobalData();
            setActiveExamQuiz(null);
          }}
        />
      )}

      {/* Prerequisite Skill Check Modal */}
      {prereqModalCourse && (
        <PrerequisiteCheckModal
          isOpen={!!prereqModalCourse}
          course={prereqModalCourse}
          currentUser={currentUser}
          onClose={() => setPrereqModalCourse(null)}
          onEnrollSuccess={handleEnrollCourseSuccess}
          onOpenProfile={() => {
            setPrereqModalCourse(null);
            setSelectedOverviewCourse(null);
            setActiveTab("profile");
          }}
        />
      )}

      {/* Gemini AI Course Advisor Modal */}
      <AiCourseAdvisorModal
        isOpen={isAiCourseAdvisorOpen}
        onClose={() => setIsAiCourseAdvisorOpen(false)}
        currentUser={currentUser}
        courses={courses}
        onSelectCourse={(course) => setSelectedOverviewCourse(course)}
        onEnrollCourse={(course) => setPrereqModalCourse(course)}
      />

      {/* AI Question Modal */}
      <AiQuestionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onQuestionsGenerated={() => {
          refreshGlobalData();
          setActiveTab("questions");
        }}
      />

      {/* Quiz Schedule Modal */}
      <QuizScheduleModal
        isOpen={isScheduleModalOpen}
        currentUser={currentUser}
        onClose={() => setIsScheduleModalOpen(false)}
        onQuizCreated={() => refreshGlobalData()}
      />

      {/* Quiz Analytics Modal */}
      <QuizAnalyticsModal
        isOpen={!!selectedQuizAnalyticsId}
        quizId={selectedQuizAnalyticsId}
        onClose={() => setSelectedQuizAnalyticsId(null)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!certificateData}
        submission={certificateData?.submission}
        courseTitle={certificateData?.courseTitle}
        traineeName={certificateData?.traineeName}
        onClose={() => setCertificateData(null)}
      />

      {/* Broadcast Manager Modal */}
      <BroadcastManagerModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onPublished={() => refreshGlobalData()}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onCourseCreated={() => {
          refreshGlobalData();
          setIsCreateCourseModalOpen(false);
        }}
      />

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900">Active MoES Directives & Circulars</h2>
              <button onClick={() => setShowAnnouncementsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              {announcements.map((a, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{a.title}</span>
                    <span className="text-[10px] text-slate-400">{a.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
