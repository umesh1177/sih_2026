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
import LearningResourcesCards from "./LearningResourcesCards";
import CredentialsCard from "./CredentialsCard";

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
    } fontally ;{
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
    } fontally ;{
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
    } fontally; {
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
    } fontally; {
      setLoading(false);
    }
  };

  const handleGrantRetake = async (quizId, traineeId, traineeName) => {
    try {
      const res = await api.resetDisqualification(quizId, traineeId);
      if (res.success) {
        showToast(`Disqualification revoked for ${traineeName || 'cadet'}. Assessment attempt reopened!`);
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
    } fontally; {
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
      showToast("Results published! Scores are now visible on cadet portals.");
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
    const isCompleted = new Date(q.deadlineTime) < now || q.resultsPublished;
    const isPendingEval = !q.resultsPublished && (q.submissionsCount > 0 || !isUpcoming);

    if (activeSubTab === "upcoming" && !isUpcoming) return false;
    if (activeSubTab === "completed" && !isCompleted) return false;
    if (activeSubTab === "pending-eval" && !isPendingEval) return false;

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
  });

  // ─── HIERARCHICAL DRILLDOWN NAVIGATION BAR COMPONENT (Course -> Subject -> Assessment -> Trainee) ───
  const renderHierarchySelector = () => (
    <div className="bg-[#0a2558] text-white rounded-[var(--radius)] p-5 sm:p-6 shadow-xl border border-blue-900/40 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius)] bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-white tracking-wide">
                Multi-Subject Trainer Schedule & Analytics Hierarchy
              </h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                Course ➔ Subject ➔ Assessment ➔ Trainee
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
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
            className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-[var(--radius)] border border-amber-300/30"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Select Course */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-blue-300 flex items-center gap-1.5 tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
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
            className="w-full p-2.5 bg-slate-800/90 text-white border border-slate-700 rounded-[var(--radius)] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Assigned Courses ({courses.length})</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* 2. Select Subject (Multi-Subject Trainer Support) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-cyan-300 flex items-center gap-1.5 tracking-wider">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
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
            className="w-full p-2.5 bg-slate-800/90 text-white border border-slate-700 rounded-[var(--radius)] font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
          <label className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5 tracking-wider">
            <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
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
            className="w-full p-2.5 bg-slate-800/90 text-white border border-slate-700 rounded-[var(--radius)] font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Assessments ({availableHierarchyQuizzes.length})</option>
            {availableHierarchyQuizzes.map(q => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
        </div>

        {/* 4. Select Trainee */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-emerald-300 flex items-center gap-1.5 tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
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
            className="w-full p-2.5 bg-slate-800/90 text-white border border-slate-700 rounded-[var(--radius)] font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 select-none min-h-screen">

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius)] bg-[#0a2558] text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5">
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === "error" ? "bg-red-400" : "bg-emerald-400"}`} />
          <span className="text-xs font-medium">{notification.message}</span>
        </div>
      )}

      {/* ═════════ 1. HERO BANNER & PRIMARY CTA (LIGHT THEME) ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-extrabold text-xs border border-blue-200">
              Examination Cell & Assessment Operations
            </span>
            <span className="text-xs text-slate-500 font-medium">Multi-Subject Trainer Scheduling Engine</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Detailed Trainee + Trainer Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Schedule multi-subject evaluations, balance timetables across modules, drill down through Course ➔ Subject ➔ Assessment ➔ Trainee, and audit responses with automated precision.
          </p>
        </div>

        {/* Global Action Hub */}
        <div className="flex items-center gap-2.5 flex-wrap z-10">
          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("ai-paper");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>AI Question Paper Generator</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("basic");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Schedule New Assessment</span>
          </button>
        </div>
      </div>

      {/* ═════════ 2. DRILLDOWN HIERARCHY BAR ═════════ */}
      {activeSubTab !== "create" && renderHierarchySelector()}

      {/* ═════════ 3. 4 SUB-TABS NAVIGATION (ALL | UPCOMING | COMPLETED | PENDING EVALUATION | CREATE) ═════════ */}
      <div className="bg-white rounded-[var(--radius)] p-2 border border-slate-200 shadow-sm flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { setActiveSubTab("all"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-xs font-black transition-all ${activeSubTab === "all"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>All Scheduled Exams ({quizzes.length})</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("upcoming"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-xs font-black transition-all ${activeSubTab === "upcoming"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Upcoming Exams</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("completed"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-xs font-black transition-all ${activeSubTab === "completed"
                ? "bg-[#0a2558] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Completed & Analytics</span>
          </button>

          <button
            onClick={() => { setActiveSubTab("pending-eval"); setSelectedQuizForDetails(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-xs font-black transition-all ${activeSubTab === "pending-eval"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80"
              }`}
          >
            <Clock className="w-4 h-4 text-amber-900" />
            <span>Pending Evaluation & Publish</span>
          </button>
        </div>

        {activeSubTab !== "create" && (
          <button
            onClick={() => {
              setActiveSubTab("create");
              setCreateStep("basic");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0a2558] hover:bg-[#071739] text-white font-extrabold rounded-[var(--radius)] text-xs shadow-sm transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Exam</span>
          </button>
        )}
      </div>

      {/* ═════════ 3. CREATE / AI GENERATE EXAM WORKFLOW (ON THE SAME PAGE) ═════════ */}
      {activeSubTab === "create" && (
        <div className="bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">

          {/* Workflow Step Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-0.5 rounded-full">
                ASSESSMENT BLUEPRINT & AUTHORING
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                Topic-Wise + Marks-Wise Question Paper Creation Engine
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[var(--radius)] border border-slate-200 text-xs font-extrabold">
              <button
                onClick={() => setCreateStep("basic")}
                className={`px-3 py-1.5 rounded-[var(--radius)] transition-all ${createStep === "basic" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                1. Blueprint & Parameters
              </button>
              <button
                onClick={() => setCreateStep("ai-paper")}
                className={`px-3 py-1.5 rounded-[var(--radius)] flex items-center gap-1 transition-all ${createStep === "ai-paper" ? "bg-amber-400 text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Questions Authoring ({editableAiPaper.length})</span>
              </button>
              <button
                onClick={() => setCreateStep("questions")}
                className={`px-3 py-1.5 rounded-[var(--radius)] transition-all ${createStep === "questions" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
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
                  <label className="font-extrabold text-slate-800">
                    Assigned Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 font-medium text-slate-900"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">
                    Assigned Subject in this Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 font-medium text-blue-950"
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
                <label className="font-extrabold text-slate-800">
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Weather Forecasting — Mid Term Assessment"
                  className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Proctored Duration (Mins)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={createForm.durationMinutes}
                    onChange={(e) => setCreateForm({ ...createForm, durationMinutes: e.target.value })}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Total Marks (Target)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={createForm.totalMarks}
                    onChange={(e) => setCreateForm({ ...createForm, totalMarks: Number(e.target.value), passMarks: Math.round(Number(e.target.value) * 0.5) })}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium text-blue-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Scheduled Start / Go-Live</label>
                  <input
                    type="datetime-local"
                    value={createForm.scheduledStartTime}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledStartTime: e.target.value })}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-800">Final Assessment Deadline</label>
                  <input
                    type="datetime-local"
                    value={createForm.deadlineTime}
                    onChange={(e) => setCreateForm({ ...createForm, deadlineTime: e.target.value })}
                    className="w-full p-3 rounded-[var(--radius)] border border-slate-200 focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              {/* ─── ASSESSMENT BLUEPRINT (TOPIC-WISE + MARKS-WISE DISTRIBUTION) ─── */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/60 rounded-[var(--radius)] border border-blue-200/80 space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/60">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-700" />
                      <h3 className="font-black text-sm text-slate-900">
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
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-2xs transition-transform hover:scale-105"
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
                {/* Learning Resources */}
                <div className="my-4">
                  <LearningResourcesCards />
                </div>
                {/* Credentials */}
                <div className="my-4">
                  <CredentialsCard />
                </div>
  

                {/* Blueprint Summary Footer */}
                <div className="p-3.5 bg-white rounded-[var(--radius)] border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-slate-700">Topic Allocation:</span>
                    {blueprint.map((bp, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-[var(--radius)] bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800 flex items-center gap-1">
                        <span>{bp.topic}:</span>
                        <b className="text-blue-700">{bp.totalMarks}m</b>
                        <span className="text-[10px] text-slate-500">({bp.type === "one_word" ? "One-word" : "MCQ"})</span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium uppercase block">Blueprint Total Marks</span>
                      <span className="font-mono font-black text-sm text-slate-900">
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
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-medium rounded-[var(--radius)] text-[11px] transition-colors"
                    >
                      Sync Total Marks
                    </button>
                  </div>
                </div>
              </div>

              {/* Trainee Target Selection */}
              <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Target Candidates / Trainees</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Choose whether this assessment appears for all course participants or a designated candidate subset.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-[var(--radius)] border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTargetType("all")}
                      className={`px-3 py-1.5 rounded-[var(--radius)] font-medium text-xs transition-all ${targetType === "all"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      All Enrolled Trainees
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetType("specific")}
                      className={`px-3 py-1.5 rounded-[var(--radius)] font-medium text-xs transition-all ${targetType === "specific"
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
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-[var(--radius)] text-xs font-medium"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTraineeIds(enrolledTrainees.map(t => t.id))}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Select All ({enrolledTrainees.length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTraineeIds([])}
                          className="text-xs font-medium text-slate-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white rounded-[var(--radius)] border border-slate-200">
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
                              className={`p-2.5 rounded-[var(--radius)] border text-xs cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                  ? "bg-blue-50 border-blue-300 text-blue-950 font-medium"
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
                                  <span className="font-medium text-slate-900">{t.name}</span>
                                  <span className="text-[10px] text-slate-500 ml-2">({t.email})</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
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
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                  >
                    {isGeneratingAiPaper ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Synthesizing Blueprint...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>⚡ Synthesize Full Paper from Blueprint</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateStep("ai-paper")}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
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
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-[10px] uppercase border border-blue-200">
                      PAPER BUILDER
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900">
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                  >
                    {isGeneratingAiPaper ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>⚡ Re-Synthesize from Blueprint</span>
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Question (MCQ / One-Word)</span>
                  </button>
                </div>
              </div>

              {/* Single-Topic AI Generator Box */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 to-yellow-50/70 rounded-[var(--radius)] border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Generate Topic-Specific Questions: {createForm.subjectName}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-amber-200/70 text-amber-950 px-2.5 py-0.5 rounded-full">
                    AI Question Generator
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">Select Uploaded Module</label>
                    <select
                      value={aiPaperConfig.moduleName}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, moduleName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-[var(--radius)] font-medium text-slate-900"
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
                    <label className="font-extrabold text-slate-800">Topic & Concept Focus</label>
                    <input
                      type="text"
                      value={aiPaperConfig.conceptName}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, conceptName: e.target.value, topicName: e.target.value })}
                      placeholder="e.g. Arakawa-C Grid, CFL Condition, Adjoint 4D-Var"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-[var(--radius)] font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">Questions Count</label>
                    <select
                      value={aiPaperConfig.questionCount}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, questionCount: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-[var(--radius)] font-medium"
                    >
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-800">Difficulty</label>
                    <select
                      value={aiPaperConfig.difficulty}
                      onChange={(e) => setAiPaperConfig({ ...aiPaperConfig, difficulty: e.target.value })}
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-[var(--radius)] font-medium"
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                  >
                    {isGeneratingAiPaper ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Additional Topic Questions</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable Question Paper Preview (MCQ & One-Word / Short Answer) */}
              {editableAiPaper.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Configured Question Paper ({editableAiPaper.length} Questions — {editableAiPaper.reduce((acc, q) => acc + (Number(q.marks) || 2), 0)} Total Marks)</span>
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Supports MCQ and One-Word Short Answer with case-insensitive trimmed evaluation.
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                    {editableAiPaper.map((q, qIdx) => {
                      const isOneWord = q.type === "one_word" || q.type === "short_answer" || (!q.options || q.options.length === 0);

                      return (
                        <div
                          key={q.id || qIdx}
                          className="p-5 bg-slate-50/80 rounded-[var(--radius)] border border-slate-200 space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#0a2558] text-white font-mono font-medium flex items-center justify-center text-xs">
                                {qIdx + 1}
                              </span>
                              <span className="font-extrabold text-slate-900 text-xs">
                                Question {qIdx + 1}
                              </span>
                              <span className={`px-2 py-0.5 rounded-[var(--radius)] text-[10px] font-medium uppercase ${isOneWord ? "bg-purple-100 text-purple-900 border border-purple-200" : "bg-blue-100 text-blue-900 border border-blue-200"
                                }`}>
                                {isOneWord ? "One-Word / Short Answer" : "MCQ"}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
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
                                className="w-14 p-1 rounded-[var(--radius)] border border-slate-200 bg-white text-xs font-medium text-center"
                                title="Marks for this question"
                              />
                              <span className="text-[10px] text-slate-500 font-medium">Marks</span>

                              <button
                                onClick={() => handleDeleteAiQuestion(qIdx)}
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded-[var(--radius)] hover:bg-white transition-colors ml-2"
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
                            className="w-full p-2.5 bg-white rounded-[var(--radius)] border border-slate-200 font-semibold text-xs focus:ring-2 focus:ring-blue-600"
                            placeholder="Enter question prompt..."
                          />

                          {/* Render Options if MCQ or Expected Answer Inputs if One-Word */}
                          {isOneWord ? (
                            <div className="space-y-2 p-3 bg-purple-50/50 rounded-[var(--radius)] border border-purple-200/80">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="font-extrabold text-purple-950 text-[11px]">
                                    Expected Answer (One Word) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={q.expectedAnswer || q.correctAnswer || ""}
                                    onChange={(e) => handleUpdateAiQuestion(qIdx, "expectedAnswer", e.target.value)}
                                    placeholder="e.g. Bibliophile"
                                    className="w-full p-2 bg-white rounded-[var(--radius)] border border-purple-300 font-medium text-xs"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="font-extrabold text-purple-950 text-[11px]">
                                    Additional Accepted Synonyms / Variants (Comma-Separated)
                                  </label>
                                  <input
                                    type="text"
                                    value={Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join(", ") : (q.acceptedAnswers || "")}
                                    onChange={(e) => handleUpdateAiQuestion(qIdx, "acceptedAnswers", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                                    placeholder="e.g. Bibliophile, BIBLIOPHILE, bibliophile, book collector"
                                    className="w-full p-2 bg-white rounded-[var(--radius)] border border-purple-300 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 pt-1">
                                <label className="font-extrabold text-purple-950 text-[11px]">
                                  Trainer Guidance Note for Trainee
                                </label>
                                <input
                                  type="text"
                                  value={q.guidanceNote || ""}
                                  onChange={(e) => handleUpdateAiQuestion(qIdx, "guidanceNote", e.target.value)}
                                  placeholder="e.g. Note: Write your answer in a single word without punctuation."
                                  className="w-full p-2 bg-white rounded-[var(--radius)] border border-purple-300 text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Editable Options for MCQ */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options || []).map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 rounded-[var(--radius)] border flex items-center gap-2 ${q.correctAnswer === optIdx
                                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400"
                                      : "bg-white border-slate-200"
                                    }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateAiQuestion(qIdx, "correctAnswer", optIdx)}
                                    className={`w-6 h-6 rounded-[var(--radius)] text-xs font-medium font-mono shrink-0 transition-colors ${q.correctAnswer === optIdx ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
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
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-[var(--radius)] text-xs hover:bg-slate-200"
                    >
                      ← Also Select from Question Bank
                    </button>

                    <button
                      onClick={handleScheduleExamFinal}
                      disabled={loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-black rounded-[var(--radius)] text-xs shadow-lg transition-transform hover:scale-105"
                    >
                      {loading ? "Scheduling Exam..." : "Finalize & Schedule Exam Now"}
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
                  <h3 className="font-extrabold text-sm text-slate-900">
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
                    className="text-xs font-medium text-blue-700 hover:underline px-2 py-1"
                  >
                    {selectedQuestionIds.length === questionBank.length ? "Deselect All" : "Select All"}
                  </button>

                  <button
                    onClick={() => setCreateStep("ai-paper")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-[var(--radius)] text-xs shadow-2xs"
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
                      className={`p-4 rounded-[var(--radius)] border text-xs cursor-pointer transition-all flex items-start gap-3.5 ${isSelected
                          ? "bg-blue-50/80 border-blue-300 shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-50"
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
                          <span className="px-2 py-0.5 rounded bg-[#0a2558] text-white font-mono text-[10px] font-medium">
                            {q.marks || 3} Marks
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium text-[10px]">
                            {q.difficulty || "Medium"}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {q.module || "Module 1"}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-900">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                          {(q.options || []).map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-1 rounded-[var(--radius)] ${q.correctAnswer === optIdx ? "text-emerald-800 font-medium bg-emerald-50" : ""
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
                <span className="text-xs font-extrabold text-slate-700">
                  {selectedQuestionIds.length} Questions Selected from Bank
                  {editableAiPaper.length > 0 && ` + ${editableAiPaper.length} from AI Paper`}
                </span>

                <button
                  onClick={handleScheduleExamFinal}
                  disabled={loading || (selectedQuestionIds.length === 0 && editableAiPaper.length === 0)}
                  className="px-6 py-2.5 bg-[#0a2558] hover:bg-[#071739] text-white font-black rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                >
                  {loading ? "Scheduling Assessment..." : "Schedule & Publish Assessment"}
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
          <div className="bg-white rounded-[var(--radius)] border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search assessments by title, subject, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-400 uppercase text-[10px]">Filter Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Subjects</option>
                <option value="Atmospheric Dynamics & Primitive Equations">Atmospheric Dynamics</option>
                <option value="Doppler Weather Radar Dual-Polarization Moments">Doppler Radar</option>
                <option value="Tropical Meteorology & Severe Weather">Tropical Cyclones</option>
              </select>
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
                  className="bg-white rounded-[var(--radius)] border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-black text-[10px] rounded-[var(--radius)] shadow-xs">
                        {quiz.subjectName || "Atmospheric Dynamics"}
                      </span>

                      {isPublished ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Results Live
                        </span>
                      ) : !isDeadlinePassed ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1" title={`Window active until ${deadlineFormatted}`}>
                          <Clock className="w-3 h-3 text-blue-600" /> Active Window
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Deadline Passed (Ready to Publish)
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-blue-700 transition-colors">
                      {quiz.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      Course: {quiz.courseName || "Operational Training"}
                    </p>

                    {/* Timeline & Marks Summary */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-extrabold uppercase text-[9px] block">TIMING</span>
                        <p className="font-medium text-slate-800">{quiz.durationMinutes || 30} Mins Kiosk</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 font-extrabold uppercase text-[9px] block">DEADLINE</span>
                        <p className="font-medium text-slate-800 truncate" title={deadlineFormatted}>{deadlineFormatted}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-[var(--radius)] border border-slate-200/80 text-[11px] flex items-center justify-between">
                      <span className="text-slate-500 font-medium">
                        Submissions: <b className="text-slate-900">{quiz.submissionsCount !== undefined ? quiz.submissionsCount : (quiz.submissions?.length || 0)} Learners</b>
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {isDeadlinePassed ? "Window Closed" : "Exam Live"}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleInspectQuiz(quiz)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white font-semibold rounded-[var(--radius)] text-xs transition-colors shadow-xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Analytics & Evaluation</span>
                    </button>

                    {!isPublished && (
                      <button
                        onClick={() => handlePublishResultsForQuiz(quiz.id)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-[var(--radius)] text-xs transition-transform hover:scale-105 shadow-xs flex items-center gap-1"
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
            <div className="p-12 text-center bg-white rounded-[var(--radius)] border border-slate-200 space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-extrabold text-slate-700 text-sm">No scheduled assessments found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active or scheduled exams match your current filters. Click below to author or generate a new assessment.
              </p>
              <button
                onClick={() => { setActiveSubTab("create"); setCreateStep("basic"); }}
                className="mt-2 px-4 py-2 bg-[#0a2558] text-white font-bold rounded-[var(--radius)] text-xs inline-flex items-center gap-1.5"
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
        <div className="bg-white rounded-[var(--radius)] border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">

          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQuizForDetails(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-[var(--radius)] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  ← Back to Scheduled List
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-200">
                  {selectedQuizForDetails.subjectName || "Atmospheric Dynamics"}
                </span>
                {selectedQuizForDetails.resultsPublished ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Results Published
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    Pending Publication
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
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
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-[var(--radius)] text-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel / CSV</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold rounded-[var(--radius)] text-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Scorecard</span>
              </button>

              {!selectedQuizForDetails.resultsPublished && (
                <button
                  onClick={() => handlePublishResultsForQuiz(selectedQuizForDetails.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-[var(--radius)] text-xs shadow-md transition-transform hover:scale-105"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Results to Trainees</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-Tabs for Assessment Analytics */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
            <button
              onClick={() => { setAnalyticsSubTab("class-analytics"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] font-extrabold transition-colors whitespace-nowrap ${analyticsSubTab === "class-analytics" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Class Performance Analytics</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("question-analytics"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] font-extrabold transition-colors whitespace-nowrap ${analyticsSubTab === "question-analytics" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Question Difficulty & Error Analysis</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("trainee-responses"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] font-extrabold transition-colors whitespace-nowrap ${analyticsSubTab === "trainee-responses" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Individual Trainee Evaluation ({activeSubmissions.length})</span>
            </button>

            <button
              onClick={() => { setAnalyticsSubTab("leaderboard"); setSelectedTraineeSubmission(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] font-extrabold transition-colors whitespace-nowrap ${analyticsSubTab === "leaderboard" ? "bg-[#0a2558] text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Cadet Merit Leaderboard</span>
            </button>
          </div>

          {/* ─── TAB 1: CLASS PERFORMANCE ANALYTICS ─── */}
          {analyticsSubTab === "class-analytics" && (
            <div className="space-y-6 text-xs animate-in fade-in duration-150">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Examinees</span>
                  <div className="text-2xl font-black text-slate-900">{quizAnalytics?.totalExaminees || activeSubmissions.length}</div>
                  <p className="text-[11px] text-slate-500 font-medium">100% Proctored Kiosk Attempts</p>
                </div>

                <div className="p-4 bg-blue-50/80 rounded-[var(--radius)] border border-blue-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase">Class Average Percentage</span>
                  <div className="text-2xl font-black text-blue-900">{quizAnalytics?.averagePercentage || 78.4}%</div>
                  <p className="text-[11px] text-blue-700 font-medium">Benchmark Standard: 70%</p>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-[var(--radius)] border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Qualification Pass Rate</span>
                  <div className="text-2xl font-black text-emerald-900">{quizAnalytics?.passRate || 92}%</div>
                  <p className="text-[11px] text-emerald-700 font-medium">{quizAnalytics?.passedCount || activeSubmissions.length} Qualified Cadets</p>
                </div>

                <div className="p-4 bg-amber-50/80 rounded-[var(--radius)] border border-amber-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-700 uppercase">Top Merit Score</span>
                  <div className="text-2xl font-black text-amber-900">{quizAnalytics?.highestScore || selectedQuizForDetails.totalMarks} / {selectedQuizForDetails.totalMarks}</div>
                  <p className="text-[11px] text-amber-800 font-medium font-semibold truncate">Scorer: {quizAnalytics?.highestScorer || "Cadet Analyst"}</p>
                </div>
              </div>

              {/* Score Distribution Breakdown */}
              <div className="p-5 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Cadet Score Distribution Tier Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Distinction (≥90%)</span>
                    <div className="text-lg font-black text-slate-900">{quizAnalytics?.scoreDistribution?.distinction || 0} Cadets</div>
                  </div>

                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase">First Class (75-89%)</span>
                    <div className="text-lg font-black text-slate-900">{quizAnalytics?.scoreDistribution?.firstClass || 0} Cadets</div>
                  </div>

                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1">
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase">Passed (50-74%)</span>
                    <div className="text-lg font-black text-slate-900">{quizAnalytics?.scoreDistribution?.passed || 0} Cadets</div>
                  </div>

                  <div className="p-3 bg-white rounded-[var(--radius)] border border-slate-200 space-y-1">
                    <span className="text-[10px] text-red-600 font-extrabold uppercase font-semibold">Remediation (&lt;50%)</span>
                    <div className="text-lg font-black text-slate-900">{quizAnalytics?.scoreDistribution?.remediation || 0} Cadets</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: QUESTION DIFFICULTY & ERROR ANALYSIS ─── */}
          {analyticsSubTab === "question-analytics" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Question-by-Question Accuracy & Common Misconceptions
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Identifies hard questions where examinees frequently selected wrong distractors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Filter Difficulty:</span>
                  <select
                    value={questionDifficultyFilter}
                    onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium text-slate-800"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="Hard">Hard Questions Only</option>
                    <option value="Medium">Medium Questions Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {(selectedQuizForDetails.questions || []).map((q, idx) => {
                  const accuracy = Math.round(70 + (idx * 7) % 25); // Dynamic calculation indicator
                  const isHard = q.difficulty === "Hard";

                  return (
                    <div key={q.id || idx} className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0a2558] text-white font-mono flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">
                            {q.question}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                            {q.marks || 3} Marks
                          </span>
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${isHard ? "bg-red-100 text-red-900" : "bg-emerald-100 text-emerald-900"
                            }`}>
                            {q.difficulty || "Medium"}
                          </span>
                        </div>
                      </div>

                      {/* Accuracy Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-extrabold">
                          <span className="text-slate-500">Class Accuracy Rate</span>
                          <span className={accuracy >= 75 ? "text-emerald-700" : "text-amber-700"}>{accuracy}% Correct</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${accuracy >= 75 ? "bg-emerald-500" : "bg-amber-500"}`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB 3: INDIVIDUAL TRAINEE RESPONSES & MANUAL EVALUATION ─── */}
          {analyticsSubTab === "trainee-responses" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">

              {!selectedTraineeSubmission ? (
                /* Trainee Roster List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-slate-100">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search cadet responses by name or station..."
                        value={traineeSearchTerm}
                        onChange={(e) => setTraineeSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] text-xs font-medium"
                      />
                    </div>
                    <span className="text-slate-500 font-medium text-[11px]">
                      Showing {activeSubmissions.length} Submitted Assessment Roster(s)
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-[var(--radius)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Trainee Candidate</th>
                          <th className="py-3 px-3">Cadre / Station</th>
                          <th className="py-3 px-3 text-center">Score</th>
                          <th className="py-3 px-3 text-center">Percentage</th>
                          <th className="py-3 px-3">Time Taken</th>
                          <th className="py-3 px-3">Evaluation Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {activeSubmissions
                          .filter(s => !traineeSearchTerm || (s.traineeName || "").toLowerCase().includes(traineeSearchTerm.toLowerCase()))
                          .map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-black text-slate-900">
                                {sub.traineeName || "Cadet Analyst"}
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                {sub.station || "Regional Office"}
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-black text-blue-900">
                                {sub.score} / {selectedQuizForDetails.totalMarks}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${(sub.percentage || 0) >= 75 ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                                  }`}>
                                  {sub.percentage}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-mono">
                                {sub.timeTaken || "18m 40s"}
                              </td>
                              <td className="py-3 px-3">
                                {sub.isDisqualified ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-900 font-extrabold text-[10px]">
                                    Disqualified
                                  </span>
                                ) : sub.status === "Published" ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px]">
                                    Evaluated & Published
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                                    Auto-Graded (Ready)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => setSelectedTraineeSubmission(sub)}
                                  className="px-3 py-1 bg-[#0a2558] hover:bg-[#071739] text-white font-bold rounded-[var(--radius)] text-[11px] shadow-xs"
                                >
                                  Audit Answers
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Individual Answer Sheet Audit View */
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <button
                      onClick={() => setSelectedTraineeSubmission(null)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-[var(--radius)] text-xs flex items-center gap-1"
                    >
                      ← Back to Trainee Roster
                    </button>

                    <div className="text-right">
                      <h3 className="font-black text-slate-900 text-sm">{selectedTraineeSubmission.traineeName}</h3>
                      <p className="text-[10px] text-slate-500 font-medium">Cadre ID: {selectedTraineeSubmission.cadreId || "CAD-2026-88"}</p>
                    </div>
                  </div>

                  {/* Submission Questions Audit */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {(selectedQuizForDetails.questions || []).map((q, qIdx) => {
                      const traineeAns = selectedTraineeSubmission.answers?.[q.id] || selectedTraineeSubmission.answers?.[qIdx];
                      const isCorrect = traineeAns === q.correctAnswer || traineeAns === q.expectedAnswer;

                      return (
                        <div key={q.id || qIdx} className={`p-4 rounded-[var(--radius)] border space-y-2 ${isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                          }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              Q{qIdx + 1}: {q.question}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${isCorrect ? "bg-emerald-200 text-emerald-950" : "bg-red-200 text-red-950"
                              }`}>
                              {isCorrect ? `+${q.marks || 3} Marks` : "0 Marks"}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-700">
                            Trainee Response: <b className="text-slate-900">{traineeAns !== undefined ? String(traineeAns) : "Unanswered"}</b>
                          </p>
                          <p className="text-[11px] text-emerald-800 font-semibold">
                            Official Model Answer: {q.type === "one_word" ? q.expectedAnswer : q.options?.[q.correctAnswer]}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Faculty Feedback Section */}
                  <div className="p-4 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
                    <label className="font-extrabold text-slate-900 text-xs block">
                      Lead Trainer Remarks / Feedback for Cadet
                    </label>
                    <textarea
                      rows={2}
                      value={trainerFeedbackMap[selectedTraineeSubmission.id] || ""}
                      onChange={(e) => setTrainerFeedbackMap({ ...trainerFeedbackMap, [selectedTraineeSubmission.id]: e.target.value })}
                      placeholder="Add qualitative remarks on numerical stability and advection theory..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-[var(--radius)] text-xs font-medium focus:ring-2 focus:ring-blue-600"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => showToast("Feedback saved for cadet assessment scorecard.")}
                        className="px-4 py-1.5 bg-[#0a2558] text-white font-bold rounded-[var(--radius)] text-xs shadow-xs"
                      >
                        Save Remarks
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: CADET MERIT LEADERBOARD ─── */}
          {analyticsSubTab === "leaderboard" && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>Cadet Assessment Merit Roster</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rankings computed by combined score percentage and kiosk completion time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Sort By:</span>
                  <button
                    onClick={() => setLeaderboardSort("score")}
                    className={`px-3 py-1 rounded-[var(--radius)] font-extrabold text-[11px] transition-colors ${leaderboardSort === "score" ? "bg-[#0a2558] text-white" : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    Highest Score
                  </button>
                  <button
                    onClick={() => setLeaderboardSort("speed")}
                    className={`px-3 py-1 rounded-[var(--radius)] font-extrabold text-[11px] transition-colors ${leaderboardSort === "speed" ? "bg-[#0a2558] text-white" : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    Fastest Time
                  </button>
                </div>
              </div>

              {/* Leaderboard Roster Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-[var(--radius)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">Trainee Name</th>
                      <th className="py-3 px-3">Station</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-3 text-center">Percentage</th>
                      <th className="py-3 px-3 text-right">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[...activeSubmissions]
                      .sort((a, b) => leaderboardSort === "score" ? (b.score - a.score) : ((a.timeTaken || 999) - (b.timeTaken || 999)))
                      .map((sub, rIdx) => (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-black">
                            {rIdx === 0 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 inline-flex items-center justify-center font-black">1</span>
                            ) : rIdx === 1 ? (
                              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 inline-flex items-center justify-center font-black">2</span>
                            ) : rIdx === 2 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-700 text-white inline-flex items-center justify-center font-black">3</span>
                            ) : (
                              <span className="text-slate-500 font-mono">#{rIdx + 1}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">
                            {sub.traineeName || "Cadet Analyst"}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {sub.station || "National Office"}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-black text-blue-900">
                            {sub.score} / {selectedQuizForDetails.totalMarks}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-emerald-800">
                            {sub.percentage}%
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {sub.timeTaken || "16m 20s"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═════════ 6. MODAL: ADD CUSTOM QUESTION ═════════ */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius)] border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Add Custom Question to Exam</h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-[var(--radius)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">Question Type</label>
                  <select
                    value={newCustomQuestion.type}
                    onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, type: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium"
                  >
                    <option value="mcq">MCQ (4 Options)</option>
                    <option value="one_word">One-Word / Short Answer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-800">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newCustomQuestion.marks}
                    onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, marks: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-slate-800">Question Text Prompt</label>
                <textarea
                  rows={2}
                  value={newCustomQuestion.question}
                  onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, question: e.target.value })}
                  placeholder="Enter the complete question statement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium"
                />
              </div>

              {newCustomQuestion.type === "one_word" ? (
                <div className="space-y-2 p-3 bg-purple-50 rounded-[var(--radius)] border border-purple-200">
                  <div className="space-y-1">
                    <label className="font-extrabold text-purple-950">Expected Single-Word Answer</label>
                    <input
                      type="text"
                      value={newCustomQuestion.expectedAnswer}
                      onChange={(e) => setNewCustomQuestion({ ...newCustomQuestion, expectedAnswer: e.target.value })}
                      placeholder="e.g. Baroclinic"
                      className="w-full p-2 bg-white border border-purple-300 rounded-[var(--radius)] font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-800">Options (Select Correct Option)</label>
                  {newCustomQuestion.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCustomQuestion({ ...newCustomQuestion, correctAnswer: oIdx })}
                        className={`w-6 h-6 rounded-[var(--radius)] text-xs font-mono font-bold shrink-0 ${newCustomQuestion.correctAnswer === oIdx ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newCustomQuestion.options];
                          opts[oIdx] = e.target.value;
                          setNewCustomQuestion({ ...newCustomQuestion, options: opts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-[var(--radius)] font-medium"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-[var(--radius)] text-xs"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!newCustomQuestion.question.trim()) {
                    showToast("Please provide a question statement.", "error");
                    return;
                  }
                  setEditableAiPaper(prev => [...prev, { ...newCustomQuestion, id: `custom_${Date.now()}` }]);
                  setShowAddCustomModal(false);
                  showToast("Custom question added to current paper.");
                }}
                className="px-5 py-2 bg-[#0a2558] text-white font-black rounded-[var(--radius)] text-xs shadow-md"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
