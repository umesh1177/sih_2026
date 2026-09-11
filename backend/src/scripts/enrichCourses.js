import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./src/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let enrichedCount = 0;

db.courses.forEach(c => {
  if (!Array.isArray(c.subjects)) c.subjects = [];
  c.subjects.forEach((s, sIdx) => {
    if (!Array.isArray(s.modules)) s.modules = [];
    s.modules.forEach((m, mIdx) => {
      if (!Array.isArray(m.materials) || m.materials.length === 0) {
        const subName = s.name || 'Atmospheric Sciences & Modeling';
        const modTitle = m.title || `Module ${mIdx + 1}`;
        const cleanTitle = modTitle.replace(/^Module\s*\d+(\.\d+)?\s*:\s*/i, '');
        
        m.materials = [
          {
            id: `mat_${c.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}_${sIdx + 1}_${mIdx + 1}_v1`,
            title: `Video ${mIdx + 1}: Recorded Masterclass — ${cleanTitle}`,
            type: "video",
            url: "https://www.youtube.com/embed/NRE2up9GxAI",
            duration: "45 mins",
            durationSeconds: 2700,
            allowDownload: false,
            uploadedBy: c.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 15, 2026",
            topic: cleanTitle,
            prerequisiteConfig: {
              enabled: false,
              condition: "ALL",
              requiredWatchThreshold: 80,
              prerequisites: []
            }
          },
          {
            id: `mat_${c.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}_${sIdx + 1}_${mIdx + 1}_ppt`,
            title: `Slide Deck: ${cleanTitle} Operational Presentation Deck (PPT)`,
            type: "presentation",
            pages: 30,
            duration: "30 Slides",
            allowDownload: true,
            uploadedBy: c.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 16, 2026",
            topic: cleanTitle
          },
          {
            id: `mat_${c.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}_${sIdx + 1}_${mIdx + 1}_pdf`,
            title: `Technical Handbook: ${cleanTitle} Formulation & Protocol Guide (PDF)`,
            type: "pdf",
            size: "3.6 MB",
            pages: 22,
            duration: "22 Pages",
            allowDownload: true,
            uploadedBy: c.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 17, 2026",
            topic: cleanTitle
          },
          {
            id: `mat_${c.id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}_${sIdx + 1}_${mIdx + 1}_qz`,
            title: `Video Quiz ${mIdx + 1}: ${cleanTitle} Prerequisite Assessment`,
            type: "quiz",
            duration: "15 mins",
            totalMarks: 10,
            passPercentage: 50,
            allowDownload: false,
            uploadedBy: c.leadTrainerName || "Dr. Amit Sengupta (Lead Trainer, Scientist 'F')",
            uploadedAt: "Uploaded on: Jan 18, 2026",
            topic: cleanTitle,
            questions: [
              {
                id: `q_${sIdx + 1}_${mIdx + 1}_1`,
                question: `In operational weather prediction, what is the core physical governing principle in ${cleanTitle}?`,
                options: [
                  "Courant-Friedrichs-Lewy (CFL) numerical stability & mass conservation",
                  "Unconstrained geostrophic divergence without friction",
                  "Zero vertical motion in non-hydrostatic regime",
                  "Uniform moisture flux across all boundary layers"
                ],
                correctAnswer: 0,
                marks: 5,
                explanation: "Numerical stability and conservation of mass and momentum are fundamental constraints in atmospheric modeling."
              },
              {
                id: `q_${sIdx + 1}_${mIdx + 1}_2`,
                question: `How are diagnostic observations validated in ${cleanTitle}?`,
                options: [
                  "Through standardized IMD NWP and radar verification protocols",
                  "By excluding background error covariances",
                  "Using uncalibrated raw radar noise levels",
                  "Without spatial coordinate transformation"
                ],
                correctAnswer: 0,
                marks: 5,
                explanation: "Operational forecasting workflows require systematic verification against ground observations and sounding profiles."
              }
            ]
          }
        ];
        enrichedCount++;
      }
    });
  });
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Successfully checked all courses! Enriched ${enrichedCount} modules with full Video, PPT, PDF, and Quiz materials.`);
