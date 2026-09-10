import { db } from "../store/dbStore.js";

export const getCompetencyMatrix = (req, res) => {
  try {
    const matrix = db.getCompetencyMatrix();
    return res.json({ success: true, count: matrix.length, matrix });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const suggestTrainersForSubject = (req, res) => {
  try {
    const { subjectName, requiredSkills = [] } = req.body;
    const trainers = db.users.filter(u => u.role === "trainer" && u.status === "approved");

    const scoredTrainers = trainers.map(t => {
      let matchScore = 60; // base score
      const trainerBioAndSkills = (t.specialization || []).concat(t.bio || "").join(" ").toLowerCase();

      if (subjectName) {
        const subWords = subjectName.toLowerCase().split(" ");
        subWords.forEach(word => {
          if (word.length > 3 && trainerBioAndSkills.includes(word)) {
            matchScore += 12;
          }
        });
      }

      matchScore = Math.min(matchScore, 99);

      return {
        trainerId: t.id,
        name: t.name,
        email: t.email,
        department: t.department,
        designation: t.designation,
        specialization: t.specialization,
        experienceYears: t.experienceYears || 10,
        matchScore: matchScore,
        avatar: t.avatar
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true,
      subjectName,
      suggestedTrainers: scoredTrainers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const assignTrainerToCompetency = (req, res) => {
  try {
    const { competencyId } = req.params;
    const { trainerId, trainerName } = req.body;
    const updated = db.assignTrainerToCompetency(competencyId, trainerId, trainerName);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Competency not found" });
    }
    return res.json({ success: true, message: "Trainer mapped to competency domain successfully", competency: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
