// Updates mockData.js and db.json with 55+ items across all collections
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../src/data/db.json");
const MOCK_FILE = path.join(__dirname, "../src/data/mockData.js");

const stations = [
  "IMD HQ Mausam Bhawan, New Delhi",
  "National Weather Forecasting Centre, New Delhi",
  "Regional Meteorological Centre, Mumbai",
  "Regional Meteorological Centre, Kolkata",
  "Regional Meteorological Centre, Chennai",
  "Regional Meteorological Centre, Guwahati",
  "Meteorological Centre, Pune",
  "Meteorological Centre, Jaipur",
  "Cyclone Warning Centre, Visakhapatnam",
  "Meteorological Centre, Hyderabad",
  "Meteorological Centre, Ahmedabad",
  "Meteorological Centre, Lucknow",
  "Meteorological Centre, Thiruvananthapuram",
  "Meteorological Centre, Bhubaneswar",
  "Meteorological Centre, Patna",
  "Meteorological Centre, Bhopal",
  "Meteorological Centre, Srinagar",
  "Meteorological Centre, Shimla",
  "Meteorological Centre, Chandigarh",
  "Meteorological Centre, Dehradun",
  "Meteorological Centre, Raipur",
  "Meteorological Centre, Ranchi",
  "Meteorological Centre, Agartala",
  "Meteorological Centre, Imphal",
  "Meteorological Centre, Port Blair"
];

const indianFirstNames = [
  "Rahul", "Priya", "Arjun", "Meena", "Kiran", "Nandita", "Suresh", "Aniket", "Divya", "Vikas",
  "Sneha", "Aditya", "Pooja", "Manish", "Ananya", "Rohan", "Kavita", "Deepak", "Swati", "Gaurav",
  "Ritika", "Abhishek", "Shreya", "Naveen", "Tanvi", "Siddharth", "Preeti", "Kartik", "Pallavi", "Alok",
  "Neelam", "Varun", "Sunita", "Harish", "Shalini", "Rajesh", "Monika", "Tarun", "Bhavna", "Prashant",
  "Rashmi", "Ashok", "Komal", "Hemant", "Garima", "Lokesh", "Aarti", "Girish", "Juhi", "Sameer",
  "Rekha", "Manoj", "Sangeeta", "Yogesh", "Bina"
];

const indianLastNames = [
  "Sharma", "Varma", "Bose", "Reddy", "Patel", "Singh", "Nair", "Deshmukh", "Menon", "Joshi",
  "Kulkarni", "Choudhury", "Bhattacharya", "Iyer", "Rao", "Gupta", "Mishra", "Pandey", "Saxena", "Das",
  "Sengupta", "Banerjee", "Mukherjee", "Chatterjee", "Dutta", "Goswami", "Thakur", "Yadav", "Meena", "Shukla",
  "Dubey", "Trivedi", "Srivastava", "Verma", "Malhotra", "Kapoor", "Agarwal", "Bansal", "Goel", "Chauhan",
  "Rathore", "Shekhawat", "Pillai", "Nambiar", "Krishnan", "Venkatesh", "Balasubramanian", "Patil", "Shinde", "Kadam",
  "Pawar", "Bhosale", "Gaikwad", "Mohanty", "Pradhan"
];

const subjects = [
  "Numerical Weather Prediction",
  "Doppler Weather Radar Meteorology",
  "INSAT Satellite Meteorology",
  "Tropical Cyclogenesis & Warning",
  "Agrometeorology & Crop Modeling",
  "Climate Science & Monsoon Dynamics",
  "Aviation Meteorology & Nowcasting",
  "Hydrometeorology & Flood Early Warning",
  "Seismological Network Operations",
  "AI & Machine Learning in Weather Prediction"
];

// Generate 57 Users
const users = [
  {
    id: "u_admin_1",
    name: "Dr. Mrutyunjay Mohapatra",
    email: "admin@imd.gov.in",
    role: "admin",
    department: "Directorate General of Meteorology, New Delhi",
    designation: "Director General & Chief Admin",
    station: "IMD HQ Mausam Bhawan, New Delhi",
    cadreId: "MOES-ADM-2026-0001",
    phone: "+91 11 2461 1068",
    status: "approved",
    bio: "Director General of IMD and Head of MoES capacity building initiative. 28+ years in atmospheric science.",
    qualifications: ["Ph.D. Meteorology (IIT Delhi)", "M.Sc. Physics (IIT Roorkee)"],
    skills: ["Atmospheric Dynamics", "Tropical Cyclone Warning", "National Disaster Policy", "NWP Verification"],
    interests: ["Cyclone Forecasting", "Nowcasting", "Early Warning Systems"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-10T09:00:00.000Z"
  },
  {
    id: "u_admin_2",
    name: "Dr. Vijay Kumar Soni",
    email: "vijay.soni@imd.gov.in",
    role: "admin",
    department: "Agrimet Division & Training Centre, Pune",
    designation: "Deputy Director General (Agrimet) & Training Head",
    station: "Meteorological Centre, Pune",
    cadreId: "MOES-ADM-2026-0002",
    phone: "+91 20 2553 5200",
    status: "approved",
    bio: "Heads the MoES national training coordination cell across 36 state meteorological offices.",
    qualifications: ["Ph.D. Agrometeorology (IARI)", "M.Sc. Meteorology"],
    skills: ["Agrometeorology", "Crop Weather Modeling", "Training Governance"],
    interests: ["FASAL Advisory", "Drought Monitoring"],
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250",
    createdAt: "2025-01-11T10:00:00.000Z"
  }
];

const trainerProfiles = [
  { name: "Dr. Amit Sengupta", email: "amit.sengupta@imd.gov.in", dept: "Numerical Weather Prediction Division, New Delhi", desig: "Scientist 'F' & Senior Meteorologist", spec: ["Numerical Weather Prediction", "WRF / GFS Modeling", "Ensemble Prediction"], exp: 18 },
  { name: "Dr. Sunita Kulkarni", email: "sunita.k@imd.gov.in", dept: "Radar & Satellite Meteorology Division, Pune", desig: "Scientist 'E' & Radar Specialist", spec: ["Doppler Weather Radar", "INSAT-3DR Products", "Nowcasting"], exp: 14 },
  { name: "Dr. Rajiv Roy", email: "rajiv.roy@imd.gov.in", dept: "Cyclone Warning Division, RMC Kolkata", desig: "Scientist 'E' & Marine Forecaster", spec: ["Tropical Cyclogenesis", "Storm Surge Modeling", "Ocean Meteorology"], exp: 12 },
  { name: "Dr. Laxminarayan Patra", email: "ln.patra@imd.gov.in", dept: "Seismology Division, IMD New Delhi", desig: "Scientist 'E' & Earthquake Monitoring Expert", spec: ["Seismology", "Broadband Seismic Networks", "Earthquake Early Warning"], exp: 16 },
  { name: "Dr. Meenakshi Sundaram", email: "meenakshi.s@imd.gov.in", dept: "Agrometeorology Division, Pune", desig: "Scientist 'D'", spec: ["Agrometeorology", "Drought Monitoring", "Crop Weather Modeling"], exp: 9 },
  { name: "Dr. Parthasarathi Mukhopadhyay", email: "partha.m@imd.gov.in", dept: "Climate Research & Services, Pune", desig: "Scientist 'G' & Climate Modeler", spec: ["Climate Modeling", "CMIP6", "Monsoon Dynamics", "ENSO Teleconnections"], exp: 22 },
  { name: "Dr. Arvind Kumar Sharma", email: "arvind.sharma@imd.gov.in", dept: "Hydrometeorology Division, New Delhi", desig: "Scientist 'E' & Flood Forecaster", spec: ["Flash Flood Guidance", "QPE Analysis", "River Basin Hydrology"], exp: 15 },
  { name: "Dr. Shalini Venkatesh", email: "shalini.v@imd.gov.in", dept: "Aviation Meteorology Division, RMC Chennai", desig: "Scientist 'E' & Aviation Forecaster", spec: ["Aviation Weather", "TAF/SIGMET", "Low Level Wind Shear"], exp: 13 },
  { name: "Dr. R. K. Jenamani", email: "rk.jenamani@imd.gov.in", dept: "National Weather Forecasting Centre, New Delhi", desig: "Scientist 'F' & Chief Forecaster", spec: ["Extreme Weather Events", "Fog Dynamics", "Heat & Cold Waves"], exp: 20 },
  { name: "Dr. D. S. Pai", email: "ds.pai@imd.gov.in", dept: "Long Range Forecasting Division, Pune", desig: "Scientist 'G' & Monsoon Expert", spec: ["Long Range Forecasting", "Statistical Monsoon Models", "Climate Normals"], exp: 24 }
];

trainerProfiles.forEach((t, i) => {
  users.push({
    id: `u_trainer_${i + 1}`,
    name: t.name,
    email: t.email,
    role: "trainer",
    department: t.dept,
    designation: t.desig,
    station: stations[i % stations.length],
    cadreId: `MOES-FAC-2026-010${i + 1}`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    specialization: t.spec,
    experienceYears: t.exp,
    qualifications: [`Ph.D. in Atmospheric Sciences`, `M.Sc. Meteorology`],
    status: "approved",
    bio: `Senior faculty trainer specializing in ${t.spec.join(", ")} with ${t.exp}+ years of operational service.`,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 90000000}?auto=format&fit=crop&q=80&w=250`,
    createdAt: "2025-01-12T10:00:00.000Z"
  });
});

for (let i = 0; i < 45; i++) {
  const firstName = indianFirstNames[i % indianFirstNames.length];
  const lastName = indianLastNames[(i * 3 + 1) % indianLastNames.length];
  const fullName = `${firstName} ${lastName}`;
  const traineeEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? (i + 1) : ""}@imd.gov.in`.replace(/['\s]/g, "");
  const stationName = stations[i % stations.length];
  const cadreNo = String(4400 + i + 1).padStart(4, "0");

  users.push({
    id: `u_trainee_${i + 1}`,
    name: fullName,
    email: i === 0 ? "rahul.sharma@imd.gov.in" : (i === 1 ? "priya.varma@imd.gov.in" : traineeEmail),
    role: "trainee",
    department: `Meteorological Centre, ${stationName.split(", ")[1] || "Jaipur"}`,
    designation: i % 3 === 0 ? "Scientist 'B' (Trainee)" : (i % 3 === 1 ? "Assistant Meteorologist Grade-I" : "Scientific Assistant Grade-I"),
    station: stationName,
    cadreId: `MOES-MET-2026-${cadreNo}`,
    phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
    status: i >= 42 ? "pending" : "approved",
    interests: [subjects[i % subjects.length], subjects[(i + 2) % subjects.length]],
    skills: ["Python for Meteorology", "Synoptic Analysis", "QGIS Data Assimilation", "Weather Radar Interpretation"],
    qualifications: ["M.Sc. Atmospheric Sciences", "IMD Pune Advanced Meteorological Training Course"],
    experience: `${(i % 4) + 1} years of operational meteorological observatory duty.`,
    certificates: [
      { title: "Basic Meteorological Forecaster (BMF)", issuer: "IMD Training Centre Pune", year: "2024" },
      { title: "Satellite & Radar Meteorology Course", issuer: "MoES Digital Academy", year: "2025" }
    ],
    avatar: `https://images.unsplash.com/photo-${1530000000000 + (i * 987654) % 90000000}?auto=format&fit=crop&q=80&w=250`,
    createdAt: new Date(Date.now() - (45 - i) * 86400000 * 2).toISOString(),
    completionPercentage: Math.min(100, Math.floor(45 + Math.random() * 55)),
    assessmentScore: Math.floor(65 + Math.random() * 32)
  });
}

// Generate 65 Questions
const questionBank = [];
for (let j = 1; j <= 65; j++) {
  const subj = subjects[j % subjects.length];
  const isMcq = j % 4 !== 0;
  questionBank.push({
    id: `qb_${String(j).padStart(3, "0")}`,
    question: `Operational Atmospheric Assessment Item ${j}: What is the primary physical process governing ${subj.toLowerCase()} under active Indian weather regimes?`,
    subjectId: `sub_gen_${(j % 5) + 1}`,
    subjectName: subj,
    module: `Module ${(j % 3) + 1}`,
    marks: (j % 3) + 1,
    type: isMcq ? "MCQ" : "one_word",
    difficulty: j % 3 === 0 ? "Hard" : (j % 3 === 1 ? "Medium" : "Easy"),
    options: isMcq ? [
      `Convective moisture convergence and thermodynamic instability`,
      `Static geopotential height with zero vorticity`,
      `Boundary layer dissipation without cloud formation`,
      `Uniform isothermal stratospheric conditions`
    ] : [],
    correctAnswer: 0,
    expectedAnswer: isMcq ? "" : "convective convergence",
    acceptedAnswers: isMcq ? [] : ["convective convergence", "convergence", "moisture convergence"],
    explanation: `Operational analysis in ${subj} relies on tracking dynamic vorticity, moisture flux convergence, and boundary layer heat exchanges.`
  });
}

// Generate 55 Submissions
const quizSubmissions = [];
const quizList = [
  { id: "quiz_nwp_01", title: "NWP Modeling & Data Assimilation Comprehensive Exam", courseId: "crs_nwp_101", totalMarks: 20 },
  { id: "quiz_dwr_02", title: "Doppler Weather Radar Interpretation Assessment", courseId: "crs_dwr_102", totalMarks: 20 },
  { id: "quiz_cyc_03", title: "Tropical Cyclone Warning & Storm Surge Test", courseId: "crs_cyc_103", totalMarks: 20 },
  { id: "quiz_sat_04", title: "INSAT-3DR Satellite Meteorology Certification", courseId: "crs_sat_104", totalMarks: 20 },
  { id: "quiz_agro_05", title: "Agrometeorology & Crop Weather Modeling Final Exam", courseId: "crs_agro_105", totalMarks: 20 },
  { id: "quiz_cli_06", title: "Monsoon Dynamics & Long-Range Forecasting Evaluation", courseId: "crs_cli_106", totalMarks: 20 }
];

for (let s = 0; s < 55; s++) {
  const trainee = users.filter(u => u.role === "trainee")[s % 40] || users[2];
  const qz = quizList[s % quizList.length];
  const score = Math.floor(12 + Math.random() * 8);
  const total = qz.totalMarks;
  const pct = Math.round((score / total) * 100);
  const isPass = pct >= 60;
  const timeTaken = Math.floor(600 + Math.random() * 800);

  quizSubmissions.push({
    id: `sub_rec_${String(s + 1).padStart(3, "0")}`,
    quizId: qz.id,
    quizTitle: qz.title,
    courseId: qz.courseId,
    traineeId: trainee.id,
    traineeName: trainee.name,
    score: score,
    totalMarks: total,
    percentage: pct,
    passMarks: Math.round(total * 0.6),
    passed: isPass,
    accuracy: pct,
    totalQuestions: 10,
    correctCount: Math.round((score / total) * 10),
    incorrectCount: 10 - Math.round((score / total) * 10),
    status: isPass ? "passed" : "failed",
    timeTakenSeconds: timeTaken,
    totalTimeText: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
    averageTimeText: `${Math.round(timeTaken / 10)} sec/question`,
    tabSwitchCount: s % 15 === 0 ? 1 : 0,
    integrityStatus: s % 15 === 0 ? "warning" : "clean",
    submittedAt: new Date(Date.now() - (55 - s) * 3600000 * 8).toISOString(),
    isPractice: s % 4 === 0
  });
}

// Generate 55 Content Library Resources
const contentLibrary = [];
const docTypes = ["pdf", "video", "presentation", "manual"];
for (let c = 1; c <= 55; c++) {
  const type = docTypes[c % docTypes.length];
  const subj = subjects[c % subjects.length];
  contentLibrary.push({
    id: `lib_doc_${String(c).padStart(3, "0")}`,
    title: `MoES Official Guide ${c}: Operational ${subj} Manual & Field Protocols`,
    type: type,
    format: type === "pdf" ? "PDF Document" : (type === "video" ? "MP4 Video" : (type === "presentation" ? "PowerPoint Presentation (PPTX)" : "Technical SOP Manual")),
    subject: subj,
    category: "Technical Standards",
    size: `${(2.4 + (c % 15) * 1.3).toFixed(1)} MB`,
    duration: type === "video" ? `${30 + (c % 35)} mins` : `${18 + (c % 40)} pages`,
    pages: type !== "video" ? 18 + (c % 40) : undefined,
    url: type === "video" ? "https://www.youtube.com/embed/iF_D2gnDJDU" : "https://storage.moes.gov.in/materials/sample_guide.pdf",
    uploadedBy: `Dr. ${indianFirstNames[(c * 2) % indianFirstNames.length]} ${indianLastNames[(c * 3) % indianLastNames.length]} (Senior Scientist)`,
    uploadedAt: new Date(Date.now() - (55 - c) * 86400000).toISOString(),
    allowDownload: true
  });
}

// Generate 52 Announcements
const announcements = [];
const priorities = ["normal", "high", "urgent"];
for (let a = 1; a <= 52; a++) {
  const subj = subjects[a % subjects.length];
  announcements.push({
    id: `ann_${String(a).padStart(3, "0")}`,
    title: `MoES Training Circular #${a}: National Capacity Directive on ${subj}`,
    message: `All designated officers across Regional Meteorological Centres are hereby notified regarding updated operational SOPs, training timelines, and certification benchmarks for ${subj}.`,
    category: a % 3 === 0 ? "Operational Advisory" : (a % 3 === 1 ? "Training Program" : "National Academy"),
    priority: priorities[a % priorities.length],
    publishedBy: "MoES Central Directorate of Training, New Delhi",
    createdAt: new Date(Date.now() - (52 - a) * 86400000 * 1.5).toISOString()
  });
}

// Generate 52 Feedbacks
const feedbacks = [];
const feedbackComments = [
  "Comprehensive explanation of WRF parameterization schemes and boundary conditions.",
  "Excellent hands-on demonstration with Doppler radar velocity de-aliasing algorithms.",
  "Very helpful case studies on Bay of Bengal severe cyclonic storms.",
  "INSAT-3DR sounder product interpretations were explained with high operational clarity.",
  "The block-level agromet advisory modules provide tremendous field value for farmers.",
  "Great insights into CMIP6 climate downscaling and monsoon active-break cycles.",
  "Real-time radar nowcasting simulations helped prepare for severe thunderstorm seasons.",
  "Detailed mathematical derivations of atmospheric primitive equations were top-notch."
];

for (let f = 1; f <= 52; f++) {
  const trainee = users.filter(u => u.role === "trainee")[f % 40] || users[2];
  feedbacks.push({
    id: `fb_${String(f).padStart(3, "0")}`,
    courseId: quizList[f % quizList.length].courseId,
    courseTitle: quizList[f % quizList.length].title,
    trainerId: `u_trainer_${(f % 6) + 1}`,
    trainerName: trainerProfiles[f % 6].name,
    traineeId: trainee.id,
    traineeName: trainee.name,
    rating: (f % 5 === 0) ? 4 : 5,
    comment: feedbackComments[f % feedbackComments.length],
    createdAt: new Date(Date.now() - (52 - f) * 86400000 * 1.2).toISOString()
  });
}

// Load existing db.json to retain courses and other setup
let currentDb = {};
try {
  if (fs.existsSync(DB_FILE)) {
    currentDb = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
} catch (e) {}

const finalDb = {
  ...currentDb,
  users: users,
  questionBank: questionBank,
  quizSubmissions: quizSubmissions,
  contentLibrary: contentLibrary,
  announcements: announcements,
  feedbacks: feedbacks
};

fs.writeFileSync(DB_FILE, JSON.stringify(finalDb, null, 2), "utf-8");
console.log("🌟 db.json successfully updated with 50+ items in all sections!");
