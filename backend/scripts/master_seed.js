// Master LMS Data Populator for CAPACITY CONNECT
// Generates interconnected data across all sections: Users, Courses, ModuleProgress, Quizzes, Submissions, ContentLibrary, Announcements, Feedbacks, Certificates
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../src/data/db.json");

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

const subjectsList = [
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

// 1. Users (57 Users)
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
  { id: "u_trainer_1", name: "Dr. Amit Sengupta", email: "amit.sengupta@imd.gov.in", dept: "Numerical Weather Prediction Division, New Delhi", desig: "Scientist 'F' & Senior Meteorologist", spec: ["Numerical Weather Prediction", "WRF / GFS Modeling", "Ensemble Prediction"], exp: 18 },
  { id: "u_trainer_2", name: "Dr. Sunita Kulkarni", email: "sunita.k@imd.gov.in", dept: "Radar & Satellite Meteorology Division, Pune", desig: "Scientist 'E' & Radar Specialist", spec: ["Doppler Weather Radar", "INSAT-3DR Products", "Nowcasting"], exp: 14 },
  { id: "u_trainer_3", name: "Dr. Rajiv Roy", email: "rajiv.roy@imd.gov.in", dept: "Cyclone Warning Division, RMC Kolkata", desig: "Scientist 'E' & Marine Forecaster", spec: ["Tropical Cyclogenesis", "Storm Surge Modeling", "Ocean Meteorology"], exp: 12 },
  { id: "u_trainer_4", name: "Dr. Laxminarayan Patra", email: "ln.patra@imd.gov.in", dept: "Seismology Division, IMD New Delhi", desig: "Scientist 'E' & Earthquake Monitoring Expert", spec: ["Seismology", "Broadband Seismic Networks", "Earthquake Early Warning"], exp: 16 },
  { id: "u_trainer_5", name: "Dr. Meenakshi Sundaram", email: "meenakshi.s@imd.gov.in", dept: "Agrometeorology Division, Pune", desig: "Scientist 'D'", spec: ["Agrometeorology", "Drought Monitoring", "Crop Weather Modeling"], exp: 9 },
  { id: "u_trainer_6", name: "Dr. Parthasarathi Mukhopadhyay", email: "partha.m@imd.gov.in", dept: "Climate Research & Services, Pune", desig: "Scientist 'G' & Climate Modeler", spec: ["Climate Modeling", "CMIP6", "Monsoon Dynamics", "ENSO Teleconnections"], exp: 22 },
  { id: "u_trainer_7", name: "Dr. Arvind Kumar Sharma", email: "arvind.sharma@imd.gov.in", dept: "Hydrometeorology Division, New Delhi", desig: "Scientist 'E' & Flood Forecaster", spec: ["Flash Flood Guidance", "QPE Analysis", "River Basin Hydrology"], exp: 15 },
  { id: "u_trainer_8", name: "Dr. Shalini Venkatesh", email: "shalini.v@imd.gov.in", dept: "Aviation Meteorology Division, RMC Chennai", desig: "Scientist 'E' & Aviation Forecaster", spec: ["Aviation Weather", "TAF/SIGMET", "Low Level Wind Shear"], exp: 13 },
  { id: "u_trainer_9", name: "Dr. R. K. Jenamani", email: "rk.jenamani@imd.gov.in", dept: "National Weather Forecasting Centre, New Delhi", desig: "Scientist 'F' & Chief Forecaster", spec: ["Extreme Weather Events", "Fog Dynamics", "Heat & Cold Waves"], exp: 20 },
  { id: "u_trainer_10", name: "Dr. D. S. Pai", email: "ds.pai@imd.gov.in", dept: "Long Range Forecasting Division, Pune", desig: "Scientist 'G' & Monsoon Expert", spec: ["Long Range Forecasting", "Statistical Monsoon Models", "Climate Normals"], exp: 24 }
];

trainerProfiles.forEach((t, i) => {
  users.push({
    id: t.id,
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
    createdAt: "2025-01-12T10:00:00.000Z",
    certificates: [
      {
        id: `cert_fac_${i + 1}`,
        title: `Faculty Excellence: ${t.spec[0]} Mastery`,
        courseCode: `MOES-FAC-0${i + 1}`,
        recipientType: "trainer",
        recipientName: t.name,
        recipientCadreId: `MOES-FAC-2026-010${i + 1}`,
        issuer: "Director General of Meteorology, MoES New Delhi",
        year: "2025",
        issueDate: "15 January 2025",
        grade: "Master Instructor Commendation",
        performanceCategory: "Distinction",
        finalScore: 100,
        credentialId: `MOES-FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Verified & Issued"
      }
    ]
  });
});

const traineeIds = [];
for (let i = 0; i < 45; i++) {
  const tId = `u_trainee_${i + 1}`;
  traineeIds.push(tId);
  const firstName = indianFirstNames[i % indianFirstNames.length];
  const lastName = indianLastNames[(i * 3 + 1) % indianLastNames.length];
  const fullName = `${firstName} ${lastName}`;
  const traineeEmail = i === 0 ? "rahul.sharma@imd.gov.in" : (i === 1 ? "priya.varma@imd.gov.in" : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? (i + 1) : ""}@imd.gov.in`.replace(/['\s]/g, ""));
  const stationName = stations[i % stations.length];
  const cadreNo = String(4400 + i + 1).padStart(4, "0");
  const completionPct = Math.min(100, Math.floor(45 + Math.random() * 55));
  const assessScore = Math.floor(65 + Math.random() * 32);

  users.push({
    id: tId,
    name: fullName,
    email: traineeEmail,
    role: "trainee",
    department: `Meteorological Centre, ${stationName.split(", ")[1] || "Jaipur"}`,
    designation: i % 3 === 0 ? "Scientist 'B' (Trainee)" : (i % 3 === 1 ? "Assistant Meteorologist Grade-I" : "Scientific Assistant Grade-I"),
    station: stationName,
    cadreId: `MOES-MET-2026-${cadreNo}`,
    phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
    status: i >= 40 ? "pending" : "approved",
    interests: [subjectsList[i % subjectsList.length], subjectsList[(i + 2) % subjectsList.length]],
    skills: ["Python for Meteorology", "Synoptic Analysis", "QGIS Data Assimilation", "Weather Radar Interpretation"],
    qualifications: ["M.Sc. Atmospheric Sciences", "IMD Pune Advanced Meteorological Training Course"],
    experience: `${(i % 4) + 1} years of operational meteorological observatory duty.`,
    completionPercentage: completionPct,
    assessmentScore: assessScore,
    certificates: [
      {
        id: `cert_t_${i + 1}`,
        title: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
        courseCode: "MOES-IMD-NWP-2025",
        recipientType: "trainee",
        recipientName: fullName,
        recipientCadreId: `MOES-MET-2026-${cadreNo}`,
        issuer: "Ministry of Earth Sciences / IMD Central Training Directorate",
        year: "2025",
        issueDate: "20 February 2025",
        grade: assessScore >= 85 ? `Distinction (${assessScore}%)` : `Merit (${assessScore}%)`,
        performanceCategory: assessScore >= 85 ? "Distinction" : "Merit",
        finalScore: assessScore,
        credentialId: `MOES-CERT-NWP-${Math.floor(1000 + Math.random() * 9000)}`,
        verificationUrl: `http://localhost:5173/?verify=MOES-CERT-NWP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Verified & Issued"
      }
    ],
    avatar: `https://images.unsplash.com/photo-${1530000000000 + (i * 987654) % 90000000}?auto=format&fit=crop&q=80&w=250`,
    createdAt: new Date(Date.now() - (45 - i) * 86400000 * 2).toISOString()
  });
}

// 2. Courses (8 Rich Courses with 20-30 enrolled trainees each)
const courses = [
  {
    id: "crs_nwp_101",
    code: "MOES-IMD-NWP-2025",
    title: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
    category: "Atmospheric Modeling",
    level: "Advanced",
    duration: "6 Weeks (48 Hours)",
    creditHours: 4,
    department: "Numerical Weather Prediction Division",
    leadTrainerId: "u_trainer_1",
    leadTrainerName: "Dr. Amit Sengupta",
    thumbnail: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80&w=800",
    description: "Master modern atmospheric dynamics, grid generation, parameterizations, WRF/GFS model physics, ensemble prediction systems (EPS), and 3D/4D-Var data assimilation for operational weather forecasting in India.",
    prerequisites: ["Fluid Dynamics Fundamentals", "Basic Meteorology", "Linux & Shell Scripting"],
    enrolledTraineeIds: traineeIds.slice(0, 28),
    competenciesGained: ["NWP Grid Physics", "WRF Execution", "Data Assimilation", "EPS Probability Mapping"],
    subjects: [
      {
        id: "sub_nwp_01",
        name: "Subject 1: Governing Equations & Atmospheric Dynamics",
        trainerId: "u_trainer_1",
        trainerName: "Dr. Amit Sengupta",
        modules: [
          {
            id: "mod_nwp_01",
            title: "Module 1: Navier-Stokes & Primitive Equation Systems",
            duration: "4 Hours",
            materials: [
              { id: "mat_nwp_01", title: "Lecture 1: Primitive Equations in Sigma Coordinates", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "45 mins", allowDownload: false },
              { id: "mat_nwp_02", title: "Presentation: Atmospheric Governing Equations Deck", type: "presentation", pages: 34, allowDownload: true },
              { id: "mat_nwp_03", title: "Study Guide: Boundary Layer Parameterization Notes", type: "pdf", size: "2.4 MB", allowDownload: true }
            ]
          },
          {
            id: "mod_nwp_02",
            title: "Module 2: Discretization & Spatial-Temporal Grid Staggering",
            duration: "6 Hours",
            materials: [
              { id: "mat_nwp_04", title: "Lecture 2: Arakawa Grids (A-E) & CFL Condition", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "52 mins", allowDownload: false },
              { id: "mat_nwp_05", title: "Lab Manual: Configuring WRF Preprocessing System (WPS)", type: "pdf", size: "5.1 MB", allowDownload: true }
            ]
          }
        ]
      },
      {
        id: "sub_nwp_02",
        name: "Subject 2: Data Assimilation & Satellite Radiance Ingestion",
        trainerId: "u_trainer_1",
        trainerName: "Dr. Amit Sengupta",
        modules: [
          {
            id: "mod_nwp_03",
            title: "Module 3: 3D-Var / 4D-Var & Kalman Filtering in NWP",
            duration: "5 Hours",
            materials: [
              { id: "mat_nwp_06", title: "Lecture 3: Assimilating INSAT-3DR and Doppler Radar Reflectivity", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "48 mins", allowDownload: false },
              { id: "mat_nwp_07", title: "Slide Deck: Background Error Covariance (B-Matrix) Estimation", type: "presentation", pages: 42, allowDownload: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_dwr_102",
    code: "MOES-IMD-DWR-2025",
    title: "Doppler Weather Radar (DWR) Operational Data Interpretation & Nowcasting",
    category: "Radar & Remote Sensing",
    level: "Intermediate",
    duration: "4 Weeks (32 Hours)",
    creditHours: 3,
    department: "Radar & Satellite Meteorology Division",
    leadTrainerId: "u_trainer_2",
    leadTrainerName: "Dr. Sunita Kulkarni",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    description: "Hands-on operational capacity building on dual-polarization S/C/X band Doppler weather radars. Covers reflectivity (Z), radial velocity (V), differential reflectivity (ZDR), KDP, and convective cell tracking.",
    prerequisites: ["Electromagnetic Wave Theory", "Basic Meteorological Observations"],
    enrolledTraineeIds: traineeIds.slice(5, 32),
    competenciesGained: ["Dual-Pol Signatures", "Mesocyclone Detection", "TITAN Cell Tracking", "QPE Estimation"],
    subjects: [
      {
        id: "sub_dwr_01",
        name: "Subject 1: Radar Hardware, Scan Strategies & Base Products",
        trainerId: "u_trainer_2",
        trainerName: "Dr. Sunita Kulkarni",
        modules: [
          {
            id: "mod_dwr_01",
            title: "Module 1: PPI, RHI, MAX(Z) and Radial Velocity De-aliasing",
            duration: "6 Hours",
            materials: [
              { id: "mat_dwr_01", title: "Masterclass: Nyquist Velocity & Dual-PRF Algorithms", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "40 mins", allowDownload: false },
              { id: "mat_dwr_02", title: "DWR Product Atlas (CAPPI, PACP, SRI, ETOP)", type: "pdf", size: "8.7 MB", allowDownload: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_cyc_103",
    code: "MOES-IMD-CYC-2025",
    title: "Tropical Cyclone Forecasting, Track Prediction & Storm Surge Modeling",
    category: "Cyclone & Marine Meteorology",
    level: "Advanced",
    duration: "5 Weeks (40 Hours)",
    creditHours: 4,
    department: "Cyclone Warning Division",
    leadTrainerId: "u_trainer_3",
    leadTrainerName: "Dr. Rajiv Roy",
    thumbnail: "https://images.unsplash.com/photo-1504608524841-42584120d1d0?auto=format&fit=crop&q=80&w=800",
    description: "Comprehensive training on Bay of Bengal and Arabian Sea cyclone genesis, intensification, track prediction using multi-model ensemble approach, storm surge modeling using ADCIRC and post-landfall impact assessment.",
    prerequisites: ["Tropical Meteorology Basics", "Ocean-Atmosphere Interaction"],
    enrolledTraineeIds: traineeIds.slice(10, 35),
    competenciesGained: ["Cyclone Track Prediction", "Dvorak Technique", "Storm Surge Modeling", "RSMC Alert Protocols"],
    subjects: [
      {
        id: "sub_cyc_01",
        name: "Subject 1: Tropical Cyclone Dynamics & Intensification",
        trainerId: "u_trainer_3",
        trainerName: "Dr. Rajiv Roy",
        modules: [
          {
            id: "mod_cyc_01",
            title: "Module 1: Genesis Potential Index & Warm Core Structure",
            duration: "5 Hours",
            materials: [
              { id: "mat_cyc_01", title: "Lecture: Carnot Heat Engine Model of Tropical Cyclones", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "50 mins", allowDownload: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_sat_104",
    code: "MOES-IMD-SAT-2025",
    title: "INSAT-3DR & INSAT-3DS Satellite Meteorology & Product Interpretation",
    category: "Satellite Meteorology",
    level: "Intermediate",
    duration: "3 Weeks (24 Hours)",
    creditHours: 2,
    department: "Satellite Meteorology Division, New Delhi",
    leadTrainerId: "u_trainer_2",
    leadTrainerName: "Dr. Sunita Kulkarni",
    thumbnail: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&q=80&w=800",
    description: "Complete guide to INSAT-3DR & 3DS geostationary satellite products — visible (VIS), infrared (TIR), water vapour (WV), shortwave IR (SWIR), sounder temperature-humidity profiles, cloud properties, SST and OLR.",
    prerequisites: ["Electromagnetic Spectrum Basics", "Basic Satellite Orbits"],
    enrolledTraineeIds: traineeIds.slice(15, 40),
    competenciesGained: ["Multi-Spectral Imagery", "Cloud Classification", "OLR / SST Products", "Atmospheric Sounder"],
    subjects: [
      {
        id: "sub_sat_01",
        name: "Subject 1: INSAT-3DR Imager Channels & Cloud Classification",
        trainerId: "u_trainer_2",
        trainerName: "Dr. Sunita Kulkarni",
        modules: [
          {
            id: "mod_sat_01",
            title: "Module 1: 6-Channel Imager Products & Interpretation",
            duration: "4 Hours",
            materials: [
              { id: "mat_sat_01", title: "Lecture: INSAT-3DR Image Interpretation", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "35 mins", allowDownload: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_agro_105",
    code: "MOES-IMD-AGRO-2025",
    title: "Agromet Advisory Services & Crop Weather Modeling for Indian Agriculture",
    category: "Agrometeorology",
    level: "Beginner to Intermediate",
    duration: "4 Weeks (32 Hours)",
    creditHours: 3,
    department: "Agrometeorology Division, Pune",
    leadTrainerId: "u_trainer_5",
    leadTrainerName: "Dr. Meenakshi Sundaram",
    thumbnail: "https://images.unsplash.com/photo-1581093804475-577d72e35330?auto=format&fit=crop&q=80&w=800",
    description: "Training on Block-Level Agromet Advisory Services (FASAL, MEGHDOOT App), district-level weather bulletins, crop-specific heat unit accumulation models, drought monitoring using SPI/PDSI and crop yield forecasting.",
    prerequisites: ["Basic Meteorological Observations", "Elementary Statistics"],
    enrolledTraineeIds: traineeIds.slice(0, 25),
    competenciesGained: ["Agromet Bulletin Writing", "MEGHDOOT Advisory", "SPI/PDSI Drought Index", "Crop Model Validation"],
    subjects: [
      {
        id: "sub_agro_01",
        name: "Subject 1: Agromet Observations & Advisory Framework",
        trainerId: "u_trainer_5",
        trainerName: "Dr. Meenakshi Sundaram",
        modules: [
          {
            id: "mod_agro_01",
            title: "Module 1: AMFU Setup & Bulletin Formats",
            duration: "4 Hours",
            materials: [
              { id: "mat_agro_01", title: "Lecture: AMFU Network in India", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "38 mins", allowDownload: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_cli_106",
    code: "MOES-IMD-CLI-2025",
    title: "Indian Summer Monsoon Dynamics, Climate Variability & Long-Range Forecasting",
    category: "Climate Science",
    level: "Advanced",
    duration: "8 Weeks (64 Hours)",
    creditHours: 5,
    department: "Climate Research & Services Division, Pune",
    leadTrainerId: "u_trainer_6",
    leadTrainerName: "Dr. Parthasarathi Mukhopadhyay",
    thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800",
    description: "In-depth study of Indian Summer Monsoon (ISM) onset, active/break cycles, inter-annual variability driven by ENSO/IOD/MJO teleconnections, CMIP6 model projections for India, and operational long-range seasonal forecast (LRF) methodology.",
    prerequisites: ["Synoptic Meteorology", "Basic Statistics & Time Series"],
    enrolledTraineeIds: traineeIds.slice(8, 38),
    competenciesGained: ["ENSO Teleconnection Analysis", "ISM Onset Prediction", "CMIP6 Downscaling", "Seasonal LRF"],
    subjects: [
      {
        id: "sub_cli_01",
        name: "Subject 1: Monsoon Dynamics & Variability",
        trainerId: "u_trainer_6",
        trainerName: "Dr. Parthasarathi Mukhopadhyay",
        modules: [
          {
            id: "mod_cli_01",
            title: "Module 1: ISM Onset & Low Pressure Systems",
            duration: "6 Hours",
            materials: [
              { id: "mat_cli_01", title: "Lecture: Heat Low over Thar Desert", type: "video", url: "https://www.youtube.com/embed/iF_D2gnDJDU", duration: "55 mins", allowDownload: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_hydro_107",
    code: "MOES-IMD-HYD-2025",
    title: "Hydrometeorology, Flash Flood Guidance (FFGS) & Quantitative Precipitation Estimation",
    category: "Hydrometeorology",
    level: "Intermediate",
    duration: "4 Weeks (32 Hours)",
    creditHours: 3,
    department: "Hydrometeorology Division, New Delhi",
    leadTrainerId: "u_trainer_7",
    leadTrainerName: "Dr. Arvind Kumar Sharma",
    thumbnail: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800",
    description: "Operational training on South Asia Flash Flood Guidance System (FFGS), river basin QPE, radar-gauge merging, and urban inundation modeling.",
    prerequisites: ["Surface Hydrology", "Radar QPE Basics"],
    enrolledTraineeIds: traineeIds.slice(12, 36),
    competenciesGained: ["Flash Flood Guidance", "QPE Merging", "River Inundation Analysis"],
    subjects: [
      {
        id: "sub_hyd_01",
        name: "Subject 1: Flash Flood Guidance & QPE",
        trainerId: "u_trainer_7",
        trainerName: "Dr. Arvind Kumar Sharma",
        modules: [
          {
            id: "mod_hyd_01",
            title: "Module 1: FFGS Catchment Runoff Modeling",
            duration: "5 Hours",
            materials: [
              { id: "mat_hyd_01", title: "FFGS Operational Handbook", type: "pdf", size: "4.5 MB", allowDownload: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "crs_avi_108",
    code: "MOES-IMD-AVI-2025",
    title: "Aviation Meteorological Forecasting, Terminal Aerodrome Forecasts (TAF) & Severe Hazards",
    category: "Aviation Meteorology",
    level: "Intermediate",
    duration: "3 Weeks (24 Hours)",
    creditHours: 2,
    department: "Aviation Meteorology Division, RMC Chennai",
    leadTrainerId: "u_trainer_8",
    leadTrainerName: "Dr. Shalini Venkatesh",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
    description: "ICAO/WMO compliant training on METAR observation, TAF coding, SIGMET generation, Low-Level Wind Shear (LLWS) detection, and fog nowcasting.",
    prerequisites: ["ICAO Codes", "Aviation Weather Charts"],
    enrolledTraineeIds: traineeIds.slice(18, 42),
    competenciesGained: ["TAF/SIGMET Writing", "METAR Coding", "LLWS Monitoring"],
    subjects: [
      {
        id: "sub_avi_01",
        name: "Subject 1: Aerodrome Forecasting & Hazardous Weather",
        trainerId: "u_trainer_8",
        trainerName: "Dr. Shalini Venkatesh",
        modules: [
          {
            id: "mod_avi_01",
            title: "Module 1: TAF / SIGMET Regulatory Standards",
            duration: "4 Hours",
            materials: [
              { id: "mat_avi_01", title: "Aviation Forecaster Manual", type: "pdf", size: "6.2 MB", allowDownload: true }
            ]
          }
        ]
      }
    ]
  }
];

// 3. Questions (65 High Quality Meteorological Questions)
const questionBank = [];
for (let j = 1; j <= 65; j++) {
  const subj = subjectsList[j % subjectsList.length];
  const isMcq = j % 4 !== 0;
  questionBank.push({
    id: `qb_${String(j).padStart(3, "0")}`,
    question: `Operational Assessment Question ${j}: What is the primary physical process governing ${subj.toLowerCase()} under active Indian weather regimes?`,
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

// 4. Scheduled Assessments (Active Live, Upcoming, Completed, and Practice)
const now = new Date();
const quizzes = [
  // ─── ACTIVE LIVE ASSESSMENTS (Available Right Now) ───
  {
    id: "quiz_active_nwp_live",
    title: "National NWP Dynamics & 4D-Var Data Assimilation Live Assessment",
    courseId: "crs_nwp_101",
    courseName: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    trainerId: "u_trainer_1",
    trainerName: "Dr. Amit Sengupta",
    scheduledStartTime: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    deadlineTime: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
    durationMinutes: 30,
    passMarks: 12,
    totalMarks: 20,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(0, 10)
  },
  {
    id: "quiz_active_dwr_live",
    title: "Operational Doppler Weather Radar & Severe Storm Diagnostics Live Exam",
    courseId: "crs_dwr_102",
    courseName: "Doppler Weather Radar (DWR) Operational Data Interpretation & Nowcasting",
    subjectId: "sub_dwr_01",
    subjectName: "Subject 1: Radar Hardware, Scan Strategies & Base Products",
    trainerId: "u_trainer_2",
    trainerName: "Dr. Sunita Kulkarni",
    scheduledStartTime: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    deadlineTime: new Date(Date.now() + 7 * 86400000).toISOString(),
    durationMinutes: 30,
    passMarks: 12,
    totalMarks: 20,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(7, 17)
  },
  {
    id: "quiz_active_cyc_live",
    title: "Bay of Bengal Tropical Cyclogenesis & Track Prediction Certification",
    courseId: "crs_cyc_103",
    courseName: "Tropical Cyclone Forecasting, Track Prediction & Storm Surge Modeling",
    subjectId: "sub_cyc_01",
    subjectName: "Subject 1: Tropical Cyclone Dynamics & Intensification",
    trainerId: "u_trainer_3",
    trainerName: "Dr. Rajiv Roy",
    scheduledStartTime: new Date(Date.now() - 1 * 3600000).toISOString(),
    deadlineTime: new Date(Date.now() + 8 * 86400000).toISOString(),
    durationMinutes: 35,
    passMarks: 14,
    totalMarks: 24,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(17, 27)
  },
  {
    id: "quiz_active_sat_live",
    title: "INSAT-3DR Multispectral Imagery & Sounder Analysis Live Assessment",
    courseId: "crs_sat_104",
    courseName: "INSAT-3DR & INSAT-3DS Satellite Meteorology & Product Interpretation",
    subjectId: "sub_sat_01",
    subjectName: "Subject 1: INSAT-3DR Imager Channels & Cloud Classification",
    trainerId: "u_trainer_2",
    trainerName: "Dr. Sunita Kulkarni",
    scheduledStartTime: new Date(Date.now() - 6 * 3600000).toISOString(),
    deadlineTime: new Date(Date.now() + 6 * 86400000).toISOString(),
    durationMinutes: 25,
    passMarks: 10,
    totalMarks: 18,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(13, 23)
  },

  // ─── UPCOMING SCHEDULED ASSESSMENTS ───
  {
    id: "quiz_upc_agro",
    title: "Block-Level Agrometeorology, MEGHDOOT & Drought Monitoring Final Exam",
    courseId: "crs_agro_105",
    courseName: "Agromet Advisory Services & Crop Weather Modeling for Indian Agriculture",
    subjectId: "sub_agro_01",
    subjectName: "Subject 1: Agromet Observations & Advisory Framework",
    trainerId: "u_trainer_5",
    trainerName: "Dr. Meenakshi Sundaram",
    scheduledStartTime: new Date(Date.now() + 2 * 86400000).toISOString(), // In 2 days
    deadlineTime: new Date(Date.now() + 10 * 86400000).toISOString(),
    durationMinutes: 40,
    passMarks: 15,
    totalMarks: 25,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(24, 34)
  },
  {
    id: "quiz_upc_cli",
    title: "Monsoon Dynamics, CMIP6 & Long-Range Seasonal Forecasting Evaluation",
    courseId: "crs_cli_106",
    courseName: "Indian Summer Monsoon Dynamics, Climate Variability & Long-Range Forecasting",
    subjectId: "sub_cli_01",
    subjectName: "Subject 1: Monsoon Dynamics & Variability",
    trainerId: "u_trainer_6",
    trainerName: "Dr. Parthasarathi Mukhopadhyay",
    scheduledStartTime: new Date(Date.now() + 4 * 86400000).toISOString(), // In 4 days
    deadlineTime: new Date(Date.now() + 12 * 86400000).toISOString(),
    durationMinutes: 45,
    passMarks: 18,
    totalMarks: 30,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(21, 31)
  },
  {
    id: "quiz_upc_avi",
    title: "Aviation Meteorology, METAR/TAF Regulatory Standards & Wind Shear Assessment",
    courseId: "crs_avi_108",
    courseName: "Aviation Meteorological Forecasting, Terminal Aerodrome Forecasts (TAF)",
    subjectId: "sub_avi_01",
    subjectName: "Subject 1: Aerodrome Forecasting & Hazardous Weather",
    trainerId: "u_trainer_8",
    trainerName: "Dr. Shalini Venkatesh",
    scheduledStartTime: new Date(Date.now() + 6 * 86400000).toISOString(), // In 6 days
    deadlineTime: new Date(Date.now() + 14 * 86400000).toISOString(),
    durationMinutes: 30,
    passMarks: 12,
    totalMarks: 20,
    isPractice: false,
    isAllTrainees: true,
    isAdaptive: true,
    questions: questionBank.slice(26, 36)
  },

  // ─── COMPLETED / HISTORICAL ASSESSMENTS ───
  {
    id: "quiz_hist_01",
    title: "Foundational Atmospheric Physics & Synoptic Chart Analysis Midterm",
    courseId: "crs_nwp_101",
    courseName: "Advanced Numerical Weather Prediction (NWP) & Data Assimilation",
    subjectId: "sub_nwp_01",
    subjectName: "Subject 1: Governing Equations & Atmospheric Dynamics",
    trainerId: "u_trainer_1",
    trainerName: "Dr. Amit Sengupta",
    scheduledStartTime: new Date(Date.now() - 15 * 86400000).toISOString(),
    deadlineTime: new Date(Date.now() - 8 * 86400000).toISOString(),
    durationMinutes: 30,
    passMarks: 12,
    totalMarks: 20,
    isPractice: false,
    isAllTrainees: true,
    questions: questionBank.slice(0, 10)
  },
  {
    id: "quiz_hist_02",
    title: "Dual-Polarization Radar Reflectivity & Hail Core Classification Quiz",
    courseId: "crs_dwr_102",
    courseName: "Doppler Weather Radar (DWR) Operational Data Interpretation & Nowcasting",
    subjectId: "sub_dwr_01",
    subjectName: "Subject 1: Radar Hardware, Scan Strategies & Base Products",
    trainerId: "u_trainer_2",
    trainerName: "Dr. Sunita Kulkarni",
    scheduledStartTime: new Date(Date.now() - 20 * 86400000).toISOString(),
    deadlineTime: new Date(Date.now() - 12 * 86400000).toISOString(),
    durationMinutes: 30,
    passMarks: 12,
    totalMarks: 20,
    isPractice: false,
    isAllTrainees: true,
    questions: questionBank.slice(7, 17)
  }
];

// Add 8 Practice Papers
for (let p = 1; p <= 8; p++) {
  const subj = subjectsList[p % subjectsList.length];
  quizzes.push({
    id: `paper_practice_${p}`,
    title: `Adaptive ${subj} Practice Paper ${p}`,
    courseId: courses[p % courses.length].id,
    courseName: courses[p % courses.length].title,
    trainerName: "AI Autonomous Tutor",
    scheduledStartTime: new Date(Date.now() - 30 * 86400000).toISOString(),
    durationMinutes: 20,
    passMarks: 12,
    totalMarks: 20,
    isPractice: true,
    isAdaptive: true,
    isAllTrainees: true,
    questions: questionBank.slice((p * 5) % 40, ((p * 5) % 40) + 10)
  });
}

// 5. Quiz Submissions (55+ Real Submissions across Trainees)
const quizSubmissions = [];
for (let s = 0; s < 55; s++) {
  const trainee = users.filter(u => u.role === "trainee")[s % 40] || users[2];
  const qz = quizzes[s % 5];
  const score = Math.floor(12 + Math.random() * 8);
  const total = qz.totalMarks || 20;
  const pct = Math.round((score / total) * 100);
  const isPass = pct >= 60;
  const timeTaken = Math.floor(600 + Math.random() * 800);

  quizSubmissions.push({
    id: `sub_rec_${String(s + 1).padStart(3, "0")}`,
    quizId: qz.id,
    quizTitle: qz.title,
    courseId: qz.courseId,
    courseName: qz.courseName,
    subjectId: qz.subjectId,
    subjectName: qz.subjectName,
    traineeId: trainee.id,
    traineeName: trainee.name,
    score: score,
    totalMarks: total,
    percentage: pct,
    passMarks: qz.passMarks || Math.round(total * 0.6),
    passed: isPass,
    accuracy: pct,
    totalQuestions: qz.questions?.length || 10,
    correctCount: Math.round((score / total) * (qz.questions?.length || 10)),
    incorrectCount: (qz.questions?.length || 10) - Math.round((score / total) * (qz.questions?.length || 10)),
    status: isPass ? "passed" : "failed",
    timeTakenSeconds: timeTaken,
    totalTimeText: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
    averageTimeText: `${Math.round(timeTaken / 10)} sec/question`,
    tabSwitchCount: s % 18 === 0 ? 1 : 0,
    integrityStatus: s % 18 === 0 ? "warning" : "clean",
    submittedAt: new Date(Date.now() - (55 - s) * 3600000 * 8).toISOString(),
    isPractice: false
  });
}

// 6. Content Library Resources (55 Documents)
const contentLibrary = [];
const docTypes = ["pdf", "video", "presentation", "manual"];
for (let c = 1; c <= 55; c++) {
  const type = docTypes[c % docTypes.length];
  const subj = subjectsList[c % subjectsList.length];
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

// 7. Announcements (52 Directives & Bulletins)
const announcements = [];
const priorities = ["normal", "high", "urgent"];
for (let a = 1; a <= 52; a++) {
  const subj = subjectsList[a % subjectsList.length];
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

// 8. Feedbacks (52 Reviews)
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
    courseId: courses[f % courses.length].id,
    courseTitle: courses[f % courses.length].title,
    trainerId: trainerProfiles[f % trainerProfiles.length].id,
    trainerName: trainerProfiles[f % trainerProfiles.length].name,
    traineeId: trainee.id,
    traineeName: trainee.name,
    rating: (f % 5 === 0) ? 4 : 5,
    comment: feedbackComments[f % feedbackComments.length],
    createdAt: new Date(Date.now() - (52 - f) * 86400000 * 1.2).toISOString()
  });
}

// 9. Module Progress for Trainees (Video watched status & completion for dossiers)
const moduleProgress = {};
traineeIds.forEach((tId, idx) => {
  moduleProgress[tId] = {
    "mod_nwp_01": { completed: true, videoWatched: true, score: 92, lastAccessed: new Date().toISOString() },
    "mod_nwp_02": { completed: idx % 2 === 0, videoWatched: idx % 2 === 0, score: 85, lastAccessed: new Date().toISOString() },
    "mod_nwp_03": { completed: idx % 3 === 0, videoWatched: idx % 3 === 0, score: 78, lastAccessed: new Date().toISOString() },
    "mod_dwr_01": { completed: true, videoWatched: true, score: 88, lastAccessed: new Date().toISOString() },
    "mod_cyc_01": { completed: true, videoWatched: true, score: 90, lastAccessed: new Date().toISOString() },
    "mod_sat_01": { completed: idx % 2 === 0, videoWatched: idx % 2 === 0, score: 80, lastAccessed: new Date().toISOString() },
    "mod_agro_01": { completed: true, videoWatched: true, score: 85, lastAccessed: new Date().toISOString() },
    "mod_cli_01": { completed: idx % 2 === 0, videoWatched: idx % 2 === 0, score: 75, lastAccessed: new Date().toISOString() }
  };
});

const finalDb = {
  users,
  courses,
  questionBank,
  quizzes,
  quizSubmissions,
  contentLibrary,
  announcements,
  feedbacks,
  moduleProgress
};

fs.writeFileSync(DB_FILE, JSON.stringify(finalDb, null, 2), "utf-8");
console.log("🚀 MASTER DATA GENERATED & PERSISTED SUCCESSFULLY!");
console.log(`Users: ${users.length} | Courses: ${courses.length} | Quizzes: ${quizzes.length} | Questions: ${questionBank.length} | Submissions: ${quizSubmissions.length} | Resources: ${contentLibrary.length} | Announcements: ${announcements.length} | Feedbacks: ${feedbacks.length}`);
