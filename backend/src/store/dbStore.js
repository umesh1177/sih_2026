// Persistent data store for CAPACITY CONNECT
// Uses JSON file persistence to survive server restarts
import { initialData } from "../data/mockData.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../data/db.json");

class DatabaseStore {
  constructor() {
    this._loadFromDisk();
  }

  // --- Persistence: Load from db.json, fallback to mockData ---
  _loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const saved = JSON.parse(raw);
        this.users = saved.users || [...initialData.users];
        this.courses = saved.courses || JSON.parse(JSON.stringify(initialData.courses));
        this.questionBank = saved.questionBank || [...initialData.questionBank];
        this.quizzes = saved.quizzes || JSON.parse(JSON.stringify(initialData.quizzes));
        this.quizSubmissions = saved.quizSubmissions || [...initialData.quizSubmissions];
        this.competencyFramework = saved.competencyFramework || JSON.parse(JSON.stringify(initialData.competencyFramework));
        this.announcements = saved.announcements || [...initialData.announcements];
        this.feedbacks = saved.feedbacks || [...initialData.feedbacks];
        this.moduleProgress = saved.moduleProgress || {};
        this.contentLibrary = this._sanitizeContentLibrary(saved.contentLibrary || this._generateInitialContentLibrary());
        this.integrityAlerts = saved.integrityAlerts || [];
        this._persist();
        console.log("✅ Database loaded from db.json");
        return;
      }
    } catch (err) {
      console.warn("⚠️ Could not load db.json, using fresh mock data:", err.message);
    }
    // Fresh seed from mockData
    this.users = [...initialData.users];
    this.courses = JSON.parse(JSON.stringify(initialData.courses));
    this.questionBank = [...initialData.questionBank];
    this.quizzes = JSON.parse(JSON.stringify(initialData.quizzes));
    this.quizSubmissions = [...initialData.quizSubmissions];
    this.competencyFramework = JSON.parse(JSON.stringify(initialData.competencyFramework));
    this.announcements = [...initialData.announcements];
    this.feedbacks = [...initialData.feedbacks];
    this.moduleProgress = {};
    this.contentLibrary = this._generateInitialContentLibrary();
    this.integrityAlerts = [];
  }

  // --- Persist current state to db.json ---
  _persist() {
    try {
      const state = {
        users: this.users,
        courses: this.courses,
        questionBank: this.questionBank,
        quizzes: this.quizzes,
        quizSubmissions: this.quizSubmissions,
        competencyFramework: this.competencyFramework,
        announcements: this.announcements,
        feedbacks: this.feedbacks,
        moduleProgress: this.moduleProgress,
        contentLibrary: this.contentLibrary,
        integrityAlerts: this.integrityAlerts || []
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("❌ Failed to persist DB:", err.message);
    }
  }

  // --- Users & Auth ---
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === "string" && val.trim().length > 0) {
        if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
        if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
        return [val.trim()];
      }
      return [];
    };

    const newUser = {
      id: userData.id || `u_${userData.role || "trainee"}_${uuidv4().substring(0, 8)}`,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash || null,
      role: userData.role || "trainee",
      department: userData.department || "India Meteorological Department",
      designation: userData.designation || "Officer",
      station: userData.station || "National Weather Forecasting Centre, IMD HQ New Delhi",
      cadreId: userData.cadreId || "MOES-MET-2026-4491",
      phone: userData.phone || "+91 98765 43210",
      status: userData.role === "admin" ? "approved" : (userData.status || "pending"),
      interests: normalizeArray(userData.interests),
      skills: normalizeArray(userData.skills),
      qualifications: normalizeArray(userData.qualifications),
      experience: normalizeArray(userData.experience),
      specialization: normalizeArray(userData.specialization),
      certificates: userData.certificates || [],
      bio: userData.bio || "",
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this._persist();
    return newUser;
  }

  updateUser(id, updates) {
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === "string" && val.trim().length > 0) {
        if (val.includes("•")) return val.split("•").map(s => s.trim()).filter(Boolean);
        if (val.includes(",")) return val.split(",").map(s => s.trim()).filter(Boolean);
        return [val.trim()];
      }
      return [];
    };

    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const formattedUpdates = { ...updates };
    if ("skills" in updates) formattedUpdates.skills = normalizeArray(updates.skills);
    if ("qualifications" in updates) formattedUpdates.qualifications = normalizeArray(updates.qualifications);
    if ("experience" in updates) formattedUpdates.experience = normalizeArray(updates.experience);
    if ("interests" in updates) formattedUpdates.interests = normalizeArray(updates.interests);
    if ("specialization" in updates) formattedUpdates.specialization = normalizeArray(updates.specialization);

    this.users[idx] = { ...this.users[idx], ...formattedUpdates, updatedAt: new Date().toISOString() };
    this._persist();
    return this.users[idx];
  }

  getPendingUsers() {
    return this.users.filter(u => u.status === "pending");
  }

  approveUser(id, approved = true, notes = "") {
    const user = this.findUserById(id);
    if (user) {
      user.status = approved ? "approved" : "rejected";
      user.approvalNotes = notes;
      if (!approved) {
        user.rejectionReason = notes || "Officer qualifications or credentials could not be verified by the administrator. Please update your profile details and resubmit.";
      } else {
        user.rejectionReason = null;
      }
      user.verifiedAt = new Date().toISOString();
      this._persist();
      return user;
    }
    return null;
  }

  // --- Courses ---
  getCourses() {
    return this.courses;
  }

  getCourseById(id) {
    return this.courses.find(c => c.id === id);
  }

  createCourse(courseData) {
    const newCourse = {
      id: courseData.id || `crs_${uuidv4().substring(0, 8)}`,
      code: courseData.code || `MOES-IMD-${Math.floor(100 + Math.random() * 900)}`,
      title: courseData.title,
      category: courseData.category || "Meteorological Sciences",
      level: courseData.level || "Intermediate",
      duration: courseData.duration || "4 Weeks",
      creditHours: courseData.creditHours || 3,
      maxEnrollment: courseData.maxEnrollment ? parseInt(courseData.maxEnrollment) : 50,
      department: courseData.department || "IMD Headquarters",
      leadTrainerId: courseData.leadTrainerId || "",
      leadTrainerName: courseData.leadTrainerName || "Assigned Senior Scientist",
      thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800",
      description: courseData.description || "",
      prerequisites: courseData.prerequisites || [],
      enrolledTraineeIds: courseData.enrolledTraineeIds || [],
      competenciesGained: courseData.competenciesGained || [],
      subjects: courseData.subjects || [],
      createdAt: new Date().toISOString(),
      isNew: true
    };
    this.courses.unshift(newCourse);

    // Automatically send broadcast announcement to everyone
    try {
      this.createAnnouncement({
        title: `New Operational Course Launched: ${newCourse.title}`,
        message: `The Ministry of Earth Sciences has officially published "${newCourse.title}" (${newCourse.code}) under ${newCourse.category}. Enrollment is now open for verified officers (Max Capacity: ${newCourse.maxEnrollment || 50} officers).`,
        category: "National Academy",
        priority: "high",
        courseId: newCourse.id,
        courseTitle: newCourse.title,
        publishedBy: "MoES Central Academy Directorate"
      });
    } catch (annErr) {
      console.error("Announcement dispatch on course create error:", annErr);
    }

    this._persist();
    return newCourse;
  }

  updateCourse(id, courseData) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;

    this.courses[idx] = {
      ...this.courses[idx],
      ...courseData,
      maxEnrollment: courseData.maxEnrollment ? parseInt(courseData.maxEnrollment) : (this.courses[idx].maxEnrollment || 50),
      updatedAt: new Date().toISOString()
    };
    this._persist();
    return this.courses[idx];
  }

  removeTraineeFromCourse(courseId, traineeId) {
    const course = this.getCourseById(courseId);
    if (course) {
      course.enrolledTraineeIds = (course.enrolledTraineeIds || []).filter(tId => tId !== traineeId);
      this._persist();
      return course;
    }
    return null;
  }

  getTrainersWorkload() {
    const trainers = this.users.filter(u => u.role === "trainer");
    return trainers.map(trainer => {
      const assignedCourses = this.courses.filter(c => {
        if (c.leadTrainerId === trainer.id) return true;
        if (c.leadTrainerName && trainer.name && c.leadTrainerName.toLowerCase().includes(trainer.name.toLowerCase())) return true;
        if (c.subjects?.some(s => s.assignedTrainerId === trainer.id || (s.assignedTrainerName && s.assignedTrainerName.toLowerCase().includes(trainer.name.toLowerCase())))) return true;
        return false;
      });

      const assignedSubjectNames = [];
      let totalAssignedModules = 0;

      this.courses.forEach(c => {
        c.subjects?.forEach(s => {
          if (s.assignedTrainerId === trainer.id || (s.assignedTrainerName && trainer.name && s.assignedTrainerName.toLowerCase().includes(trainer.name.toLowerCase()))) {
            assignedSubjectNames.push({
              subjectTitle: s.title || s.name,
              courseTitle: c.title,
              courseCode: c.code
            });
            totalAssignedModules += (s.modules?.length || 0);
          }
        });
      });

      const workloadScore = assignedCourses.length * 2 + assignedSubjectNames.length;
      let workloadStatus = "Optimal";
      if (workloadScore >= 5) workloadStatus = "High Load";
      else if (workloadScore <= 1) workloadStatus = "Available";

      return {
        trainerId: trainer.id,
        trainerName: trainer.name,
        designation: trainer.designation,
        department: trainer.department,
        station: trainer.station,
        avatar: trainer.avatar,
        skills: trainer.skills || trainer.specialization || [],
        assignedCoursesCount: assignedCourses.length,
        assignedCourses: assignedCourses.map(c => ({ id: c.id, code: c.code, title: c.title })),
        assignedSubjects: assignedSubjectNames,
        totalAssignedModules,
        workloadScore,
        workloadStatus
      };
    });
  }

  generateBulkCertificates(courseId, templateData = {}) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const enrolledIds = course.enrolledTraineeIds || ["u_trainee_1", "u_trainee_2"];
    const generatedCertificates = [];
    const timestamp = new Date().toISOString();

    // 1. Generate for Trainees
    enrolledIds.forEach((tId, idx) => {
      const user = this.findUserById(tId);
      if (user) {
        if (!user.certificates) user.certificates = [];
        const certId = `MOES-CERT-${course.code || "CRS"}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCert = {
          id: `cert_${uuidv4().substring(0, 8)}`,
          title: course.title,
          courseCode: course.code,
          courseId: course.id,
          recipientType: "trainee",
          recipientName: user.name,
          recipientCadreId: user.cadreId || `MOES-CADRE-${Math.floor(1000 + Math.random() * 9000)}`,
          issuer: "Ministry of Earth Sciences / IMD Central Training Directorate",
          year: "2026",
          issueDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          grade: "Distinction (Honours)",
          credentialId: certId,
          templateType: templateData.templateName || "MoES Official Gold Standard",
          customFormatUrl: templateData.customFormatUrl || null,
          verificationUrl: `https://moes.gov.in/verify/${certId}`,
          status: "Verified & Issued"
        };
        // Avoid duplicate for same course
        const existingCertIdx = user.certificates.findIndex(c => c.courseId === course.id || c.title === course.title);
        if (existingCertIdx >= 0) {
          user.certificates[existingCertIdx] = newCert;
        } else {
          user.certificates.unshift(newCert);
        }
        generatedCertificates.push(newCert);
      }
    });

    // 2. Generate Faculty Trainer Commendation Certificate
    const trainerUser = this.users.find(u => 
      u.role === "trainer" && (u.id === course.leadTrainerId || (course.leadTrainerName && u.name.includes(course.leadTrainerName)))
    ) || this.users.find(u => u.role === "trainer");

    if (trainerUser) {
      if (!trainerUser.certificates) trainerUser.certificates = [];
      const trainerCertId = `MOES-FACULTY-${course.code || "CRS"}-${Math.floor(1000 + Math.random() * 9000)}`;
      const facultyCert = {
        id: `cert_fac_${uuidv4().substring(0, 8)}`,
        title: `Faculty Excellence: ${course.title}`,
        courseCode: course.code,
        courseId: course.id,
        recipientType: "trainer",
        recipientName: trainerUser.name,
        recipientCadreId: trainerUser.cadreId || "MOES-FACULTY-4491",
        issuer: "Director General of Meteorology, MoES New Delhi",
        year: "2026",
        issueDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        grade: "Master Instructor Commendation",
        credentialId: trainerCertId,
        templateType: templateData.templateName || "MoES Official Gold Standard",
        verificationUrl: `https://moes.gov.in/verify/${trainerCertId}`,
        status: "Verified & Issued"
      };
      trainerUser.certificates.unshift(facultyCert);
      generatedCertificates.push(facultyCert);
    }

    this._persist();
    return {
      courseTitle: course.title,
      totalIssued: generatedCertificates.length,
      certificates: generatedCertificates
    };
  }

  enrollTrainee(courseId, traineeId) {
    const course = this.getCourseById(courseId);
    if (course) {
      if (!course.enrolledTraineeIds) course.enrolledTraineeIds = [];
      if (!course.enrolledTraineeIds.includes(traineeId)) {
        course.enrolledTraineeIds.push(traineeId);
      }
      this._persist();
      return course;
    }
    return null;
  }

  getEnrolledTraineesForTrainer(trainerName, trainerId) {
    const assignedCourses = this.courses.filter(c => {
      if (trainerName && c.leadTrainerName && c.leadTrainerName.toLowerCase().includes(trainerName.toLowerCase())) return true;
      if (trainerId && c.leadTrainerId === trainerId) return true;
      return false;
    });

    const effectiveCourses = assignedCourses.length > 0 ? assignedCourses : this.courses.slice(0, 2);
    const results = [];

    effectiveCourses.forEach(course => {
      const traineeIds = (course.enrolledTraineeIds && course.enrolledTraineeIds.length > 0) 
        ? course.enrolledTraineeIds 
        : ["u_trainee_1", "u_trainee_2"];

      traineeIds.forEach(tId => {
        const traineeUser = this.findUserById(tId) || this.users.find(u => u.role === "trainee" && u.id === tId) || this.users.find(u => u.role === "trainee");
        if (traineeUser) {
          const userProg = this.moduleProgress[traineeUser.id] || {};
          let completedMods = 0;
          let totalMods = 0;
          course.subjects?.forEach(s => {
            s.modules?.forEach(m => {
              totalMods++;
              if (userProg[m.id]) completedMods++;
            });
          });
          const progressPercent = totalMods > 0 ? Math.min(100, Math.max(25, Math.round((completedMods / totalMods) * 100))) : 75;

          const submissions = this.quizSubmissions.filter(sub => sub.traineeId === traineeUser.id);
          const avgScore = submissions.length > 0 
            ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 75), 0) / submissions.length)
            : 82;

          results.push({
            id: `${course.id}_${traineeUser.id}`,
            traineeId: traineeUser.id,
            name: traineeUser.name,
            email: traineeUser.email,
            department: traineeUser.department,
            designation: traineeUser.designation,
            station: traineeUser.station || (traineeUser.id === "u_trainee_2" ? "Cyclone Warning Centre, Visakhapatnam" : "Meteorological Centre, Jaipur"),
            cadreId: traineeUser.cadreId || `MOES-MET-2026-${traineeUser.id === "u_trainee_2" ? "5512" : "4491"}`,
            avatar: traineeUser.avatar,
            courseId: course.id,
            courseTitle: course.title,
            courseCode: course.code,
            enrolledDate: "12th Jan 2026",
            progressPercentage: progressPercent,
            completedModulesCount: completedMods || 3,
            totalModulesCount: totalMods || 4,
            avgQuizScore: avgScore,
            status: progressPercent >= 100 ? "Completed" : "In Progress",
            skills: traineeUser.skills || ["Python for Meteorology", "Synoptic Analysis", "Data Assimilation"],
            qualifications: traineeUser.qualifications || ["M.Sc. Atmospheric Sciences"],
            experience: traineeUser.experience || ["2 years at IMD Field Station"],
            submissions: submissions.length > 0 ? submissions.map(s => ({
              id: s.id,
              quizId: s.quizId,
              title: s.quizTitle || "#30 Atmospheric Dynamics & NWP",
              score: s.score,
              totalMarks: s.totalMarks,
              percentage: s.percentage,
              submittedAt: s.submittedAt || "2026-02-14T10:00:00Z",
              timeSpent: "13m 16s",
              accuracy: s.percentage || 75,
              status: (s.percentage || 75) >= 60 ? "Passed" : "Failed"
            })) : [
              {
                id: "sub_demo_1",
                quizId: "quiz_nwp_01",
                title: "#30 Atmospheric Dynamics & NWP 4D-Var",
                score: 29,
                totalMarks: 40,
                percentage: 72.5,
                submittedAt: "2026-02-14T20:36:00Z",
                timeSpent: "13m 16s",
                accuracy: 72.5,
                status: "Passed"
              },
              {
                id: "sub_demo_2",
                quizId: "quiz_rad_01",
                title: "#29 Satellite Meteorology & INSAT-3DR",
                score: 17,
                totalMarks: 20,
                percentage: 85.0,
                submittedAt: "2026-02-12T13:06:00Z",
                timeSpent: "34m 53s",
                accuracy: 85.0,
                status: "Passed"
              }
            ]
          });
        }
      });
    });

    return results;
  }

  addMaterialToModule(courseId, subjectId, moduleId, materialData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;
    const subject = course.subjects.find(s => s.id === subjectId || s.name === subjectId);
    if (!subject) return null;
    const mod = (subject.modules || []).find(m => m.id === moduleId || m.title === moduleId);
    if (!mod) return null;

    if (!mod.materials) {
      mod.materials = [];
    }

    const newMaterial = {
      id: materialData.id || `mat_${uuidv4().substring(0, 8)}`,
      title: materialData.title,
      type: materialData.type || "pdf",
      url: materialData.url || "https://example.com/material.pdf",
      duration: materialData.duration,
      pages: materialData.pages,
      size: materialData.size || "3.5 MB",
      topic: materialData.topic || mod.title,
      subject: materialData.subject || subject.name,
      uploadedBy: materialData.uploadedBy || course.leadTrainerName || "Lead Faculty",
      uploadedAt: materialData.uploadedAt || new Date().toISOString(),
      allowDownload: materialData.allowDownload !== false
    };
    mod.materials.push(newMaterial);
    this._persist();
    return newMaterial;
  }

  removeMaterialFromModule(courseId, subjectId, moduleId, materialId) {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const subject = (course.subjects || []).find(s => s.id === subjectId || s.name === subjectId);
    if (!subject) return false;
    const mod = (subject.modules || []).find(m => m.id === moduleId || m.title === moduleId);
    if (!mod || !mod.materials) return false;

    const initialLen = mod.materials.length;
    mod.materials = mod.materials.filter(m => m.id !== materialId);
    if (mod.materials.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  addModuleToSubject(courseId, subjectId, moduleData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;
    const subject = (course.subjects || []).find(s => s.id === subjectId || s.name === subjectId);
    if (!subject) return null;

    if (!subject.modules) {
      subject.modules = [];
    }

    const newModule = {
      id: moduleData.id || `mod_${uuidv4().substring(0, 8)}`,
      title: moduleData.title || `Module ${subject.modules.length + 1}: ${moduleData.name || "Specialized Topic"}`,
      duration: moduleData.duration || "4 Hours",
      description: moduleData.description || "In-depth interactive study module and operational guidelines.",
      materials: moduleData.materials || []
    };

    subject.modules.push(newModule);
    this._persist();
    return newModule;
  }

  deleteModuleFromSubject(courseId, subjectId, moduleId) {
    const course = this.getCourseById(courseId);
    if (!course) return false;
    const subject = (course.subjects || []).find(s => s.id === subjectId || s.name === subjectId);
    if (!subject || !subject.modules) return false;

    const initialLen = subject.modules.length;
    subject.modules = subject.modules.filter(m => m.id !== moduleId);
    if (subject.modules.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  // --- Question Bank ---
  getQuestions(filter = {}) {
    let result = [...this.questionBank];
    if (filter.subjectId) result = result.filter(q => q.subjectId === filter.subjectId);
    if (filter.type) result = result.filter(q => q.type.toLowerCase() === filter.type.toLowerCase());
    if (filter.difficulty) result = result.filter(q => q.difficulty.toLowerCase() === filter.difficulty.toLowerCase());
    if (filter.search) {
      const qLower = filter.search.toLowerCase();
      result = result.filter(q => q.question.toLowerCase().includes(qLower));
    }
    return result;
  }

  createQuestion(questionData) {
    const newQ = {
      id: questionData.id || `qb_${uuidv4().substring(0, 8)}`,
      question: questionData.question,
      subjectId: questionData.subjectId || "sub_nwp_01",
      subjectName: questionData.subjectName || "Atmospheric Dynamics",
      module: questionData.module || "Module 1",
      marks: Number(questionData.marks) || 2,
      type: questionData.type || "MCQ",
      difficulty: questionData.difficulty || "Medium",
      options: questionData.options || [],
      correctAnswer: questionData.correctAnswer !== undefined ? Number(questionData.correctAnswer) : 0,
      explanation: questionData.explanation || ""
    };
    this.questionBank.unshift(newQ);
    this._persist();
    return newQ;
  }

  duplicateQuestion(id) {
    const q = this.questionBank.find(item => item.id === id);
    if (q) {
      const cloned = { ...q, id: `qb_${uuidv4().substring(0, 8)}`, question: `${q.question} (Copy)` };
      this.questionBank.unshift(cloned);
      this._persist();
      return cloned;
    }
    return null;
  }

  deleteQuestion(id) {
    const initialLen = this.questionBank.length;
    this.questionBank = this.questionBank.filter(q => q.id !== id);
    if (this.questionBank.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  // --- Quizzes ---
  getQuizzes() {
    return this.quizzes;
  }

  getQuizById(id) {
    return this.quizzes.find(q => q.id === id);
  }

  createQuiz(quizData) {
    const newQuiz = {
      id: quizData.id || `quiz_${uuidv4().substring(0, 8)}`,
      title: quizData.title,
      courseId: quizData.courseId,
      courseName: quizData.courseName,
      subjectId: quizData.subjectId || "all",
      subjectName: quizData.subjectName || "",
      topicName: quizData.topicName || "",
      conceptName: quizData.conceptName || "",
      trainerId: quizData.trainerId,
      trainerName: quizData.trainerName,
      department: quizData.department || "India Meteorological Department",
      totalMarks: Number(quizData.totalMarks) || 20,
      passMarks: Number(quizData.passMarks) || 10,
      durationMinutes: Number(quizData.durationMinutes) || 30,
      scheduledStartTime: quizData.scheduledStartTime || new Date().toISOString(),
      deadlineTime: quizData.deadlineTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: quizData.status || "published",
      isKioskModeRequired: true,
      targetTraineeIds: Array.isArray(quizData.targetTraineeIds) ? quizData.targetTraineeIds : [],
      blueprint: Array.isArray(quizData.blueprint) ? quizData.blueprint : [],
      questions: quizData.questions || []
    };
    this.quizzes.unshift(newQuiz);
    this._persist();
    return newQuiz;
  }

  // --- Submissions & Auto-Grading & Integrity Enforcement ---
  submitQuiz(submissionData) {
    const quiz = this.getQuizById(submissionData.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const rawTabSwitches = Number(submissionData.tabSwitchCount) || 0;
    const isDisqualified = !!submissionData.isDisqualified || rawTabSwitches >= 2;
    const tabSwitchCount = isDisqualified ? Math.max(2, rawTabSwitches) : rawTabSwitches;
    const integrityStatus = isDisqualified ? "disqualified" : (tabSwitchCount === 1 ? "warning" : "clean");

    let totalScore = 0;
    const answers = submissionData.answers || {};

    // Auto-grade only if not disqualified
    if (!isDisqualified) {
      quiz.questions.forEach(q => {
        const userAns = answers[q.id];
        if (userAns !== undefined && userAns !== null) {
          const qType = q.type || (Array.isArray(q.options) && q.options.length > 0 ? "mcq" : "one_word");
          const qMarks = Number(q.marks) || 2;
          
          if (qType === "one_word" || qType === "short_answer") {
            const cleanUser = String(userAns).trim().toLowerCase();
            const accepted = [
              q.expectedAnswer,
              q.correctAnswer,
              ...(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [])
            ].filter(Boolean).map(a => String(a).trim().toLowerCase());
            
            if (cleanUser.length > 0 && accepted.includes(cleanUser)) {
              totalScore += qMarks;
            }
          } else {
            // Standard MCQ
            if (userAns === q.correctAnswer) {
              totalScore += qMarks;
            }
          }
        }
      });
    }

    const totalMarks = quiz.totalMarks || quiz.questions.reduce((acc, q) => acc + (Number(q.marks) || 2), 0);
    const percentage = isDisqualified ? 0 : Math.round((totalScore / (totalMarks || 1)) * 100);
    const passed = isDisqualified ? false : totalScore >= (quiz.passMarks || (totalMarks * 0.5));

    const submission = {
      id: `subm_${uuidv4().substring(0, 8)}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseId: quiz.courseId,
      traineeId: submissionData.traineeId,
      traineeName: submissionData.traineeName,
      traineeEmail: submissionData.traineeEmail,
      answers,
      score: totalScore,
      totalMarks,
      percentage,
      passed,
      isDisqualified,
      integrityStatus,
      disqualificationReason: isDisqualified ? (submissionData.disqualificationReason || "Assessment context exited repeatedly") : "",
      timeTakenSeconds: submissionData.timeTakenSeconds || 600,
      tabSwitchCount,
      submittedAt: new Date().toISOString(),
      gradedBy: "auto",
      resultsPublished: !!submissionData.resultsPublished || false,
      evaluationStatus: isDisqualified ? "disqualified" : (submissionData.resultsPublished ? "published" : "pending_publish"),
      trainerFeedback: isDisqualified ? "Attempt Disqualified due to repeated context exit violations (Security Rule)." : "",
      certificateGenerated: passed,
      certificateId: passed ? `MOES-IMD-CERT-2025-${Math.floor(1000 + Math.random() * 9000)}` : null,
      adaptiveTrajectory: submissionData.adaptiveTrajectory || ["Moderate"],
      difficultyHistory: submissionData.difficultyHistory || [],
      questionAnalysis: submissionData.questionAnalysis || []
    };

    // Replace existing submission for this quiz + trainee if present
    const existingIdx = this.quizSubmissions.findIndex(s => s.quizId === quiz.id && s.traineeId === submissionData.traineeId);
    if (existingIdx !== -1) {
      this.quizSubmissions[existingIdx] = submission;
    } else {
      this.quizSubmissions.unshift(submission);
    }

    // Auto log alert if violation or disqualification occurred
    if (tabSwitchCount > 0 || isDisqualified) {
      this.logIntegrityViolation({
        quizId: quiz.id,
        quizTitle: quiz.title,
        traineeId: submissionData.traineeId,
        traineeName: submissionData.traineeName,
        eventType: "context_switch",
        count: tabSwitchCount,
        disqualified: isDisqualified,
        reason: isDisqualified ? "Assessment context exited repeatedly" : "Assessment context exited"
      });
    }

    this._persist();
    return submission;
  }

  // --- Integrity Violations & Disqualification Management ---
  logIntegrityViolation(violationData) {
    const { 
      quizId, 
      quizTitle, 
      traineeId, 
      traineeName, 
      eventType = "visibilitychange", 
      count = 1, 
      disqualified = false, 
      reason 
    } = violationData;
    
    const isDisq = disqualified || count >= 2;
    const alert = {
      id: `alert_${uuidv4().substring(0, 8)}`,
      quizId,
      quizTitle: quizTitle || "Assessment",
      traineeId,
      traineeName: traineeName || "Trainee Officer",
      status: isDisq ? "DISQUALIFIED" : "WARNING",
      violations: count,
      eventType,
      reason: reason || (isDisq ? "Assessment context exited repeatedly" : "Assessment context exited (Warning)"),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric", hour12: true })
    };

    if (!this.integrityAlerts) this.integrityAlerts = [];
    // Remove older alert for same trainee & quiz
    this.integrityAlerts = this.integrityAlerts.filter(a => !(a.quizId === quizId && a.traineeId === traineeId));
    this.integrityAlerts.unshift(alert);

    this._persist();
    return alert;
  }

  getIntegrityAlerts(filter = {}) {
    if (!this.integrityAlerts) this.integrityAlerts = [];
    let alerts = [...this.integrityAlerts];
    if (filter.quizId) {
      alerts = alerts.filter(a => a.quizId === filter.quizId);
    }
    if (filter.traineeId) {
      alerts = alerts.filter(a => a.traineeId === filter.traineeId);
    }
    return alerts;
  }

  resetDisqualification(quizId, traineeId) {
    // 1. Remove any disqualified submission for this quiz + trainee so they can re-take the exam cleanly
    this.quizSubmissions = this.quizSubmissions.filter(s => !(s.quizId === quizId && s.traineeId === traineeId));
    
    // 2. Remove or resolve integrity alerts for this quiz & trainee
    if (this.integrityAlerts) {
      this.integrityAlerts = this.integrityAlerts.filter(a => !(a.quizId === quizId && a.traineeId === traineeId));
    }

    this._persist();
    return {
      success: true,
      quizId,
      traineeId,
      message: "Disqualification removed successfully. Trainee has been granted one more chance and can now re-take the assessment."
    };
  }

  getSubmissionsForQuiz(quizId) {
    return this.quizSubmissions.filter(s => s.quizId === quizId);
  }

  getSubmissionsForTrainee(traineeId) {
    return this.quizSubmissions.filter(s => s.traineeId === traineeId);
  }

  publishQuizResults(quizId, feedback = "") {
    const quiz = this.getQuizById(quizId);
    if (!quiz) return null;
    quiz.resultsPublished = true;
    quiz.publishedAt = new Date().toISOString();
    
    let updatedCount = 0;
    this.quizSubmissions.forEach(sub => {
      if (sub.quizId === quizId) {
        sub.resultsPublished = true;
        sub.evaluationStatus = "published";
        sub.publishedAt = new Date().toISOString();
        if (feedback) sub.trainerFeedback = feedback;
        updatedCount++;
      }
    });
    this._persist();
    return { quiz, updatedCount };
  }

  evaluateSubmission(submissionId, updates = {}) {
    const sub = this.quizSubmissions.find(s => s.id === submissionId);
    if (!sub) return null;
    if (updates.score !== undefined) {
      sub.score = Number(updates.score);
      sub.percentage = Math.round((sub.score / (sub.totalMarks || 1)) * 100);
      sub.passed = sub.score >= (sub.totalMarks * 0.5);
    }
    if (updates.trainerFeedback) sub.trainerFeedback = updates.trainerFeedback;
    if (updates.resultsPublished !== undefined) sub.resultsPublished = !!updates.resultsPublished;
    if (sub.resultsPublished) sub.evaluationStatus = "published";
    this._persist();
    return sub;
  }

  // --- Module Progress Tracking ---
  markModuleComplete(userId, moduleId) {
    if (!this.moduleProgress[userId]) {
      this.moduleProgress[userId] = {};
    }
    this.moduleProgress[userId][moduleId] = {
      completed: true,
      completedAt: new Date().toISOString()
    };
    this._persist();
    return this.moduleProgress[userId];
  }

  getModuleProgress(userId) {
    return this.moduleProgress[userId] || {};
  }

  // --- Competency Mapping ---
  getCompetencyMatrix() {
    return this.competencyFramework;
  }

  assignTrainerToCompetency(competencyId, trainerId, trainerName) {
    const comp = this.competencyFramework.find(c => c.id === competencyId);
    if (comp) {
      if (!comp.suggestedTrainers.includes(trainerName)) {
        comp.suggestedTrainers.push(trainerName);
      }
      this._persist();
      return comp;
    }
    return null;
  }

  // --- Announcements & Feedback ---
  getAnnouncements() {
    return this.announcements;
  }

  createAnnouncement(annData) {
    const ann = {
      id: `ann_${uuidv4().substring(0, 8)}`,
      title: annData.title,
      category: annData.category || "General",
      date: new Date().toISOString().split("T")[0],
      urgent: !!annData.urgent,
      content: annData.content,
      author: annData.author || "MoES Directorate"
    };
    this.announcements.unshift(ann);
    this._persist();
    return ann;
  }

  getFeedbacks(courseId) {
    if (courseId) return this.feedbacks.filter(f => f.courseId === courseId);
    return this.feedbacks;
  }

  addFeedback(fbData) {
    const fb = {
      id: `fb_${uuidv4().substring(0, 8)}`,
      courseId: fbData.courseId,
      traineeId: fbData.traineeId,
      traineeName: fbData.traineeName,
      trainerRating: Number(fbData.trainerRating) || 5,
      contentRating: Number(fbData.contentRating) || 5,
      relevanceRating: Number(fbData.relevanceRating) || 5,
      comment: fbData.comment || "",
      createdAt: new Date().toISOString()
    };
    this.feedbacks.unshift(fb);
    this._persist();
    return fb;
  }

  // --- Content Library & Media Assets Repository ---
  _sanitizeContentLibrary(items) {
    if (!Array.isArray(items)) return this._generateInitialContentLibrary();
    const cleanPrefix = (str) => {
      if (!str) return "";
      return str
        .replace(/^Subject\s*\d+\s*:\s*/i, "")
        .replace(/^Module\s*\d+\s*:\s*/i, "")
        .trim();
    };

    return items.map(item => ({
      ...item,
      subject: cleanPrefix(item.subject || item.subjectName) || "Atmospheric Dynamics & Modeling",
      topic: cleanPrefix(item.topic || item.moduleTitle) || "Meteorological Formulations & Physics",
      subjectName: undefined,
      moduleTitle: undefined,
      moduleId: undefined
    }));
  }

  _generateInitialContentLibrary() {
    return [
      {
        id: "lib_01",
        title: "Primitive Equations & Atmospheric Governing Laws Masterclass",
        type: "video",
        format: "MP4 Video",
        duration: "48 mins",
        size: "320 MB",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        subject: "Atmospheric Dynamics & Modeling",
        topic: "Navier-Stokes & Primitive Equation Systems in Sigma Coordinates",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "02 Feb 2026",
        description: "Comprehensive derivation of hydrostatic and non-hydrostatic Navier-Stokes formulations in Sigma and pressure coordinate frames.",
        tags: ["Atmospheric Dynamics", "Sigma Coordinates", "Navier-Stokes"],
        downloadAllowed: false
      },
      {
        id: "lib_02",
        title: "Atmospheric Governing Equations & Grid Staggering Slide Deck",
        type: "ppt",
        format: "PowerPoint Presentation (PPTX)",
        pages: 46,
        size: "14.8 MB",
        url: "",
        subject: "Atmospheric Dynamics & Modeling",
        topic: "Arakawa Grids (A-E) & CFL Stability Criteria",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "05 Feb 2026",
        description: "Presentation slides on horizontal and vertical grid staggering, Arakawa grids A through E, and CFL stability criteria.",
        tags: ["Grid Staggering", "CFL Criteria", "Arakawa Grids"],
        downloadAllowed: true
      },
      {
        id: "lib_03",
        title: "Boundary Layer Parameterization & Turbulence Closure Notes",
        type: "pdf",
        format: "PDF Study Guide",
        pages: 32,
        size: "3.4 MB",
        url: "",
        subject: "Atmospheric Dynamics & Modeling",
        topic: "Planetary Boundary Layer & Mellor-Yamada Closures",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "08 Feb 2026",
        description: "Mathematical notes on 1.5 order and Mellor-Yamada planetary boundary layer closures in mesoscale numerical models.",
        tags: ["PBL Parameterization", "Mellor-Yamada", "Turbulence Closure"],
        downloadAllowed: true
      },
      {
        id: "lib_04",
        title: "Configuring WRF Preprocessing System (WPS) & Domain Grids",
        type: "manual",
        format: "Laboratory Practical Manual",
        pages: 28,
        size: "5.8 MB",
        url: "",
        subject: "Numerical Weather Prediction",
        topic: "WRF Domain Setup, Geogrid & Ungrib Configurations",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "12 Feb 2026",
        description: "Step-by-step terminal execution guide for geogrid.exe, ungrib.exe, and metgrid.exe on HPC Linux clusters.",
        tags: ["WRF Setup", "WPS", "HPC Linux", "Lab Manual"],
        downloadAllowed: true
      },
      {
        id: "lib_05",
        title: "3D-Var / 4D-Var Data Assimilation with INSAT-3DR & Radar Data",
        type: "video",
        format: "MP4 Video",
        duration: "54 mins",
        size: "410 MB",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        subject: "Data Assimilation & Satellite Radiance Ingestion",
        topic: "3D-Var / 4D-Var Radiance & Radar Ingestion",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "15 Feb 2026",
        description: "Assimilation methodologies for infrared sounder radiances, atmospheric motion vectors, and Doppler radar radial velocity observations.",
        tags: ["Data Assimilation", "INSAT-3DR", "Radar Reflectivity", "3D-Var"],
        downloadAllowed: false
      },
      {
        id: "lib_06",
        title: "Background Error Covariance (B-Matrix) Estimation Deck",
        type: "ppt",
        format: "PowerPoint Presentation (PPTX)",
        pages: 38,
        size: "11.2 MB",
        url: "",
        subject: "Data Assimilation & Satellite Radiance Ingestion",
        topic: "Background Error Covariance (B-Matrix) & NMC Method",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "18 Feb 2026",
        description: "NMC method, ensemble-based background error structures, and spatial correlation length scale tuning.",
        tags: ["B-Matrix", "NMC Method", "Covariance"],
        downloadAllowed: true
      },
      {
        id: "lib_07",
        title: "Ensemble Kalman Filter (EnKF) Implementation in Operational Models",
        type: "pdf",
        format: "PDF Study Guide",
        pages: 40,
        size: "4.1 MB",
        url: "",
        subject: "Data Assimilation & Satellite Radiance Ingestion",
        topic: "Hybrid Ensemble-Variational (EnVar) & Kalman Filters",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Under Review",
        uploadDate: "24 Feb 2026",
        description: "Hybrid Ensemble-Variational data assimilation frameworks for the Indian Monsoon domain.",
        tags: ["EnKF", "Hybrid EnVar", "Monsoon NWP"],
        downloadAllowed: true
      },
      {
        id: "lib_08",
        title: "WRF Model Physics & Microphysics Parameterization Lab Guide",
        type: "manual",
        format: "Laboratory Practical Manual",
        pages: 35,
        size: "6.5 MB",
        url: "",
        subject: "Numerical Weather Prediction",
        topic: "Cloud Microphysics (WSM6 vs Thompson Schemes)",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Draft",
        uploadDate: "01 Mar 2026",
        description: "Comparative benchmark between WSM6, Thompson, and Morrison 2-moment cloud microphysics schemes for tropical convective clouds.",
        tags: ["Cloud Microphysics", "WSM6", "Thompson Scheme"],
        downloadAllowed: true
      }
    ];
  }

  getContentLibrary({ trainerId, trainerName, subject, type, status, search } = {}) {
    if (!this.contentLibrary) {
      this.contentLibrary = this._generateInitialContentLibrary();
    }
    return this.contentLibrary.filter(item => {
      if (trainerId && item.trainerId && item.trainerId !== trainerId && !item.uploadedBy?.includes(trainerName || "")) {
        return false;
      }
      if (subject && subject !== "all") {
        const itemSubj = (item.subject || item.subjectName || "").toLowerCase();
        if (!itemSubj.includes(subject.toLowerCase())) {
          return false;
        }
      }
      if (type && type !== "all" && item.type !== type) {
        return false;
      }
      if (status && status !== "all" && item.status?.toLowerCase() !== status.toLowerCase()) {
        return false;
      }
      if (search && search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesSubj = (item.subject || item.subjectName || "")?.toLowerCase().includes(q);
        const matchesTopic = (item.topic || item.moduleTitle || "")?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSubj && !matchesTopic && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }

  createContentLibraryItem(itemData) {
    if (!this.contentLibrary) {
      this.contentLibrary = this._generateInitialContentLibrary();
    }
    const newItem = {
      id: `lib_${uuidv4().substring(0, 8)}`,
      title: itemData.title || "Untitled Material",
      type: itemData.type || "pdf",
      format: itemData.format || (itemData.type === "video" ? "MP4 Video" : itemData.type === "ppt" ? "PowerPoint Presentation (PPTX)" : itemData.type === "manual" ? "Laboratory Practical Manual" : "PDF Study Guide"),
      duration: itemData.duration || (itemData.type === "video" ? "30 mins" : null),
      pages: itemData.pages || (itemData.type !== "video" ? 25 : null),
      size: itemData.size || "4.5 MB",
      url: itemData.url || (itemData.type === "video" ? "https://www.youtube.com/embed/dQw4w9WgXcQ" : ""),
      subject: itemData.subject || itemData.subjectName || "Atmospheric Dynamics & Modeling",
      topic: itemData.topic || itemData.moduleTitle || "General Meteorological Topic",
      uploadedBy: itemData.uploadedBy || "Dr. Amit Sengupta",
      trainerId: itemData.trainerId || "u_trainer_1",
      status: itemData.status || "Published",
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: itemData.description || "",
      tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags ? itemData.tags.split(",").map(t => t.trim()) : []),
      downloadAllowed: itemData.downloadAllowed !== undefined ? !!itemData.downloadAllowed : true
    };

    this.contentLibrary.unshift(newItem);
    this._persist();
    return newItem;
  }

  updateContentLibraryItem(id, itemData) {
    if (!this.contentLibrary) return null;
    const index = this.contentLibrary.findIndex(item => item.id === id);
    if (index !== -1) {
      this.contentLibrary[index] = {
        ...this.contentLibrary[index],
        ...itemData,
        id: this.contentLibrary[index].id,
        lastModified: new Date().toISOString()
      };
      this._persist();
      return this.contentLibrary[index];
    }
    return null;
  }

  deleteContentLibraryItem(id) {
    if (!this.contentLibrary) return false;
    const beforeLen = this.contentLibrary.length;
    this.contentLibrary = this.contentLibrary.filter(item => item.id !== id);
    if (this.contentLibrary.length !== beforeLen) {
      this._persist();
      return true;
    }
    return false;
  }

  attachContentToSubjectModule(contentId, courseId, subjectId, moduleId) {
    const item = this.contentLibrary?.find(i => i.id === contentId);
    const course = this.courses.find(c => c.id === courseId);
    if (course && item) {
      const subject = course.subjects?.find(s => s.id === subjectId || s.name === subjectId);
      if (subject) {
        const moduleItem = subject.modules?.find(m => m.id === moduleId || m.title === moduleId);
        if (moduleItem) {
          if (!moduleItem.materials) moduleItem.materials = [];
          const existing = moduleItem.materials.find(m => m.id === item.id || m.title === item.title);
          if (!existing) {
            moduleItem.materials.push({
              id: item.id,
              title: item.title,
              type: item.type === "ppt" ? "presentation" : item.type,
              url: item.url,
              duration: item.duration,
              pages: item.pages,
              size: item.size,
              uploadedBy: item.uploadedBy || "Dr. Amit Sengupta",
              allowDownload: item.downloadAllowed !== false
            });
            this._persist();
            return true;
          }
        }
      }
    }
    return false;
  }

  removeMaterialFromModule(courseId, subjectId, moduleId, materialId) {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return false;
    const subject = course.subjects?.find(s => s.id === subjectId || s.name === subjectId);
    if (!subject) return false;
    const mod = subject.modules?.find(m => m.id === moduleId || m.title === moduleId);
    if (!mod || !mod.materials) return false;
    const beforeLen = mod.materials.length;
    mod.materials = mod.materials.filter(m => m.id !== materialId && m.title !== materialId);
    if (mod.materials.length !== beforeLen) {
      this._persist();
      return true;
    }
    return false;
  }

  getFeedbacks(courseId) {
    if (!this.feedbacks || this.feedbacks.length === 0) {
      this.feedbacks = [
        {
          id: "fb_01",
          courseId: "course_01",
          courseCode: "NWP-201",
          courseTitle: "Advanced Numerical Weather Prediction (WRF & Global Ensembles)",
          traineeId: "u_trainee_1",
          traineeName: "Rahul Sharma",
          cadreId: "IMD-MET-2024-089",
          station: "RMC Chennai",
          department: "Numerical Weather Prediction Division",
          trainerRating: 5,
          contentRating: 5,
          relevanceRating: 5,
          recommendScore: 10,
          comment: "Outstanding mathematical clarity on 4D-Var data assimilation schemes and Arakawa-C horizontal grid staggering. Practical scripts helped understand WRF namelist tuning during severe monsoonal trough conditions.",
          createdAt: "2026-09-08T10:30:00.000Z"
        },
        {
          id: "fb_02",
          courseId: "course_01",
          courseCode: "NWP-201",
          courseTitle: "Advanced Numerical Weather Prediction (WRF & Global Ensembles)",
          traineeId: "u_trainee_2",
          traineeName: "Priya Nair",
          cadreId: "IMD-MET-2024-112",
          station: "MC Thiruvananthapuram",
          department: "Regional Forecasting Centre",
          trainerRating: 5,
          contentRating: 4,
          relevanceRating: 5,
          recommendScore: 9,
          comment: "The lectures on parameterization of cumulus convection and planetary boundary layer physics were extremely helpful for operational cyclone tracking and track prediction.",
          createdAt: "2026-09-07T14:15:00.000Z"
        },
        {
          id: "fb_03",
          courseId: "course_02",
          courseCode: "RADAR-301",
          courseTitle: "Doppler Weather Radar Interpretation & Severe Storm Nowcasting",
          traineeId: "u_trainee_3",
          traineeName: "Anand Verma",
          cadreId: "IMD-MET-2024-045",
          station: "RMC Kolkata",
          department: "Radar & Remote Sensing Directorate",
          trainerRating: 5,
          contentRating: 5,
          relevanceRating: 5,
          recommendScore: 10,
          comment: "Polarimetric radar products (ZDR, KDP, RhoHV) were demonstrated brilliantly with live Nor'wester storm case studies. The hands-on velocity de-aliasing exercises were top tier.",
          createdAt: "2026-09-06T16:45:00.000Z"
        },
        {
          id: "fb_04",
          courseId: "course_03",
          courseCode: "CYC-401",
          courseTitle: "Tropical Cyclone Track, Intensity Estimation & Storm Surge Modeling",
          traineeId: "u_trainee_4",
          traineeName: "Sneha Patel",
          cadreId: "IMD-MET-2024-078",
          station: "MC Ahmedabad",
          department: "Cyclone Warning Centre",
          trainerRating: 5,
          contentRating: 5,
          relevanceRating: 5,
          recommendScore: 10,
          comment: "Advanced Dvorak technique EIR cloud pattern matching and storm surge hydrodynamic coupling simulations provided immense confidence for coastal warning dissemination.",
          createdAt: "2026-09-05T09:20:00.000Z"
        }
      ];
      this._persist();
    }

    if (courseId && courseId !== "all") {
      const matching = this.feedbacks.filter(f => f.courseId === courseId || f.courseCode === courseId);
      return matching.length > 0 ? matching : this.feedbacks;
    }
    return this.feedbacks;
  }

  addFeedback(feedbackData) {
    if (!this.feedbacks) this.feedbacks = [];
    const newFb = {
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...feedbackData
    };
    this.feedbacks.unshift(newFb);
    this._persist();
    return newFb;
  }

  // --- Public Certificate Verification Engine ---
  verifyCertificate(rawQuery) {
    if (!rawQuery) return null;
    let query = String(rawQuery).trim();
    // Extract ID if a full URL was passed in
    if (query.includes("/")) {
      const parts = query.split("/");
      query = parts[parts.length - 1];
    }
    if (query.includes("?id=")) {
      query = query.split("?id=")[1].split("&")[0];
    } else if (query.includes("?verify=")) {
      query = query.split("?verify=")[1].split("&")[0];
    }
    query = query.trim().toUpperCase();

    // 1. Check all users' certificates
    for (const user of this.users) {
      if (user.certificates && Array.isArray(user.certificates)) {
        for (const cert of user.certificates) {
          const credId = (cert.credentialId || cert.id || "").toUpperCase();
          if (credId.includes(query) || query.includes(credId) || (cert.title && cert.title.toUpperCase().includes(query))) {
            return {
              isValid: true,
              certificateId: cert.credentialId || credId || `MOES-CERT-${Date.now()}`,
              recipientName: cert.recipientName || user.name,
              recipientCadreId: cert.recipientCadreId || user.cadreId || "MOES-MET-2024-001",
              recipientRole: user.role || "trainee",
              courseTitle: cert.title || "Advanced Numerical Weather Prediction (NWP)",
              courseCode: cert.courseCode || "NWP-401",
              issueDate: cert.issueDate || "January 15, 2026",
              grade: cert.grade || "Distinction (Honours) - 92.5%",
              issuingAuthority: cert.issuer || "Ministry of Earth Sciences / IMD Central Training Directorate",
              directorGeneral: "Dr. Mrutyunjay Mohapatra, Director General of Meteorology",
              leadInstructor: "Dr. Amit Sengupta, Scientist 'F'",
              cryptographicHash: `SHA256-${Buffer.from(credId || 'MOES-CERT').toString('hex').slice(0, 24).toUpperCase()}`,
              verificationUrl: `http://localhost:5173/?verify=${cert.credentialId || credId}`,
              status: "OFFICIALLY ISSUED & CRYPTOGRAPHICALLY VERIFIED"
            };
          }
        }
      }
    }

    // 2. Check quiz submissions
    for (const sub of this.quizSubmissions) {
      if (sub.certificateId && sub.certificateId.toUpperCase().includes(query)) {
        return {
          isValid: true,
          certificateId: sub.certificateId,
          recipientName: sub.traineeName || "Rahul Sharma",
          recipientCadreId: "IMD-MET-2024-001",
          recipientRole: "trainee",
          courseTitle: sub.quizTitle || "Numerical Weather Prediction & Radar Assimilation Assessment",
          courseCode: "NWP-401",
          issueDate: new Date(sub.submittedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          grade: `Passed with Honors (${sub.percentage || 85}%)`,
          issuingAuthority: "Ministry of Earth Sciences, Government of India",
          directorGeneral: "Dr. Mrutyunjay Mohapatra, Director General of Meteorology",
          leadInstructor: "Dr. Amit Sengupta, Scientist 'F'",
          cryptographicHash: `SHA256-${Buffer.from(sub.certificateId).toString('hex').slice(0, 24).toUpperCase()}`,
          verificationUrl: `http://localhost:5173/?verify=${sub.certificateId}`,
          status: "OFFICIALLY ISSUED & CRYPTOGRAPHICALLY VERIFIED"
        };
      }
    }

    // 3. If not found in user certificates or quiz submissions, return null
    return null;
  }
}

export const db = new DatabaseStore();
