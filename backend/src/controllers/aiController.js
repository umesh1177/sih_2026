// ══════════════════════════════════════════════════════════════════════
// CAPACITY CONNECT AI CONTROLLER (POWERED BY GOOGLE GEMINI)
// ══════════════════════════════════════════════════════════════════════
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { db } from "../store/dbStore.js";

dotenv.config();

// Initialize Google Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Robust Gemini Call Helper using Google GenAI Interactions / Models API
export const callGeminiAI = async (promptText) => {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Google Gemini API Key is missing in environment.");

  // Models to try in priority order
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.6-flash", "gemini-3.8-flash"];

  for (const model of models) {
    try {
      if (ai.models && ai.models.generateContent) {
        const res = await ai.models.generateContent({
          model,
          contents: promptText
        });
        if (res?.text) {
          return { text: res.text, model };
        }
      }
    } catch (err) {
      console.warn(`Models generateContent with ${model} warning:`, err.message);
    }
  }

  throw new Error("Unable to reach Google Gemini API across all model fallbacks.");
};

// Safe JSON Extractor
export const extractJson = (text) => {
  if (!text) return null;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const raw = match ? match[1] : text;
  try {
    return JSON.parse(raw.trim());
  } catch (e) {
    const firstBracket = raw.indexOf("[");
    const lastBracket = raw.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(raw.slice(firstBracket, lastBracket + 1));
      } catch (err) {}
    }
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
      } catch (err) {}
    }
    return null;
  }
};

// Helper: Strict Question Validator (Supports both MCQ and One-Word / Short Answer)
const validateAiQuestion = (q, defaultSubject, defaultTopic, defaultModule, defaultDifficulty, defaultMarks) => {
  if (!q || typeof q !== "object") return null;
  const questionText = typeof q.question === "string" ? q.question.trim() : "";
  if (questionText.length < 5) return null;

  const marks = Number(q.marks) > 0 ? Number(q.marks) : (Number(defaultMarks) > 0 ? Number(defaultMarks) : 3);
  const difficulty = ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : (defaultDifficulty || "Medium");
  const isOneWord = q.type === "one_word" || q.type === "short_answer" || (!q.options && q.expectedAnswer);

  if (isOneWord) {
    const expected = typeof q.expectedAnswer === "string" ? q.expectedAnswer.trim() : (typeof q.correctAnswer === "string" ? q.correctAnswer.trim() : "Standard Term");
    const acceptedAnswers = Array.isArray(q.acceptedAnswers) 
      ? q.acceptedAnswers.map(a => String(a).trim()).filter(Boolean)
      : [expected];

    return {
      id: `ai_q_${uuidv4().substring(0, 8)}`,
      question: questionText,
      subjectName: q.subjectName || defaultSubject || "General Domain",
      module: q.module || defaultModule || "Module 1",
      topic: q.topic || defaultTopic || defaultSubject || "",
      concept: q.concept || "",
      type: "one_word",
      expectedAnswer: expected,
      acceptedAnswers: Array.from(new Set([expected, ...acceptedAnswers])),
      guidanceNote: q.guidanceNote || "Write your answer as a single word or term. Capitalization does not matter.",
      marks,
      difficulty,
      explanation: q.explanation || `Conceptually verified for ${q.topic || defaultTopic || defaultSubject}.`,
      generatedByAI: true
    };
  }

  // Validate exactly 4 options for MCQ
  if (!Array.isArray(q.options) || q.options.length !== 4) return null;
  const options = q.options.map(opt => typeof opt === "string" ? opt.trim() : String(opt || "").trim());
  if (options.some(opt => opt.length === 0)) return null;

  // Check for duplicate options
  const uniqueOptions = new Set(options.map(o => o.toLowerCase()));
  if (uniqueOptions.size !== 4) return null;

  // Validate correctAnswer index
  let correctAnswer = 0;
  if (typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer <= 3) {
    correctAnswer = q.correctAnswer;
  } else if (typeof q.correctAnswer === "string") {
    const parsedIdx = ["a", "b", "c", "d"].indexOf(q.correctAnswer.trim().toLowerCase());
    if (parsedIdx !== -1) correctAnswer = parsedIdx;
  }

  return {
    id: `ai_q_${uuidv4().substring(0, 8)}`,
    question: questionText,
    subjectName: q.subjectName || defaultSubject || "General Domain",
    module: q.module || defaultModule || "Module 1",
    topic: q.topic || defaultTopic || defaultSubject || "",
    concept: q.concept || "",
    type: "mcq",
    options,
    correctAnswer,
    marks,
    difficulty,
    explanation: q.explanation || `Conceptually verified for ${q.topic || defaultTopic || defaultSubject}.`,
    generatedByAI: true
  };
};

// ─── 1. AI MCQ QUESTION GENERATOR (LIVE GEMINI WITH STRICT TOPIC CONTRACT) ───
export const generateQuestionsWithAI = async (req, res) => {
  try {
    const { 
      topic, 
      subjectName, 
      module = "Module 1", 
      concept = "",
      difficulty = "Medium", 
      count = 5 
    } = req.body;

    if (!topic && !subjectName) {
      return res.status(400).json({ 
        success: false, 
        message: "Please specify a valid topic or subject name for question generation." 
      });
    }

    const targetTopic = (topic || subjectName).trim();
    const targetSubject = (subjectName || topic).trim();
    const numToGenerate = Math.min(Math.max(Number(count) || 5, 1), 20);
    const marksPerQ = difficulty === "Hard" ? 4 : difficulty === "Medium" ? 3 : 2;

    const buildPrompt = (isStrictRetry = false) => `
You are a senior domain examination author and subject matter expert.
Generate exactly ${numToGenerate} high-quality, technically rigorous Multiple Choice Questions (MCQs) strictly on:
- Subject: "${targetSubject}"
- Topic / Domain: "${targetTopic}"
${concept ? `- Concept: "${concept}"` : ""}
- Module: "${module}"
- Difficulty Level: "${difficulty}" (Easy, Medium, or Hard)

CRITICAL CONTRACT RULES:
1. Every question MUST be genuinely and directly related to "${targetTopic}" in the field of "${targetSubject}".
2. DO NOT return questions about any other unrelated domains.
3. Provide exactly 4 distinct, mutually exclusive options (Option 0, Option 1, Option 2, Option 3) per question. No duplicate options.
4. "correctAnswer" MUST be an integer between 0 and 3 representing the correct option index.
5. Provide a clear, technically precise explanation justifying the correct answer.
6. Set "marks" to ${marksPerQ}.

${isStrictRetry ? "PREVIOUS ATTEMPT HAD FORMATTING ERRORS. YOU MUST RESPOND WITH RAW VALID JSON ONLY, WITH NO WRAPPERS." : ""}

Respond ONLY with a valid JSON array of objects structured exactly as:
[
  {
    "question": "Question text specifically testing ${targetTopic}...",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": 0,
    "marks": ${marksPerQ},
    "difficulty": "${difficulty}",
    "subjectName": "${targetSubject}",
    "module": "${module}",
    "topic": "${targetTopic}",
    "concept": "${concept || targetTopic}",
    "explanation": "Detailed pedagogical explanation for why the correct answer is right."
  }
]
`;

    let generatedQuestions = [];
    let usedModel = "Google Gemini Flash";

    // Attempt 1: Call Gemini
    try {
      const geminiResult = await callGeminiAI(buildPrompt(false));
      usedModel = geminiResult.model;
      const parsed = extractJson(geminiResult.text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated = parsed
          .map(q => validateAiQuestion(q, targetSubject, targetTopic, module, difficulty, marksPerQ))
          .filter(Boolean);

        if (validated.length > 0) {
          generatedQuestions = validated.slice(0, numToGenerate);
        }
      }
    } catch (err) {
      console.warn("Gemini Attempt 1 failed:", err.message);
    }

    // Attempt 2: Retry once with strict formatting prompt if attempt 1 was empty
    if (generatedQuestions.length === 0) {
      try {
        const retryResult = await callGeminiAI(buildPrompt(true));
        usedModel = retryResult.model;
        const parsed = extractJson(retryResult.text);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed
            .map(q => validateAiQuestion(q, targetSubject, targetTopic, module, difficulty, marksPerQ))
            .filter(Boolean);

          if (validated.length > 0) {
            generatedQuestions = validated.slice(0, numToGenerate);
          }
        }
      } catch (retryErr) {
        console.warn("Gemini Attempt 2 (Retry) failed:", retryErr.message);
      }
    }

    // Strict Contract: If Gemini failed, return error state
    if (generatedQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        message: `AI Question Generation could not generate questions for topic "${targetTopic}". Please verify your topic or try again.`
      });
    }

    return res.json({
      success: true,
      source: `Google Gemini Flash (${usedModel})`,
      topic: targetTopic,
      subjectName: targetSubject,
      difficulty,
      generatedQuestions
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 2. AI COURSE RECOMMENDATION ADVISOR (LIVE GEMINI) ───
export const recommendCoursesWithAI = async (req, res) => {
  try {
    const { traineeProfile, courses } = req.body;
    const user = traineeProfile || req.user || {};

    const dbCourses = db.getCourses ? db.getCourses() : [];
    const allCourses = (Array.isArray(courses) && courses.length > 0) ? courses : dbCourses;

    // Strictly filter out courses in which the trainee is already enrolled
    const userId = user.id || req.user?.id;
    const availableCourses = allCourses.filter(c => {
      if (userId && Array.isArray(c.enrolledTraineeIds) && c.enrolledTraineeIds.includes(userId)) {
        return false;
      }
      if (Array.isArray(user.enrolledCourseIds) && user.enrolledCourseIds.includes(c.id)) {
        return false;
      }
      return true;
    });

    if (!availableCourses || availableCourses.length === 0) {
      return res.json({
        success: true,
        source: "Capacity Connect AI Engine",
        recommendations: [],
        message: "You are already enrolled in all available courses in the catalog!"
      });
    }

    const promptText = `
You are the Chief AI Training Advisor for Capacity Connect Portal.
Analyze this Officer's Profile and recommend the top 3 best matching courses from the available list.

Officer Profile:
- Name: ${user.name || "Trainee Officer"}
- Role / Designation: ${user.designation || "Officer"}
- Department / Centre: ${user.department || "Regional Centre"}
- Current Skills: ${Array.isArray(user.skills) ? user.skills.join(", ") : (user.skills || "Fundamentals")}
- Interests: ${Array.isArray(user.interests) ? user.interests.join(", ") : (user.interests || "Specialized Tracks")}
- Qualifications: ${user.qualifications || "Degree / Professional Certification"}

Available Courses:
${availableCourses.map(c => `- ID: ${c.id} | Title: ${c.title} | Category: ${c.category} | Prerequisites: ${Array.isArray(c.prerequisites) ? c.prerequisites.join(", ") : c.prerequisites}`).join("\n")}

Respond ONLY with a valid JSON array of objects with these exact keys:
[
  {
    "courseId": "string (matching course ID above)",
    "courseTitle": "string",
    "matchScore": number (between 80 and 99),
    "reason": "1-2 sentence compelling justification why this fits the officer's department and skills",
    "careerImpact": "Specific operational benefit",
    "skillGapsAddressed": ["skill 1", "skill 2"]
  }
]
`;

    try {
      const geminiResult = await callGeminiAI(promptText);
      const parsed = extractJson(geminiResult.text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate that recommended course IDs exist in availableCourses
        const validRecs = parsed.filter(r => availableCourses.some(c => c.id === r.courseId));
        if (validRecs.length > 0) {
          return res.json({
            success: true,
            source: `Google Gemini Flash (${geminiResult.model})`,
            recommendations: validRecs
          });
        }
      }
    } catch (apiErr) {
      console.warn("Live Gemini Advisor failed, running dynamic scoring:", apiErr.message);
    }

    // Dynamic Fallback based strictly on officer interests and skills matching actual course titles
    const officerInterests = (user.interests || []).map(i => String(i).toLowerCase());
    const officerSkills = (user.skills || []).map(s => String(s).toLowerCase());

    const scoredCourses = availableCourses.map(c => {
      let score = 75;
      const titleLower = (c.title || "").toLowerCase();
      const catLower = (c.category || "").toLowerCase();

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
        reason: `Directly aligns with your specialization in ${c.category || "this domain"} and supports operational mandates at ${user.department || "your organization"}.`,
        careerImpact: `Enhances your operational capabilities in ${c.category || c.title}.`,
        skillGapsAddressed: c.prerequisites || ["Core Domain Protocols"]
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

    return res.json({
      success: true,
      source: "Capacity Connect AI Engine",
      recommendations: scoredCourses
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 3. AI PATTERN QUESTION SYNTHESIZER (LIVE GEMINI) ───
export const generatePatternQuestionsWithAI = async (req, res) => {
  try {
    const { sampleQuestion, topic, difficulty = "Medium", count = 3 } = req.body;

    if (!sampleQuestion && !topic) {
      return res.status(400).json({
        success: false,
        message: "Please provide a sample question or topic to clone."
      });
    }

    const promptText = `
You are an expert exam question author.
Analyze this sample question pattern and generate ${count} NEW, similar pattern practice questions.

Sample Question:
"${sampleQuestion || `Practice question on ${topic}`}"

Topic / Context: ${topic || "Target Domain"}
Target Difficulty: ${difficulty}

Requirements:
- Preserve the exact conceptual rigor and mathematical/analytical pattern of the sample question.
- Formulate 4 realistic multiple-choice options with exactly 1 correct answer (0-indexed).
- Provide a detailed pedagogical explanation for why the correct option is right.

Respond ONLY with a valid JSON array of objects with these exact keys:
[
  {
    "question": "string (the new question text)",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "difficulty": "${difficulty}",
    "explanation": "Detailed explanation of solution/theory",
    "patternMatch": "Explains similarity to original concept"
  }
]
`;

    try {
      const geminiResult = await callGeminiAI(promptText);
      const parsed = extractJson(geminiResult.text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated = parsed
          .map(q => validateAiQuestion(q, topic, topic, "Module 1", difficulty, 3))
          .filter(Boolean);

        if (validated.length > 0) {
          return res.json({
            success: true,
            source: `Google Gemini Flash (${geminiResult.model})`,
            generatedQuestions: validated.slice(0, count)
          });
        }
      }
    } catch (apiErr) {
      console.warn("Live Gemini pattern generator error:", apiErr.message);
    }

    return res.status(502).json({
      success: false,
      message: "AI Pattern Synthesizer could not generate matching questions. Please try again."
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 4. AI MATERIAL SUMMARY GENERATOR (LIVE GEMINI) ───
export const generateMaterialSummaryWithAI = async (req, res) => {
  try {
    const { materialTitle, materialType, courseTitle, customNotes } = req.body;

    if (!materialTitle && !courseTitle) {
      return res.status(400).json({
        success: false,
        message: "Please provide material title or course title for summary."
      });
    }

    const promptText = `
You are an instructional AI generating structured learning notes for trainees.
Course: "${courseTitle || "Professional Training Track"}"
Material: "${materialTitle || "Core Curriculum"}"
Format: "${materialType || "document"}"
${customNotes ? `Notes: "${customNotes}"` : ""}

Generate a comprehensive pedagogical summary formatted strictly as JSON:
{
  "executiveSummary": "2-3 crisp sentences summarizing the operational importance of this module.",
  "keyTakeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3",
    "Key takeaway point 4"
  ],
  "coreFormulasAndConcepts": [
    "Core formula or algorithmic definition 1",
    "Core formula or algorithmic definition 2"
  ],
  "operationalApplications": "Practical application in operational workflows.",
  "examTips": "Important concept frequently tested in certification examinations."
}
`;

    try {
      const geminiResult = await callGeminiAI(promptText);
      const parsed = extractJson(geminiResult.text);

      if (parsed?.executiveSummary && Array.isArray(parsed?.keyTakeaways)) {
        return res.json({
          success: true,
          source: `Google Gemini Flash (${geminiResult.model})`,
          summary: parsed
        });
      }
    } catch (apiErr) {
      console.warn("Live Gemini Summary error:", apiErr.message);
    }

    return res.status(502).json({
      success: false,
      message: "AI Summary generation temporarily unavailable. Please try again."
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── 5. AI ASSESSMENT QUESTION PAPER SYNTHESIZER (LIVE GEMINI) ───
export const synthesizeAssessmentPaperWithAI = async (req, res) => {
  try {
    const { 
      courseTitle, 
      subjectName, 
      moduleName = "Module 1", 
      topicName, 
      conceptName, 
      questionCount = 5, 
      totalMarks = 20, 
      difficulty = "Medium" 
    } = req.body;

    const targetTopic = (topicName || conceptName || subjectName || "Domain Subject").trim();
    const targetSubject = (subjectName || courseTitle || targetTopic).trim();
    const targetModule = (moduleName || "Module 1").trim();
    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 20);
    const calculatedMarksPerQ = Math.max(1, Math.round((Number(totalMarks) || 20) / count));

    const buildPaperPrompt = (isStrictRetry = false) => `
You are the Senior Faculty Examiner.
Synthesize a complete official examination question paper for trainees strictly on:
- Course: "${courseTitle || targetSubject}"
- Subject: "${targetSubject}"
- Module: "${targetModule}"
- Topic / Concept: "${targetTopic}${conceptName ? ` - ${conceptName}` : ""}"
- Number of Questions: ${count}
- Total Marks: ${totalMarks} (each question approx ${calculatedMarksPerQ} marks)
- Difficulty: "${difficulty}"

CRITICAL CONTRACT RULES:
1. Every question MUST be genuinely and directly related to "${targetTopic}" in "${targetSubject}".
2. DO NOT return questions about unrelated topics.
3. Provide exactly 4 options per question with no duplicate options.
4. "correctAnswer" MUST be an integer between 0 and 3.
5. Provide a clear pedagogical explanation for each question.
6. The sum of all question marks should match approximately ${totalMarks}.

${isStrictRetry ? "PREVIOUS ATTEMPT FAILED PARSING. YOU MUST RESPOND ONLY WITH RAW VALID JSON ARRAY." : ""}

Respond ONLY with a valid JSON array of questions formatted as:
[
  {
    "question": "Question prompt here specifically about ${targetTopic}?",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": 0,
    "marks": ${calculatedMarksPerQ},
    "difficulty": "${difficulty}",
    "subjectName": "${targetSubject}",
    "module": "${targetModule}",
    "topic": "${targetTopic}",
    "explanation": "Detailed explanation of solution"
  }
]
`;

    let generatedQuestions = [];
    let usedModel = "Google Gemini Flash";

    // Attempt 1: Gemini synthesis
    try {
      const geminiResult = await callGeminiAI(buildPaperPrompt(false));
      usedModel = geminiResult.model;
      const parsed = extractJson(geminiResult.text);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated = parsed
          .map(q => validateAiQuestion(q, targetSubject, targetTopic, targetModule, difficulty, calculatedMarksPerQ))
          .filter(Boolean);

        if (validated.length > 0) {
          generatedQuestions = validated.slice(0, count);
        }
      }
    } catch (apiErr) {
      console.warn("Gemini Paper Synthesis Attempt 1 failed:", apiErr.message);
    }

    // Attempt 2: Retry if needed
    if (generatedQuestions.length === 0) {
      try {
        const retryResult = await callGeminiAI(buildPaperPrompt(true));
        usedModel = retryResult.model;
        const parsed = extractJson(retryResult.text);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed
            .map(q => validateAiQuestion(q, targetSubject, targetTopic, targetModule, difficulty, calculatedMarksPerQ))
            .filter(Boolean);

          if (validated.length > 0) {
            generatedQuestions = validated.slice(0, count);
          }
        }
      } catch (retryErr) {
        console.warn("Gemini Paper Synthesis Attempt 2 failed:", retryErr.message);
      }
    }

    // Strict contract: Return error state if Gemini failed — ZERO fake meteorology questions
    if (generatedQuestions.length === 0) {
      return res.status(502).json({
        success: false,
        message: `AI Assessment Paper Synthesis failed for topic "${targetTopic}". Please try again.`
      });
    }

    return res.json({
      success: true,
      source: `Google Gemini Flash (${usedModel})`,
      topic: targetTopic,
      subject: targetSubject,
      questions: generatedQuestions
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
