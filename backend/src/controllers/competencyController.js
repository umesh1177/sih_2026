import { db } from "../store/dbStore.js";

export const getCompetencyMatrix = (req, res) => {
  try {
    const matrix = db.getCompetencyMatrix();
    return res.json({ success: true, count: matrix.length, matrix });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const calculateTrainerCompetencyMatch = (tw, queryData) => {
  const subjectName = typeof queryData === "string" ? queryData : (queryData?.name || queryData?.title || queryData?.subjectName || "");
  const requiredSkills = typeof queryData === "object" ? (queryData?.requiredSkills || "") : "";
  const description = typeof queryData === "object" ? (queryData?.description || "") : "";
  const category = (typeof queryData === "object" && !subjectName) ? (queryData?.category || "") : "";

  // The query is strictly based on what is typed for this specific subject
  const queryCombined = [subjectName, requiredSkills, description, category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim();

  // If query is blank or generic default placeholder
  if (!queryCombined || queryCombined === "subject title..." || queryCombined.match(/^subject\s*\d*$/i)) {
    return {
      matchScore: 0,
      matchLabel: "Enter Subject Title",
      matchedPills: [],
      matchedSkills: [],
      matchedCertificates: [],
      matchedQualifications: [],
      matchedExpertise: []
    };
  }

  // Meteorological Domain Taxonomy for high-precision differentiation
  const DOMAINS = {
    NWP: {
      terms: ["nwp", "numerical", "wrf", "data assimilation", "4d-var", "governing equations", "grid", "arakawa", "simulation", "atmospheric dynamics", "equations", "physics", "modeling", "mathematical"],
      primaryTrainer: "Amit Sengupta"
    },
    RADAR: {
      terms: ["radar", "doppler", "dwr", "polarimetry", "dual-pol", "nowcasting", "mesocyclone", "reflectivity", "z-r", "convection", "echo"],
      primaryTrainer: "Meenakshi Roy"
    },
    CYCLONE: {
      terms: ["cyclone", "cyclogenesis", "tropical", "dvorak", "storm track", "central pressure", "eye", "depression", "warning"],
      primaryTrainer: "Rajesh Kumar Sharma"
    },
    MARINE: {
      terms: ["marine", "ocean", "storm surge", "wave", "coastal", "adcirc", "inundation", "hydrodynamic", "sea surface"],
      primaryTrainer: "Rajiv Roy"
    },
    AGROMET: {
      terms: ["agro", "agrometeorology", "crop", "fasal", "soil moisture", "evapotranspiration", "drought", "phenology", "agriculture", "farmer"],
      primaryTrainer: "Ananya Mukherjee"
    },
    SATELLITE: {
      terms: ["satellite", "insat", "insat-3dr", "sounder", "radiance", "infrared", "visible", "water vapor", "remote sensing", "geostationary"],
      primaryTrainer: "Vikram Rathore"
    }
  };

  const GENERIC_COMMON_WORDS = new Set(["data", "modeling", "dynamics", "prediction", "analysis", "system", "science", "meteorology", "study", "principles", "basics", "core", "theory", "part", "unit", "overview"]);

  const stopwords = new Set([
    "the", "a", "an", "and", "or", "for", "with", "from", "in", "on", "at", "to", "by", "of",
    "is", "are", "was", "were", "subject", "chapter", "module", "demo", "test", "topic", "session", "lecture"
  ]);

  const rawTokens = queryCombined
    .replace(/[^\w\s\-/]/g, " ")
    .split(/[\s,./\-&]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length >= 2 && !stopwords.has(t));

  const queryTokens = Array.from(new Set(rawTokens));

  const trainerSkills = (tw.skills || []).map(s => String(s).trim());
  const trainerSpecs = (tw.specialization || []).map(s => String(s).trim());
  const allSkills = Array.from(new Set([...trainerSkills, ...trainerSpecs])).filter(Boolean);

  const rawCerts = tw.certificates || tw.certifications || tw.matchedCredentials?.certifications || [];
  const certTitles = rawCerts.map(c => typeof c === "string" ? c : (c.title || c.name || "")).filter(Boolean);

  const rawQuals = tw.qualifications || tw.matchedCredentials?.qualification || [];
  const qualifications = (Array.isArray(rawQuals) ? rawQuals : [rawQuals]).map(q => String(q).trim()).filter(Boolean);

  const designation = String(tw.designation || "");
  const department = String(tw.department || "");

  let rawScore = 0;
  const matchedPills = [];
  const matchedSkills = [];
  const matchedCertificates = [];
  const matchedQualifications = [];
  const matchedExpertise = [];

  // 1. Skill & Specialization Matching (Weight ~ 45%)
  allSkills.forEach(sk => {
    const skLower = sk.toLowerCase();
    if (queryCombined.includes(skLower) || skLower.includes(queryCombined)) {
      rawScore += 35;
      matchedSkills.push(sk);
      matchedPills.push(`Skill: ${sk}`);
    } else {
      const matchingTokens = queryTokens.filter(qTok => 
        qTok.length >= 3 && skLower.includes(qTok)
      );
      if (matchingTokens.length > 0) {
        const points = matchingTokens.reduce((acc, tok) => acc + (GENERIC_COMMON_WORDS.has(tok) ? 4 : 14), 0);
        rawScore += Math.min(points, 25);
        matchedSkills.push(sk);
        matchedPills.push(`Skill: ${sk}`);
      }
    }
  });

  // 2. Certificates & Professional Accreditations Matching (Weight ~ 25%)
  certTitles.forEach(cert => {
    const certLower = cert.toLowerCase();
    if (queryCombined.includes(certLower) || certLower.includes(queryCombined)) {
      rawScore += 25;
      matchedCertificates.push(cert);
      matchedPills.push(`Cert: ${cert}`);
    } else {
      const matchingTokens = queryTokens.filter(qTok => 
        qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok) && certLower.includes(qTok)
      );
      if (matchingTokens.length > 0) {
        rawScore += Math.min(matchingTokens.length * 15, 25);
        matchedCertificates.push(cert);
        matchedPills.push(`Cert: ${cert}`);
      }
    }
  });

  // 3. Qualifications & Academic Degrees Alignment (Weight ~ 15%)
  const qualLower = qualifications.join(" ").toLowerCase();
  queryTokens.forEach(qTok => {
    if (qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok)) {
      if (qualLower.includes(qTok)) {
        rawScore += 12;
        matchedQualifications.push(qTok);
        matchedPills.push(`Qual: ${qTok}`);
      }
    }
  });

  // 4. Role & Departmental Operational Mandate (Weight ~ 15%)
  const desigLower = designation.toLowerCase();
  const deptLower = department.toLowerCase();
  queryTokens.forEach(qTok => {
    if (qTok.length >= 3 && !GENERIC_COMMON_WORDS.has(qTok)) {
      if (desigLower.includes(qTok)) {
        rawScore += 14;
        matchedExpertise.push(designation);
        matchedPills.push(`Role: ${designation.split("&")[0].trim()}`);
      } else if (deptLower.includes(qTok)) {
        rawScore += 10;
        matchedExpertise.push(department.split(",")[0]);
        matchedPills.push(`Dept: ${department.split(",")[0]}`);
      }
    }
  });

  // If there are zero matching skills, certs, qualifications, or roles, return 0% match:
  if (rawScore === 0) {
    return {
      matchScore: 0,
      matchLabel: "No Competency Match",
      matchedPills: [],
      matchedSkills: [],
      matchedCertificates: [],
      matchedQualifications: [],
      matchedExpertise: []
    };
  }

  // 5. Workload & Availability Factor Adjustment
  if (tw.workloadLevel === "High" || tw.recommendationTone === "warning") {
    rawScore -= 4; // Overburdened faculty penalty
  } else if (tw.workloadLevel === "Optimal" || tw.declaredAvailability === "Full-Time") {
    rawScore += 3; // Optimal availability bonus
  }
  if (tw.isColdStart && rawScore >= 30) {
    rawScore += 2; // Cold-start credential matching bonus
  }

  // Normalize final percentage based on authenticated competency metrics
  let finalScore = 0;
  if (rawScore > 0) {
    if (rawScore >= 70) {
      finalScore = Math.min(98, 90 + Math.round((rawScore - 70) * 0.35));
    } else if (rawScore >= 40) {
      finalScore = 70 + Math.round((rawScore - 40) * 0.65);
    } else if (rawScore >= 18) {
      finalScore = 40 + Math.round((rawScore - 18) * 1.1);
    } else {
      finalScore = Math.max(12, Math.min(35, rawScore * 2));
    }
  }

  const uniquePills = Array.from(new Set(matchedPills)).slice(0, 3);
  let matchLabel = "Low Match";
  if (finalScore >= 85) matchLabel = "Top Recommendation";
  else if (finalScore >= 65) matchLabel = "High Competency Match";
  else if (finalScore >= 40) matchLabel = "Moderate Match";

  return {
    matchScore: finalScore,
    matchLabel,
    matchedPills: uniquePills,
    matchedSkills: Array.from(new Set(matchedSkills)),
    matchedCertificates: Array.from(new Set(matchedCertificates)),
    matchedQualifications: Array.from(new Set(matchedQualifications)),
    matchedExpertise: Array.from(new Set(matchedExpertise))
  };
};

export const suggestTrainersForSubject = (req, res) => {
  try {
    const { subjectName = "", requiredSkills = "", description = "", category = "" } = req.body;
    
    // Get full workload and cold-start metadata from db
    const workloads = db.getTrainersWorkload();

    const scoredTrainers = workloads.map(tw => {
      const matchResult = calculateTrainerCompetencyMatch(tw, {
        name: subjectName,
        requiredSkills,
        description,
        category
      });

      const { matchScore, matchLabel, matchedPills, matchedSkills, matchedCertificates, matchedQualifications } = matchResult;

      // Re-evaluate final recommendation with dynamic subject match score
      let adjustedRec = tw.finalRecommendation;
      let adjustedBadge = tw.recommendationBadge;

      if (matchScore >= 70 && tw.workloadLevel === "High") {
        adjustedRec = "Consider with workload warning";
        adjustedBadge = "⚠ Consider with workload warning";
      } else if (matchScore >= 70 && tw.isColdStart) {
        adjustedRec = "Eligible New Faculty (Cold-Start Matched)";
        adjustedBadge = "🌱 Matched on Credentials (Cold-Start)";
      } else if (matchScore >= 70 && tw.workloadLevel === "Optimal") {
        adjustedRec = "Highly Recommended (Optimal Availability)";
        adjustedBadge = "🌟 Highly Recommended";
      }

      return {
        ...tw,
        name: tw.trainerName,
        matchScore,
        matchLabel,
        matchedPills,
        matchedSkills,
        matchedCertificates,
        matchedQualifications,
        finalRecommendation: adjustedRec,
        recommendationBadge: adjustedBadge
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
