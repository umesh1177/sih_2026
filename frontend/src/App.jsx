import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNavbar } from "./components/layout/TopNavbar";
import { QuestionBankTable } from "./components/quiz/QuestionBankTable";
import { KioskExamMode } from "./components/quiz/KioskExamMode";
import { TraineeAssessmentsView } from "./components/quiz/TraineeAssessmentsView";
import { TraineePracticePapersView } from "./components/quiz/TraineePracticePapersView";
import { AiQuestionModal } from "./components/quiz/AiQuestionModal";
import { QuizScheduleModal } from "./components/quiz/QuizScheduleModal";
import { QuizAnalyticsModal } from "./components/quiz/QuizAnalyticsModal";
import { CourseLearningStudio } from "./components/courses/CourseLearningStudio";
import { CourseCatalogView } from "./components/courses/CourseCatalogView";
import { CourseOverviewPage } from "./components/courses/CourseOverviewPage";
import { PrerequisiteCheckModal } from "./components/courses/PrerequisiteCheckModal";
import { AiCourseAdvisorModal } from "./components/courses/AiCourseAdvisorModal";
import { CreateCourseModal } from "./components/courses/CreateCourseModal";
import { ProfessionalProfileModal } from "./components/profile/ProfessionalProfileModal";
import { OfficerProfileView } from "./components/profile/OfficerProfileView";
import { CredentialsCertificationsView } from "./components/certificates/CredentialsCertificationsView";
import { CertificateModal } from "./components/profile/CertificateModal";
import { CompetencyMatrixView } from "./components/admin/CompetencyMatrixView";
import { UserApprovalQueue } from "./components/admin/UserApprovalQueue";
import { BroadcastManagerModal } from "./components/admin/BroadcastManagerModal";
import { NationalBroadcastsView } from "./components/admin/NationalBroadcastsView";
import { PlatformAnalyticsView } from "./components/admin/PlatformAnalyticsView";
import { TraineeDashboardView } from "./components/dashboard/TraineeDashboardView";
import { TrainerDashboardView } from "./components/dashboard/TrainerDashboardView";
import { AdminDashboardView } from "./components/dashboard/AdminDashboardView";
import { ContentLibraryView } from "./components/trainer/ContentLibraryView";
import { TrainerCurriculumStudio } from "./components/trainer/TrainerCurriculumStudio";
import { TrainerScheduleAssessmentView } from "./components/trainer/TrainerScheduleAssessmentView";
import { TraineePerformanceCategoryView } from "./components/analytics/TraineePerformanceCategoryView";
import { LearningGapDetectionHub } from "./components/analytics/LearningGapDetectionHub";
import { CourseFeedbackImprovementStudio } from "./components/analytics/CourseFeedbackImprovementStudio";
import { TrainerMatchingWorkloadHub } from "./components/trainer/TrainerMatchingWorkloadHub";
import { PublicHomePage } from "./pages/PublicHomePage";
import { LoginPage } from "./pages/LoginPage";
import { api } from "./services/api";
import { 
  BookOpen, 
  Layers, 
  Award, 
  Sparkles, 
  Plus, 
  BarChart3, 
  ClipboardList, 
  BellRing,
  UserCheck,
  CheckCircle2,
  X,
  PlayCircle,
  FileText
} from "lucide-react";

const MainApp = () => {
  const { currentUser, switchAccount, demoAccounts } = useAuth();
  
  // Navigation & Page views: Defaults to Home Page ("landing")
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verify") || params.get("id")) return "landing";
    if (params.get("mode") === "portal" || params.get("tab")) return "portal";
    if (params.get("mode") === "login") return "login";
    return "landing";
  });
  const [activeTab, setActiveTab] = useState("dashboard");

  // Course Overview (Matching iGOT style) and Learning Studio
  const [selectedOverviewCourse, setSelectedOverviewCourse] = useState(null);
  const [activeStudioCourse, setActiveStudioCourse] = useState(null);
  const [activeTrainerStudioCourse, setActiveTrainerStudioCourse] = useState(null); // { course, subjectId }

  // Active Modals & Fullscreen states
  const [activeExamQuiz, setActiveExamQuiz] = useState(null);
  const [selectedQuizAnalyticsId, setSelectedQuizAnalyticsId] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  
  const [prereqModalCourse, setPrereqModalCourse] = useState(null);
  const [isAiCourseAdvisorOpen, setIsAiCourseAdvisorOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      if (cRes.success) setCourses(cRes.courses);
      if (qRes.success) setQuizzes(qRes.quizzes);
      if (aRes.success) setAnnouncements(aRes.announcements);
    } catch (err) {
      console.error("Global data refresh failed:", err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, []);

  const handleEnrollCourseSuccess = async (courseId) => {
    try {
      const res = await api.enrollCourse(courseId, currentUser?.id || "u_trainee_1");
      if (res.success) {
        await refreshGlobalData();
        // Update selected overview course state if open
        if (selectedOverviewCourse && selectedOverviewCourse.id === courseId) {
          setSelectedOverviewCourse(prev => ({
            ...prev,
            enrolledTraineeIds: [...(prev.enrolledTraineeIds || []), currentUser?.id]
          }));
        }
        alert("✅ " + res.message);
      } else {
        alert("❌ " + (res.message || "Enrollment failed. Administrative approval is required."));
      }
    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Enrollment failed: " + err.message);
    }
  };

  // Landing page view
  if (viewMode === "landing") {
    return (
      <PublicHomePage
        onEnterPortal={() => setViewMode("portal")}
        onOpenLoginPage={() => setViewMode("login")}
        onOpenCourse={(c) => {
          setSelectedOverviewCourse(c);
          setViewMode("portal");
        }}
      />
    );
  }

  // Dedicated Login / Register page
  if (viewMode === "login") {
    return (
      <LoginPage
        onLoginSuccess={() => setViewMode("portal")}
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
          onOpenHomePage={() => setViewMode("landing")}
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

  // If Full-Tab Course Studio is active -> Render full studio in the portal tab!
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
          onOpenHomePage={() => setViewMode("landing")}
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

  // If Course Overview Page (Matching shared photo) is selected -> Render Course Overview Page!
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
          onOpenHomePage={() => setViewMode("landing")}
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
        onOpenHomePage={() => setViewMode("landing")}
        onOpenAiAdvisor={() => setIsAiCourseAdvisorOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          onOpenAnnouncements={() => setShowAnnouncementsModal(true)}
          onOpenAiCourseAdvisor={() => setIsAiCourseAdvisorOpen(true)}
          onOpenAiGenerator={() => setIsAiModalOpen(true)}
          onOpenLoginPage={() => setViewMode("login")}
        />

        {/* Dynamic Tab Pane */}
        <main className="flex-1 overflow-y-auto">
          {/* 1. DASHBOARD VIEW (Role specific) */}
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
                  onNavigatePerformance={() => setActiveTab("trainee-performance")}
                />
              )}

              {currentUser?.role === "admin" && (
                <AdminDashboardView
                  onOpenApprovals={() => setActiveTab("approvals")}
                  onOpenBroadcastModal={() => setActiveTab("announcements")}
                  onOpenCreateCourse={() => setIsCreateCourseModalOpen(true)}
                  onOpenAnalytics={() => setActiveTab("analytics")}
                  onNavigatePerformance={() => setActiveTab("trainee-performance")}
                  onNavigateTrainerMatching={() => setActiveTab("trainer-matching")}
                />
              )}
            </>
          )}

          {/* 2. CONTENT LIBRARY (Trainer Media & Learning Materials Repository) */}
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

          {/* 3. AI PRACTICE PAPERS & ADAPTIVE TESTING (Trainee Studio) */}
          {activeTab === "practice-papers" && (
            <TraineePracticePapersView
              currentUser={currentUser}
              onStartExam={(paper) => setActiveExamQuiz(paper)}
              onOpenQuestionBank={() => setActiveTab("questions")}
              onOpenAiGenerator={() => setIsAiModalOpen(true)}
            />
          )}

          {/* 4. QUESTION BANK (Accessible by Trainees, Trainers & Admins) */}
          {activeTab === "questions" && (
            <div className="p-6 space-y-6">
              <QuestionBankTable
                currentUser={currentUser}
                onOpenAiGenerator={() => setIsAiModalOpen(true)}
                onOpenScheduleQuiz={() => setIsScheduleModalOpen(true)}
                onNavigatePracticePapers={() => setActiveTab("practice-papers")}
                onStartExam={(paper) => setActiveExamQuiz(paper)}
              />
            </div>
          )}

          {/* 3. TRAINER SCHEDULE ASSESSMENT (Dedicated Comprehensive Module) */}
          {(activeTab === "schedule-assessment" || (currentUser?.role === "trainer" && activeTab === "quizzes")) && (
            <TrainerScheduleAssessmentView
              currentUser={currentUser}
              onOpenQuestionBank={() => setActiveTab("questions")}
              onScheduleSuccess={() => {
                refreshGlobalData();
                setActiveTab("schedule-assessment");
              }}
              onOpenContentLibrary={() => setActiveTab("content-library")}
            />
          )}

          {/* 4. SCHEDULED QUIZZES & ASSESSMENTS */}
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
                      Assessment Operations & Kiosk Scheduling
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

                {/* Trainer / Admin Quizzes List */}
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

          {/* 4. COURSES & SUBJECTS CATALOG (Rich Filtered View with Admin Management) */}
          {(activeTab === "courses" || activeTab === "subjects" || activeTab === "my-learning") && (
            <CourseCatalogView
              courses={courses}
              currentUser={currentUser}
              activeTab={activeTab}
              onNavigateCourses={() => setActiveTab("courses")}
              onSelectCourse={(course) => setSelectedOverviewCourse(course)}
              onEnrollClick={(course) => setPrereqModalCourse(course)}
              onOpenCertificate={(submission, courseTitle, traineeName) => {
                setCertificateData({ submission, courseTitle, traineeName });
              }}
              onOpenTrainerStudio={(course, subjectId) => {
                setActiveTrainerStudioCourse({ course, subjectId });
              }}
              onRefreshCourses={refreshGlobalData}
            />
          )}

          {/* 5. USER APPROVALS */}
          {activeTab === "approvals" && <UserApprovalQueue />}

          {/* 6. NATIONAL BROADCASTS & CIRCULARS HUB */}
          {activeTab === "announcements" && (
            <NationalBroadcastsView onRefreshData={refreshGlobalData} />
          )}

          {/* 6.5. TRAINEE PERFORMANCE CLASSIFICATION & DIAGNOSTICS */}
          {activeTab === "trainee-performance" && (
            <TraineePerformanceCategoryView
              currentUser={currentUser}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
              onOpenCourse={(course) => {
                setSelectedOverviewCourse(course);
              }}
            />
          )}

          {/* 6.6. AUTOMATED LEARNING GAP DETECTION & REMEDIATION HUB */}
          {activeTab === "learning-gaps" && (
            <LearningGapDetectionHub
              currentUser={currentUser}
              onStartExam={(quiz) => setActiveExamQuiz(quiz)}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
              onOpenCourse={(course) => {
                setSelectedOverviewCourse(course);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* 6.7. TRAINER FEEDBACK -> COURSE IMPROVEMENT STUDIO (RULE 16) */}
          {activeTab === "course-feedback" && (
            <CourseFeedbackImprovementStudio
              currentUser={currentUser}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
              onOpenQuestionBank={() => setActiveTab("questions")}
              onOpenAssessment={() => setActiveTab("schedule-assessment")}
            />
          )}

          {/* 6.8. FACULTY MATCHING & WORKLOAD INTELLIGENCE HUB (RULES 17 & 18) */}
          {activeTab === "trainer-matching" && (
            <TrainerMatchingWorkloadHub
              currentUser={currentUser}
              onOpenCreateCourse={() => setIsCreateCourseModalOpen(true)}
              onAssignToCourse={(trainer, subject) => {
                setIsCreateCourseModalOpen(true);
              }}
            />
          )}

          {/* 7. PLATFORM ANALYTICS & REPORTING */}
          {activeTab === "analytics" && (
            <PlatformAnalyticsView />
          )}

          {/* 8. CERTIFICATIONS & CREDENTIALS SHOWCASE */}
          {activeTab === "certificates" && (
            <CredentialsCertificationsView
              currentUser={currentUser}
              onOpenStudio={(course) => {
                setSelectedOverviewCourse(null);
                setActiveStudioCourse(course);
              }}
              onOpenCertificate={(submission, courseTitle, traineeName) => {
                setCertificateData({ submission, courseTitle, traineeName });
              }}
            />
          )}

          {/* 9. OFFICER PROFESSIONAL PROFILE */}
          {activeTab === "profile" && (
            <OfficerProfileView
              onOpenCertificate={(submission, courseTitle, traineeName) => {
                setCertificateData({ submission, courseTitle, traineeName });
              }}
            />
          )}
        </main>
      </div>

      {/* FULLSCREEN KIOSK EXAM OVERLAY */}
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

      {/* Other Modals */}
      <AiQuestionModal
        isOpen={isAiModalOpen}
        currentUser={currentUser}
        onClose={() => setIsAiModalOpen(false)}
        onQuestionsGenerated={() => {
          refreshGlobalData();
          setActiveTab("questions");
        }}
      />

      <QuizScheduleModal
        isOpen={isScheduleModalOpen}
        currentUser={currentUser}
        onClose={() => setIsScheduleModalOpen(false)}
        onQuizCreated={() => refreshGlobalData()}
      />

      <QuizAnalyticsModal
        isOpen={!!selectedQuizAnalyticsId}
        quizId={selectedQuizAnalyticsId}
        onClose={() => setSelectedQuizAnalyticsId(null)}
      />

      <ProfessionalProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <CertificateModal
        isOpen={!!certificateData}
        submission={certificateData?.submission}
        courseTitle={certificateData?.courseTitle}
        traineeName={certificateData?.traineeName}
        onClose={() => setCertificateData(null)}
      />

      <BroadcastManagerModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onPublished={() => refreshGlobalData()}
      />

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
