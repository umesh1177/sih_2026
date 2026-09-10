// AI-Assisted Assessment Question & Summary Drafting Controller
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Curated Domain Question Templates for Rule-Based Generation Fallback
const domainKnowledge = {
  nwp: [
    {
      q: "Which thermodynamic variable is conserved in both dry and moist adiabatic processes without precipitation in NWP models?",
      options: ["Equivalent Potential Temperature (Theta-e)", "Virtual Temperature (Tv)", "Dew Point Temperature (Td)", "Dry Static Energy (s)"],
      correct: 0,
      marks: 3,
      difficulty: "Hard",
      explanation: "Equivalent potential temperature (Theta-e) is conserved during both dry and reversible moist pseudoadiabatic ascents."
    },
    {
      q: "What is the primary function of the Arakawa C-grid staggering utilized in the WRF model?",
      options: ["Staggering velocity components (u, v) at cell faces and mass variables (T, P) at cell centers to optimize gravity wave propagation", "Placing all variables at the cell vertex", "Using hexagonal spherical harmonics", "Eliminating vertical advection"],
      correct: 0,
      marks: 2,
      difficulty: "Medium",
      explanation: "Arakawa C-grid provides optimal dispersion properties for high-resolution gravity waves and boundary layer turbulence."
    },
    {
      q: "In 4D-Var Data Assimilation, what is the role of the Adjoint Model?",
      options: ["To integrate the gradient of the cost function backwards in time to obtain initial condition sensitivities", "To project satellite radiances onto radar beams", "To predict climate over 100 years", "To smooth horizontal topography"],
      correct: 0,
      marks: 4,
      difficulty: "Hard",
      explanation: "The adjoint model integrates sensitivities backwards in time to minimize cost function J with respect to initial state vector x0."
    }
  ],
  radar: [
    {
      q: "In dual-polarization weather radar, what physical property does Differential Reflectivity (ZDR) primarily measure?",
      options: ["The median oblateness/eccentricity of hydrometeors (horizontal vs vertical diameter ratio)", "Total precipitation volume only", "Wind shear speed in knots", "Echo top height above sea level"],
      correct: 0,
      marks: 2,
      difficulty: "Easy",
      explanation: "ZDR = 10 * log10(Zh / Zv), giving direct insight into hydrometeor shapes (large raindrops flatten, creating positive ZDR)."
    },
    {
      q: "What Doppler radar velocity signature indicates an intense downburst / microburst impacting the surface?",
      options: ["Strong low-level radial velocity divergence centered at the precipitation core", "Uniform cyclonic rotation at 10 km altitude", "Pure inbound velocities with zero outbound", "Broad spectrum width without velocity gradient"],
      correct: 0,
      marks: 3,
      difficulty: "Medium",
      explanation: "As the downdraft strikes the ground, it spreads outward horizontally, causing a divergent radial velocity signature near ground level."
    }
  ],
  cyclone: [
    {
      q: "In the Dvorak Tropical Cyclone analysis, what defines the 'Curved Band Pattern' logarithmic spiral angle?",
      options: ["The extent in fractions of 10-degree logarithmic spirals that the dense overcast cloud band wraps around the storm center", "The total diameter of the storm in nautical miles", "The sea surface temperature gradient alone", "The upper tropospheric divergence outflow rate"],
      correct: 0,
      marks: 2,
      difficulty: "Medium",
      explanation: "The curved band pattern measures the degree of band curvature (e.g. 0.5 to 1.5 spirals) to determine the Data T-number."
    }
  ]
};

// Phase 11: AI-Assisted Question Drafting Workflow (Saved as DRAFTS for trainer review)
export const generateQuestionsWithAI = async (req, res) => {
  try {
    const { topic = "Numerical Weather Prediction", difficulty = "Medium", count = 3, module = "Module 1", subjectName = "Atmospheric Sciences" } = req.body;
    const numToGenerate = Math.min(Math.max(Number(count) || 3, 1), 10);

    // If Gemini API Key exists, try calling Gemini 1.5 Flash
    if (GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10) {
      try {
        const promptText = `
You are an expert meteorological exam author for India Meteorological Department (IMD) / MoES.
Generate ${numToGenerate} rigorous, multiple-choice assessment questions on:
Topic: "${topic}"
Subject: "${subjectName}"
Difficulty: "${difficulty}"

Requirements:
- 4 realistic options per question with exactly 1 correct answer (index 0 to 3).
- Provide a detailed pedagogical explanation for why the option is correct.
- Mark each question as draft for trainer review.

Respond strictly with valid JSON array:
[
  {
    "question": "question text",
    "options": ["opt A", "opt B", "opt C", "opt D"],
    "correctAnswer": 0,
    "difficulty": "${difficulty}",
    "explanation": "pedagogical explanation"
  }
]
`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const cleaned = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const draftQuestions = parsed.map((q, idx) => ({
              id: `draft_q_${uuidv4().substring(0, 8)}`,
              question: q.question,
              subjectName: subjectName || "Meteorological Specialization",
              module: module || `Module ${(idx % 3) + 1}`,
              marks: difficulty === "Hard" ? 4 : (difficulty === "Medium" ? 3 : 2),
              type: "MCQ",
              difficulty: q.difficulty || difficulty,
              options: q.options,
              correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 0,
              explanation: q.explanation || "",
              isDraft: true,
              generatedByAI: true,
              sourceEngine: "AI-Assisted Question Drafting (Gemini 1.5 Flash)",
              reviewStatus: "PENDING_TRAINER_APPROVAL"
            }));

            return res.json({
              success: true,
              source: "AI-Assisted Question Drafting (Gemini 1.5 Flash)",
              message: `Drafted ${draftQuestions.length} draft assessment questions for trainer review.`,
              topic,
              difficulty,
              generatedQuestions: draftQuestions
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini question generation fallback:", geminiErr.message);
      }
    }

    // Accurate Heuristic Fallback (Clearly labeled Rule-Based Domain Question Generator)
    const topicLower = topic.toLowerCase();
    let templatePool = domainKnowledge.nwp;
    if (topicLower.includes("radar") || topicLower.includes("dwr")) templatePool = domainKnowledge.radar;
    else if (topicLower.includes("cyclone") || topicLower.includes("storm")) templatePool = domainKnowledge.cyclone;

    const draftQuestions = [];
    for (let i = 0; i < numToGenerate; i++) {
      const template = templatePool[i % templatePool.length];
      const marks = difficulty === "Hard" ? 4 : (difficulty === "Medium" ? 3 : 2);

      draftQuestions.push({
        id: `draft_q_${uuidv4().substring(0, 8)}`,
        question: template.q,
        subjectName: subjectName || "Meteorological Specialization",
        module: module || `Module ${(i % 3) + 1}`,
        marks: marks,
        type: "MCQ",
        difficulty: difficulty || template.difficulty,
        options: [...template.options],
        correctAnswer: template.correct,
        explanation: template.explanation,
        isDraft: true,
        generatedByAI: false,
        sourceEngine: "Rule-Based Domain Question Generator",
        reviewStatus: "PENDING_TRAINER_APPROVAL"
      });
    }

    return res.json({
      success: true,
      source: "Rule-Based Domain Question Generator",
      message: `Generated ${draftQuestions.length} domain assessment drafts for trainer review.`,
      topic,
      difficulty,
      generatedQuestions: draftQuestions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const recommendCoursesWithAI = async (req, res) => {
  try {
    const { traineeProfile, courses } = req.body;
    const user = traineeProfile || req.user || {};
    const availableCourses = courses || [];

    const officerInterests = (user.interests || []).map(i => i.toLowerCase());
    const officerSkills = (user.skills || []).map(s => s.toLowerCase());

    const scoredCourses = availableCourses.map(c => {
      let score = 75;
      const titleLower = c.title.toLowerCase();
      const catLower = c.category.toLowerCase();

      officerInterests.forEach(interest => {
        if (titleLower.includes(interest) || catLower.includes(interest)) score += 12;
      });
      officerSkills.forEach(skill => {
        if (titleLower.includes(skill) || catLower.includes(skill)) score += 8;
      });

      score = Math.min(98, Math.max(80, score));

      return {
        courseId: c.id,
        courseTitle: c.title,
        matchScore: score,
        reason: `Aligns with your specialization in ${c.category} and operational responsibilities at ${user.department || "your meteorological station"}.`,
        careerImpact: `Enhances operational proficiency in ${c.category} forecasting workflows.`,
        skillGapsAddressed: c.prerequisites || ["Operational Forecasting Protocols"]
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

    return res.json({
      success: true,
      source: "Rule-Based Course Recommendation Engine",
      recommendations: scoredCourses
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateMaterialSummaryWithAI = async (req, res) => {
  try {
    const { materialTitle, materialType, courseTitle } = req.body;

    const summary = {
      executiveSummary: `This curriculum material provides technical analysis of atmospheric and meteorological processes in ${courseTitle || "Meteorological Sciences"}.`,
      keyTakeaways: [
        "Mastery of physical equations ensures accurate interpretation of operational numerical forecast output.",
        "Boundary layer and grid parameterizations maintain numerical stability across complex regional topographies.",
        "Strict adherence to IMD standard operating procedures during extreme weather forecasting cycles."
      ],
      coreFormulasAndConcepts: [
        "Hydrostatic Balance: ∂p/∂z = -ρg",
        "CFL Stability Condition: CFL = (u·Δt)/Δx ≤ 1.0"
      ],
      operationalApplications: "Utilized in operational shift weather briefings and nowcasting at IMD meteorological centres.",
      examTips: "Focus on physical coordinate transformations and numerical stability criteria."
    };

    return res.json({
      success: true,
      source: "Rule-Based Domain Summary Engine",
      summary
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
