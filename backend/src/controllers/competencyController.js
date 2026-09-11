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

  // Query is strictly based on what the user typed for this subject
  const queryCombined = [subjectName, requiredSkills, description]
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

  const stopwords = new Set([
    "the", "a", "an", "and", "or", "for", "with", "from", "in", "on", "at", "to", "by", "of",
    "is", "are", "was", "were", "subject", "part", "unit", "chapter", "module", "study",
    "demo", "test", "topic", "session", "lecture"
  ]);

  const rawTokens = queryCombined
    .replace(/[^\w\s\-/]/g, " ")
    .split(/[\s,./\-&]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length >= 2 && !stopwords.has(t));

  const queryTokens = Array.from(new Set(rawTokens));

  const trainerName = String(tw.trainerName || tw.name || "").trim();
  const trainerEmail = String(tw.email || "").trim();

  const trainerSkills = (tw.skills || []).map(s => String(s).trim());
  const trainerSpecs = (tw.specialization || []).map(s => String(s).trim());
  const allSkills = Array.from(new Set([...trainerSkills, ...trainerSpecs])).filter(Boolean);

  const rawCerts = tw.certificates || tw.certifications || tw.matchedCredentials?.certifications || [];
  const certTitles = rawCerts.map(c => typeof c === "string" ? c : (c.title || c.name || "")).filter(Boolean);
  const certIssuers = rawCerts.map(c => typeof c === "object" ? (c.issuer || "") : "").filter(Boolean);

  const rawQuals = tw.qualifications || tw.matchedCredentials?.qualification || [];
  const qualifications = (Array.isArray(rawQuals) ? rawQuals : [rawQuals]).map(q => String(q).trim()).filter(Boolean);

  const designation = String(tw.designation || "");
  const department = String(tw.department || "");
  const bio = String(tw.bio || "");
  const experience = (Array.isArray(tw.experience) ? tw.experience.join(" ") : String(tw.experience || ""));
  const role = String(tw.role || "");

  let matchScore = 0;
  const matchedPills = [];
  const matchedSkills = [];
  const matchedCertificates = [];
  const matchedQualifications = [];
  const matchedExpertise = [];

  // 1. TRAINER NAME / USERNAME MATCH (Direct Match: Up to 80 pts)
  const trainerNameLower = trainerName.toLowerCase();
  const trainerEmailLower = trainerEmail.toLowerCase();
  
  const nameMatched = queryTokens.some(qTok => 
    (qTok.length >= 3 && (trainerNameLower.includes(qTok) || trainerEmailLower.includes(qTok))) ||
    (trainerNameLower.length >= 3 && qTok.includes(trainerNameLower))
  ) || (queryCombined.length >= 3 && (trainerNameLower.includes(queryCombined) || queryCombined.includes(trainerNameLower)));

  if (nameMatched) {
    matchScore += 80;
    matchedPills.push(`Faculty: ${trainerName}`);
  }

  // 2. SKILLS & SPECIALIZATION MATCHING (Top Priority: Up to 50 pts)
  allSkills.forEach(sk => {
    const skLower = sk.toLowerCase();
    const hasSkillOverlap = queryTokens.some(qTok => 
      (qTok.length >= 3 && (skLower.includes(qTok) || qTok.includes(skLower)))
    ) || (queryCombined.length >= 3 && (skLower.includes(queryCombined) || queryCombined.includes(skLower)));

    if (hasSkillOverlap) {
      matchScore += 45;
      matchedSkills.push(sk);
      matchedPills.push(`Skill: ${sk}`);
    }
  });

  // 3. CERTIFICATES MATCHING (High Priority: Up to 35 pts)
  certTitles.forEach((cert, idx) => {
    const certLower = cert.toLowerCase();
    const issuerLower = (certIssuers[idx] || "").toLowerCase();
    const fullCertText = `${certLower} ${issuerLower}`;

    const hasCertOverlap = queryTokens.some(qTok => 
      (qTok.length >= 3 && (fullCertText.includes(qTok) || qTok.includes(certLower)))
    ) || (queryCombined.length >= 3 && fullCertText.includes(queryCombined));

    if (hasCertOverlap) {
      matchScore += 35;
      matchedCertificates.push(cert);
      matchedPills.push(`Cert: ${cert}`);
    }
  });

  // 4. QUALIFICATIONS MATCHING (Factor: Up to 30 pts)
  qualifications.forEach(qual => {
    const qualLower = qual.toLowerCase();
    const hasQualOverlap = queryTokens.some(qTok => 
      (qTok.length >= 3 && qualLower.includes(qTok))
    ) || (queryCombined.length >= 3 && qualLower.includes(queryCombined));

    if (hasQualOverlap) {
      matchScore += 28;
      matchedQualifications.push(qual);
      matchedPills.push(`Qual: ${qual}`);
    }
  });

  // 5. EXPERTISE, DESIGNATION, DEPARTMENT & ROLE MATCHING (Factor: Up to 25 pts)
  const designationLower = designation.toLowerCase();
  const departmentLower = department.toLowerCase();
  const bioLower = `${bio} ${experience} ${role}`.toLowerCase();

  queryTokens.forEach(qTok => {
    if (qTok.length >= 3) {
      if (designationLower.includes(qTok)) {
        matchScore += 20;
        matchedExpertise.push(designation);
        matchedPills.push(`Expertise: ${designation}`);
      } else if (departmentLower.includes(qTok)) {
        matchScore += 15;
        matchedExpertise.push(department);
        matchedPills.push(`Domain: ${department.split(",")[0]}`);
      } else if (bioLower.includes(qTok)) {
        matchScore += 12;
        matchedExpertise.push(qTok);
        matchedPills.push(`Field: ${qTok}`);
      }
    }
  });

  // Clamp score
  if (matchScore <= 0) {
    matchScore = 0;
  } else {
    matchScore = Math.min(Math.max(matchScore, 20), 99);
  }

  const uniquePills = Array.from(new Set(matchedPills)).slice(0, 3);

  let matchLabel = "Low Match";
  if (matchScore >= 80) matchLabel = "Top Recommendation";
  else if (matchScore >= 60) matchLabel = "High Competency Match";
  else if (matchScore >= 35) matchLabel = "Moderate Match";

  return {
    matchScore,
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
