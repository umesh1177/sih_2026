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
    const course = db.enrollTrainee(id, traineeId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, message: "Successfully enrolled in course!", course });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createCourse = (req, res) => {
  try {
    const course = db.createCourse(req.body);
    return res.status(201).json({ success: true, message: "Course created successfully", course });
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

export const getFeedbacks = (req, res) => {
  try {
    const { courseId } = req.query;
    const feedbacks = db.getFeedbacks(courseId);
    return res.json({ success: true, feedbacks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTrainerEnrolledTrainees = (req, res) => {
  try {
    const trainerName = req.query.trainerName || req.user?.name;
    const trainerId = req.query.trainerId || req.user?.id;
    const trainees = db.getEnrolledTraineesForTrainer(trainerName, trainerId);
    return res.json({ success: true, count: trainees.length, trainees });
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

