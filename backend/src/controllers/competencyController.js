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
    const { subjectName = "" } = req.body;
    const rawName = (subjectName || "").trim().toLowerCase();
    const trainers = db.users.filter(u => u.role === "trainer" && u.status === "approved");

    const domainKnowledge = {
      nwp: {
        keywords: ["nwp", "numerical", "wrf", "gfs", "dynamics", "equation", "modeling", "model", "assimilation", "4d-var", "3d-var", "hpc", "arakawa", "primitive", "advection", "baroclinic", "atmospheric dynamics", "grid", "sigma", "continuity", "hydrostatic"],
        coreTrainerName: "Amit Sengupta"
      },
      radar: {
        keywords: ["radar", "dwr", "doppler", "polarimetr", "reflectivity", "zdr", "kdp", "nowcast", "titan", "hydrometeor", "echo", "velocity", "de-alias", "satellite", "insat", "sounder", "radiance", "remote sensing", "microwave", "precipitable", "band"],
        coreTrainerName: "Sunita Kulkarni"
      },
      cyclone: {
        keywords: ["cyclone", "cyclogenesis", "storm", "surge", "dvorak", "tropical", "marine", "ocean", "rsmc", "coastal", "inundation", "track", "alipore", "depression", "sea surface", "bay of bengal", "arabian sea", "cdo", "eye"],
        coreTrainerName: "Rajiv Roy"
      },
      agri: {
        keywords: ["agro", "crop", "agriculture", "fasal", "meghdoot", "drought", "soil", "yield", "advisory", "phenology", "agrometeorology"],
        coreTrainerName: "Sunita Deshmukh"
      },
      climate: {
        keywords: ["climate", "monsoon", "enso", "iod", "teleconnection", "variability", "long-range", "reanalysis", "ipcc", "seasonal", "climatology"],
        coreTrainerName: "Rajesh Pillai"
      }
    };

    const tokens = rawName.split(/[\s,./\-&]+/).filter(tok => tok.length > 2);

    const scoredTrainers = trainers.map(t => {
      let matchScore = 0;
      let directMatches = 0;

      if (rawName && rawName !== "subject title..." && !rawName.match(/^subject\s*\d*$/i)) {
        tokens.forEach(tok => {
          if (!["umesh", "admin", "officer", "scientist", "subject", "part", "test", "demo", "title", "study"].includes(tok)) {
            (t.skills || []).forEach(sk => {
              if (sk.toLowerCase().includes(tok)) directMatches += 2;
            });
            (t.specialization || []).forEach(sp => {
              if (sp.toLowerCase().includes(tok)) directMatches += 2;
            });
          }
        });

        Object.entries(domainKnowledge).forEach(([domain, conf]) => {
          const hasTopicKeyword = conf.keywords.some(kw => rawName.includes(kw));
          const isCoreTrainer = (t.name && conf.coreTrainerName && t.name.toLowerCase().includes(conf.coreTrainerName.toLowerCase()));

          if (hasTopicKeyword && isCoreTrainer) {
            matchScore += 80;
          } else if (hasTopicKeyword) {
            matchScore -= 10;
          }
        });

        if (directMatches > 0) {
          matchScore += directMatches * 10;
        }

        if (matchScore <= 0) {
          matchScore = 0;
        } else {
          matchScore = Math.min(Math.max(matchScore, 10), 99);
        }
      }

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
