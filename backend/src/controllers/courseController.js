import { db } from "../store/dbStore.js";

export const getCourses = (req, res) => {
  try {
    const courses = db.getCourses();
    return res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseById = (req, res) => {
  try {
    const { id } = req.params;
    const course = db.getCourseById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const enrollCourse = (req, res) => {
  try {
    const { id } = req.params;
    const { traineeId } = req.body;
    if (!traineeId) {
      return res.status(400).json({ success: false, message: "Trainee ID is required" });
    }

    // Strict Access Control: Trainee must be approved by Admin
    const user = db.findUserById(traineeId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Trainee profile not found." });
    }

    if (user.role === "trainee" && user.status !== "approved") {
      const statusText = user.status === "rejected" ? "rejected" : "pending review";
      const rejectionNote = user.rejectionReason ? ` Reason: "${user.rejectionReason}"` : "";
      return res.status(403).json({
        success: false,
        message: `Course enrollment restricted. Your officer profile is currently ${statusText}.${rejectionNote} Only MoES verified officers with Administrative Approval can enroll in operational programs.`,
        userStatus: user.status,
        rejectionReason: user.rejectionReason || null
      });
    }

    // Max enrollment capacity check
    const existingCourse = db.getCourseById(id);
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    const maxCapacity = existingCourse.maxEnrollment || 50;
    if ((existingCourse.enrolledTraineeIds || []).length >= maxCapacity && !existingCourse.enrolledTraineeIds?.includes(traineeId)) {
      return res.status(400).json({
        success: false,
        message: `Course batch capacity limit (${maxCapacity} cadets) has been reached. Please contact administration for waitlist.`
      });
    }

    const course = db.enrollTrainee(id, traineeId);
    return res.json({ success: true, message: "Successfully enrolled in course!", course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCourse = (req, res) => {
  try {
    const course = db.createCourse(req.body);
    return res.status(201).json({ success: true, message: "Course published and notification broadcast to all officers successfully!", course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCourse = (req, res) => {
  try {
    const { id } = req.params;
    const course = db.updateCourse(id, req.body);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, message: "Course updated successfully!", course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const removeTraineeFromCourse = (req, res) => {
  try {
    const { id, traineeId } = req.params;
    const course = db.removeTraineeFromCourse(id, traineeId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, message: "Trainee removed from course enrollment list.", course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrainersWorkload = (req, res) => {
  try {
    const workloads = db.getTrainersWorkload();
    return res.json({ success: true, count: workloads.length, workloads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateBulkCertificates = (req, res) => {
  try {
    const { id } = req.params;
    const result = db.generateBulkCertificates(id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({
      success: true,
      message: `Bulk certification completed! Generated and issued ${result.count ?? result.totalIssued ?? 0} accredited certificates for trainees.`,
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadLearningMaterial = (req, res) => {
  try {
    const { courseId, subjectId, moduleId } = req.params;
    const materialData = req.body;
    const material = db.addMaterialToModule(courseId, subjectId, moduleId, materialData);
    if (!material) {
      return res.status(404).json({ success: false, message: "Course, Subject or Module not found" });
    }
    return res.status(201).json({
      success: true,
      message: "Material added to module successfully with download permissions set.",
      material
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addModuleToSubject = (req, res) => {
  try {
    const { courseId, subjectId } = req.params;
    const moduleData = req.body;
    const newMod = db.addModuleToSubject(courseId, subjectId, moduleData);
    if (!newMod) {
      return res.status(404).json({ success: false, message: "Course or Subject not found" });
    }
    return res.status(201).json({
      success: true,
      message: "New curriculum module created successfully!",
      module: newMod
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteModuleFromSubject = (req, res) => {
  try {
    const { courseId, subjectId, moduleId } = req.params;
    const removed = db.deleteModuleFromSubject(courseId, subjectId, moduleId);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Module not found in subject" });
    }
    return res.json({
      success: true,
      message: "Module removed from subject successfully."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteLearningMaterial = (req, res) => {
  try {
    const { courseId, subjectId, moduleId, materialId } = req.params;
    const removed = db.removeMaterialFromModule(courseId, subjectId, moduleId, materialId);
    if (!removed) {
      return res.status(404).json({ success: false, message: "Material not found in module" });
    }
    return res.json({
      success: true,
      message: "Material removed from module successfully."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrainerEnrolledTrainees = (req, res) => {
  try {
    let trainerName = req.query.trainerName;
    let trainerId = req.query.trainerId;
    if (!trainerName && !trainerId && req.user?.role === "trainer") {
      trainerName = req.user?.name;
      trainerId = req.user?.id;
    }
    const { courseId } = req.query;
    const trainees = db.getEnrolledTraineesForTrainer(trainerName, trainerId, courseId);
    return res.json({ success: true, count: trainees.length, trainees });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseEnrolledTrainees = (req, res) => {
  try {
    const { id } = req.params;
    let trainerName = req.user?.role === "trainer" ? req.user?.name : null;
    let trainerId = req.user?.role === "trainer" ? req.user?.id : null;
    const trainees = db.getEnrolledTraineesForTrainer(trainerName, trainerId, id);
    return res.json({ success: true, count: trainees.length, trainees });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCourseTrainerPerformance = (req, res) => {
  try {
    const { id } = req.params;
    const analytics = db.getCoursePerformanceAndTrainerAnalytics(id);
    if (!analytics) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, analytics });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeedbacks = (req, res) => {
  try {
    const { courseId } = req.query;
    const feedbacks = db.getFeedbacks(courseId);
    return res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const submitFeedback = (req, res) => {
  try {
    const fb = db.addFeedback(req.body);
    return res.status(201).json({ success: true, message: "Feedback submitted successfully!", feedback: fb });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Trainer Content Library Handlers ---
export const getContentLibrary = (req, res) => {
  try {
    const { trainerId, trainerName, subject, subjectId, type, status, search } = req.query;
    const items = db.getContentLibrary({ trainerId, trainerName, subject: subject || subjectId, type, status, search });
    return res.json({ success: true, count: items.length, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createContentLibraryItem = (req, res) => {
  try {
    const itemData = req.body;
    const newItem = db.createContentLibraryItem(itemData);
    return res.status(201).json({ success: true, message: "Material successfully added to Content Library!", item: newItem });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateContentLibraryItem = (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateContentLibraryItem(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Library item not found" });
    }
    return res.json({ success: true, message: "Material metadata updated successfully!", item: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteContentLibraryItem = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteContentLibraryItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Library item not found" });
    }
    return res.json({ success: true, message: "Material removed from Content Library!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const attachContentLibraryItem = (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, subjectId, moduleId } = req.body;
    const attached = db.attachContentToSubjectModule(id, courseId, subjectId, moduleId);
    if (!attached) {
      return res.status(400).json({ success: false, message: "Failed to map content item to course/module" });
    }
    return res.json({ success: true, message: "Material mapped to subject module successfully!" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Public Certificate Verification Controller ---
export const verifyCertificate = (req, res) => {
  try {
    const query = req.params.certId || req.body.query || req.query.id || req.query.verify;
    if (!query) {
      return res.status(400).json({ success: false, message: "Please enter a Certificate ID or URL to verify." });
    }
    const cert = db.verifyCertificate(query);
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "No certificate record found matching this credential identifier. Please check the Certificate ID."
      });
    }
    return res.json({
      success: true,
      certificate: cert
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};



