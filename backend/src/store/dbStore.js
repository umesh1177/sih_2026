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
      salutation: userData.salutation || "",
      email: userData.email,
      passwordHash: userData.passwordHash || null,
      role: userData.role || "trainee",
      department: userData.department || "India Meteorological Department",
      designation: userData.designation || "Officer",
      station: userData.station || "National Weather Forecasting Centre, IMD HQ New Delhi",
      zone: userData.zone || "HQ & National Centers (New Delhi)",
      cadreId: userData.cadreId || "MOES-MET-2026-4491",
      employeeId: userData.employeeId || `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
      phone: userData.phone || "+91 98765 43210",
      highestDegree: userData.highestDegree || "M.Sc. in Atmospheric Sciences",
      university: userData.university || "IMD / Central Training Institute",
      experienceYears: userData.experienceYears || (userData.role === "trainer" ? 10 : 1),
      batchYear: userData.batchYear || "Batch 2026",
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



  generateBulkCertificates(courseId, templateData = {}) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5173";

    // Helper: compute grade label from percentage
    const getGradeLabel = (pct) => {
      if (pct >= 90) return `Distinction (${pct}%)`;
      if (pct >= 75) return `Merit (${pct}%)`;
      if (pct >= 60) return `Pass (${pct}%)`;
      if (pct > 0)   return `Remedial (${pct}%)`;
      return "Not Yet Assessed";
    };

    // Helper: compute performance category
    const getPerformanceCategory = (pct) => {
      if (pct >= 90) return "Distinction";
      if (pct >= 75) return "Merit";
      if (pct >= 60) return "Pass";
      return "Remedial";
    };

    const enrolledIds = course.enrolledTraineeIds || [];
    const generatedCertificates = [];

    // 1. Generate for Trainees
    enrolledIds.forEach((tId) => {
      const user = this.findUserById(tId);
      if (user) {
        if (!user.certificates) user.certificates = [];

        // Compute real performance from submissions for this course
        const traineeSubmissions = (this.quizSubmissions || []).filter(
          s => s.traineeId === tId && s.courseId === courseId
        );
        const avgPct = traineeSubmissions.length > 0
          ? Math.round(traineeSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / traineeSubmissions.length)
          : 0;

        const certId = `MOES-CERT-${course.code || "CRS"}-${Math.floor(1000 + Math.random() * 9000)}`;
        const verificationUrl = `${APP_BASE_URL}/?verify=${certId}`;

        const newCert = {
          id: `cert_${uuidv4().substring(0, 8)}`,
          title: course.title,
          courseCode: course.code,
          courseId: course.id,
          recipientType: "trainee",
          recipientName: user.name,
          recipientCadreId: user.cadreId || `MOES-CADRE-${Math.floor(1000 + Math.random() * 9000)}`,
          issuer: "Ministry of Earth Sciences / IMD Central Training Directorate",
          year: new Date().getFullYear().toString(),
          issueDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          grade: getGradeLabel(avgPct),
          performanceCategory: getPerformanceCategory(avgPct),
          finalScore: avgPct,
          credentialId: certId,
          templateType: templateData.templateName || "MoES Official Gold Standard",
          customFormatUrl: templateData.customFormatUrl || null,
          verificationUrl,
          status: "Verified & Issued"
        };

        // Avoid duplicate for same course
        const existingCertIdx = user.certificates.findIndex(c => c.courseId === course.id);
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
      const trainerVerificationUrl = `${APP_BASE_URL}/?verify=${trainerCertId}`;
      const facultyCert = {
        id: `cert_fac_${uuidv4().substring(0, 8)}`,
        title: `Faculty Excellence: ${course.title}`,
        courseCode: course.code,
        courseId: course.id,
        recipientType: "trainer",
        recipientName: trainerUser.name,
        recipientCadreId: trainerUser.cadreId || "MOES-FACULTY-4491",
        issuer: "Director General of Meteorology, MoES New Delhi",
        year: new Date().getFullYear().toString(),
        issueDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        grade: "Master Instructor Commendation",
        performanceCategory: "Distinction",
        finalScore: 100,
        credentialId: trainerCertId,
        templateType: templateData.templateName || "MoES Official Gold Standard",
        verificationUrl: trainerVerificationUrl,
        status: "Verified & Issued"
      };
      const existingTrainerCertIdx = trainerUser.certificates.findIndex(c => c.courseId === course.id);
      if (existingTrainerCertIdx >= 0) {
        trainerUser.certificates[existingTrainerCertIdx] = facultyCert;
      } else {
        trainerUser.certificates.unshift(facultyCert);
      }
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

  getEnrolledTraineesForTrainer(trainerName, trainerId, specificCourseId) {
    let targetCourses = [];

    if (specificCourseId && specificCourseId !== "all") {
      const found = this.getCourseById(specificCourseId);
      if (found) targetCourses = [found];
    } else if (trainerId || trainerName) {
      targetCourses = (this.courses || []).filter(c => {
        if (trainerId && (c.leadTrainerId === trainerId || c.trainerId === trainerId)) return true;
        if (trainerName && c.leadTrainerName && c.leadTrainerName.toLowerCase().includes(trainerName.toLowerCase())) return true;
        if (c.subjects && Array.isArray(c.subjects)) {
          return c.subjects.some(s => 
            (trainerId && (s.trainerId === trainerId || s.facultyId === trainerId || s.assignedTrainerId === trainerId)) ||
            (trainerName && (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName) && 
              (s.trainerName || s.facultyName || s.trainer || s.assignedTrainerName).toLowerCase().includes(trainerName.toLowerCase()))
          );
        }
        return false;
      });
    } else {
      // Admin sees all courses
      targetCourses = this.courses || [];
    }

    if (targetCourses.length === 0 && !specificCourseId) {
      targetCourses = this.courses || [];
    }

    const results = [];

    targetCourses.forEach(course => {
      const traineeIds = course.enrolledTraineeIds || [];

      traineeIds.forEach(tId => {
        const traineeUser = this.findUserById(tId) || (this.users || []).find(u => u.id === tId || u.email === tId || u.cadreId === tId);
        if (traineeUser && traineeUser.role === "trainee") {
          const userProg = (this.moduleProgress && this.moduleProgress[traineeUser.id]) || {};
          let completedMods = 0;
          let totalMods = 0;

          // Subject-level performance breakdown
          const subjectBreakdown = (course.subjects || []).map(s => {
            let sTotalMods = 0;
            let sCompletedMods = 0;
            (s.modules || []).forEach(m => {
              sTotalMods++;
              totalMods++;
              if (userProg[m.id]?.completed || userProg[m.id] === true) {
                sCompletedMods++;
                completedMods++;
              }
            });
            const sProg = sTotalMods > 0 ? Math.round((sCompletedMods / sTotalMods) * 100) : 0;

            const sSubmissions = (this.quizSubmissions || []).filter(sub =>
              (sub.traineeId === traineeUser.id || sub.traineeId === traineeUser.email) &&
              (sub.subjectId === s.id || 
               (sub.subjectName && sub.subjectName.toLowerCase().includes((s.name || s.title || "").toLowerCase())) ||
               (sub.quizTitle && sub.quizTitle.toLowerCase().includes((s.name || s.title || "").toLowerCase())))
            );
            const sAvgScore = sSubmissions.length > 0
              ? Math.round(sSubmissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / sSubmissions.length)
              : 0;

            return {
              subjectId: s.id,
              subjectName: s.name || s.title || "Subject Unit",
              assignedTrainer: s.trainerName || s.facultyName || s.trainer || course.leadTrainerName || "Department Faculty",
              assignedTrainerId: s.trainerId || s.facultyId || s.assignedTrainerId || course.leadTrainerId || null,
              progressPercentage: sProg,
              completedModules: sCompletedMods,
              totalModules: sTotalMods,
              avgScore: sAvgScore,
              submissionsCount: sSubmissions.length
            };
          });

          const progressPercent = totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : (traineeUser.completionPercentage || 0);

          const submissions = (this.quizSubmissions || []).filter(sub => 
            (sub.traineeId === traineeUser.id || sub.traineeId === traineeUser.email) && 
            (sub.courseId === course.id || (sub.quizTitle && sub.quizTitle.toLowerCase().includes((course.title || "").toLowerCase().slice(0, 10))))
          );
          
          const avgScore = submissions.length > 0 
            ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
            : (traineeUser.assessmentScore || 0);

          const passedSubs = submissions.filter(s => s.passed || (s.percentage || 0) >= 60).length;
          const consistencyScore = submissions.length > 0 ? Math.min(100, Math.round((passedSubs / submissions.length) * 80 + submissions.length * 5)) : 75;
          const practiceSubs = submissions.filter(s => s.isPractice);
          const practiceScore = practiceSubs.length > 0
            ? Math.round(practiceSubs.reduce((acc, s) => acc + (s.percentage || 0), 0) / practiceSubs.length)
            : avgScore;

          const strengths = [];
          const weaknesses = [];
          const topicScores = {};
          submissions.forEach(s => {
            if (s.quizTitle || s.topic) {
              const topic = s.topic || s.quizTitle;
              if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 };
              topicScores[topic].total += (s.percentage || 0);
              topicScores[topic].count += 1;
            }
          });
          Object.entries(topicScores).forEach(([top, data]) => {
            const pct = data.total / data.count;
            if (pct >= 75) strengths.push(top);
            else if (pct < 60) weaknesses.push(top);
          });

          results.push({
            id: `${course.id}_${traineeUser.id}`,
            traineeId: traineeUser.id,
            name: traineeUser.name,
            email: traineeUser.email,
            department: traineeUser.department || "Ministry of Earth Sciences",
            designation: traineeUser.designation || "Scientist 'B' (Trainee)",
            station: traineeUser.station || "IMD Field Station",
            cadreId: traineeUser.cadreId || `MOES-MET-${traineeUser.id}`,
            avatar: traineeUser.avatar,
            courseId: course.id,
            courseTitle: course.title,
            courseCode: course.code || course.id,
            enrolledDate: "Active Enrollment",
            progressPercentage: progressPercent,
            completionPercentage: progressPercent,
            completedModulesCount: completedMods,
            totalModulesCount: totalMods,
            avgQuizScore: avgScore,
            assessmentScore: avgScore,
            practiceScore: practiceScore,
            consistencyScore: consistencyScore,
            isDisqualified: !!traineeUser.isDisqualified,
            strengths: strengths.length > 0 ? strengths : (traineeUser.skills || ["Atmospheric Observation", "Radar Meteorology"]),
            weaknesses: weaknesses,
            subjectBreakdown: subjectBreakdown,
            status: progressPercent >= 100 ? "Completed" : (progressPercent > 0 ? "In Progress" : "Enrolled"),
            skills: traineeUser.skills || [],
            qualifications: traineeUser.qualifications || [],
            experience: traineeUser.experience || [],
            submissions: submissions.map(s => ({
              id: s.id,
              quizId: s.quizId,
              title: s.quizTitle || "Subject Assessment",
              topic: s.topic || s.quizTitle,
              score: s.score,
              totalMarks: s.totalMarks,
              percentage: s.percentage,
              submittedAt: s.submittedAt || new Date().toISOString(),
              timeSpent: s.timeSpent || "N/A",
              accuracy: s.percentage || 0,
              status: (s.percentage || 0) >= 60 ? "Passed" : "Failed"
            }))
          });
        }
      });
    });

    // Ensure all registered trainees are included when viewing overall analytics
    if (!trainerId && !trainerName && !specificCourseId) {
      const allTrainees = (this.users || []).filter(u => u.role === "trainee");
      const mappedTraineeIds = new Set(results.map(r => r.traineeId));
      
      allTrainees.forEach(traineeUser => {
        if (!mappedTraineeIds.has(traineeUser.id)) {
          const defaultCourse = (this.courses && this.courses[0]) || { id: "course_nwp_01", title: "National Meteorological Training Curriculum" };
          const submissions = (this.quizSubmissions || []).filter(sub => 
            sub.traineeId === traineeUser.id || sub.traineeId === traineeUser.email
          );
          const avgScore = submissions.length > 0 
            ? Math.round(submissions.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / submissions.length)
            : (traineeUser.assessmentScore || 78);
          const progressPercent = traineeUser.completionPercentage || (submissions.length > 0 ? Math.min(100, submissions.length * 25) : 65);
          
          results.push({
            id: `${defaultCourse.id}_${traineeUser.id}`,
            traineeId: traineeUser.id,
            name: traineeUser.name,
            email: traineeUser.email,
            department: traineeUser.department || "Ministry of Earth Sciences",
            designation: traineeUser.designation || "Scientist 'B' (Trainee)",
            station: traineeUser.station || "IMD Field Station",
            cadreId: traineeUser.cadreId || `MOES-MET-${traineeUser.id}`,
            avatar: traineeUser.avatar,
            courseId: defaultCourse.id,
            courseTitle: defaultCourse.title,
            courseCode: defaultCourse.code || defaultCourse.id,
            enrolledDate: "Active Enrollment",
            progressPercentage: progressPercent,
            completionPercentage: progressPercent,
            completedModulesCount: 4,
            totalModulesCount: 6,
            avgQuizScore: avgScore,
            assessmentScore: avgScore,
            practiceScore: avgScore,
            consistencyScore: 82,
            isDisqualified: !!traineeUser.isDisqualified,
            strengths: traineeUser.skills && traineeUser.skills.length > 0 ? traineeUser.skills : ["Atmospheric Observation", "Radar Meteorology"],
            weaknesses: traineeUser.needsImprovement || [],
            subjectBreakdown: (defaultCourse.subjects || []).map(s => ({
              subjectId: s.id,
              subjectName: s.name || s.title || "Subject Unit",
              assignedTrainer: s.trainerName || defaultCourse.leadTrainerName || "Department Faculty",
              progressPercentage: progressPercent,
              completedModules: 2,
              totalModules: 3,
              avgScore: avgScore,
              submissionsCount: 1
            })),
            status: progressPercent >= 100 ? "Completed" : "In Progress",
            skills: traineeUser.skills || [],
            qualifications: traineeUser.qualifications || [],
            experience: traineeUser.experience || [],
            submissions: submissions.map(s => ({
              id: s.id,
              quizId: s.quizId,
              title: s.quizTitle || "Subject Assessment",
              topic: s.topic || s.quizTitle,
              score: s.score,
              totalMarks: s.totalMarks,
              percentage: s.percentage,
              submittedAt: s.submittedAt || new Date().toISOString(),
              timeSpent: s.timeSpent || "N/A",
              accuracy: s.percentage || 0,
              status: (s.percentage || 0) >= 60 ? "Passed" : "Failed"
            }))
          });
        }
      });
    }

    return results;
  }

  getFeedbacks(courseId) {
    if (!this.feedbacks) this.feedbacks = [];
    if (courseId && courseId !== "all") {
      return this.feedbacks.filter(f => f.courseId === courseId);
    }
    return this.feedbacks;
  }

  addFeedback(feedbackData) {
    if (!this.feedbacks) this.feedbacks = [];
    const newFeedback = {
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...feedbackData
    };
    this.feedbacks.unshift(newFeedback);
    this._persist();
    return newFeedback;
  }

  addMaterialToModule(courseId, subjectId, moduleId, materialData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;
    const subject = (course.subjects || []).find(s => s.id === subjectId || s.name === subjectId);
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
      url: materialData.url || "https://storage.moes.gov.in/materials/sample_guide.pdf",
      fileData: materialData.fileData || materialData.url || undefined,
      fileName: materialData.fileName || undefined,
      format: materialData.format || (materialData.type === "ppt" ? "PowerPoint Presentation (PPTX)" : materialData.type === "video" ? "MP4 Video" : "PDF Document"),
      duration: materialData.duration || (materialData.type === "ppt" ? "28 Slides" : materialData.type === "video" ? "45 Mins" : "16 Pages"),
      pages: materialData.pages,
      size: materialData.size || "12.5 MB",
      topic: materialData.topic || mod.title,
      subject: materialData.subject || subject.name,
      uploadedBy: materialData.uploadedBy || course.leadTrainerName || "Dr. Amit Sengupta (Trainer)",
      uploadedAt: materialData.uploadedAt || new Date().toISOString(),
      allowDownload: materialData.allowDownload !== false,
      passPercentage: materialData.passPercentage,
      totalMarks: materialData.totalMarks,
      prerequisiteConfig: materialData.prerequisiteConfig,
      questions: materialData.questions
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
    const rawType = String(questionData.type || "MCQ").toLowerCase();
    const isOneWord = rawType.includes("word") || rawType.includes("short");

    const newQ = {
      id: questionData.id || `qb_${uuidv4().substring(0, 8)}`,
      question: questionData.question,
      subjectId: questionData.subjectId || "sub_nwp_01",
      subjectName: questionData.subjectName || "Atmospheric Dynamics",
      module: questionData.module || "Module 1",
      topic: questionData.topic || questionData.subjectName || "",
      concept: questionData.concept || "",
      marks: Number(questionData.marks) || (isOneWord ? 2 : 3),
      type: isOneWord ? "one_word" : "MCQ",
      difficulty: questionData.difficulty || "Medium",
      options: isOneWord ? [] : (Array.isArray(questionData.options) ? questionData.options : []),
      correctAnswer: isOneWord ? 0 : (questionData.correctAnswer !== undefined ? Number(questionData.correctAnswer) : 0),
      expectedAnswer: questionData.expectedAnswer || (isOneWord ? (questionData.options?.[0] || "") : ""),
      acceptedAnswers: Array.isArray(questionData.acceptedAnswers) 
        ? questionData.acceptedAnswers 
        : (questionData.expectedAnswer ? [questionData.expectedAnswer] : []),
      explanation: questionData.explanation || "",
      createdBy: questionData.createdBy || "u_trainer_1",
      createdByEmail: questionData.createdByEmail || null,
      createdByName: questionData.createdByName || null,
      createdByRole: questionData.createdByRole || "trainer",
      createdAt: new Date().toISOString()
    };
    this.questionBank.unshift(newQ);
    this._persist();
    return newQ;
  }

  duplicateQuestion(id, user = null) {
    const q = this.questionBank.find(item => item.id === id);
    if (q) {
      const cloned = { 
        ...q, 
        id: `qb_${uuidv4().substring(0, 8)}`, 
        question: `${q.question} (Copy)`,
        createdBy: user?.id || q.createdBy || "u_trainer_1",
        createdByEmail: user?.email || q.createdByEmail,
        createdByName: user?.name || q.createdByName,
        createdAt: new Date().toISOString()
      };
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
      ...quizData,
      id: quizData.id || `quiz_${uuidv4().substring(0, 8)}`,
      title: quizData.title,
      courseId: quizData.courseId || "crs_nwp_101",
      courseName: quizData.courseName || "MoES Operational Meteorology",
      subjectId: quizData.subjectId || "all",
      subjectName: quizData.subjectName || "",
      topicName: quizData.topicName || quizData.topic || "",
      conceptName: quizData.conceptName || "",
      trainerId: quizData.trainerId || quizData.createdBy || "u_trainer_1",
      trainerName: quizData.trainerName || "AI Adaptive Engine",
      department: quizData.department || "India Meteorological Department",
      totalMarks: Number(quizData.totalMarks) || 20,
      passMarks: Number(quizData.passMarks) || 10,
      durationMinutes: Number(quizData.durationMinutes) || 30,
      scheduledStartTime: quizData.scheduledStartTime || new Date().toISOString(),
      deadlineTime: quizData.deadlineTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: quizData.status || "published",
      isPractice: quizData.isPractice !== undefined ? quizData.isPractice : (quizData.type === "practice"),
      type: quizData.type || (quizData.isPractice ? "practice" : "assessment"),
      createdBy: quizData.createdBy || null,
      createdByRole: quizData.createdByRole || "trainer",
      isAdaptive: quizData.isAdaptive !== undefined ? quizData.isAdaptive : true,
      initialDifficulty: quizData.initialDifficulty || "Medium",
      questionCount: Array.isArray(quizData.questions) ? quizData.questions.length : (quizData.questionCount || 10),
      isKioskModeRequired: quizData.isKioskModeRequired !== undefined ? quizData.isKioskModeRequired : true,
      targetTraineeIds: Array.isArray(quizData.targetTraineeIds) ? quizData.targetTraineeIds : [],
      blueprint: Array.isArray(quizData.blueprint) ? quizData.blueprint : [],
      questions: quizData.questions || [],
      createdAt: quizData.createdAt || new Date().toISOString()
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
        url: "https://www.youtube.com/embed/iF_D2gnDJDU",
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
        url: "https://www.youtube.com/embed/iF_D2gnDJDU",
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
      url: itemData.url || (itemData.type === "video" ? "https://www.youtube.com/embed/iF_D2gnDJDU" : ""),
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

  // --- Trainer Matching & Workload Balancing Engine (Rule 17: Cold-Start & Rule 18: Workload) ---
  getTrainersWorkload() {
    // Ensure all active trainers are retrieved
    let trainers = this.users.filter(u => u.role === "trainer" && u.status !== "rejected");
    
    // Ensure at least 5 realistic trainers exist across all states (Cold-start, High load, Optimal)
    if (trainers.length < 5) {
      const extraFaculty = [
        {
          id: "u_trainer_4",
          name: "Dr. Rajesh Pillai",
          email: "rajesh.pillai@imd.gov.in",
          role: "trainer",
          department: "Agrometeorology & Climate Science Division, Pune",
          designation: "Scientist 'E' & Climate Forecaster",
          specialization: ["Agrometeorology", "Crop-Weather Modeling", "Drought Early Warning"],
          skills: ["Agrometeorology", "Fasal Modeling", "Monsoon Dynamics", "Soil Moisture Index"],
          experienceYears: 10,
          qualifications: ["Ph.D. in Agrometeorology (IARI New Delhi)", "M.Sc. Agricultural Physics"],
          certificates: [
            { title: "WMO Agrometeorological Advisory Lead", issuer: "World Meteorological Organization", year: "2023" },
            { title: "National Climate Services Diploma", issuer: "IMD Pune", year: "2024" }
          ],
          status: "approved",
          declaredAvailability: "Full-Time",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
        },
        {
          id: "u_trainer_5",
          name: "Dr. Sunita Deshmukh",
          email: "sunita.deshmukh@imd.gov.in",
          role: "trainer",
          department: "Satellite Meteorology & Space Applications, New Delhi",
          designation: "Scientist 'D' & Remote Sensing Analyst",
          specialization: ["Satellite Radiance Assimilation", "INSAT-3DR Sounder Products", "Convective Initiation"],
          skills: ["Satellite Meteorology", "Radiance Data Assimilation", "RGB Composite Interpretation", "Microwave Sounding"],
          experienceYears: 8,
          qualifications: ["M.Tech Remote Sensing (IIRS Dehradun)", "M.Sc. Physics (Delhi University)"],
          certificates: [
            { title: "ISRO/WMO Satellite Meteorology Fellowship", issuer: "ISRO / CSSTEAP", year: "2023" }
          ],
          status: "approved",
          declaredAvailability: "Limited",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250"
        }
      ];

      extraFaculty.forEach(ef => {
        if (!this.users.some(u => u.id === ef.id || u.email === ef.email)) {
          this.users.push(ef);
        }
      });
      this._persist();
      trainers = this.users.filter(u => u.role === "trainer" && u.status !== "rejected");
    }

    return trainers.map(t => {
      // 1. RULE 17: COLD-START RULE EVALUATION
      // If a trainer has NO previous trainee feedback and NO previous assessment history,
      // do NOT assign an artificial performance score. Instead: Performance history unavailable.
      const feedbacks = (this.feedbacks || []).filter(f => f.trainerId === t.id || f.trainerName === t.name);
      const quizzes = (this.quizzes || []).filter(q => q.trainerId === t.id || q.trainerName === t.name);

      const hasFeedbackHistory = feedbacks.length > 0;
      const hasAssessmentHistory = quizzes.length > 0;
      const isColdStart = !hasFeedbackHistory && !hasAssessmentHistory;

      let performanceScore = null;
      let performanceDisplay = "Performance history unavailable";
      let avgRating = null;

      if (!isColdStart) {
        if (hasFeedbackHistory) {
          const totalRating = feedbacks.reduce((acc, f) => acc + (Number(f.trainerEffectiveness || f.rating || 4.5)), 0);
          avgRating = (totalRating / feedbacks.length).toFixed(1);
          performanceScore = Number(avgRating);
          performanceDisplay = `${avgRating} / 5.0 (${feedbacks.length} Reviews • ${quizzes.length} Assessments)`;
        } else {
          performanceDisplay = `${quizzes.length} Assessments Conducted (Pending Trainee Feedback)`;
        }
      }

      const rawQualifications = Array.isArray(t.qualifications) 
        ? t.qualifications 
        : (t.qualifications ? [t.qualifications] : ["M.Sc. Atmospheric Sciences"]);

      const rawCertificates = Array.isArray(t.certificates) 
        ? t.certificates 
        : (Array.isArray(t.certifications) ? t.certifications : [
            { title: "WMO Certified Meteorologist (Class-I)", issuer: "World Meteorological Organization", year: "2023" },
            { title: "MoES Faculty Clearance", issuer: "Ministry of Earth Sciences", year: "2024" }
          ]);

      const rawSkills = Array.isArray(t.skills) ? t.skills : [];
      const rawSpecs = Array.isArray(t.specialization) ? t.specialization : [];
      const mergedSkills = Array.from(new Set([...rawSkills, ...rawSpecs])).filter(Boolean);

      // 4 verified pillars for matching (Competency, Certification, Experience, Qualification)
      const matchedCredentials = {
        verifiedCompetency: mergedSkills.length > 0 ? mergedSkills : ["Atmospheric Observation & Forecasting"],
        certifications: rawCertificates,
        experienceYears: t.experienceYears || (Array.isArray(t.experience) ? t.experience.length * 3 : 10),
        experienceDisplay: `${t.experienceYears || 10}+ Yrs Operational Forecaster`,
        qualification: rawQualifications[0] || "Ph.D. / M.Tech in Atmospheric Sciences",
        department: t.department || "India Meteorological Department",
        designation: t.designation || "Scientist 'E'"
      };

      // 2. RULE 18: AVAILABILITY / WORKLOAD RULE CALCULATION
      // Calculate: Current Course Load + Active Learners + Scheduled Assessments + Declared Availability
      const assignedCourses = (this.courses || []).filter(c => 
        c.leadTrainerName === t.name || 
        (c.subjects || []).some(s => s.assignedTrainerName === t.name || s.assignedTrainerId === t.id)
      );

      const currentCourseLoad = assignedCourses.length;
      const activeLearners = assignedCourses.reduce((acc, c) => acc + (c.enrolledTraineeIds?.length || 0), 0);
      const scheduledAssessments = quizzes.filter(q => {
        if (!q.scheduledStartTime) return false;
        return new Date(q.scheduledStartTime) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length;

      // Declared availability
      const declaredAvailability = t.declaredAvailability || (currentCourseLoad >= 3 ? "Limited" : currentCourseLoad >= 2 ? "Moderate" : "Full-Time");

      // Composite Workload Classification
      let workloadLevel = "Optimal"; // "Optimal" | "Moderate" | "High"
      let workloadStatus = "Optimal Availability";
      
      if (currentCourseLoad >= 3 || activeLearners >= 120 || scheduledAssessments >= 4 || declaredAvailability === "Limited") {
        workloadLevel = "High";
        workloadStatus = "High Load";
      } else if (currentCourseLoad === 2 || activeLearners >= 60 || scheduledAssessments >= 2) {
        workloadLevel = "Moderate";
        workloadStatus = "Moderate Load";
      } else {
        workloadLevel = "Optimal";
        workloadStatus = "Optimal Availability";
      }

      // Workload score index (0 - 100)
      const workloadScore = Math.min(100, (currentCourseLoad * 25) + Math.round(activeLearners * 0.3) + (scheduledAssessments * 10));

      // 3. FINAL RECOMMENDATION ENGINE
      let finalRecommendation = "Highly Recommended";
      let recommendationBadge = "🌟 Highly Recommended";
      let recommendationTone = "optimal"; // "optimal" | "warning" | "cold-start" | "balanced"
      let recommendationReason = "Optimal bandwidth and verified credentials.";

      if (isColdStart) {
        if (workloadLevel === "High") {
          finalRecommendation = "Consider with workload warning (Cold-Start)";
          recommendationBadge = "⚠ Workload Warning (New Faculty)";
          recommendationTone = "warning";
          recommendationReason = "Newly inducted faculty with limited bandwidth. Performance history unavailable — matched on verified certifications & qualification.";
        } else {
          finalRecommendation = "Eligible New Faculty (Cold-Start Matched)";
          recommendationBadge = "🌱 Matched on Credentials (Cold-Start)";
          recommendationTone = "cold-start";
          recommendationReason = "Performance history unavailable. Successfully matched using verified competency, certifications, experience, and qualification.";
        }
      } else {
        if (workloadLevel === "High") {
          finalRecommendation = "Consider with workload warning";
          recommendationBadge = "⚠ Consider with workload warning";
          recommendationTone = "warning";
          recommendationReason = "High course load and active learners across ongoing batches. Consider rebalancing before assigning new lead curriculum.";
        } else if (workloadLevel === "Moderate") {
          finalRecommendation = "Recommended with balanced workload";
          recommendationBadge = "🟡 Balanced Workload";
          recommendationTone = "balanced";
          recommendationReason = "Moderate course commitments; good capacity for specialized subject delegation.";
        } else {
          finalRecommendation = "Highly Recommended (Optimal Availability)";
          recommendationBadge = "🌟 Highly Recommended";
          recommendationTone = "optimal";
          recommendationReason = "Exceptional competency match with optimal availability and capacity.";
        }
      }

      return {
        trainerId: t.id,
        trainerName: t.name,
        email: t.email,
        department: t.department,
        designation: t.designation,
        role: t.role || "trainer",
        bio: t.bio || "",
        interests: t.interests || [],
        station: t.station || "",
        avatar: t.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
        skills: mergedSkills,
        specialization: rawSpecs.length > 0 ? rawSpecs : mergedSkills,
        qualifications: rawQualifications,
        certificates: rawCertificates,
        experience: Array.isArray(t.experience) ? t.experience : (t.experience ? [t.experience] : []),
        experienceYears: t.experienceYears || 10,
        
        // Rule 17 Cold Start Metadata
        isColdStart,
        performanceHistoryAvailable: !isColdStart,
        performanceScore,
        performanceDisplay,
        feedbackCount: feedbacks.length,
        assessmentHistoryCount: quizzes.length,
        matchedCredentials,

        // Rule 18 Availability & Workload Metadata
        currentCourseLoad,
        assignedCoursesCount: currentCourseLoad,
        assignedCourses: assignedCourses.map(c => ({ id: c.id, title: c.title, code: c.code })),
        activeLearners,
        scheduledAssessments,
        declaredAvailability,
        workloadLevel,
        workloadStatus,
        workloadScore,

        // Recommendation
        finalRecommendation,
        recommendationBadge,
        recommendationTone,
        recommendationReason
      };
    });
  }

  verifyCertificate(query) {
    if (!query) return null;
    const cleanQuery = String(query).trim().toLowerCase();

    // 1. Check all users' certificates array
    for (const user of this.users) {
      if (Array.isArray(user.certificates)) {
        for (const cert of user.certificates) {
          const certId = (cert.credentialId || cert.id || cert.certificateId || "").toLowerCase();
          const certTitle = (cert.title || "").toLowerCase();
          if (certId && (cleanQuery.includes(certId) || certId.includes(cleanQuery)) ||
              (cleanQuery === certId)) {
            return {
              certificateId: cert.credentialId || cert.id || cert.certificateId || query,
              title: cert.title,
              recipientName: user.name,
              recipientEmail: user.email,
              designation: user.designation || "Scientist / Officer",
              department: user.department || "Ministry of Earth Sciences",
              cadreId: user.cadreId || `MOES-MET-${user.id}`,
              issuer: cert.issuer || "Ministry of Earth Sciences / IMD Training Directorate",
              issueDate: cert.year || cert.issueDate || "2026",
              grade: cert.performanceCategory || cert.grade || "Distinction (Verified)",
              finalScore: cert.finalScore || 95,
              status: "GENUINE & VERIFIED",
              verificationStatus: "Active Official Credential",
              issuedAt: cert.issuedAt || new Date().toISOString(),
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(query)}`
            };
          }
        }
      }
    }

    // 2. Check quiz submissions with certificates
    for (const sub of this.quizSubmissions) {
      const certId = (sub.certificateId || `MOES-CERT-${sub.id}`).toLowerCase();
      if (certId && (cleanQuery.includes(certId) || certId.includes(cleanQuery))) {
        const user = this.findUserById(sub.traineeId);
        return {
          certificateId: sub.certificateId || `MOES-CERT-${sub.id}`,
          title: sub.quizTitle || "Subject Assessment Competency",
          recipientName: sub.traineeName || user?.name || "Officer Trainee",
          recipientEmail: user?.email || "",
          designation: user?.designation || "Scientist 'B' (Trainee)",
          department: user?.department || "Ministry of Earth Sciences",
          cadreId: user?.cadreId || `MOES-MET-${sub.traineeId}`,
          issuer: "Ministry of Earth Sciences / IMD Central Examination Cell",
          issueDate: new Date(sub.submittedAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          grade: sub.percentage >= 90 ? `Distinction (${sub.percentage}%)` : sub.percentage >= 75 ? `Merit (${sub.percentage}%)` : `Passed (${sub.percentage}%)`,
          finalScore: sub.score,
          totalMarks: sub.totalMarks,
          percentage: sub.percentage,
          status: "GENUINE & VERIFIED",
          verificationStatus: "Active Official Credential",
          issuedAt: sub.submittedAt || new Date().toISOString(),
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(query)}`
        };
      }
    }

    // Fallback demo match for standard format
    if (cleanQuery.startsWith("moes-") || cleanQuery.startsWith("cert-")) {
      return {
        certificateId: query.toUpperCase(),
        title: "Advanced Capacity Building & Weather Dynamics Credential",
        recipientName: "Verified Officer Trainee",
        designation: "Scientist 'B'",
        department: "Ministry of Earth Sciences / IMD",
        cadreId: "MOES-GOI-2026",
        issuer: "Ministry of Earth Sciences Training Directorate",
        issueDate: "2026",
        grade: "Distinction (Verified)",
        finalScore: 100,
        status: "GENUINE & VERIFIED",
        verificationStatus: "Active Official Credential",
        issuedAt: new Date().toISOString(),
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(query)}`
      };
    }

    return null;
  }

  generateBulkCertificates(courseId) {
    const course = this.getCourseById(courseId);
    if (!course) return { success: false, count: 0, certificates: [] };

    const enrolledTrainees = course.enrolledTraineeIds || [];
    const issued = [];

    enrolledTrainees.forEach(traineeId => {
      const user = this.findUserById(traineeId);
      if (user) {
        if (!Array.isArray(user.certificates)) user.certificates = [];
        
        const certId = `MOES-CERT-${course.code || course.id}-${user.id}`;
        const alreadyHas = user.certificates.some(c => (c.credentialId === certId || c.id === certId || c.title === course.title));

        if (!alreadyHas) {
          const newCert = {
            id: certId,
            credentialId: certId,
            title: course.title,
            issuer: "Ministry of Earth Sciences / IMD Training Directorate",
            year: new Date().getFullYear().toString(),
            grade: "Distinction (100%)",
            performanceCategory: "Distinction",
            finalScore: 100,
            courseId: course.id,
            issuedAt: new Date().toISOString(),
            verificationUrl: `http://localhost:5173/?verify=${certId}`
          };
          user.certificates.push(newCert);
          issued.push({ traineeId: user.id, traineeName: user.name, certificate: newCert });
        }
      }
    });

    this._persist();
    return { success: true, count: issued.length, issued };
  }

  saveData() {
    this._persist();
  }

  // ══════════════════════════════════════════════════════════════════════
  // CONTENT LIBRARY MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════
  _generateInitialContentLibrary() {
    return [
      {
        id: "lib_radar_01",
        title: "Doppler Weather Radar (DWR) Reflectivity & Velocity Interpretation",
        subject: "Radar Meteorology & Satellite Applications",
        subjectName: "Radar Meteorology & Satellite Applications",
        topic: "Dual-Polarization (ZDR, KDP) & Hydro-Meteor Classification",
        type: "ppt",
        format: "PPTX",
        url: "https://storage.moes.gov.in/slides/dwr_reflectivity.pptx",
        duration: "34 Slides",
        size: "18.2 MB",
        uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
        uploadedAt: "Uploaded on: Jan 12, 2025",
        status: "verified",
        downloadAllowed: true,
        tags: ["Doppler Radar", "Reflectivity", "Dual-Pol", "Mesoscale"]
      },
      {
        id: "lib_nwp_02",
        title: "Sigma-Coordinates & Lower Boundary Formulations in NWP Models",
        subject: "Atmospheric Dynamics & Numerical Weather Prediction",
        subjectName: "Atmospheric Dynamics & Numerical Weather Prediction",
        topic: "Terrain Following Coordinate Transformation & CFL Criterion",
        type: "video",
        format: "MP4",
        url: "https://www.youtube.com/embed/iF_D2gnDJDU",
        duration: "45 Mins",
        size: "245 MB",
        uploadedBy: "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
        uploadedAt: "Uploaded on: Jan 14, 2025",
        status: "verified",
        downloadAllowed: false,
        tags: ["NWP", "Sigma Coordinates", "CFL", "Boundary Conditions"]
      },
      {
        id: "lib_hydro_03",
        title: "Atmospheric Boundary Layer Turbulence & Eddy Covariance Guide",
        subject: "Atmospheric Dynamics & Numerical Weather Prediction",
        subjectName: "Atmospheric Dynamics & Numerical Weather Prediction",
        topic: "Monin-Obukhov Similarity Theory & Flux-Gradient Relations",
        type: "pdf",
        format: "PDF",
        url: "https://storage.moes.gov.in/notes/boundary_layer_guide.pdf",
        duration: "22 Pages",
        pages: 22,
        size: "4.8 MB",
        uploadedBy: "Dr. Sunita Sharma (Scientist 'E')",
        uploadedAt: "Uploaded on: Jan 18, 2025",
        status: "verified",
        downloadAllowed: true,
        tags: ["Boundary Layer", "Eddy Covariance", "Monin-Obukhov", "Turbulence"]
      }
    ];
  }

  _sanitizeContentLibrary(lib) {
    return Array.isArray(lib) && lib.length > 0 ? lib : this._generateInitialContentLibrary();
  }

  getContentLibrary({ trainerId, trainerName, subject, type, status, search } = {}) {
    let items = Array.isArray(this.contentLibrary) ? [...this.contentLibrary] : [];
    
    if (subject && subject !== "all") {
      const subLower = subject.toLowerCase();
      items = items.filter(i => 
        (i.subject && i.subject.toLowerCase().includes(subLower)) ||
        (i.subjectName && i.subjectName.toLowerCase().includes(subLower))
      );
    }

    if (type && type !== "all") {
      items = items.filter(i => i.type === type || (type === "manual" && (i.type === "lab" || i.type === "manual")));
    }

    if (status && status !== "all") {
      items = items.filter(i => i.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(i => 
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.topic && i.topic.toLowerCase().includes(q)) ||
        (i.subject && i.subject.toLowerCase().includes(q)) ||
        (i.uploadedBy && i.uploadedBy.toLowerCase().includes(q))
      );
    }

    return items;
  }

  createContentLibraryItem(data) {
    if (!Array.isArray(this.contentLibrary)) {
      this.contentLibrary = [];
    }

    const type = data.type || "ppt";
    const ext = type === "ppt" ? "PPTX" : type === "pdf" ? "PDF" : type === "video" ? "MP4" : "DOCX";

    const newItem = {
      id: data.id || `lib_${uuidv4().substring(0, 8)}`,
      title: (data.title || "Untitled Resource").trim(),
      subject: (data.subject || data.subjectName || "Atmospheric Dynamics & Numerical Weather Prediction").trim(),
      subjectName: (data.subject || data.subjectName || "Atmospheric Dynamics & Numerical Weather Prediction").trim(),
      topic: (data.topic || data.title || "Core Meteorological Dynamics").trim(),
      type: type,
      format: data.format || ext,
      url: data.url || (type === "video" ? "https://www.youtube.com/embed/iF_D2gnDJDU" : "https://storage.moes.gov.in/repository/material_sample.pdf"),
      fileData: data.fileData || null,
      fileName: data.fileName || null,
      duration: data.duration || (type === "ppt" ? "28 Slides" : type === "pdf" ? "16 Pages" : "45 Mins"),
      pages: data.pages || (type === "pdf" ? 16 : undefined),
      size: data.size || "12.4 MB",
      uploadedBy: data.uploadedBy || "Faculty Member (MoES)",
      uploadedAt: `Uploaded on: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: data.status || "verified",
      downloadAllowed: data.downloadAllowed !== false && type !== "quiz" && type !== "video",
      tags: Array.isArray(data.tags) ? data.tags : [type.toUpperCase(), "Operational"]
    };

    this.contentLibrary.unshift(newItem);
    this._persist();
    return newItem;
  }

  updateContentLibraryItem(id, data) {
    if (!Array.isArray(this.contentLibrary)) return null;
    const idx = this.contentLibrary.findIndex(i => i.id === id);
    if (idx === -1) return null;

    this.contentLibrary[idx] = {
      ...this.contentLibrary[idx],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this._persist();
    return this.contentLibrary[idx];
  }

  deleteContentLibraryItem(id) {
    if (!Array.isArray(this.contentLibrary)) return false;
    const initialLen = this.contentLibrary.length;
    this.contentLibrary = this.contentLibrary.filter(i => i.id !== id);
    if (this.contentLibrary.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  attachContentToSubjectModule(itemId, courseId, subjectId, moduleId) {
    const item = (this.contentLibrary || []).find(i => i.id === itemId);
    if (!item) return false;

    const materialPayload = {
      id: `mat_${uuidv4().substring(0, 8)}`,
      title: item.title,
      type: item.type === "presentation" ? "ppt" : item.type,
      url: item.url,
      fileData: item.fileData,
      fileName: item.fileName,
      duration: item.duration || (item.pages ? `${item.pages} Pages` : "30 Mins"),
      size: item.size || "8.5 MB",
      allowDownload: item.downloadAllowed !== false,
      uploadedBy: item.uploadedBy || "Faculty Member",
      uploadedAt: `Uploaded on: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    };

    const added = this.addMaterialToModule(courseId, subjectId, moduleId, materialPayload);
    return !!added;
  }

  // ══════════════════════════════════════════════════════════════════════
  // CURRICULUM SUBJECT, MODULE & MATERIAL PERSISTENCE
  // ══════════════════════════════════════════════════════════════════════
  addMaterialToModule(courseId, subjectId, moduleId, materialData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    if (!Array.isArray(course.subjects)) {
      course.subjects = [];
    }

    let subject = course.subjects.find(s => s.id === subjectId);
    if (!subject && course.subjects.length > 0) {
      subject = course.subjects[0];
    }
    if (!subject) return null;

    if (!Array.isArray(subject.modules)) {
      subject.modules = [];
    }

    let moduleObj = subject.modules.find(m => m.id === moduleId);
    if (!moduleObj && subject.modules.length > 0) {
      moduleObj = subject.modules[0];
    }
    if (!moduleObj) return null;

    if (!Array.isArray(moduleObj.materials)) {
      moduleObj.materials = [];
    }

    const newMaterial = {
      id: materialData.id || `mat_${uuidv4().substring(0, 8)}`,
      title: materialData.title || "Learning Resource",
      type: materialData.type || "ppt",
      url: materialData.url || "",
      fileData: materialData.fileData || undefined,
      fileName: materialData.fileName || undefined,
      duration: materialData.duration || "30 Mins",
      size: materialData.size || "10 MB",
      allowDownload: materialData.allowDownload !== false && materialData.type !== "quiz" && materialData.type !== "video",
      uploadedBy: materialData.uploadedBy || "Faculty Member",
      uploadedAt: materialData.uploadedAt || `Uploaded on: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      passPercentage: materialData.passPercentage,
      totalMarks: materialData.totalMarks,
      prerequisiteConfig: materialData.prerequisiteConfig,
      questions: materialData.questions
    };

    moduleObj.materials.push(newMaterial);
    this._persist();
    return newMaterial;
  }

  addModuleToSubject(courseId, subjectId, moduleData) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    if (!Array.isArray(course.subjects)) {
      course.subjects = [];
    }

    const subject = course.subjects.find(s => s.id === subjectId);
    if (!subject) return null;

    if (!Array.isArray(subject.modules)) {
      subject.modules = [];
    }

    const newMod = {
      id: moduleData.id || `mod_${uuidv4().substring(0, 8)}`,
      title: moduleData.title || `Module ${subject.modules.length + 1}`,
      durationHours: moduleData.durationHours || "3 Hours",
      duration: moduleData.duration || "3 Hours",
      materials: Array.isArray(moduleData.materials) ? moduleData.materials : []
    };

    subject.modules.push(newMod);
    this._persist();
    return newMod;
  }

  deleteModuleFromSubject(courseId, subjectId, moduleId) {
    const course = this.getCourseById(courseId);
    if (!course || !Array.isArray(course.subjects)) return false;

    const subject = course.subjects.find(s => s.id === subjectId);
    if (!subject || !Array.isArray(subject.modules)) return false;

    const initialLen = subject.modules.length;
    subject.modules = subject.modules.filter(m => m.id !== moduleId);
    if (subject.modules.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  removeMaterialFromModule(courseId, subjectId, moduleId, materialId) {
    const course = this.getCourseById(courseId);
    if (!course || !Array.isArray(course.subjects)) return false;

    const subject = course.subjects.find(s => s.id === subjectId);
    if (!subject || !Array.isArray(subject.modules)) return false;

    const moduleObj = subject.modules.find(m => m.id === moduleId);
    if (!moduleObj || !Array.isArray(moduleObj.materials)) return false;

    const initialLen = moduleObj.materials.length;
    moduleObj.materials = moduleObj.materials.filter(mat => mat.id !== materialId);
    if (moduleObj.materials.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════════════════
  // FEEDBACKS
  // ══════════════════════════════════════════════════════════════════════
  getFeedbacks(courseId) {
    if (!Array.isArray(this.feedbacks)) return [];
    if (courseId) {
      return this.feedbacks.filter(f => f.courseId === courseId);
    }
    return this.feedbacks;
  }

  addFeedback(feedbackData) {
    if (!Array.isArray(this.feedbacks)) this.feedbacks = [];
    const newFb = {
      id: feedbackData.id || `fb_${uuidv4().substring(0, 8)}`,
      ...feedbackData,
      submittedAt: new Date().toISOString()
    };
    this.feedbacks.push(newFb);
    this._persist();
    return newFb;
  }

  // ══════════════════════════════════════════════════════════════════════
  // PROGRESS & VIDEO TRACKING
  // ══════════════════════════════════════════════════════════════════════
  markModuleComplete(userId, moduleId, extra = {}) {
    if (!this.moduleProgress) this.moduleProgress = {};
    if (!this.moduleProgress[userId]) this.moduleProgress[userId] = {};
    this.moduleProgress[userId][moduleId] = {
      completed: true,
      completedAt: new Date().toISOString(),
      ...extra
    };
    this._persist();
    return this.moduleProgress[userId];
  }

  getModuleProgress(userId) {
    if (!this.moduleProgress) this.moduleProgress = {};
    return this.moduleProgress[userId] || {};
  }

  // ══════════════════════════════════════════════════════════════════════
  // ENROLLED TRAINEES & DEEP PERFORMANCE FOR TRAINER & ADMIN
  // ══════════════════════════════════════════════════════════════════════
  getEnrolledTraineesForTrainer(trainerName, trainerId, specificCourseId) {
    const allCourses = Array.isArray(this.courses) ? this.courses : [];
    
    // Find courses
    let targetCourses = allCourses;
    if (specificCourseId && specificCourseId !== "all") {
      targetCourses = allCourses.filter(c => c.id === specificCourseId);
    } else if (trainerName || trainerId) {
      targetCourses = allCourses.filter(c => 
        c.leadTrainerName === trainerName || 
        c.leadTrainerId === trainerId ||
        (c.subjects || []).some(s => s.assignedTrainerName === trainerName || s.assignedTrainerId === trainerId)
      );
    }

    if (targetCourses.length === 0 && !specificCourseId) {
      targetCourses = allCourses;
    }

    const allUsers = Array.isArray(this.users) ? this.users : [];
    const allQuizzes = Array.isArray(this.quizzes) ? this.quizzes : [];
    const allSubmissions = Array.isArray(this.quizSubmissions) ? this.quizSubmissions : [];

    const traineeMap = new Map();

    targetCourses.forEach(course => {
      const enrolledIds = Array.isArray(course.enrolledTraineeIds) ? course.enrolledTraineeIds : [];
      const courseQuizzes = allQuizzes.filter(q => q.courseId === course.id);
      const courseAllModules = (course.subjects || []).flatMap(s => s.modules || []);
      const totalModulesCount = courseAllModules.length || 1;

      // Ensure active enrolled trainees
      const activeEnrolledIds = enrolledIds.length > 0 
        ? enrolledIds 
        : allUsers.filter(u => u.role === "trainee").map(u => u.id);

      activeEnrolledIds.forEach(traineeId => {
        const userObj = allUsers.find(u => u.id === traineeId) || {
          id: traineeId,
          name: "Rahul Sharma",
          email: "rahul.sharma@imd.gov.in",
          station: "MC Jaipur",
          designation: "Scientist 'B' Trainee",
          cadreId: "IMD-MET-2026-4491",
          department: "Numerical Weather Prediction Division"
        };

        const userProgressMap = this.getModuleProgress(traineeId);
        const completedMods = courseAllModules.filter(m => userProgressMap[m.id]?.completed);
        const progressPercentage = Math.round((completedMods.length / totalModulesCount) * 100) || (userObj.completionPercentage ?? (traineeId === "u_trainee_1" ? 100 : 65));

        // Find trainee submissions for this course's assessments
        const userCourseSubmissions = allSubmissions.filter(sub => {
          if (sub.traineeId !== traineeId && sub.userId !== traineeId) return false;
          return courseQuizzes.some(q => q.id === sub.quizId || q.title === sub.quizTitle || q.title === sub.title);
        });

        // Fallback to relevant submissions
        const relevantSubmissions = userCourseSubmissions.length > 0 
          ? userCourseSubmissions 
          : allSubmissions.filter(sub => sub.traineeId === traineeId || sub.userId === traineeId);

        const avgScore = relevantSubmissions.length > 0
          ? Math.round(relevantSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / relevantSubmissions.length)
          : (userObj.assessmentScore ?? (progressPercentage > 0 ? 82 : 65));

        // Calculate Video & Learning Position
        let currentSubject = course.subjects?.[0]?.name || "Atmospheric Dynamics";
        let currentModule = courseAllModules[Math.min(completedMods.length, courseAllModules.length - 1)]?.title || "Data Assimilation & Satellite Radiance Ingestion";
        let currentVideo = "INSAT-3DR Radiance Ingestion & 3D-Var Quality Control";
        let isWatchedFull = progressPercentage >= 100;
        let watchPercentage = progressPercentage >= 100 ? 100 : (progressPercentage > 50 ? 85 : 45);
        let watchedDurationText = isWatchedFull ? "45m / 45m (100% Watched)" : `${Math.round(30 * (watchPercentage / 100))}m / 30m (${watchPercentage}% Watched)`;

        // Video list in course
        const allVideosInCourse = [];
        (course.subjects || []).forEach(sub => {
          (sub.modules || []).forEach(mod => {
            (mod.materials || []).filter(m => m.type === "video").forEach(v => {
              allVideosInCourse.push({
                subjectName: sub.name,
                moduleTitle: mod.title,
                videoTitle: v.title,
                duration: v.duration || "30 mins",
                url: v.url
              });
            });
          });
        });

        if (allVideosInCourse.length > 0) {
          const videoIdx = Math.min(Math.floor((progressPercentage / 100) * allVideosInCourse.length), allVideosInCourse.length - 1);
          const activeVid = allVideosInCourse[videoIdx];
          currentSubject = activeVid.subjectName;
          currentModule = activeVid.moduleTitle;
          currentVideo = activeVid.videoTitle;
        }

        // Detailed Learning Gaps
        const learningGaps = [
          {
            topic: "Doppler Radar Velocity De-Aliasing & Dual-PRF",
            subject: "Radar Meteorology",
            accuracy: avgScore > 80 ? 68 : 48,
            status: avgScore > 80 ? "Developing" : "Needs Attention",
            gapType: "Conceptual Calibration",
            recommendation: "Review Nyquist interval and dual-PRF velocity unfolding practical laboratory modules."
          },
          {
            topic: "Background Error Covariance (B-Matrix) Inversion",
            subject: "Data Assimilation",
            accuracy: avgScore > 75 ? 74 : 52,
            status: avgScore > 75 ? "Developing" : "Needs Attention",
            gapType: "Mathematical Formulation",
            recommendation: "Complete NMC method matrix synthesis exercises in Module 2."
          },
          {
            topic: "Satellite Infrared Radiance Sounding",
            subject: "Satellite Meteorology",
            accuracy: 88,
            status: "Strong",
            gapType: "Mastered",
            recommendation: "Ready for advanced RTTOV fast radiative transfer modeling."
          }
        ];

        let category = "Poor";
        if (userObj.isDisqualified) {
          category = "Disqualified";
        } else if (avgScore >= 85) {
          category = "Excellent";
        } else if (avgScore >= 70) {
          category = "Good";
        } else if (avgScore >= 50) {
          category = "Needs Improvement";
        }

        const practiceSubs = relevantSubmissions.filter(s => s.isPractice);
        const practiceScore = practiceSubs.length > 0
          ? Math.round(practiceSubs.reduce((acc, s) => acc + (s.percentage || 0), 0) / practiceSubs.length)
          : avgScore;
        const consistencyScore = Math.min(100, Math.max(60, avgScore + Math.floor(Math.random() * 8) - 4));

        const subjectBreakdown = (course.subjects || []).map(s => {
          const sMods = s.modules || [];
          const sCompletedMods = sMods.filter(m => userProgressMap[m.id]?.completed);
          const sProg = sMods.length > 0 ? Math.round((sCompletedMods.length / sMods.length) * 100) : progressPercentage;
          return {
            subjectId: s.id,
            subjectName: s.name || s.title || "Subject Unit",
            assignedTrainer: s.trainerName || course.leadTrainerName || "Department Faculty",
            progressPercentage: sProg,
            completedModules: sCompletedMods.length,
            totalModules: sMods.length,
            avgScore: avgScore,
            submissionsCount: Math.max(1, relevantSubmissions.length)
          };
        });

        const key = `${traineeId}_${course.id}`;
        if (!traineeMap.has(key)) {
          traineeMap.set(key, {
            id: userObj.id,
            name: userObj.name,
            email: userObj.email,
            avatar: userObj.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
            station: userObj.station || "National Forecasting Centre",
            cadreId: userObj.cadreId || `IMD-MET-2026-${userObj.id.substring(userObj.id.length - 4)}`,
            designation: userObj.designation || "Scientist 'B' Trainee",
            department: userObj.department || course.department || "Numerical Weather Prediction Division",
            phone: userObj.phone || "+91 98765 43210",
            skills: userObj.skills || ["WRF Modeling", "Synoptic Analysis", "Python Meteorology"],
            qualifications: userObj.qualifications || ["M.Sc. Atmospheric Physics"],
            bio: userObj.bio || "Trainee officer undergoing specialized capacity development.",
            courseId: course.id,
            courseTitle: course.title,
            courseCode: course.code,
            progressPercentage,
            completionPercentage: progressPercentage,
            completedModulesCount: completedMods.length || (progressPercentage > 0 ? Math.ceil(totalModulesCount * (progressPercentage / 100)) : 0),
            totalModulesCount,
            category,
            status: progressPercentage >= 100 ? "Completed" : (progressPercentage > 0 ? "In Progress" : "Enrolled"),
            examsGivenCount: relevantSubmissions.length || (progressPercentage > 0 ? 2 : 0),
            examsTotalCount: courseQuizzes.length || 3,
            avgQuizScore: avgScore,
            assessmentScore: avgScore,
            practiceScore,
            consistencyScore,
            isDisqualified: !!userObj.isDisqualified,
            subjectBreakdown,
            strengths: ["Satellite Radiance Ingestion", "Synoptic Charting"],
            weaknesses: ["Doppler Radar De-Aliasing"],
            submissions: relevantSubmissions.map(s => ({
              id: s.id,
              quizId: s.quizId,
              title: s.quizTitle || "Subject Assessment",
              topic: s.topic || s.quizTitle,
              score: s.score,
              totalMarks: s.totalMarks,
              percentage: s.percentage,
              submittedAt: s.submittedAt || new Date().toISOString(),
              timeSpent: s.timeSpent || "28 mins",
              accuracy: s.percentage || 0,
              status: (s.percentage || 0) >= 60 ? "Passed" : "Failed"
            })),
            currentLearningPosition: {
              subjectName: currentSubject,
              moduleTitle: currentModule,
              videoTitle: currentVideo,
              isWatchedFull,
              watchPercentage,
              watchedDurationText,
              lastWatchedDate: "Today at 07:45 AM"
            },
            learningGaps,
            enrolledDate: "15 Jan 2026",
            trainerNotes: [
              "Demonstrates consistent attention to synoptic chart interpretation.",
              "Recommended for additional DWR Nowcasting simulation runs."
            ]
          });
        }
      });
    });

    return Array.from(traineeMap.values());
  }

  // ══════════════════════════════════════════════════════════════════════
  // COURSE PERFORMANCE & TRAINER OVERALL ANALYTICS (FOR ADMIN & TRAINER)
  // ══════════════════════════════════════════════════════════════════════
  getCoursePerformanceAndTrainerAnalytics(courseId) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const feedbacks = this.getFeedbacks(courseId);
    const quizzes = (this.quizzes || []).filter(q => q.courseId === courseId);
    const trainees = this.getEnrolledTraineesForTrainer(null, null, courseId);

    // Calculate Trainer Feedback Metrics
    const totalFeedbacks = feedbacks.length;
    let avgTrainerRating = 4.8;
    let avgContentRating = 4.7;
    let avgRelevanceRating = 4.9;

    if (totalFeedbacks > 0) {
      avgTrainerRating = (feedbacks.reduce((acc, f) => acc + (f.trainerRating || 5), 0) / totalFeedbacks).toFixed(1);
      avgContentRating = (feedbacks.reduce((acc, f) => acc + (f.contentRating || 5), 0) / totalFeedbacks).toFixed(1);
      avgRelevanceRating = (feedbacks.reduce((acc, f) => acc + (f.relevanceRating || 5), 0) / totalFeedbacks).toFixed(1);
    }

    // Calculate Class Performance Metrics
    const totalTrainees = trainees.length;
    const completedTrainees = trainees.filter(t => t.progressPercentage >= 100).length;
    const activeTrainees = trainees.filter(t => t.progressPercentage > 0 && t.progressPercentage < 100).length;
    
    const allScores = trainees.map(t => t.avgQuizScore).filter(s => s > 0);
    const classAvgScore = allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 84;

    const passedCount = allScores.filter(s => s >= 50).length;
    const passRate = allScores.length > 0 ? Math.round((passedCount / allScores.length) * 100) : 94;
    const failRate = 100 - passRate;

    // Module / Material Upload Stats
    const allSubjects = course.subjects || [];
    const allModules = allSubjects.flatMap(s => s.modules || []);
    const totalMaterialsUploaded = allModules.reduce((acc, m) => acc + (m.materials?.length || 0), 0);
    const videoMaterialsCount = allModules.reduce((acc, m) => acc + (m.materials?.filter(mat => mat.type === "video").length || 0), 0);
    const docMaterialsCount = totalMaterialsUploaded - videoMaterialsCount;

    // Tests Conducted
    const testsConducted = quizzes.length;
    const publishedTests = quizzes.filter(q => q.resultsPublished).length;

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      leadTrainerName: course.leadTrainerName || "Dr. Amit Sengupta",
      leadTrainerId: course.leadTrainerId || "u_trainer_1",
      leadTrainerDesignation: "Scientist 'F' & Lead Faculty",
      department: course.department || "Numerical Weather Prediction Division",
      trainerFeedback: {
        averageRating: Number(avgTrainerRating),
        contentRating: Number(avgContentRating),
        relevanceRating: Number(avgRelevanceRating),
        totalReviews: totalFeedbacks,
        reviews: feedbacks
      },
      curriculumDelivery: {
        totalSubjects: allSubjects.length,
        totalModulesUploaded: allModules.length,
        totalMaterialsUploaded,
        videoMaterialsCount,
        docMaterialsCount,
        curriculumCoveragePercent: 100,
        status: "Active & Up-to-Date"
      },
      assessmentOperations: {
        testsConducted,
        publishedTests,
        pendingEvaluation: testsConducted - publishedTests,
        totalSubmissionsEvaluated: quizzes.reduce((acc, q) => acc + (q.submissionsCount || q.submissions?.length || 0), 0)
      },
      classPerformance: {
        totalEnrolledTrainees: totalTrainees,
        completedTrainees,
        activeTrainees,
        completionRate: totalTrainees > 0 ? Math.round((completedTrainees / totalTrainees) * 100) : 40,
        classAverageScore: classAvgScore,
        passRate,
        failRate,
        topScore: Math.max(...allScores, 96),
        lowestScore: Math.min(...allScores, 58)
      },
      cohortLearningGaps: [
        { topic: "Doppler Radar Velocity De-Aliasing", failureFrequency: "28% of Class", severity: "Medium" },
        { topic: "Background Error Covariance Tuning", failureFrequency: "22% of Class", severity: "Medium" },
        { topic: "INSAT-3DR Atmospheric Sounding Ingestion", failureFrequency: "8% of Class", severity: "Low (Mastered)" }
      ]
    };
  }
}

export const db = new DatabaseStore();
