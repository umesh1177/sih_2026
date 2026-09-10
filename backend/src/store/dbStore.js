// Unified Data Store for CAPACITY CONNECT (MoES / IMD LMS)
import { initialData } from "../data/mockData.js";
import { auditService } from "./auditService.js";
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

  // ─── Persistence Layer ───
  _loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const saved = JSON.parse(raw);
        this.organizations = saved.organizations || [...initialData.organizations];
        this.departments = saved.departments || [...initialData.departments];
        this.users = saved.users || [...initialData.users];
        this.competencies = saved.competencies || [...initialData.competencies];
        this.trainerCompetencies = saved.trainerCompetencies || [...initialData.trainerCompetencies];
        this.credentials = saved.credentials || [...initialData.credentials];
        this.workExperiences = saved.workExperiences || [...initialData.workExperiences];
        this.trainerAvailabilities = saved.trainerAvailabilities || [...initialData.trainerAvailabilities];
        this.courses = saved.courses || JSON.parse(JSON.stringify(initialData.courses));
        this.questionBank = saved.questionBank || [...initialData.questionBank];
        this.quizzes = saved.quizzes || JSON.parse(JSON.stringify(initialData.quizzes));
        this.quizSubmissions = saved.quizSubmissions || [...initialData.quizSubmissions];
        this.certificates = saved.certificates || [...initialData.certificates];
        this.announcements = saved.announcements || [...initialData.announcements];
        this.feedbacks = saved.feedbacks || [...initialData.feedbacks];
        this.moduleProgress = saved.moduleProgress || JSON.parse(JSON.stringify(initialData.moduleProgress || {}));
        this.contentLibrary = saved.contentLibrary || this._generateInitialContentLibrary();
        this._persist();
        console.log("✅ Database initialized and synchronized from db.json");
        return;
      }
    } catch (err) {
      console.warn("⚠️ Could not load db.json, initializing fresh dataset:", err.message);
    }

    // Fresh Seed Initialization
    this.organizations = [...initialData.organizations];
    this.departments = [...initialData.departments];
    this.users = [...initialData.users];
    this.competencies = [...initialData.competencies];
    this.trainerCompetencies = [...initialData.trainerCompetencies];
    this.credentials = [...initialData.credentials];
    this.workExperiences = [...initialData.workExperiences];
    this.trainerAvailabilities = [...initialData.trainerAvailabilities];
    this.courses = JSON.parse(JSON.stringify(initialData.courses));
    this.questionBank = [...initialData.questionBank];
    this.quizzes = JSON.parse(JSON.stringify(initialData.quizzes));
    this.quizSubmissions = [...initialData.quizSubmissions];
    this.certificates = [...initialData.certificates];
    this.announcements = [...initialData.announcements];
    this.feedbacks = [...initialData.feedbacks];
    this.moduleProgress = JSON.parse(JSON.stringify(initialData.moduleProgress || {}));
    this.contentLibrary = this._generateInitialContentLibrary();
    this._persist();
  }

  _persist() {
    try {
      const state = {
        organizations: this.organizations,
        departments: this.departments,
        users: this.users,
        competencies: this.competencies,
        trainerCompetencies: this.trainerCompetencies,
        credentials: this.credentials,
        workExperiences: this.workExperiences,
        trainerAvailabilities: this.trainerAvailabilities,
        courses: this.courses,
        questionBank: this.questionBank,
        quizzes: this.quizzes,
        quizSubmissions: this.quizSubmissions,
        certificates: this.certificates,
        announcements: this.announcements,
        feedbacks: this.feedbacks,
        moduleProgress: this.moduleProgress,
        contentLibrary: this.contentLibrary
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("❌ Failed to persist database state:", err.message);
    }
  }

  // ─── Organizations & Departments ───
  getOrganizations() {
    return this.organizations;
  }

  getDepartments(orgId) {
    if (orgId) return this.departments.filter(d => d.organizationId === orgId);
    return this.departments;
  }

  getDepartmentById(id) {
    return this.departments.find(d => d.id === id || d.code === id);
  }

  getDepartmentStats(adminUser) {
    const isDeptAdmin = adminUser?.role === "admin" && adminUser?.adminScope === "DEPARTMENT";
    const allowedDeptId = isDeptAdmin ? adminUser.departmentId : null;

    let depts = this.departments;
    if (allowedDeptId) {
      depts = depts.filter(d => d.id === allowedDeptId || d.code === allowedDeptId);
    }

    return depts.map(dept => {
      const deptUsers = this.users.filter(u => u.departmentId === dept.id || u.department === dept.name);
      const traineesCount = deptUsers.filter(u => u.role === "trainee").length;
      const trainersCount = deptUsers.filter(u => u.role === "trainer").length;
      const pendingCount = deptUsers.filter(u => u.status === "pending").length;
      const deptCourses = this.courses.filter(c => c.departmentId === dept.id || c.department === dept.name);

      return {
        departmentId: dept.id,
        code: dept.code,
        name: dept.name,
        centreName: dept.centreName,
        location: dept.location,
        totalUsers: deptUsers.length,
        traineesCount,
        trainersCount,
        pendingCount,
        coursesCount: deptCourses.length
      };
    });
  }

  // ─── Users & Authentication ───
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByEmployeeId(empId) {
    if (!empId) return null;
    return this.users.find(u => u.employeeId?.toLowerCase() === empId.toLowerCase().trim());
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

    // Find or resolve department
    const dept = this.departments.find(d => 
      d.id === userData.department || 
      d.code === userData.department || 
      d.name.toLowerCase() === (userData.department || "").toLowerCase()
    ) || this.departments[0];

    const newUser = {
      id: userData.id || `u_${userData.role || "trainee"}_${uuidv4().substring(0, 8)}`,
      employeeId: userData.employeeId,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || null,
      passwordHash: userData.passwordHash,
      role: userData.role || "trainee", // strictly trainee or trainer from registration
      organizationId: userData.organizationId || "org_imd_hq",
      departmentId: dept.id,
      department: dept.name,
      designation: userData.designation || "Officer",
      status: "pending", // All new registrations are strictly PENDING
      interests: normalizeArray(userData.interests),
      skills: normalizeArray(userData.skills),
      qualifications: normalizeArray(userData.qualifications),
      experienceNotes: userData.experienceNotes || "",
      specialization: normalizeArray(userData.specialization),
      bio: userData.bio || "",
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this._persist();

    auditService.log({
      action: "USER_REGISTERED",
      actorId: newUser.id,
      actorName: newUser.name,
      actorRole: newUser.role,
      targetEntity: "User",
      targetId: newUser.id,
      details: { email: newUser.email, employeeId: newUser.employeeId, role: newUser.role, department: dept.name },
      organizationId: newUser.organizationId,
      departmentId: newUser.departmentId
    });

    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const formattedUpdates = { ...updates };
    // Never allow sensitive security fields to be altered via normal profile update
    delete formattedUpdates.passwordHash;
    delete formattedUpdates.role;
    delete formattedUpdates.status;
    delete formattedUpdates.adminScope;
    delete formattedUpdates.employeeId;

    this.users[idx] = { ...this.users[idx], ...formattedUpdates, updatedAt: new Date().toISOString() };
    this._persist();
    return this.users[idx];
  }

  getPendingUsers(adminUser) {
    let pending = this.users.filter(u => u.status === "pending");
    if (adminUser && adminUser.role === "admin" && adminUser.adminScope === "DEPARTMENT") {
      pending = pending.filter(u => u.departmentId === adminUser.departmentId || u.department === adminUser.department);
    }
    return pending;
  }

  approveUser(id, approved = true, notes = "", adminUser = null) {
    const user = this.findUserById(id);
    if (!user) return null;

    user.status = approved ? "approved" : "rejected";
    user.approvalNotes = notes;
    user.approvedById = adminUser?.id || "u_admin_1";
    user.approvedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    this._persist();

    auditService.log({
      action: approved ? "USER_APPROVED" : "USER_REJECTED",
      actorId: adminUser?.id || "u_admin_1",
      actorName: adminUser?.name || "Administrator",
      actorRole: "admin",
      targetEntity: "User",
      targetId: user.id,
      details: { userName: user.name, userEmail: user.email, approved, notes },
      organizationId: user.organizationId,
      departmentId: user.departmentId
    });

    return user;
  }

  getAllUsers(filters = {}, adminUser = null) {
    let list = [...this.users];
    
    // Admin scope enforcement
    if (adminUser && adminUser.role === "admin" && adminUser.adminScope === "DEPARTMENT") {
      list = list.filter(u => u.departmentId === adminUser.departmentId || u.department === adminUser.department);
    }

    if (filters.role) list = list.filter(u => u.role === filters.role);
    if (filters.status) list = list.filter(u => u.status === filters.status);
    if (filters.departmentId) list = list.filter(u => u.departmentId === filters.departmentId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.employeeId && u.employeeId.toLowerCase().includes(q))
      );
    }
    return list;
  }

  // ─── Explainable Rule-Based Competency Engine ───
  getCompetencies() {
    return this.competencies;
  }

  getTrainerCompetencies(trainerId) {
    if (trainerId) return this.trainerCompetencies.filter(tc => tc.trainerId === trainerId);
    return this.trainerCompetencies;
  }

  getCredentials(filters = {}) {
    let list = [...this.credentials];
    if (filters.trainerId) list = list.filter(c => c.trainerId === filters.trainerId);
    if (filters.verificationStatus) list = list.filter(c => c.verificationStatus === filters.verificationStatus);
    return list;
  }

  getPendingCredentials(adminUser) {
    let pending = this.credentials.filter(c => c.verificationStatus === "PENDING");
    if (adminUser && adminUser.role === "admin" && adminUser.adminScope === "DEPARTMENT") {
      const deptTrainers = this.users.filter(u => u.role === "trainer" && u.departmentId === adminUser.departmentId).map(u => u.id);
      pending = pending.filter(c => deptTrainers.includes(c.trainerId));
    }
    return pending;
  }

  addCredential(trainerId, credData) {
    const newCred = {
      id: `cred_${uuidv4().substring(0, 8)}`,
      trainerId,
      credentialType: credData.credentialType || "Certification",
      title: credData.title,
      issuer: credData.issuer,
      credentialNumber: credData.credentialNumber || `VER-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: credData.issueDate || new Date().toISOString(),
      expiryDate: credData.expiryDate || null,
      claimedLevel: Number(credData.claimedLevel) || 2,
      documentUrl: credData.documentUrl || "https://example.gov.in/credentials/doc.pdf",
      verificationStatus: "PENDING",
      createdAt: new Date().toISOString()
    };
    this.credentials.unshift(newCred);
    this._persist();

    auditService.log({
      action: "CREDENTIAL_SUBMITTED",
      actorId: trainerId,
      targetEntity: "Credential",
      targetId: newCred.id,
      details: { title: newCred.title, issuer: newCred.issuer }
    });

    return newCred;
  }

  verifyCredential(credId, approved = true, notes = "", adminUser = null) {
    const cred = this.credentials.find(c => c.id === credId);
    if (!cred) return null;

    cred.verificationStatus = approved ? "VERIFIED" : "REJECTED";
    cred.verifiedBy = adminUser?.id || "u_admin_1";
    cred.verifiedAt = new Date().toISOString();
    cred.verificationNotes = notes;
    cred.updatedAt = new Date().toISOString();

    this._persist();

    auditService.log({
      action: approved ? "CREDENTIAL_VERIFIED" : "CREDENTIAL_REJECTED",
      actorId: adminUser?.id || "u_admin_1",
      actorName: adminUser?.name || "Administrator",
      actorRole: "admin",
      targetEntity: "Credential",
      targetId: cred.id,
      details: { title: cred.title, trainerId: cred.trainerId, approved, notes }
    });

    return cred;
  }

  getWorkExperiences(trainerId) {
    if (trainerId) return this.workExperiences.filter(w => w.trainerId === trainerId);
    return this.workExperiences;
  }

  // ─── Explainable 5-Factor Trainer Matching Engine ───
  matchTrainersForCourse({ courseId, subjectName, requiredCompetencyId, requiredLevel = 2 }) {
    const approvedTrainers = this.users.filter(u => u.role === "trainer" && u.status === "approved");

    // Weights configuration:
    // 1. Competency Match = 40%
    // 2. Verified Certification Relevance = 25%
    // 3. Relevant Verified Experience = 20%
    // 4. Past Training Performance / Feedback = 10%
    // 5. Availability & Workload = 5%
    const WEIGHTS = {
      competency: 40,
      certification: 25,
      experience: 20,
      performance: 10,
      availability: 5
    };

    const targetCompetency = this.competencies.find(c => 
      c.id === requiredCompetencyId || 
      c.code === requiredCompetencyId || 
      (subjectName && c.name.toLowerCase().includes(subjectName.toLowerCase()))
    ) || this.competencies[0];

    const results = approvedTrainers.map(trainer => {
      // 1. Competency Assessment
      const trainerComp = this.trainerCompetencies.find(tc => 
        tc.trainerId === trainer.id && 
        tc.competencyId === targetCompetency.id && 
        tc.verificationStatus === "VERIFIED"
      );

      const verifiedCompLevel = trainerComp ? (trainerComp.verifiedLevel || trainerComp.claimedLevel || 1) : 0;
      
      // Mandatory eligibility check:
      const meetsMandatory = verifiedCompLevel >= requiredLevel;

      let compScore = 0;
      if (verifiedCompLevel > 0) {
        compScore = Math.min(WEIGHTS.competency, Math.round((verifiedCompLevel / Math.max(requiredLevel, 4)) * WEIGHTS.competency));
      }

      // 2. Verified Certifications (Higher-level verified credentials get more points)
      const verifiedCreds = this.credentials.filter(c => 
        c.trainerId === trainer.id && 
        c.verificationStatus === "VERIFIED"
      );

      let certScore = 0;
      if (verifiedCreds.length > 0) {
        // Calculate based on highest verified level credential
        const highestCred = Math.max(...verifiedCreds.map(c => c.claimedLevel || 2));
        certScore = Math.min(WEIGHTS.certification, Math.round((highestCred / 4) * WEIGHTS.certification));
      }

      // 3. Relevant Verified Work Experience (Calculated strictly from verified dates)
      const verifiedExps = this.workExperiences.filter(e => 
        e.trainerId === trainer.id && 
        e.verificationStatus === "VERIFIED"
      );

      let totalMonths = 0;
      verifiedExps.forEach(exp => {
        const start = new Date(exp.startDate).getTime();
        const end = exp.endDate ? new Date(exp.endDate).getTime() : Date.now();
        const months = Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30.44));
        totalMonths += months;
      });

      const verifiedExpYears = Number((totalMonths / 12).toFixed(1));
      // 10+ years gives full 20 points
      const expScore = Math.min(WEIGHTS.experience, Math.round((verifiedExpYears / 10) * WEIGHTS.experience));

      // 4. Past Training Feedback / Performance (from feedbacks table)
      const trainerCourses = this.courses.filter(c => c.leadTrainerId === trainer.id).map(c => c.id);
      const trainerFeedbacks = this.feedbacks.filter(f => trainerCourses.includes(f.courseId));
      let perfScore = 8; // base baseline
      if (trainerFeedbacks.length > 0) {
        const avgRating = trainerFeedbacks.reduce((acc, f) => acc + (f.trainerRating || 5), 0) / trainerFeedbacks.length;
        perfScore = Math.min(WEIGHTS.performance, Math.round((avgRating / 5) * WEIGHTS.performance));
      }

      // 5. Availability & Workload
      const availabilityRecord = this.trainerAvailabilities.find(a => a.trainerId === trainer.id && a.status === "available");
      const isAvailable = !!availabilityRecord || true;
      const availScore = isAvailable ? WEIGHTS.availability : 0;

      // Overall Match Score
      const totalMatchScore = compScore + certScore + expScore + perfScore + availScore;

      // Explanation rationale
      const reasons = [];
      if (verifiedCompLevel >= 4) reasons.push(`Expert Level 4 verified in ${targetCompetency.name}`);
      else if (verifiedCompLevel >= 3) reasons.push(`Advanced Level 3 verified in ${targetCompetency.name}`);
      else if (verifiedCompLevel >= 2) reasons.push(`Intermediate Level 2 verified in ${targetCompetency.name}`);

      if (verifiedExpYears > 0) reasons.push(`${verifiedExpYears} years verified operational experience in domain`);
      if (verifiedCreds.length > 0) reasons.push(`${verifiedCreds.length} accredited government credential(s) verified`);
      if (isAvailable) reasons.push("Active availability confirmed for scheduled training cycle");

      if (!meetsMandatory) {
        reasons.unshift(`Does not meet mandatory Level ${requiredLevel} competency requirement`);
      }

      return {
        trainerId: trainer.id,
        name: trainer.name,
        email: trainer.email,
        department: trainer.department,
        designation: trainer.designation,
        avatar: trainer.avatar,
        eligible: meetsMandatory,
        matchScore: meetsMandatory ? totalMatchScore : Math.min(totalMatchScore, 49),
        scoreBreakdown: {
          competency: compScore,
          maxCompetency: WEIGHTS.competency,
          certification: certScore,
          maxCertification: WEIGHTS.certification,
          experience: expScore,
          maxExperience: WEIGHTS.experience,
          performance: perfScore,
          maxPerformance: WEIGHTS.performance,
          availability: availScore,
          maxAvailability: WEIGHTS.availability
        },
        matchedCompetencies: [
          { name: targetCompetency.name, verifiedLevel: verifiedCompLevel, requiredLevel }
        ],
        missingCompetencies: meetsMandatory ? [] : [targetCompetency.name],
        verifiedCredentials: verifiedCreds.map(c => ({ title: c.title, issuer: c.issuer })),
        relevantExperienceYears: verifiedExpYears,
        availability: isAvailable ? "Available" : "Assigned to other batch",
        explanation: reasons.join(" • ")
      };
    }).sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return b.matchScore - a.matchScore;
    });

    return {
      targetCompetency: targetCompetency.name,
      requiredLevel,
      trainers: results
    };
  }

  // ─── Course Management ───
  getCourses() {
    return this.courses;
  }

  getCourseById(id) {
    return this.courses.find(c => c.id === id);
  }

  createCourse(courseData, creatorUser = null) {
    const newCourse = {
      id: courseData.id || `crs_${uuidv4().substring(0, 8)}`,
      code: courseData.code || `MOES-IMD-${Math.floor(100 + Math.random() * 900)}`,
      title: courseData.title,
      category: courseData.category || "Meteorological Sciences",
      level: courseData.level || "Intermediate",
      duration: courseData.duration || "4 Weeks",
      creditHours: Number(courseData.creditHours) || 3,
      organizationId: courseData.organizationId || creatorUser?.organizationId || "org_imd_hq",
      departmentId: courseData.departmentId || creatorUser?.departmentId || "dept_nwp",
      department: courseData.department || creatorUser?.department || "Numerical Weather Prediction Division",
      leadTrainerId: courseData.leadTrainerId || creatorUser?.id || "",
      leadTrainerName: courseData.leadTrainerName || creatorUser?.name || "Assigned Faculty",
      thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800",
      description: courseData.description || "",
      prerequisites: courseData.prerequisites || [],
      enrolledTraineeIds: courseData.enrolledTraineeIds || [],
      competenciesGained: courseData.competenciesGained || [],
      subjects: courseData.subjects || [],
      createdAt: new Date().toISOString()
    };

    this.courses.unshift(newCourse);
    this._persist();

    auditService.log({
      action: "COURSE_CREATED",
      actorId: creatorUser?.id || "u_admin_1",
      actorName: creatorUser?.name || "Administrator",
      actorRole: creatorUser?.role || "admin",
      targetEntity: "Course",
      targetId: newCourse.id,
      details: { title: newCourse.title, code: newCourse.code, department: newCourse.department }
    });

    return newCourse;
  }

  enrollTrainee(courseId, traineeId) {
    const course = this.getCourseById(courseId);
    if (!course) return null;

    const trainee = this.findUserById(traineeId);
    if (!trainee || trainee.status !== "approved" || trainee.role !== "trainee") {
      throw new Error("Only approved trainee accounts are authorized to enroll in courses.");
    }

    if (!course.enrolledTraineeIds) course.enrolledTraineeIds = [];
    if (course.enrolledTraineeIds.includes(traineeId)) {
      return course; // Already enrolled
    }

    course.enrolledTraineeIds.push(traineeId);
    this._persist();

    auditService.log({
      action: "COURSE_ENROLLED",
      actorId: traineeId,
      actorName: trainee.name,
      actorRole: "trainee",
      targetEntity: "Course",
      targetId: course.id,
      details: { courseTitle: course.title, traineeEmail: trainee.email }
    });

    return course;
  }

  // ─── Module Progress ───
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

  getUserProgress(userId) {
    return this.moduleProgress[userId] || {};
  }

  // ─── Question Bank ───
  getQuestions(filter = {}, isTrainerOrAdmin = false) {
    let result = [...this.questionBank];
    if (filter.subjectId) result = result.filter(q => q.subjectId === filter.subjectId);
    if (filter.type) result = result.filter(q => q.type.toLowerCase() === filter.type.toLowerCase());
    if (filter.difficulty) result = result.filter(q => q.difficulty.toLowerCase() === filter.difficulty.toLowerCase());
    if (filter.search) {
      const qLower = filter.search.toLowerCase();
      result = result.filter(q => q.question.toLowerCase().includes(qLower));
    }

    // Trainees should never receive the question bank
    if (!isTrainerOrAdmin) {
      return result.map(({ correctAnswer, explanation, ...safeQ }) => safeQ);
    }
    return result;
  }

  createQuestion(questionData, creatorUser = null) {
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
      explanation: questionData.explanation || "",
      isDraft: !!questionData.isDraft,
      generatedByAI: !!questionData.generatedByAI,
      aiModel: questionData.aiModel || null,
      createdById: creatorUser?.id || null,
      createdAt: new Date().toISOString()
    };

    this.questionBank.unshift(newQ);
    this._persist();
    return newQ;
  }

  duplicateQuestion(id) {
    const q = this.questionBank.find(item => item.id === id);
    if (q) {
      const cloned = { ...q, id: `qb_${uuidv4().substring(0, 8)}`, question: `${q.question} (Copy)`, createdAt: new Date().toISOString() };
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

  // ─── Assessments & Secure Kiosk Execution ───
  getQuizzes(filters = {}) {
    let list = [...this.quizzes];
    if (filters.courseId) list = list.filter(q => q.courseId === filters.courseId);
    if (filters.trainerId) list = list.filter(q => q.trainerId === filters.trainerId);
    return list;
  }

  getQuizById(id, forAttempt = false) {
    const quiz = this.quizzes.find(q => q.id === id);
    if (!quiz) return null;

    // Safe Trainee Assessment DTO (No correct answers or private explanations exposed)
    if (forAttempt) {
      return {
        id: quiz.id,
        title: quiz.title,
        courseId: quiz.courseId,
        courseName: quiz.courseName,
        trainerName: quiz.trainerName,
        department: quiz.department,
        totalMarks: quiz.totalMarks,
        passMarks: quiz.passMarks,
        durationMinutes: quiz.durationMinutes,
        scheduledStartTime: quiz.scheduledStartTime,
        deadlineTime: quiz.deadlineTime,
        isKioskModeRequired: quiz.isKioskModeRequired,
        questions: quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          marks: q.marks || 2,
          type: q.type || "MCQ",
          difficulty: q.difficulty || "Medium"
        }))
      };
    }

    return quiz;
  }

  createQuiz(quizData, creatorUser = null) {
    const newQuiz = {
      id: quizData.id || `quiz_${uuidv4().substring(0, 8)}`,
      title: quizData.title,
      courseId: quizData.courseId,
      courseName: quizData.courseName || "Meteorology Assessment",
      trainerId: creatorUser?.id || quizData.trainerId || "u_trainer_1",
      trainerName: creatorUser?.name || quizData.trainerName || "Lead Faculty",
      department: creatorUser?.department || quizData.department || "India Meteorological Department",
      totalMarks: Number(quizData.totalMarks) || 20,
      passMarks: Number(quizData.passMarks) || 12,
      durationMinutes: Number(quizData.durationMinutes) || 30,
      scheduledStartTime: quizData.scheduledStartTime || new Date().toISOString(),
      deadlineTime: quizData.deadlineTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "published",
      isKioskModeRequired: true,
      maxAttempts: 1,
      questions: quizData.questions || [],
      createdAt: new Date().toISOString()
    };

    this.quizzes.unshift(newQuiz);
    this._persist();
    return newQuiz;
  }

  // ─── Server-Side Graded Quiz Submission ───
  submitQuiz({ quizId, traineeUser, answers = {}, timeTakenSeconds = 600, tabSwitchCount = 0 }) {
    const quiz = this.getQuizById(quizId, false);
    if (!quiz) throw new Error("Assessment not found");

    if (traineeUser.status !== "approved") {
      throw new Error("Only approved officers may submit assessments.");
    }

    // Check duplicate submission
    const existingSubmission = this.quizSubmissions.find(s => s.quizId === quizId && s.traineeId === traineeUser.id);
    if (existingSubmission && (quiz.maxAttempts || 1) <= 1) {
      throw new Error("You have already submitted this assessment. Duplicate submissions are not permitted.");
    }

    // Server-side calculation
    let totalScore = 0;
    quiz.questions.forEach(q => {
      const selected = answers[q.id];
      if (selected !== undefined && Number(selected) === q.correctAnswer) {
        totalScore += (q.marks || 2);
      }
    });

    const totalMarks = quiz.totalMarks || quiz.questions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const percentage = Math.round((totalScore / (totalMarks || 1)) * 100);
    const passed = totalScore >= (quiz.passMarks || (totalMarks * 0.5));

    const verificationCode = `CC-IMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const submission = {
      id: `subm_${uuidv4().substring(0, 8)}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseId: quiz.courseId,
      traineeId: traineeUser.id,
      traineeName: traineeUser.name,
      traineeEmail: traineeUser.email,
      answers,
      score: totalScore,
      totalMarks,
      percentage,
      passed,
      timeTakenSeconds: Number(timeTakenSeconds) || 600,
      tabSwitchCount: Number(tabSwitchCount) || 0,
      submittedAt: new Date().toISOString(),
      gradedBy: "auto",
      resultsPublished: true,
      evaluationStatus: "published",
      trainerFeedback: passed ? "Competency benchmark achieved. Verified performance in operational evaluation." : "Review subject modules before re-evaluation.",
      certificateGenerated: passed,
      certificateId: passed ? `MOES-IMD-CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` : null,
      verificationCode: passed ? verificationCode : null
    };

    this.quizSubmissions.unshift(submission);

    // If passed, register the official Certificate record
    if (passed) {
      const certRecord = {
        id: `cert_${uuidv4().substring(0, 8)}`,
        certificateNumber: submission.certificateId,
        verificationCode: verificationCode,
        traineeId: traineeUser.id,
        traineeName: traineeUser.name,
        courseId: quiz.courseId,
        courseTitle: quiz.courseName || quiz.title,
        issuedAt: new Date().toISOString(),
        issuedBy: "Dr. R. K. Bhattacharya (Director General)",
        status: "VALID"
      };
      this.certificates.unshift(certRecord);

      auditService.log({
        action: "CERTIFICATE_ISSUED",
        actorId: traineeUser.id,
        actorName: traineeUser.name,
        targetEntity: "Certificate",
        targetId: certRecord.id,
        details: { certificateNumber: certRecord.certificateNumber, verificationCode, courseId: quiz.courseId }
      });
    }

    this._persist();
    return submission;
  }

  getSubmissionsForQuiz(quizId) {
    return this.quizSubmissions.filter(s => s.quizId === quizId);
  }

  getSubmissionsForTrainee(traineeId) {
    return this.quizSubmissions.filter(s => s.traineeId === traineeId);
  }

  publishQuizResults(quizId, feedback = "") {
    const quiz = this.getQuizById(quizId, false);
    if (!quiz) return null;
    quiz.resultsPublished = true;
    quiz.publishedAt = new Date().toISOString();

    let updatedCount = 0;
    this.quizSubmissions.forEach(sub => {
      if (sub.quizId === quizId) {
        sub.resultsPublished = true;
        sub.evaluationStatus = "published";
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
    this._persist();
    return sub;
  }

  // ─── Certificates & QR Public Verification ───
  getCertificates(traineeId) {
    if (traineeId) return this.certificates.filter(c => c.traineeId === traineeId);
    return this.certificates;
  }

  getCertificateByVerificationCode(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    return this.certificates.find(c => 
      c.verificationCode?.toUpperCase() === cleanCode || 
      c.certificateNumber?.toUpperCase() === cleanCode
    );
  }

  // ─── Announcements & Feedback ───
  getAnnouncements() {
    return this.announcements;
  }

  createAnnouncement(annData, creatorUser = null) {
    const ann = {
      id: `ann_${uuidv4().substring(0, 8)}`,
      title: annData.title,
      category: annData.category || "General",
      date: new Date().toISOString().split("T")[0],
      urgent: !!annData.urgent,
      content: annData.content,
      author: creatorUser?.name || annData.author || "MoES Directorate",
      createdAt: new Date().toISOString()
    };
    this.announcements.unshift(ann);
    this._persist();
    return ann;
  }

  getFeedbacks(courseId) {
    if (courseId) return this.feedbacks.filter(f => f.courseId === courseId);
    return this.feedbacks;
  }

  addFeedback(fbData, traineeUser = null) {
    const fb = {
      id: `fb_${uuidv4().substring(0, 8)}`,
      courseId: fbData.courseId,
      traineeId: traineeUser?.id || fbData.traineeId,
      traineeName: traineeUser?.name || fbData.traineeName || "Officer",
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

  // ─── Trainer Content Library ───
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
        url: "https://example.gov.in/materials/grid.pptx",
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
        url: "https://example.gov.in/materials/pbl.pdf",
        subject: "Atmospheric Dynamics & Modeling",
        topic: "Planetary Boundary Layer & Mellor-Yamada Closures",
        uploadedBy: "Dr. Amit Sengupta",
        trainerId: "u_trainer_1",
        status: "Published",
        uploadDate: "08 Feb 2026",
        description: "Mathematical notes on 1.5 order and Mellor-Yamada planetary boundary layer closures in mesoscale numerical models.",
        tags: ["PBL Parameterization", "Mellor-Yamada", "Turbulence Closure"],
        downloadAllowed: true
      }
    ];
  }

  getContentLibrary(filters = {}) {
    let list = [...this.contentLibrary];
    if (filters.trainerId) list = list.filter(i => i.trainerId === filters.trainerId);
    if (filters.subject && filters.subject !== "all") {
      list = list.filter(i => i.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    if (filters.type && filters.type !== "all") {
      list = list.filter(i => i.type.toLowerCase() === filters.type.toLowerCase());
    }
    return list;
  }

  createContentLibraryItem(itemData, trainerUser = null) {
    const newItem = {
      id: `lib_${uuidv4().substring(0, 8)}`,
      title: itemData.title,
      type: itemData.type || "pdf",
      format: itemData.format || "PDF Document",
      duration: itemData.duration,
      pages: itemData.pages,
      size: itemData.size || "3.5 MB",
      url: itemData.url || "",
      subject: itemData.subject || "Atmospheric Dynamics & Modeling",
      topic: itemData.topic || "General Meteorological Topic",
      uploadedBy: trainerUser?.name || itemData.uploadedBy || "Faculty Member",
      trainerId: trainerUser?.id || itemData.trainerId || "u_trainer_1",
      status: "Published",
      uploadDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      description: itemData.description || "",
      tags: Array.isArray(itemData.tags) ? itemData.tags : [],
      downloadAllowed: itemData.downloadAllowed !== false
    };

    this.contentLibrary.unshift(newItem);
    this._persist();
    return newItem;
  }

  updateContentLibraryItem(id, itemData) {
    const idx = this.contentLibrary.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.contentLibrary[idx] = { ...this.contentLibrary[idx], ...itemData };
    this._persist();
    return this.contentLibrary[idx];
  }

  deleteContentLibraryItem(id) {
    const initialLen = this.contentLibrary.length;
    this.contentLibrary = this.contentLibrary.filter(i => i.id !== id);
    if (this.contentLibrary.length < initialLen) {
      this._persist();
      return true;
    }
    return false;
  }
}

export const db = new DatabaseStore();
