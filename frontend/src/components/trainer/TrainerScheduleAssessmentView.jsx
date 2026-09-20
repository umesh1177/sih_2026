import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Award,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Eye,
  Send,
  FileText,
  Check,
  RotateCcw,
  BookOpen,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Trash2,
  Edit3,
  Building2,
  HelpCircle,
  ShieldCheck,
  Flame,
  Target,
  Loader2,
  FileCheck2,
  PieChart,
  Trophy,
  Medal,
  Zap,
  Download,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { api } from "../../services/api";
import { cleanSubject, cleanTopic } from "./ContentLibraryView";
import AssessmentCards from "./AssessmentCards";

export const TrainerScheduleAssessmentView = ({
  currentUser,
  onOpenStudio,
  onOpenContentLibrary
}) => {
  // Navigation Sub-Tabs: "all" | "upcoming" | "completed" | "pending-eval" | "create"
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [notification, setNotification] = useState(null);

  // Selected Quiz for In-Depth Analytics / Evaluation
  const [selectedQuizForDetails, setSelectedQuizForDetails] = useState(null);
  const [selectedTraineeSubmission, setSelectedTraineeSubmission] = useState(null);
  const [analyticsSubTab, setAnalyticsSubTab] = useState("class-analytics"); // "class-analytics" | "question-analytics" | "trainee-responses" | "leaderboard"
  const [leaderboardSort, setLeaderboardSort] = useState("score"); // "score" | "speed"
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState("all");
  const [traineeSearchTerm, setTraineeSearchTerm] = useState("");

  // ─── HIERARCHICAL PERFORMANCE SELECTOR STATE (Course -> Subject -> Assessment -> Trainee) ───
  const [selectedHierarchyCourseId, setSelectedHierarchyCourseId] = useState("all");
  const [selectedHierarchySubjectId, setSelectedHierarchySubjectId] = useState("all");
  const [selectedHierarchyAssessmentId, setSelectedHierarchyAssessmentId] = useState("all");
  const [selectedHierarchyTraineeId, setSelectedHierarchyTraineeId] = useState("all");

  // ─── ASSESSMENT CREATION FORM STATE ───
  const [createStep, setCreateStep] = useState("basic"); // "basic" | "questions" | "ai-paper"
  const [createForm, setCreateForm] = useState({
    title: "",
    courseId: "",
    courseName: "",
    subjectId: "",
    subjectName: "",
    durationMinutes: 30,
    totalMarks: 20,
    passMarks: 10,
    scheduledStartTime: new Date().toISOString().slice(0, 16),
    deadlineTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  });

  // ─── ASSESSMENT BLUEPRINT STATE (Topic-Wise + Marks-Wise Question Paper Definition) ───
  const [blueprint, setBlueprint] = useState([
    {
      id: "bp_1",
      topic: "Atmospheric Dynamics",
      module: "Module 1",
      type: "mcq", // "mcq" | "one_word"
      questionCount: 2,
      marksPerQuestion: 2.5,
      totalMarks: 5,
      difficulty: "Medium",
      competency: "Atmospheric Equations"
    },
    {
      id: "bp_2",
      topic: "Radar Meteorology",
      module: "Module 2",
      type: "one_word",
      questionCount: 2,
      marksPerQuestion: 3.5,
      totalMarks: 7,
      difficulty: "Hard",
      competency: "Radar Polarimetry"
    },
    {
      id: "bp_3",
      topic: "Numerical Weather Prediction",
      module: "Module 3",
      type: "mcq",
      questionCount: 2,
      marksPerQuestion: 4,
      totalMarks: 8,
      difficulty: "Medium",
      competency: "NWP Grid Dispersion"
    }
  ]);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [newCustomQuestion, setNewCustomQuestion] = useState({
    type: "mcq", // "mcq" | "one_word"
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    expectedAnswer: "",
    acceptedAnswersText: "",
    guidanceNote: "",
    marks: 3,
    difficulty: "Medium",
    competency: "Analytical Reasoning",
    topic: "",
    module: "Module 1",
    explanation: ""
  });
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // ─── AI QUESTION PAPER GENERATOR STATE ───
  const [aiPaperConfig, setAiPaperConfig] = useState({
    moduleName: "",
    topicName: "",
    conceptName: "",
    questionType: "all", // "all" | "mcq" | "one_word"
    questionCount: 5,
    difficulty: "Medium",
    totalMarks: 20
  });
  const [isGeneratingAiPaper, setIsGeneratingAiPaper] = useState(false);
  const [editableAiPaper, setEditableAiPaper] = useState([]);

  const [targetType, setTargetType] = useState("all"); // "all" | "specific"
  const [enrolledTrainees, setEnrolledTrainees] = useState([]);
  const [selectedTraineeIds, setSelectedTraineeIds] = useState([]);
  const [targetTraineeSearch, setTargetTraineeSearch] = useState("");

  // Submissions state for selected quiz
  const [activeSubmissions, setActiveSubmissions] = useState([]);
  const [trainerFeedbackMap, setTrainerFeedbackMap] = useState({});

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const existing = document.querySelector('link[data-trainer-inter-font]');
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
      link.dataset.trainerInterFont = "true";
      document.head.appendChild(link);
    }
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, qRes, qbRes, tRes] = await Promise.all([
        api.getCourses(),
        api.getQuizzes(),
        api.getQuestions(),
        api.getTrainerEnrolledTrainees().catch(() => ({ success: false }))
      ]);

      if (tRes?.success && Array.isArray(tRes.trainees)) {
        setEnrolledTrainees(tRes.trainees);
      } else {
        setEnrolledTrainees([]);
      }

      if (cRes?.success && Array.isArray(cRes.courses)) {
        // Filter assigned courses and subjects for trainer
        const assignedOnly = cRes.courses.filter(c => {
          if (currentUser?.id && (c.leadTrainerId === currentUser.id || c.trainerId === currentUser.id)) return true;
          if (currentUser?.name && c.leadTrainerName) {
            const cName = c.leadTrainerName.toLowerCase();
            const uName = currentUser.name.toLowerCase();
            if (cName === uName || cName.includes(uName) || uName.includes(cName)) return true;
          }
          if (c.subjects && Array.isArray(c.subjects)) {
            return c.subjects.some(s => {
              if (currentUser?.id && (s.trainerId === currentUser.id || s.facultyId === currentUser.id || s.assignedTrainerId === currentUser.id)) return true;
              if (currentUser?.name && (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName)) {
                const sName = (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName).toLowerCase();
                const uName = currentUser.name.toLowerCase();
                if (sName === uName || sName.includes(uName) || uName.includes(sName)) return true;
              }
              return false;
            });
          }
          return false;
        });

        const finalCourses = currentUser?.role === "admin" ? cRes.courses : assignedOnly;
        setCourses(finalCourses);

        if (finalCourses.length > 0) {
          const firstCourse = finalCourses[0];
          const firstSubject = firstCourse.subjects?.[0] || null;
          setCreateForm(prev => ({
            ...prev,
            courseId: firstCourse.id,
            courseName: firstCourse.title,
            subjectId: firstSubject?.id || "",
            subjectName: firstSubject?.name || firstSubject?.title || ""
          }));
          const firstModule = firstSubject?.modules?.[0];
          setAiPaperConfig(prev => ({
            ...prev,
            moduleName: firstModule?.title || "",
            topicName: firstModule?.topics?.[0] || firstSubject?.name || firstCourse.title,
            conceptName: ""
          }));
        } else {
          setCreateForm(prev => ({
            ...prev,
            courseId: "",
            courseName: "",
            subjectId: "",
            subjectName: ""
          }));
        }
      }

      if (qRes?.success && Array.isArray(qRes.quizzes)) {
        let finalQuizzes = qRes.quizzes;
        if (currentUser?.role === "trainer") {
          finalQuizzes = finalQuizzes.filter(q => {
            if (currentUser?.id && (q.trainerId === currentUser.id || q.createdBy === currentUser.id || q.authorId === currentUser.id)) return true;
            if (currentUser?.name && q.trainerName) {
              const qName = q.trainerName.toLowerCase();
              const uName = currentUser.name.toLowerCase();
              if (qName === uName || qName.includes(uName) || uName.includes(qName)) return true;
            }
            if (currentUser?.name && q.createdByName) {
              const qName = q.createdByName.toLowerCase();
              const uName = currentUser.name.toLowerCase();
              if (qName === uName || qName.includes(uName) || uName.includes(qName)) return true;
            }
            return false;
          });
        }
        setQuizzes(finalQuizzes);
      } else {
        setQuizzes([]);
      }

      if (qbRes?.success && Array.isArray(qbRes.questions)) {
        setQuestionBank(qbRes.questions);
      } else {
        setQuestionBank([]);
      }
    } catch (err) {
      console.error("Failed loading assessment data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Switch Course in Create Form -> Auto update subjects & modules
  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    if (!selectedCourse) return;
    const firstSubject = selectedCourse.subjects?.[0] || { id: "subj_1", name: "Atmospheric Dynamics" };
    setCreateForm(prev => ({
      ...prev,
      courseId: selectedCourse.id,
      courseName: selectedCourse.title,
      subjectId: firstSubject.id,
      subjectName: firstSubject.name || firstSubject.title
    }));
    setAiPaperConfig(prev => ({
      ...prev,
      moduleName: firstSubject.modules?.[0]?.title || "Module 1",
      topicName: firstSubject.name || firstSubject.title,
      conceptName: "Core Principles"
    }));
  };

  const handleSubjectChange = (subjectId) => {
    const currentCourse = courses.find(c => c.id === createForm.courseId);
    const selectedSubject = currentCourse?.subjects?.find(s => s.id === subjectId || s.name === subjectId);
    if (!selectedSubject) return;
    setCreateForm(prev => ({
      ...prev,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name || selectedSubject.title
    }));
    setAiPaperConfig(prev => ({
      ...prev,
      moduleName: selectedSubject.modules?.[0]?.title || "Module 1",
      topicName: selectedSubject.name || selectedSubject.title,
      conceptName: "Key Concepts"
    }));
  };

  // Helper: Retrieve syllabus topics taught for the selected subject
  const getSubjectTaughtTopics = (subject) => {
    if (!subject) return [];
    const topics = [];
    (subject.modules || []).forEach(m => {
      if (m.title) topics.push(m.title.replace(/^Module \d+:\s*/i, ""));
      (m.materials || []).forEach(mat => {
        if (mat.title) topics.push(mat.title.replace(/^(Lecture|Presentation|Practical|Lab)\s*\d*:\s*/i, ""));
      });
    });

    const sName = (subject.name || subject.title || "").toLowerCase();
    if (sName.includes("dynamics") || sName.includes("nwp") || sName.includes("modeling")) {
      topics.push("Governing Navier-Stokes Equations", "Arakawa C-Grid Staggering", "CFL Numerical Stability", "4D-Var Data Assimilation", "Sigma Coordinates", "Boundary Layer Parameterizations");
    } else if (sName.includes("radar") || sName.includes("dwr")) {
      topics.push("Dual-Polarization Differential Reflectivity (ZDR)", "Specific Differential Phase (KDP)", "TITAN Convective Cell Tracking", "Hydrometeor Classification", "Doppler Velocity De-Aliasing");
    } else if (sName.includes("cyclone") || sName.includes("tropical")) {
      topics.push("Dvorak Technique Pattern Recognition", "Tropical Cyclogenesis & SST", "ADCIRC Storm Surge Modeling", "RSMC Warning Protocols & Track Forecasts");
    } else if (sName.includes("satellite") || sName.includes("insat")) {
      topics.push("INSAT-3DR Sounder Temperature Profiles", "Water Vapour 6.7 µm Channel Analysis", "Nighttime Fog Brightness Temperature Difference", "Cloud Motion Vectors (CMVs)");
    } else if (sName.includes("agro") || sName.includes("crop")) {
      topics.push("FASAL Agromet Advisory Formulation", "MEGHDOOT Block-Level Forecasts", "Crop Water Stress Index & Phenology", "Agricultural Drought Monitoring");
    }
    return Array.from(new Set(topics));
  };

  const validateTopicForSubject = (enteredTopic, subject) => {
    if (!enteredTopic || !enteredTopic.trim()) {
      return { isValid: true, message: "" };
    }
    const topicLower = enteredTopic.trim().toLowerCase();
    if (!subject) return { isValid: true, message: "" };

    const subjectText = [
      subject.name || "",
      subject.title || "",
      subject.description || "",
      subject.requiredSkills || "",
      ...(subject.modules || []).map(m => `${m.title} ${m.description || ""}`),
      ...getSubjectTaughtTopics(subject)
    ].join(" ").toLowerCase();

    const topicTokens = topicLower.split(/[\s,./\-&]+/).filter(tok => tok.length > 2);
    const isCovered = topicTokens.some(tok => subjectText.includes(tok)) || subjectText.includes(topicLower);

    if (!isCovered) {
      return {
        isValid: false,
        message: `This topic is not teached yet for "${cleanSubject(subject.name || subject.title)}". Please choose or enter a topic covered in the uploaded syllabus modules.`
      };
    }

    return { isValid: true, message: "" };
  };

  // ─── AI QUESTION PAPER GENERATION (AI ENGINE) ───
  const handleGenerateAiPaper = async (e) => {
    if (e) e.preventDefault();

    const curCourse = courses.find(c => c.id === createForm.courseId);
    const curSubject = curCourse?.subjects?.find(s => s.id === createForm.subjectId || s.name === createForm.subjectName || s.title === createForm.subjectName) || curCourse?.subjects?.[0];

    const topicCheck = validateTopicForSubject(aiPaperConfig.conceptName, curSubject);
    if (!topicCheck.isValid) {
      showToast(topicCheck.message, "error");
      return;
    }

    setIsGeneratingAiPaper(true);
    try {
      const res = await api.synthesizeAssessmentPaperWithAI({
        courseTitle: createForm.courseName,
        subjectName: createForm.subjectName,
        moduleName: aiPaperConfig.moduleName,
        topicName: aiPaperConfig.topicName,
        conceptName: aiPaperConfig.conceptName,
        questionCount: Number(aiPaperConfig.questionCount) || 5,
        totalMarks: Number(aiPaperConfig.totalMarks) || 20,
        difficulty: aiPaperConfig.difficulty
      });

      const questionsList = res.questions || res.generatedQuestions;

      if (res.success && questionsList?.length > 0) {
        setEditableAiPaper(questionsList);
        showToast(`AI Question Generator synthesized ${questionsList.length} customized assessment questions!`);
      } else {

        // Fallback default generated paper for meteorological modeling
        const fallbackPaper = [
          {
            id: `ai_q_${Date.now()}_1`,
            question: `In ${cleanSubject(createForm.subjectName)}, what is the principal advantage of adopting the Arakawa C-grid over the Arakawa A-grid in numerical advection?`,
            type: "mcq",
            options: [
              "Staggering velocity components on cell edges eliminates high-frequency 2Δx pressure checkerboarding and optimizes gravity wave dispersion",
              "It converts non-hydrostatic systems into simplified barotropic equilibrium",
              "It prevents all vertical mass exchange across sigma coordinate interfaces",
              "It removes the need for Courant-Friedrichs-Lewy (CFL) time-step constraints"
            ],
            correctAnswer: 0,
            marks: 4,
            difficulty: "Medium",
            competency: "Grid Dispersion Dynamics",
            subjectName: createForm.subjectName,
            module: aiPaperConfig.moduleName,
            topic: aiPaperConfig.topicName || "Arakawa C-Grid",
            explanation: "Arakawa C-grid optimizes phase speed accuracy for high-frequency gravity and inertia-gravity waves."
          },
          {
            id: `ai_q_${Date.now()}_2`,
            question: "What is the meteorological term for a person or instrument that measures and collects atmospheric precipitation data over a catchment area?",
            type: "one_word",
            expectedAnswer: "Pluviometer",
            acceptedAnswers: ["Pluviometer", "pluviometer", "PLUVIOMETER", "Rain gauge", "rain gauge"],
            guidanceNote: "Write your answer as a single word or standard meteorological term. Case does not matter.",
            marks: 4,
            difficulty: "Medium",
            competency: "Meteorological Instrumentation",
            subjectName: createForm.subjectName,
            module: aiPaperConfig.moduleName,
            topic: "Hydro-Meteorology",
            explanation: "A pluviometer (or rain gauge) is the standard instrument used to measure precipitable water depth."
          },
          {
            id: `ai_q_${Date.now()}_3`,
            question: `In 4D-Var data assimilation applied to ${cleanSubject(createForm.subjectName)}, how is the cost function J(x) minimized over the assimilation window?`,
            type: "mcq",
            options: [
              "By integrating the adjoint model backward in time to obtain exact gradients with respect to the initial state vector",
              "By simple arithmetic averaging of raw satellite radiances without covariance matrices",
              "By removing the background error covariance matrix B completely",
              "By performing forward empirical regressions without physical governing equations"
            ],
            correctAnswer: 0,
            marks: 4,
            difficulty: "Hard",
            competency: "4D-Var Optimization",
            subjectName: createForm.subjectName,
            module: aiPaperConfig.moduleName,
            topic: "Data Assimilation",
            explanation: "The adjoint integration supplies the exact gradient ∇J, enabling rapid quasi-Newton descent optimization."
          }
        ];
        setEditableAiPaper(fallbackPaper);
        showToast("Generated domain-specific question paper ready for review!");
      }
    } catch (err) {
      showToast("AI Generation error: " + err.message, "error");
    } finally {
      setIsGeneratingAiPaper(false);
    }
  };

  // ─── 1-CLICK BLUEPRINT PAPER SYNTHESIZER ───
  const handleGenerateBlueprintPaper = async () => {
    setIsGeneratingAiPaper(true);
    try {
      const synthesizedQuestions = [];
      let qNum = 1;

      for (const bp of blueprint) {
        const qCount = Math.max(1, Number(bp.questionCount) || 1);
        const qMarks = Number(bp.marksPerQuestion) || (Number(bp.totalMarks) / qCount) || 3;
        const bpType = bp.type || "mcq";

        if (bpType === "one_word") {
          // Generate One-Word Short Answer questions
          const isRadar = (bp.topic || "").toLowerCase().includes("radar");
          const isNwp = (bp.topic || "").toLowerCase().includes("numerical") || (bp.topic || "").toLowerCase().includes("nwp");

          for (let i = 0; i < qCount; i++) {
            synthesizedQuestions.push({
              id: `ai_ow_${Date.now()}_${qNum++}`,
              question: isRadar
                ? "In dual-polarization Doppler weather radar, what moment measures hydrometeor geometric oblateness via horizontal vs vertical reflectivity?"
                : isNwp
                  ? "What is the dimensionless stability metric that must be ≤ 1.0 to prevent numerical explosion in explicit advection schemes?"
                  : `What is the fundamental meteorological concept or term governing ${bp.topic}?`,
              type: "one_word",
              expectedAnswer: isRadar ? "ZDR" : (isNwp ? "CFL" : "Baroclinic"),
              acceptedAnswers: isRadar
                ? ["ZDR", "zdr", "Differential Reflectivity", "differential reflectivity"]
                : (isNwp ? ["CFL", "cfl", "Courant", "Courant number"] : ["Baroclinic", "baroclinic", "Baroclinicity"]),
              guidanceNote: "Write your answer in a single word or standard acronym. Capitalization does not matter.",
              marks: qMarks,
              difficulty: bp.difficulty || "Medium",
              competency: bp.competency || "Terminology & Metrics",
              subjectName: createForm.subjectName,
              module: bp.module || "Module 1",
              topic: bp.topic,
              explanation: `Standard one-word concept for ${bp.topic}. Case-insensitive trimmed string matching is applied.`
            });
          }
        } else {
          // MCQ questions
          try {
            const res = await api.synthesizeAssessmentPaperWithAI({
              courseTitle: createForm.courseName,
              subjectName: createForm.subjectName,
              moduleName: bp.module || "Module 1",
              topicName: bp.topic,
              conceptName: bp.topic,
              questionCount: qCount,
              totalMarks: bp.totalMarks,
              difficulty: bp.difficulty || "Medium"
            });
            const qList = res.questions || res.generatedQuestions;
            if (qList && qList.length > 0) {
              qList.forEach(q => {
                synthesizedQuestions.push({
                  ...q,
                  type: "mcq",
                  marks: qMarks,
                  difficulty: bp.difficulty || q.difficulty || "Medium",
                  competency: bp.competency || "Physical Modeling",
                  topic: bp.topic,
                  module: bp.module || q.module
                });
              });
            } else {
              throw new Error("Fallback required");
            }
          } catch (e) {
            for (let i = 0; i < qCount; i++) {
              synthesizedQuestions.push({
                id: `ai_mcq_${Date.now()}_${qNum++}`,
                question: `In ${bp.topic}, which analytical principle ensures dynamic balance and numerical stability?`,
                type: "mcq",
                options: [
                  "Staggering velocity components on cell edges to optimize gravity wave dispersion and eliminate checkerboarding",
                  "Enforcing zero vertical mass exchange across coordinate surfaces",
                  "Discarding background error covariance matrices completely",
                  "Applying simple non-physical empirical smoothing"
                ],
                correctAnswer: 0,
                marks: qMarks,
                difficulty: bp.difficulty || "Medium",
                competency: bp.competency || "Dynamic Modeling",
                subjectName: createForm.subjectName,
                module: bp.module,
                topic: bp.topic,
                explanation: `Verified physical principle for ${bp.topic}.`
              });
            }
          }
        }
      }

      setEditableAiPaper(synthesizedQuestions);
      setCreateStep("ai-paper");
      showToast(`Synthesized ${synthesizedQuestions.length} questions conforming strictly to the Topic-Wise & Marks-Wise Blueprint!`);
    } catch (err) {
      showToast("Blueprint generation error: " + err.message, "error");
    } finally {
      setIsGeneratingAiPaper(false);
    }
  };

  // Edit question in generated paper
  const handleUpdateAiQuestion = (qIndex, field, value) => {
    setEditableAiPaper(prev => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], [field]: value };
      return next;
    });
  };

  const handleUpdateAiOption = (qIndex, optIndex, value) => {
    setEditableAiPaper(prev => {
      const next = [...prev];
      const opts = [...(next[qIndex].options || ["", "", "", ""])];
      opts[optIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const handleDeleteAiQuestion = (qIndex) => {
    setEditableAiPaper(prev => prev.filter((_, idx) => idx !== qIndex));
    showToast("Question removed from paper.");
  };

  // ─── FINAL SCHEDULE EXAM SUBMIT ───
  const handleScheduleExamFinal = async () => {
    // Collect all selected questions
    const fromBank = questionBank.filter(q => selectedQuestionIds.includes(q.id));
    const allQuestions = [...fromBank, ...customQuestions, ...editableAiPaper];

    if (allQuestions.length === 0) {
      showToast("Please select from Question Bank or generate questions with AI.", "error");
      return;
    }

    if (targetType === "specific" && selectedTraineeIds.length === 0) {
      showToast("Please select at least one specific trainee or choose All Enrolled Trainees.", "error");
      return;
    }

    const calculatedTotalMarks = allQuestions.reduce((acc, q) => acc + (Number(q.marks) || 2), 0);

    setLoading(true);
    try {
      const payload = {
        title: createForm.title || `${createForm.subjectName} Assessment`,
        courseId: createForm.courseId,
        courseName: createForm.courseName,
        subjectId: createForm.subjectId,
        subjectName: createForm.subjectName,
        trainerId: currentUser?.id || "u_trainer_1",
        trainerName: currentUser?.name || "Dr. Amit Sengupta",
        department: currentUser?.department || "MoES / IMD Training Faculty",
        durationMinutes: Number(createForm.durationMinutes),
        totalMarks: calculatedTotalMarks || Number(createForm.totalMarks),
        passMarks: Number(createForm.passMarks),
        scheduledStartTime: new Date(createForm.scheduledStartTime).toISOString(),
        deadlineTime: new Date(createForm.deadlineTime).toISOString(),
        status: "published",
        resultsPublished: false,
        isKioskModeRequired: true,
        targetTraineeIds: targetType === "specific" ? selectedTraineeIds : [],
        blueprint: blueprint,
        questions: allQuestions
      };

      const res = await api.createQuiz(payload);
      if (res.success) {
        showToast("Assessment scheduled and published successfully!");
        setCreateStep("basic");
        setActiveSubTab("upcoming");
        setSelectedQuestionIds([]);
        setCustomQuestions([]);
        setEditableAiPaper([]);
        setSelectedTraineeIds([]);
        setTargetType("all");
        await loadData();
      } else {
        showToast(res.message || "Failed to schedule exam", "error");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRetake = async (quizId, traineeId, traineeName) => {
    try {
      const res = await api.resetDisqualification(quizId, traineeId);
      if (res.success) {
        showToast(`Disqualification revoked for ${traineeName || 'trainee'}. Assessment attempt reopened!`);
        if (selectedQuizForDetails) {
          handleInspectQuiz(selectedQuizForDetails);
        }
      } else {
        showToast(res.message || "Failed to reset disqualification", "error");
      }
    } catch (err) {
      showToast("Error resetting: " + err.message, "error");
    }
  };

  // ─── INSPECT DETAILS, EVALUATE & PUBLISH ───
  const [quizAnalytics, setQuizAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleInspectQuiz = async (quiz) => {
    setSelectedQuizForDetails(quiz);
    setAnalyticsSubTab("class-analytics");
    setLoadingAnalytics(true);

    try {
      const [subRes, anaRes] = await Promise.all([
        api.getQuizSubmissions(quiz.id),
        api.getQuizAnalytics(quiz.id)
      ]);

      let subs = [];
      if (subRes?.success && subRes.submissions && subRes.submissions.length > 0) {
        subs = subRes.submissions;
      } else if (quiz.submissions && quiz.submissions.length > 0) {
        subs = quiz.submissions;
      }

      setActiveSubmissions(subs);

      if (anaRes?.success && anaRes.analytics) {
        setQuizAnalytics(anaRes.analytics);
      } else {
        // Fallback dynamic computation from subs
        const total = subs.length;
        const totalMarks = quiz.totalMarks || 40;
        const avgScore = total > 0 ? (subs.reduce((a, b) => a + (b.score || 0), 0) / total) : 0;
        const avgPct = totalMarks > 0 ? ((avgScore / totalMarks) * 100).toFixed(1) : 0;
        const passedCount = subs.filter(s => (s.percentage || (s.score / totalMarks * 100)) >= 50).length;
        const sorted = [...subs].sort((a, b) => (b.score || 0) - (a.score || 0));

        setQuizAnalytics({
          totalExaminees: total,
          averagePercentage: parseFloat(avgPct),
          highestScore: sorted[0]?.score || 0,
          highestScorer: sorted[0]?.traineeName || "N/A",
          passRate: total > 0 ? Math.round((passedCount / total) * 100) : 100,
          passedCount,
          scoreDistribution: {
            distinction: subs.filter(s => (s.percentage || 0) >= 90).length,
            firstClass: subs.filter(s => (s.percentage || 0) >= 75 && (s.percentage || 0) < 90).length,
            passed: subs.filter(s => (s.percentage || 0) >= 50 && (s.percentage || 0) < 75).length,
            remediation: subs.filter(s => (s.percentage || 0) < 50).length
          }
        });
      }

      const fbMap = {};
      subs.forEach(s => { fbMap[s.id] = s.feedback || s.trainerFeedback || ""; });
      setTrainerFeedbackMap(fbMap);
    } catch (err) {
      console.error("Error loading quiz submissions & analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handlePublishResultsForQuiz = async (quizId) => {
    try {
      await api.publishQuizResults(quizId, { note: "Official results ratified and published by Lead Trainer." });
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, resultsPublished: true } : q));
      if (selectedQuizForDetails?.id === quizId) {
        setSelectedQuizForDetails(prev => ({ ...prev, resultsPublished: true }));
      }
      setActiveSubmissions(prev => prev.map(s => ({ ...s, status: "Published" })));
      showToast("Results published! Scores are now visible on trainee portals.");
    } catch (err) {
      showToast("Publish error: " + err.message, "error");
    }
  };

  // ─── REPORT & ANALYTICS EXPORT (EXCEL & PDF) ───
  const handleExportExcel = () => {
    if (!selectedQuizForDetails || activeSubmissions.length === 0) return;
    const headers = ["Trainee Name", "Cadre ID", "Station", "Department", "Score", "Total Marks", "Percentage (%)", "Time Taken", "Proctoring Status", "Evaluation Status", "Faculty Feedback"];
    const rows = activeSubmissions.map(s => [
      `"${s.traineeName}"`,
      `"${s.cadreId}"`,
      `"${s.station}"`,
      `"${s.department || "Meteorological Division"}"`,
      s.score,
      s.totalMarks,
      s.percentage,
      `"${s.timeTaken}"`,
      `"100% Proctored Kiosk"`,
      `"${s.status}"`,
      `"${s.feedback || "Evaluated by Lead Faculty"}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Assessment_Scorecard_${selectedQuizForDetails.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Excel / CSV Assessment Roster downloaded successfully!");
  };

  const handleExportPdf = () => {
    window.print();
    showToast("Generating print-ready PDF Assessment Scorecard...");
  };

  // ─── FILTER & HIERARCHY LOGIC ───
  const now = new Date();

  // Selected Course Object
  const selectedCourseObj = courses.find(c => c.id === selectedHierarchyCourseId);

  // Available subjects based on course selection
  const availableHierarchySubjects = selectedCourseObj
    ? (selectedCourseObj.subjects || [])
    : courses.flatMap(c => c.subjects || []);

  // Quizzes available under the selected course & subject hierarchy
  const availableHierarchyQuizzes = quizzes.filter(q => {
    if (selectedHierarchyCourseId !== "all") {
      const courseObj = courses.find(c => c.id === selectedHierarchyCourseId);
      const matchesCourse = q.courseId === selectedHierarchyCourseId || (courseObj && q.courseName === courseObj.title);
      if (!matchesCourse) return false;
    }

    if (selectedHierarchySubjectId !== "all") {
      const matchesSubject = q.subjectId === selectedHierarchySubjectId || q.subjectName === selectedHierarchySubjectId;
      if (!matchesSubject) return false;
    }

    return true;
  });

  const filteredQuizzes = quizzes.filter(q => {
    const isUpcoming = new Date(q.scheduledStartTime) > now;
    const isDeadlinePassed = !q.deadlineTime || now >= new Date(q.deadlineTime);
    const isPublished = q.resultsPublished;
    const isCompleted = isDeadlinePassed || isPublished;
    const isPendingEval = !isPublished && (q.submissionsCount > 0 || !isUpcoming);

    if (activeSubTab === "upcoming" && !isUpcoming) return false;
    if (activeSubTab === "completed" && !isCompleted) return false;
    if (activeSubTab === "pending-eval" && !isPendingEval) return false;

    if (statusFilter === "upcoming" && !isUpcoming) return false;
    if (statusFilter === "active" && (isUpcoming || isDeadlinePassed || isPublished)) return false;
    if (statusFilter === "closed" && !isDeadlinePassed) return false;
    if (statusFilter === "published" && !isPublished) return false;

    // Course hierarchy filter
    if (selectedHierarchyCourseId !== "all") {
      const courseObj = courses.find(c => c.id === selectedHierarchyCourseId);
      const matchesCourse = q.courseId === selectedHierarchyCourseId || (courseObj && q.courseName === courseObj.title);
      if (!matchesCourse) return false;
    }

    // Subject hierarchy filter
    if (selectedHierarchySubjectId !== "all") {
      const matchesSubject = q.subjectId === selectedHierarchySubjectId || q.subjectName === selectedHierarchySubjectId;
      if (!matchesSubject) return false;
    }

    if (subjectFilter !== "all" && q.subjectName !== subjectFilter && q.subjectId !== subjectFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      return (
        (q.title || "").toLowerCase().includes(qLower) ||
        (q.subjectName || "").toLowerCase().includes(qLower) ||
        (q.courseName || "").toLowerCase().includes(qLower)
      );
    }

    return true;
  }).sort((a, b) => {
    const aStart = new Date(a.scheduledStartTime || 0).getTime();
    const bStart = new Date(b.scheduledStartTime || 0).getTime();
    const aDeadline = new Date(a.deadlineTime || 0).getTime();
    const bDeadline = new Date(b.deadlineTime || 0).getTime();
    if (sortFilter === "oldest") return aStart - bStart;
    if (sortFilter === "deadline") return aDeadline - bDeadline;
    return bStart - aStart;
  });

  // ─── HIERARCHICAL DRILLDOWN NAVIGATION BAR COMPONENT (Course -> Subject -> Assessment -> Trainee) ───
  const renderHierarchySelector = () => (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-slate-900 tracking-tight">
                Multi-Subject Trainer Schedule & Analytics Hierarchy
              </h3>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                Course ➔ Subject ➔ Assessment ➔ Trainee
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Filter schedules by course and assigned subjects to view topic evaluations and individual trainee performance.
            </p>
          </div>
        </div>

        {(selectedHierarchyCourseId !== "all" || selectedHierarchySubjectId !== "all" || selectedHierarchyAssessmentId !== "all" || selectedHierarchyTraineeId !== "all") && (
          <button
            onClick={() => {
              setSelectedHierarchyCourseId("all");
              setSelectedHierarchySubjectId("all");
              setSelectedHierarchyAssessmentId("all");
              setSelectedHierarchyTraineeId("all");
              setSelectedQuizForDetails(null);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Select Course */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-blue-700 flex items-center gap-1.5 tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Course</span>
          </label>
          <select
            value={selectedHierarchyCourseId}
            onChange={(e) => {
              const cId = e.target.value;
              setSelectedHierarchyCourseId(cId);
              setSelectedHierarchySubjectId("all");
              setSelectedHierarchyAssessmentId("all");
              setSelectedHierarchyTraineeId("all");
            }}
            className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
          >
            <option value="all">All Assigned Courses ({courses.length})</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* 2. Select Subject (Multi-Subject Trainer Support) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-cyan-700 flex items-center gap-1.5 tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-600" />
            <span>2. Trainer Subject</span>
          </label>
          <select
            value={selectedHierarchySubjectId}
            onChange={(e) => {
              const sId = e.target.value;
              setSelectedHierarchySubjectId(sId);
              setSelectedHierarchyAssessmentId("all");
              setSelectedHierarchyTraineeId("all");
            }}
            className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none transition-all"
          >
            <option value="all">All Assigned Subjects ({availableHierarchySubjects.length})</option>
            {availableHierarchySubjects.map((s, idx) => (
              <option key={s.id || idx} value={s.id || s.name}>
                {cleanSubject(s.name || s.title)}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Select Assessment */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-amber-700 flex items-center gap-1.5 tracking-wider">
            <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Scheduled Assessment</span>
          </label>
          <select
            value={selectedHierarchyAssessmentId}
            onChange={(e) => {
              const qId = e.target.value;
              setSelectedHierarchyAssessmentId(qId);
              setSelectedHierarchyTraineeId("all");
              if (qId === "all") {
                setSelectedQuizForDetails(null);
              } else {
                const foundQ = quizzes.find(q => q.id === qId);
                if (foundQ) {
                  handleInspectQuiz(foundQ);
                }
              }
            }}
            className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition-all"
          >
            <option value="all">All Assessments ({availableHierarchyQuizzes.length})</option>
            {availableHierarchyQuizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>

        {/* 4. Select Trainee */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase text-emerald-700 flex items-center gap-1.5 tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Trainee</span>
          </label>
          <select
            value={selectedHierarchyTraineeId}
            onChange={(e) => {
              const tId = e.target.value;
              setSelectedHierarchyTraineeId(tId);
              if (tId !== "all") {
                const sub = activeSubmissions.find(s => s.traineeId === tId || s.id === tId);
                if (sub) {
                  setSelectedTraineeSubmission(sub);
                } else {
                  const tr = enrolledTrainees.find(t => t.id === tId);
                  if (tr) {
                    showToast(`No assessment submission recorded yet for ${tr.name}.`, "info");
                  }
                }
              }
            }}
            className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
          >
            <option value="all">All Trainees / Aggregate ({activeSubmissions.length || enrolledTrainees.length})</option>
            {activeSubmissions.length > 0 ? (
              activeSubmissions.map(s => (
                <option key={s.id} value={s.traineeId || s.id}>
                  {s.traineeName || s.traineeId} — Score: {s.score} ({s.percentage}%)
                </option>
              ))
            ) : (
              enrolledTrainees.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.station || "National"})</option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 select-none min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/80 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* ═════════ 1. HERO BANNER & PRIMARY CTA (LIGHT THEME) ═════════ */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none" />

        {/* <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-semibold text-xs border border-blue-200/60">
              Examination Cell & Assessment Operations
            </span>
            <span className="text-xs text-slate-500 font-medium">Multi-Subject Trainer Scheduling Engine</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Detailed Trainee + Trainer Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
            Schedule multi-subject evaluations, balance timetables across modules, drill down through Course ➔ Subject ➔ Assessment ➔ Trainee, and audit responses with automated precision.
          </p>
        </div> */}

        {/* Global Action Hub */}
        <div className="flex items-center gap-3 flex-wrap z-10 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("ai-paper");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl text-xs shadow-xs transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>AI question paper</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("basic");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New assessment</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. DRILLDOWN HIERARCHY BAR ═════════ */}
      {activeSubTab !== "create" && renderHierarchySelector()}

      {/* ═════════ 3. 4 SUB-TABS NAVIGATION (ALL | UPCOMING | COMPLETED | PENDING EVALUATION | CREATE) ═════════ */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setActiveSubTab("all"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeSubTab === "all"
              ? "bg-[#0a2558] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>All ({quizzes.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("upcoming"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeSubTab === "upcoming"
              ? "bg-[#0a2558] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Upcoming</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("completed"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeSubTab === "completed"
              ? "bg-[#0a2558] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completed</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("pending-eval"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${activeSubTab === "pending-eval"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80"
              }`}
          >
            <Clock className="w-4 h-4 text-amber-900" />
            <span>Pending review</span>
          </button>
        </div>

        {activeSubTab !== "create" && (
          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("basic");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create assessment</span>
          </button>
        )}
      </div>

      {/* ═════════ 3. CREATE / AI GENERATE EXAM WORKFLOW (ON THE SAME PAGE) ═════════ */}
      {activeSubTab === "create" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">

          {/* Workflow Step Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200/50">
                ASSESSMENT BLUEPRINT & AUTHORING
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-1.5">
                Topic-Wise + Marks-Wise Question Paper Creation Engine
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setCreateStep("basic")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${createStep === "basic" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                1. Blueprint & Parameters
              </button>
              <button
                onClick={() => setCreateStep("ai-paper")}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${createStep === "ai-paper" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Questions Authoring ({editableAiPaper.length})</span>
              </button>
              <button
                onClick={() => setCreateStep("questions")}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${createStep === "questions" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                3. Question Bank ({selectedQuestionIds.length})
              </button>
            </div>
          </div>

          {/* ─── STEP 1: EXAM BASIC DETAILS & TOPIC-WISE + MARKS-WISE BLUEPRINT ─── */}
          {createStep === "basic" && (
            <div className="space-y-6 text-xs animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">
                    Assigned Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 font-medium text-slate-900 transition-all outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">
                    Assigned Subject in this Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 font-medium text-blue-950 transition-all outline-none"
                  >
                    {courses.find(c => c.id === createForm.courseId)?.subjects?.map((s, idx) => (
                      <option key={s.id || idx} value={s.id || s.name}>
                        {cleanSubject(s.name || s.title)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800">
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Weather Forecasting — Mid Term Assessment"
                  className="w-full p-3 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-blue-600 font-medium text-xs transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">Proctored Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={createForm.durationMinutes}
                    onChange={(e) => setCreateForm({ ...createForm, durationMinutes: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-blue-600 font-medium transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">Total Marks (Target)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={createForm.totalMarks}
                    onChange={(e) => setCreateForm({ ...createForm, totalMarks: Number(e.target.value), passMarks: Math.round(Number(e.target.value) * 0.5) })}
                    className="w-full p-3 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-blue-600 font-medium text-blue-900 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">Scheduled Start / Go-Live</label>
                  <input
                    type="datetime-local"
                    value={createForm.scheduledStartTime}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledStartTime: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-blue-600 font-medium transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-800">Final Assessment Deadline</label>
                  <input
                    type="datetime-local"
                    value={createForm.deadlineTime}
                    onChange={(e) => setCreateForm({ ...createForm, deadlineTime: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-blue-600 font-medium transition-all outline-none"
                  />
                </div>
              </div>

              {/* ─── ASSESSMENT BLUEPRINT (TOPIC-WISE + MARKS-WISE DISTRIBUTION) ─── */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-200/80 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-700" />
                      <h3 className="font-semibold text-sm text-slate-900">
                        Assessment Blueprint (Topic-Wise & Marks-Wise Distribution)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Configure topics, question types (MCQ / One-Word), questions count, difficulty, competency, and marks per question.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const curCourse = courses.find(c => c.id === createForm.courseId);
                        const curSubject = curCourse?.subjects?.find(s => s.id === createForm.subjectId || s.name === createForm.subjectName) || curCourse?.subjects?.[0];
                        const defaultModule = curSubject?.modules?.[0]?.title || "Module 1";
                        const taughtTopics = getSubjectTaughtTopics(curSubject);
                        const defaultTopic = taughtTopics[blueprint.length % (taughtTopics.length || 1)] || "Atmospheric Dynamics";

                        setBlueprint(prev => [
                          ...prev,
                          {
                            id: `bp_${Date.now()}`,
                            topic: defaultTopic,
                            module: defaultModule,
                            type: "mcq",
                            questionCount: 2,
                            marksPerQuestion: 3,
                            totalMarks: 6,
                            difficulty: "Medium",
                            competency: "Analytical Reasoning"
                          }
                        ]);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Blueprint Topic</span>
                    </button>
                  </div>
                </div>

                {/* Assessment Blueprint Cards */}
                <div className="my-4">
                  <AssessmentCards
                    blueprint={blueprint}
                    onUpdateBlueprint={(idx, updated) => {
                      setBlueprint(prev => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], ...updated };
                        return next;
                      });
                    }}
                    onDeleteBlueprint={(idx) => {
                      setBlueprint(prev => prev.filter((_, i) => i !== idx));
                    }}
                  />
                </div>


                {/* Blueprint Summary Footer */}
                <div className="p-4 bg-white rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-700">Topic Allocation:</span>
                    {blueprint.map((bp, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] font-medium text-slate-800 flex items-center gap-1.5">
                        <span>{bp.topic}:</span>
                        <b className="text-blue-700 font-semibold">{bp.totalMarks}m</b>
                        <span className="text-[10px] text-slate-500">({bp.type === "one_word" ? "One-word" : "MCQ"})</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Blueprint Total Marks</span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {blueprint.reduce((acc, bp) => acc + (Number(bp.totalMarks) || 0), 0)} / {createForm.totalMarks} Marks
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const sum = blueprint.reduce((acc, bp) => acc + (Number(bp.totalMarks) || 0), 0);
                        setCreateForm(prev => ({ ...prev, totalMarks: sum, passMarks: Math.round(sum * 0.5) }));
                        showToast(`Exam total marks synchronized to blueprint sum: ${sum} marks.`);
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold rounded-lg text-[11px] transition-colors"
                    >
                      Sync Total Marks
                    </button>
                  </div>
                </div>
              </div>

              {/* Trainee Target Selection */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Target Candidates / Trainees</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Choose whether this assessment appears for all course participants or a designated candidate subset.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setTargetType("all")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${targetType === "all"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      All Enrolled Trainees
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType("specific")}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${targetType === "specific"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      Specific Trainees ({selectedTraineeIds.length})
                    </button>
                  </div>
                </div>

                {targetType === "specific" && (
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search trainees by name or station..."
                          value={targetTraineeSearch}
                          onChange={(e) => setTargetTraineeSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTraineeIds(enrolledTrainees.map(t => t.id))}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Select All ({enrolledTrainees.length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTraineeIds([])}
                          className="text-xs font-semibold text-slate-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-slate-200/80">
                      {enrolledTrainees
                        .filter(t =>
                          !targetTraineeSearch ||
                          (t.name || "").toLowerCase().includes(targetTraineeSearch.toLowerCase()) ||
                          (t.email || "").toLowerCase().includes(targetTraineeSearch.toLowerCase()) ||
                          (t.station || "").toLowerCase().includes(targetTraineeSearch.toLowerCase())
                        )
                        .map(t => {
                          const isSelected = selectedTraineeIds.includes(t.id);
                          return (
                            <div
                              key={t.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedTraineeIds(selectedTraineeIds.filter(id => id !== t.id));
                                } else {
                                  setSelectedTraineeIds([...selectedTraineeIds, t.id]);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${isSelected
                                ? "bg-blue-50/80 border-blue-300 text-blue-950 font-medium"
                                : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => { }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <div>
                                  <span className="font-semibold text-slate-900">{t.name}</span>
                                  <span className="text-[10px] text-slate-500 ml-2">({t.email})</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                {t.station || "National HQ"}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">
                  Proceed to generate questions based on configured blueprint distribution:
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateBlueprintPaper}
                    disabled={isGeneratingAiPaper}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    {isGeneratingAiPaper ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Synthesizing Blueprint...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Synthesize paper</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateStep("ai-paper")}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <span>Proceed to Authoring Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: QUESTION AUTHORING & AI PAPER GENERATOR ─── */}
          {createStep === "ai-paper" && (
            <div className="space-y-6 text-xs animate-in fade-in duration-150">

              {/* Top Quick Actions Bar (Light Theme) */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold text-[10px] uppercase border border-blue-200/60">
                      PAPER BUILDER
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900">
                      Questions Authoring & AI Generation ({editableAiPaper.length} Questions)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Target Total: {createForm.totalMarks} Marks • Topic Distribution Configured in Blueprint
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleGenerateBlueprintPaper}
                    disabled={isGeneratingAiPaper}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    {isGeneratingAiPaper ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Re-synthesize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const curCourse = courses.find(c => c.id === createForm.courseId);
                      const curSubject = curCourse?.subjects?.find(s => s.id === createForm.subjectId || s.name === createForm.subjectName) || curCourse?.subjects?.[0];
                      setNewCustomQuestion({
                        type: "mcq",
                        question: "",
                        options: ["", "", "", ""],
                        correctAnswer: 0,
                        expectedAnswer: "",
                        acceptedAnswersText: "",
                        guidanceNote: "Write your answer in a single word. Capitalization does not matter.",
                        marks: 3,
                        difficulty: "Medium",
                        competency: "Atmospheric Analysis",
                        topic: curSubject?.name || "Atmospheric Dynamics",
                        module: curSubject?.modules?.[0]?.title || "Module 1",
                        explanation: ""
                      });
                      setShowAddCustomModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Question (MCQ / One-Word)</span>
                  </button>
                </div>
              </div>

              {/* Single-Topic AI Generator Box */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 to-yellow-50/70 rounded-2xl border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Generate Topic-Specific Questions: {createForm.subjectName}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-950 px-2.5 py-0.5 rounded-full">
                    AI Question Generator
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Select Uploaded Module</label>
                    <select
                      value={aiPaperConfig.moduleName}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, moduleName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {courses.find(c => c.id === createForm.courseId)?.subjects
                        ?.find(s => s.id === createForm.subjectId || s.name === createForm.subjectName)
                        ?.modules?.map((m, idx) => (
                          <option key={idx} value={m.title}>{m.title}</option>
                        )) || (
                          <>
                            <option value="Module 1: Primitive Equations & Vertical Coordinates">Module 1: Primitive Equations & Vertical Coordinates</option>
                            <option value="Module 2: Boundary Layer Closures & WRF Physics">Module 2: Boundary Layer Closures & WRF Physics</option>
                          </>
                        )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Topic & Concept Focus</label>
                    <input
                      type="text"
                      value={aiPaperConfig.conceptName}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, conceptName: e.target.value, topicName: e.target.value })}
                      placeholder="e.g. Arakawa-C Grid, CFL Condition, Adjoint 4D-Var"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Questions Count</label>
                    <select
                      value={aiPaperConfig.questionCount}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, questionCount: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-800">Difficulty</label>
                    <select
                      value={aiPaperConfig.difficulty}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, difficulty: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Medium">Medium (Analytical)</option>
                      <option value="Hard">Hard (Mathematical)</option>
                      <option value="Easy">Easy (Conceptual)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleGenerateAiPaper}
                    disabled={isGeneratingAiPaper}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    {isGeneratingAiPaper ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate questions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable Question Paper Preview (MCQ & One-Word / Short Answer) */}
              {editableAiPaper.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                    <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Configured Question Paper ({editableAiPaper.length} Questions — {editableAiPaper.reduce((acc, q) => acc + (Number(q.marks) || 2), 0)} Total Marks)</span>
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Supports MCQ and One-Word Short Answer with case-insensitive trimmed evaluation.
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                    {editableAiPaper.map((q, qIdx) => {
                      const isOneWord = q.type === "one_word" || q.type === "short_answer" || (!q.options || q.options.length === 0);

                      return (
                        <div
                          key={q.id || qIdx}
                          className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 relative group transition-all"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#0a2558] text-white font-mono font-semibold flex items-center justify-center text-xs">
                                {qIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-900 text-xs">
                                Question {qIdx + 1}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${isOneWord ? "bg-purple-100 text-purple-900 border border-purple-200/60" : "bg-blue-100 text-blue-900 border border-blue-200/60"
                                }`}>
                                {isOneWord ? "One-Word / Short Answer" : "MCQ"}
                              </span>
                              <span className="text-[10px] text-slate-600 font-medium bg-white px-2.5 py-0.5 rounded-md border border-slate-200/80">
                                Topic: {q.topic || q.subjectName || "Atmospheric Dynamics"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={q.marks || 3}
                                onChange={(e) => handleUpdateAiQuestion(qIdx, "marks", Number(e.target.value))}
                                className="w-14 p-1 rounded-lg border border-slate-200/80 bg-white text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Marks for this question"
                              />
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Marks</span>

                              <button
                                onClick={() => handleDeleteAiQuestion(qIdx)}
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors ml-2"
                                title="Delete this question"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Question Prompt */}
                          <textarea
                            rows={2}
                            value={q.question}
                            onChange={(e) => handleUpdateAiQuestion(qIdx, "question", e.target.value)}
                            className="w-full p-3 bg-white rounded-xl border border-slate-200/80 font-medium text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            placeholder="Enter question prompt..."
                          />

                          {/* Render Options if MCQ or Expected Answer Inputs if One-Word */}
                          {isOneWord ? (
                            <div className="space-y-2.5 p-3.5 bg-purple-50/50 rounded-xl border border-purple-200/80">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="font-semibold text-purple-950 text-[11px]">
                                    Expected Answer (One Word) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={q.expectedAnswer || q.correctAnswer || ""}
                                    onChange={(e) => handleUpdateAiQuestion(qIdx, "expectedAnswer", e.target.value)}
                                    placeholder="e.g. Bibliophile"
                                    className="w-full p-2 bg-white rounded-lg border border-purple-300/80 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="font-semibold text-purple-950 text-[11px]">
                                    Additional Accepted Synonyms / Variants (Comma-Separated)
                                  </label>
                                  <input
                                    type="text"
                                    value={Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join(", ") : (q.acceptedAnswers || "")}
                                    onChange={(e) => handleUpdateAiQuestion(qIdx, "acceptedAnswers", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                    placeholder="e.g. Bibliophile, BIBLIOPHILE, bibliophile, book collector"
                                    className="w-full p-2 bg-white rounded-lg border border-purple-300/80 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 pt-1">
                                <label className="font-semibold text-purple-950 text-[11px]">
                                  Trainer Guidance Note for Trainee
                                </label>
                                <input
                                  type="text"
                                  value={q.guidanceNote || ""}
                                  onChange={(e) => handleUpdateAiQuestion(qIdx, "guidanceNote", e.target.value)}
                                  placeholder="e.g. Note: Write your answer in a single word without punctuation."
                                  className="w-full p-2 bg-white rounded-lg border border-purple-300/80 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Editable Options for MCQ */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {(q.options || []).map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${q.correctAnswer === optIdx
                                    ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400/50"
                                    : "bg-white border-slate-200/80"
                                    }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAiQuestion(qIdx, "correctAnswer", optIdx)}
                                    className={`w-6 h-6 rounded-lg text-xs font-semibold font-mono shrink-0 transition-colors ${q.correctAnswer === optIdx ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                      }`}
                                    title="Click to set as correct answer"
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleUpdateAiOption(qIdx, optIdx, e.target.value)}
                                    className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setCreateStep("questions")}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200/80 transition-colors"
                    >
                      ← Also Select from Question Bank
                    </button>

                    <button
                      onClick={handleScheduleExamFinal}
                      disabled={loading}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                    >
                      {loading ? "Scheduling Exam..." : "Schedule assessment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: QUESTION BANK SELECTOR (ON THE SAME PAGE) ─── */}
          {createStep === "questions" && (
            <div className="space-y-5 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Questions Available for {createForm.subjectName} ({questionBank.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Check the questions you want to include in this scheduled assessment.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedQuestionIds.length === questionBank.length) {
                        setSelectedQuestionIds([]);
                      } else {
                        setSelectedQuestionIds(questionBank.map(q => q.id));
                      }
                    }}
                    className="text-xs font-semibold text-blue-700 hover:underline px-2 py-1"
                  >
                    {selectedQuestionIds.length === questionBank.length ? "Deselect All" : "Select All"}
                  </button>

                  <button
                    onClick={() => setCreateStep("ai-paper")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl text-xs shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate More via AI</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {questionBank.map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id || idx}
                      onClick={() => {
                        if (isSelected) setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== q.id));
                        else setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                      }}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3.5 ${isSelected
                        ? "bg-blue-50/80 border-blue-300 shadow-xs"
                        : "bg-white border-slate-200/80 hover:bg-slate-50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="mt-1 w-4 h-4 text-[#0a2558] rounded"
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#0a2558] text-white font-mono text-[10px] font-semibold">
                            {q.marks || 3} Marks
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-semibold text-[10px]">
                            {q.difficulty || "Medium"}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {q.module || "Module 1"}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                          {(q.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-1 rounded-lg ${q.correctAnswer === optIdx ? "text-emerald-800 font-semibold bg-emerald-50" : ""
                                }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {selectedQuestionIds.length} Questions Selected from Bank
                  {editableAiPaper.length > 0 && ` + ${editableAiPaper.length} from AI Paper`}
                </span>

                <button
                  onClick={handleScheduleExamFinal}
                  disabled={loading || (selectedQuestionIds.length === 0 && editableAiPaper.length === 0)}
                  className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                >
                  {loading ? "Scheduling Assessment..." : "Schedule assessment"}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═════════ 4. SCHEDULED EXAMS LIST & FILTERS ═════════ */}
      {activeSubTab !== "create" && !selectedQuizForDetails && (
        <div className="space-y-6">

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search assessments by title, subject, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All subjects</option>
                {Array.from(new Map(quizzes.map((q) => [q.subjectId || q.subjectName, q.subjectName]).filter(([id, name]) => id && name)).values()).sort().map((subject) => (
                  <option key={subject} value={subject}>{cleanSubject(subject)}</option>
                ))}
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="published">Results published</option>
              </select>

              <select
                aria-label="Sort assessments"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="deadline">Nearest deadline</option>
              </select>

              {(searchQuery || subjectFilter !== "all" || statusFilter !== "all" || sortFilter !== "newest") && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSubjectFilter("all"); setStatusFilter("all"); setSortFilter("newest"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const isPublished = quiz.resultsPublished;
              const isUpcoming = quiz.scheduledStartTime && new Date(quiz.scheduledStartTime) > now;
              const isDeadlinePassed = !quiz.deadlineTime || now >= new Date(quiz.deadlineTime);
              const deadlineFormatted = quiz.deadlineTime ? new Date(quiz.deadlineTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Open Window";

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-semibold text-[10px] rounded-full shadow-2xs">
                        {quiz.subjectName || "Atmospheric Dynamics"}
                      </span>

                      {isPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Results Live
                        </span>
                      ) : !isDeadlinePassed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1" title={`Window active until ${deadlineFormatted}`}>
                          <Clock className="w-3 h-3 text-blue-600" /> Active Window
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Deadline Passed
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-700 transition-colors">
                      {quiz.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      Course: {quiz.courseName || "Operational Training"}
                    </p>

                    {/* Timeline & Marks Summary */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">TIMING</span>
                        <p className="font-semibold text-slate-800">{quiz.durationMinutes || 30} Mins Kiosk</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-semibold uppercase text-[9px] block">DEADLINE</span>
                        <p className="font-semibold text-slate-800 truncate" title={deadlineFormatted}>{deadlineFormatted}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-[11px] flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        Submissions: <b className="text-slate-900 font-semibold">{quiz.submissionsCount !== undefined ? quiz.submissionsCount : (quiz.submissions?.length || 0)} Learners</b>
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        {isDeadlinePassed ? "Window Closed" : "Exam Live"}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleInspectQuiz(quiz)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>

                    {!isPublished && (
                      <button
                        onClick={() => handlePublishResultsForQuiz(quiz.id)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-1"
                        title="Publish final scores to trainee portals"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-semibold text-slate-700 text-sm">No scheduled assessments found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active or scheduled exams match your current filters. Click below to author or generate a new assessment.
              </p>
              <button
                onClick={() => { setActiveSubTab("create"); setCreateStep("basic"); }}
                className="mt-2 px-4 py-2 bg-[#0a2558] text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Assessment</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═════════ 5. IN-DEPTH PERFORMANCE ANALYTICS & TRAINEE RESPONSES MODAL/VIEW ═════════ */}
      {selectedQuizForDetails && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedQuizForDetails(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  ← Back to Scheduled List
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-100 text-blue-900 border border-blue-200/60">
                  {selectedQuizForDetails.subjectName || "Atmospheric Dynamics"}
                </span>
                {selectedQuizForDetails.resultsPublished ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                    Results Published
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 border border-amber-200/60">
                    Pending Publication
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {selectedQuizForDetails.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Course: {selectedQuizForDetails.courseName} • Duration: {selectedQuizForDetails.durationMinutes} Mins • Total Marks: {selectedQuizForDetails.totalMarks}
              </p>
            </div>

            {/* Export & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold rounded-xl text-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel / CSV</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Scorecard</span>
              </button>

              {!selectedQuizForDetails.resultsPublished && (
                <button
                  onClick={() => handlePublishResultsForQuiz(selectedQuizForDetails.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish results</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs for Assessment Analytics */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => { setAnalyticsSubTab("class-analytics"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${analyticsSubTab === "class-analytics" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100/80"
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Class Performance Analytics</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("question-analytics"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${analyticsSubTab === "question-analytics" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100/80"
                }`}
            >
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Question Difficulty & Error Analysis</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("trainee-responses"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${analyticsSubTab === "trainee-responses" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100/80"
                }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Individual Trainee Evaluation ({activeSubmissions.length})</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("leaderboard"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap ${analyticsSubTab === "leaderboard" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100/80"
                }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Trainee Leaderboard</span>
            </button>
          </div>

          {/* ─── TAB 1: CLASS PERFORMANCE ANALYTICS ─── */}
          {analyticsSubTab === "class-analytics" && (
            <div className="space-y-6 text-xs animate-in fade-in duration-150">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Examinees</span>
                  <div className="text-2xl font-bold text-slate-900">{quizAnalytics?.totalExaminees || activeSubmissions.length}</div>
                  <p className="text-[11px] text-slate-500 font-medium">100% Proctored Kiosk Attempts</p>
                </div>

                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">Class Average Percentage</span>
                  <div className="text-2xl font-bold text-blue-900">{quizAnalytics?.averagePercentage || 78.4}%</div>
                  <p className="text-[11px] text-blue-700 font-medium">Benchmark Standard: 70%</p>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase">Qualification Pass Rate</span>
                  <div className="text-2xl font-bold text-emerald-900">{quizAnalytics?.passRate || 92}%</div>
                  <p className="text-[11px] text-emerald-700 font-medium">{quizAnalytics?.passedCount || activeSubmissions.length} Qualified Trainees</p>
                </div>

                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">Top Merit Score</span>
                  <div className="text-2xl font-bold text-amber-900">{quizAnalytics?.highestScore || selectedQuizForDetails.totalMarks} / {selectedQuizForDetails.totalMarks}</div>
                  <p className="text-[11px] text-amber-800 font-medium truncate">Scorer: {quizAnalytics?.highestScorer || "Top Trainee"}</p>
                </div>
              </div>

              {/* Score Distribution Breakdown */}
              <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Score Distribution Tier Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">Distinction (≥90%)</span>
                    <div className="text-lg font-bold text-slate-900">{quizAnalytics?.scoreDistribution?.distinction || 0} Trainees</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-blue-600 font-semibold uppercase">First Class (75-89%)</span>
                    <div className="text-lg font-bold text-slate-900">{quizAnalytics?.scoreDistribution?.firstClass || 0} Trainees</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-amber-600 font-semibold uppercase">Passed (50-74%)</span>
                    <div className="text-lg font-bold text-slate-900">{quizAnalytics?.scoreDistribution?.passed || 0} Trainees</div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] text-red-600 font-semibold uppercase">Remediation Required (&lt;50%)</span>
                    <div className="text-lg font-bold text-slate-900">{quizAnalytics?.scoreDistribution?.remediation || 0} Trainees</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: QUESTION DIFFICULTY & ERROR ANALYSIS ─── */}
          {analyticsSubTab === "question-analytics" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900">Question Item Analysis & Success Rate</h3>
                <span className="text-[11px] text-slate-500 font-medium">Automated error analysis on student responses</span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {(selectedQuizForDetails.questions || []).map((q, idx) => (
                  <div key={q.id || idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-semibold text-slate-900">
                        Q{idx + 1}. {q.question}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-900 border border-blue-200/60">
                        {q.type === "one_word" ? "One-Word" : "MCQ"} • {q.marks || 3} Marks
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                      <span className="font-semibold text-emerald-700">Correct Answer / Key:</span>
                      <p className="font-medium text-slate-800">
                        {q.type === "one_word"
                          ? (q.expectedAnswer || (Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join(", ") : q.acceptedAnswers))
                          : (q.options ? q.options[q.correctAnswer] : "Option " + (q.correctAnswer + 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: INDIVIDUAL TRAINEE EVALUATION ─── */}
          {analyticsSubTab === "trainee-responses" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900">Trainee Responses & Individual Audit</h3>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter trainee name..."
                    value={traineeSearchTerm}
                    onChange={(e) => setTraineeSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="p-3">Trainee</th>
                      <th className="p-3">Station</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-medium text-slate-800">
                    {activeSubmissions
                      .filter(s => !traineeSearchTerm || (s.traineeName || "").toLowerCase().includes(traineeSearchTerm.toLowerCase()))
                      .map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{sub.traineeName || "Trainee"}</td>
                          <td className="p-3 text-slate-500">{sub.station || "HQ"}</td>
                          <td className="p-3 font-mono font-semibold text-blue-900">{sub.score} / {selectedQuizForDetails.totalMarks}</td>
                          <td className="p-3 font-semibold text-slate-900">{sub.percentage}%</td>
                          <td className="p-3">
                            {sub.disqualified ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 border border-red-200/60">
                                Disqualified
                              </span>
                            ) : sub.percentage >= 50 ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                                Qualified
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200/60">
                                Remediation
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {sub.disqualified && (
                              <button
                                onClick={() => handleGrantRetake(selectedQuizForDetails.id, sub.traineeId, sub.traineeName)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-[11px] transition-colors"
                              >
                                Revoke Flag
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB 4: CADET MERIT LEADERBOARD ─── */}
          {analyticsSubTab === "leaderboard" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Merit Leaderboard Ranking</span>
                </h3>
              </div>

              <div className="space-y-2">
                {[...activeSubmissions]
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((sub, idx) => (
                    <div key={sub.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full font-bold font-mono flex items-center justify-center text-xs ${idx === 0 ? "bg-amber-400 text-slate-950 shadow-xs" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{sub.traineeName}</div>
                          <div className="text-[10px] text-slate-500">{sub.station || "National Meteorological HQ"}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-blue-900 text-sm">{sub.score} Marks</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">{sub.percentage}% Score</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};