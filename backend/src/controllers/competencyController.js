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
  const category = typeof queryData === "object" ? (queryData?.category || "") : "";

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

  const stopwords = new Set([
    "the", "and", "for", "with", "from", "part", "unit", "chapter", "module", "study",
    "subject", "demo", "test", "basic", "basics", "intro", "introduction", "advanced",
    "overview", "general", "specialized", "course", "topic", "session", "lecture",
    "admin", "umesh", "officer", "cadre", "year", "years"
  ]);

  const rawTokens = queryCombined
    .replace(/[^\w\s\-/]/g, " ")
    .split(/[\s,./\-&]+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length >= 3 && !stopwords.has(t));

  const queryTokens = Array.from(new Set(rawTokens));

  const trainerSkills = (tw.skills || []).map(s => String(s).trim());
  const trainerSpecs = (tw.specialization || []).map(s => String(s).trim());
  const allSkills = Array.from(new Set([...trainerSkills, ...trainerSpecs])).filter(Boolean);

  const rawCerts = tw.certificates || tw.certifications || tw.matchedCredentials?.certifications || [];
  const certTitles = rawCerts.map(c => typeof c === "string" ? c : (c.title || c.name || "")).filter(Boolean);
  const certIssuers = rawCerts.map(c => typeof c === "object" ? (c.issuer || "") : "").filter(Boolean);

  const rawQuals = tw.qualifications || tw.matchedCredentials?.qualification || [];
  const qualifications = (Array.isArray(rawQuals) ? rawQuals : [rawQuals]).map(q => String(q).trim()).filter(Boolean);

  const designation = tw.designation || "";
  const department = tw.department || "";
  const bio = tw.bio || "";
  const experience = (Array.isArray(tw.experience) ? tw.experience.join(" ") : String(tw.experience || ""));
  const role = tw.role || "";

  let matchScore = 0;
  const matchedPills = [];
  const matchedSkills = [];
  const matchedCertificates = [];
  const matchedQualifications = [];
  const matchedExpertise = [];

  const subjectNameLower = subjectName.toLowerCase();

  // 1. SKILLS & SPECIALIZATION MATCHING (Top Factor: 45-50 pts)
  allSkills.forEach(sk => {
    const skLower = sk.toLowerCase();
    if (queryCombined.includes(skLower) || (skLower.length >= 4 && subjectNameLower.includes(skLower))) {
      matchScore += 45;
      matchedSkills.push(sk);
      matchedPills.push(`Skill: ${sk}`);
    } else if (skLower.includes(subjectNameLower) && subjectNameLower.length >= 4) {
      matchScore += 40;
      matchedSkills.push(sk);
      matchedPills.push(`Skill: ${sk}`);
    } else {
      const skTokens = skLower.split(/[\s,./\-&]+/).filter(t => t.length >= 3 && !stopwords.has(t));
      const hasOverlap = queryTokens.some(qTok => skTokens.some(sTok => sTok.includes(qTok) || qTok.includes(sTok)));
      if (hasOverlap) {
        matchScore += 25;
        matchedSkills.push(sk);
        matchedPills.push(`Skill: ${sk}`);
      }
    }
  });

  // 2. CERTIFICATES MATCHING (High Factor: 25-35 pts)
  certTitles.forEach((cert, idx) => {
    const certLower = cert.toLowerCase();
    const issuerLower = (certIssuers[idx] || "").toLowerCase();

    if (queryCombined.includes(certLower) || (certLower.length >= 5 && subjectNameLower.includes(certLower))) {
      matchScore += 35;
      matchedCertificates.push(cert);
      matchedPills.push(`Cert: ${cert}`);
    } else {
      const certTokens = `${certLower} ${issuerLower}`.split(/[\s,./\-&]+/).filter(t => t.length >= 3 && !stopwords.has(t));
      const hasOverlap = queryTokens.some(qTok => certTokens.some(cTok => cTok.includes(qTok) || qTok.includes(cTok)));
      if (hasOverlap) {
        matchScore += 22;
        matchedCertificates.push(cert);
        matchedPills.push(`Cert: ${cert}`);
      }
    }
  });

  // 3. QUALIFICATIONS MATCHING (Factor: 20-30 pts)
  qualifications.forEach(qual => {
    const qualLower = qual.toLowerCase();
    if (queryCombined.includes(qualLower) || (qualLower.length >= 5 && subjectNameLower.includes(qualLower))) {
      matchScore += 28;
      matchedQualifications.push(qual);
      matchedPills.push(`Qual: ${qual}`);
    } else {
      const qualTokens = qualLower.split(/[\s,./\-&]+/).filter(t => t.length >= 3 && !stopwords.has(t));
      const hasOverlap = queryTokens.some(qTok => qualTokens.some(quTok => quTok.includes(qTok) || qTok.includes(quTok)));
      if (hasOverlap) {
        matchScore += 18;
        matchedQualifications.push(qual);
        matchedPills.push(`Qual: ${qual}`);
      }
    }
  });

  // 4. EXPERTISE, DESIGNATION, DEPARTMENT, ROLE, BIO & EXPERIENCE MATCHING (Factor: 15-25 pts)
  const profileBioText = `${designation} ${department} ${bio} ${experience} ${role}`.toLowerCase();
  queryTokens.forEach(qTok => {
    if (profileBioText.includes(qTok)) {
      matchScore += 12;
      if (!matchedExpertise.includes(qTok)) {
        matchedExpertise.push(qTok);
        if (designation.toLowerCase().includes(qTok)) {
          matchedPills.push(`Expertise: ${designation}`);
        } else if (department.toLowerCase().includes(qTok)) {
          matchedPills.push(`Domain: ${department.split(",")[0]}`);
        }
      }
    }
  });

  // 5. DOMAIN KNOWLEDGE SYNONYMS / METEOROLOGY EXPANSION (Synergy Boost: +15 pts)
  const synonyms = {
    nwp: ["wrf", "gfs", "numerical", "modeling", "dynamics", "equation", "assimilation", "4d-var", "3d-var", "hpc", "atmospheric"],
    radar: ["dwr", "doppler", "reflectivity", "zdr", "kdp", "nowcast", "echo", "hydrometeor", "dual-pol"],
    satellite: ["insat", "radiance", "sounder", "sounding", "remote sensing", "microwave", "imagery", "rgb"],
    cyclone: ["storm", "surge", "cyclogenesis", "tropical", "marine", "ocean", "rsmc", "typhoon", "coastal"],
    agri: ["crop", "agriculture", "fasal", "soil", "drought", "agrometeorology", "yield", "monsoon"],
    climate: ["monsoon", "enso", "iod", "teleconnection", "cmip", "climatology", "reanalysis", "ipcc"],
    seismology: ["earthquake", "seismic", "geophysics", "fault", "tremor", "ground motion", "tsunami"]
  };

  Object.values(synonyms).forEach(synGroup => {
    const queryHasGroup = synGroup.some(w => queryCombined.includes(w));
    const trainerHasGroup = synGroup.some(w => 
      allSkills.some(s => s.toLowerCase().includes(w)) ||
      certTitles.some(c => c.toLowerCase().includes(w)) ||
      qualifications.some(q => q.toLowerCase().includes(w)) ||
      profileBioText.includes(w)
    );
    if (queryHasGroup && trainerHasGroup) {
      matchScore += 15;
    }
  });

  // Clamp & normalize final score
  if (matchScore <= 0) {
    matchScore = 0;
  } else {
    matchScore = Math.min(Math.max(matchScore, 15), 99);
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
