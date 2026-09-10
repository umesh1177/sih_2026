import { db } from "../store/dbStore.js";
import { auditService } from "../store/auditService.js";

export const getCompetencyMatrix = (req, res) => {
  try {
    const matrix = db.getCompetencies();
    return res.json({ success: true, count: matrix.length, matrix });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Phase 6: Explainable Rule-Based Competency Engine
export const suggestTrainersForSubject = (req, res) => {
  try {
    const { courseId, subjectName, requiredCompetencyId, requiredLevel } = req.body;
    
    const result = db.matchTrainersForCourse({
      courseId,
      subjectName,
      requiredCompetencyId,
      requiredLevel: Number(requiredLevel) || 2
    });

    return res.json({
      success: true,
      targetCompetency: result.targetCompetency,
      requiredLevel: result.requiredLevel,
      suggestedTrainers: result.trainers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const assignTrainerToCompetency = (req, res) => {
  try {
    const { competencyId } = req.params;
    const { trainerId, courseId } = req.body;

    const trainer = db.findUserById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    auditService.log({
      action: "TRAINER_ASSIGNED",
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: "admin",
      targetEntity: "Competency",
      targetId: competencyId,
      details: { trainerId: trainer.id, trainerName: trainer.name, courseId }
    });

    return res.json({
      success: true,
      message: `Trainer ${trainer.name} successfully assigned to domain!`,
      trainer
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
