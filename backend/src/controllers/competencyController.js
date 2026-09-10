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
    const { subjectName = "", requiredSkills = "", category = "" } = req.body;
    const trainers = db.users.filter(u => u.role === "trainer" && u.status === "approved");

    const scoredTrainers = trainers.map(t => {
      let matchScore = 45; // Base confidence
      const combinedSearch = [
        subjectName,
        typeof requiredSkills === "string" ? requiredSkills : (requiredSkills || []).join(" "),
        category
      ].join(" ").toLowerCase();

      const trainerSkills = [
        ...(t.specialization || []),
        ...(t.skills || []),
        t.department || "",
        t.bio || "",
        t.name || ""
      ].join(" ").toLowerCase();

      // Domain definitions for MoES / IMD Specializations
      const domainKeywords = {
        nwp: ["nwp", "numerical", "wrf", "gfs", "dynamics", "equations", "modeling", "model", "assimilation", "4d-var", "hpc", "fluid", "grid", "arakawa", "primitive", "dispersion", "atmospheric"],
        radar: ["radar", "dwr", "doppler", "polarimetr", "reflectivity", "zdr", "nowcast", "titan", "hydrometeor", "echo", "velocity", "de-alias", "satellite", "insat", "sounder", "radiance", "remote sensing"],
        cyclone: ["cyclone", "cyclogenesis", "storm", "surge", "dvorak", "tropical", "marine", "ocean", "rsmc", "coastal", "inundation", "track", "alipore", "depression", "warning"],
        agri: ["agro", "crop", "agriculture", "fasal", "meghdoot", "drought", "soil", "yield", "advisory", "phenology", "plant"],
        climate: ["climate", "monsoon", "enso", "iod", "teleconnection", "variability", "long-range", "reanalysis", "ipcc", "projection", "seasonal"]
      };

      // Match against domain keywords
      Object.entries(domainKeywords).forEach(([domain, words]) => {
        const hasTopic = words.some(w => combinedSearch.includes(w));
        const hasTrainerSkill = words.some(w => trainerSkills.includes(w));
        if (hasTopic && hasTrainerSkill) {
          matchScore += 45;
        }
      });

      // Individual token matching
      const tokens = combinedSearch.split(/[\s,./\-&]+/).filter(tok => tok.length > 3);
      tokens.forEach(token => {
        if (trainerSkills.includes(token)) {
          matchScore += 10;
        }
      });

      matchScore = Math.min(Math.max(matchScore, 48), 99);

      return {
        trainerId: t.id,
        name: t.name,
        trainerName: t.name,
        email: t.email,
        department: t.department,
        designation: t.designation,
        specialization: t.specialization || [],
        skills: t.skills || t.specialization || [],
        experienceYears: t.experienceYears || 10,
        matchScore: matchScore,
        avatar: t.avatar,
        workloadStatus: t.workloadStatus || "Optimal"
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
