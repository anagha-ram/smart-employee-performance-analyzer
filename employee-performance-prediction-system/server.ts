/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { DecisionTreeClassifier } from "./src/server/decisionTree.ts";
import { EmployeeInfo, DashboardAnalytics, PredictionResult, PerformanceCount, ChartSeries, TrainingBucket } from "./src/types.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const CSV_FILE_PATH = path.resolve(process.cwd(), "employee_data.csv");

// In-Memory Local Predictions Logs (Recent history)
let recentPredictions: PredictionResult[] = [];

// Decision tree reference
let cachedClassifier: DecisionTreeClassifier | null = null;
const featureNames = ["Experience", "Projects", "Working_Hours", "Training_Hours"];

/**
 * Standard utility to parse CSV data directly and safely
 */
function parseEmployeeCsv(): EmployeeInfo[] {
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error(`CSV file not found at ${CSV_FILE_PATH}, setting up stub entries`);
      return [];
    }
    const rawContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
    const lines = rawContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",");
    
    // Parse individual lines
    const parsed: EmployeeInfo[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",");
      if (cells.length < 6) continue;
      
      parsed.push({
        Employee_ID: cells[0],
        Experience: parseInt(cells[1]) || 0,
        Projects: parseInt(cells[2]) || 0,
        Working_Hours: parseInt(cells[3]) || 0,
        Training_Hours: parseInt(cells[4]) || 0,
        Performance: cells[5] as "High" | "Average" | "Low"
      });
    }
    return parsed;
  } catch (error) {
    console.error("Error reading CSV database: ", error);
    return [];
  }
}

/**
 * Appends a single employee record back into the CSV safely
 */
function appendEmployeeToCsv(newEmployee: EmployeeInfo): boolean {
  try {
    const row = `\n${newEmployee.Employee_ID},${newEmployee.Experience},${newEmployee.Projects},${newEmployee.Working_Hours},${newEmployee.Training_Hours},${newEmployee.Performance}`;
    fs.appendFileSync(CSV_FILE_PATH, row, "utf-8");
    // Retrain classifier on new dataset
    initializeAndTrainClassifier();
    return true;
  } catch (err) {
    console.error("Failed appending to CSV database: ", err);
    return false;
  }
}

/**
 * Trains/Re-trains the Custom Decision Tree Classifier
 */
function initializeAndTrainClassifier() {
  const employees = parseEmployeeCsv();
  if (employees.length === 0) {
    console.warn("Dataset empty. Model training skipped.");
    return;
  }

  const X = employees.map(e => [e.Experience, e.Projects, e.Working_Hours, e.Training_Hours]);
  const y = employees.map(e => e.Performance);

  const model = new DecisionTreeClassifier(featureNames);
  model.fit(X, y);
  cachedClassifier = model;
  console.log(`ML Decision Tree classifier initialized & trained successfully on ${employees.length} records.`);
}

// Perform initial model training
initializeAndTrainClassifier();

/**
 * Generates Actionable Recommendations based on predicted class
 */
function generateRecommendation(performance: "High" | "Average" | "Low", hours: number, training: number): string {
  if (performance === "Low") {
    let actions: string[] = [];
    if (training < 30) actions.push("immediate assignment to a mandatory 20h Core Skills Bootcamp");
    if (hours > 9) actions.push("curating a 10% micro-sabbatical or workload balance audit to prevent exhaustion");
    actions.push("instating a weekly 1-to-1 senior team pairing program to fast-track technical confidence");
    return `Low perform classification detected: We recommend ${actions.join(", and ")}.`;
  } else if (performance === "Average") {
    let actions: string[] = [];
    if (training < 40) actions.push("sponsoring intermediate credentials or technical bootcamps to broaden domain skill sets");
    actions.push("allocating full-ownership of secondary sprint modules to empower autonomous planning");
    actions.push("introducing collaborative R&D sandboxes or monthly hackathon cycles to drive professional spark");
    return `Average perform level evaluated: Increase engagement via ${actions.join(", plus ")}.`;
  } else {
    // High Performers
    return "High performance status achieved: Strategic fast-track requested! Nominate this candidate to act as a principal technical designer, delegate cascade team mentoring duties for junior recruits, and schedule strategic leadership review slots with managing directors.";
  }
}

// ============================================
// 🔹 API ROUTE CONTROLLERS FIRST
// ============================================

// A. HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// B. GET CURRENT ANALYTICS PROFILES
app.get("/api/analytics", (req, res) => {
  const employees = parseEmployeeCsv();
  
  const total = employees.length;
  const high = employees.filter(e => e.Performance === "High").length;
  const average = employees.filter(e => e.Performance === "Average").length;
  const low = employees.filter(e => e.Performance === "Low").length;

  // Aggregate Experience Buckets vs Performance
  // Categories: "0-3 yrs", "4-7 yrs", "8-11 yrs", "12+ yrs"
  const expCategories = ["0-3 yrs", "4-7 yrs", "8-11 yrs", "12+ yrs"];
  const experienceData: ChartSeries[] = expCategories.map(cat => ({ category: cat, High: 0, Average: 0, Low: 0 }));
  
  // Aggregate Projects Buckets vs Performance
  // Categories: "1-3 projects", "4-6 projects", "7-9 projects", "10+ projects"
  const projCategories = ["1-3 proj", "4-6 proj", "7-9 proj", "10+ proj"];
  const projectsData: ChartSeries[] = projCategories.map(cat => ({ category: cat, High: 0, Average: 0, Low: 0 }));

  // Aggregate Working Hours Buckets vs Performance
  // Categories: "<=7 hrs/day", "8 hrs/day", "9 hrs/day", ">=10 hrs/day"
  const hoursCategories = ["<=7 hrs", "8 hrs", "9 hrs", ">=10 hrs"];
  const workingHoursData: ChartSeries[] = hoursCategories.map(cat => ({ category: cat, High: 0, Average: 0, Low: 0 }));

  // Aggregate Training Hours Buckets
  const trainBuckets = [
    { label: "0-20 hrs (Low)", min: 0, max: 20 },
    { label: "21-40 hrs (Avg)", min: 21, max: 40 },
    { label: "41-60 hrs (High)", min: 41, max: 60 },
    { label: "61+ hrs (Expert)", min: 61, max: 999 }
  ];
  const trainingDistribution: TrainingBucket[] = trainBuckets.map(b => ({ label: b.label, count: 0 }));

  // Loop through CSV entries and aggregate data
  employees.forEach((e) => {
    // 1. Experience bucket
    let expCatIndex = 0;
    if (e.Experience <= 3) expCatIndex = 0;
    else if (e.Experience <= 7) expCatIndex = 1;
    else if (e.Experience <= 11) expCatIndex = 2;
    else expCatIndex = 3;
    experienceData[expCatIndex][e.Performance]++;

    // 2. Projects bucket
    let projCatIndex = 0;
    if (e.Projects <= 3) projCatIndex = 0;
    else if (e.Projects <= 6) projCatIndex = 1;
    else if (e.Projects <= 9) projCatIndex = 2;
    else projCatIndex = 3;
    projectsData[projCatIndex][e.Performance]++;

    // 3. Working Hours bucket
    let hoursCatIndex = 0;
    if (e.Working_Hours <= 7) hoursCatIndex = 0;
    else if (e.Working_Hours === 8) hoursCatIndex = 1;
    else if (e.Working_Hours === 9) hoursCatIndex = 2;
    else hoursCatIndex = 3;
    workingHoursData[hoursCatIndex][e.Performance]++;

    // 4. Training hours distribution counts
    const bIdx = trainBuckets.findIndex(b => e.Training_Hours >= b.min && e.Training_Hours <= b.max);
    if (bIdx !== -1) {
      trainingDistribution[bIdx].count++;
    }
  });

  const performanceDistribution: PerformanceCount[] = [
    { label: "High Performers", count: high },
    { label: "Average Performers", count: average },
    { label: "Low Performers", count: low }
  ];

  const analyticsResponse: DashboardAnalytics = {
    totalEmployees: total,
    highPerformers: high,
    averagePerformers: average,
    lowPerformers: low,
    performanceDistribution,
    experienceData,
    projectsData,
    workingHoursData,
    trainingDistribution
  };

  res.json(analyticsResponse);
});

// C. RUN INTERACTIVE PREDICTION ENDPOINT
app.post("/api/predict", (req, res) => {
  const { Experience, Projects, Working_Hours, Training_Hours } = req.body;

  if (
    Experience === undefined ||
    Projects === undefined ||
    Working_Hours === undefined ||
    Training_Hours === undefined
  ) {
    res.status(400).json({ error: "Missing required numeric criteria in request body." });
    return;
  }

  // Ensure classifier is loaded
  if (!cachedClassifier) {
    initializeAndTrainClassifier();
  }

  const features = [Number(Experience), Number(Projects), Number(Working_Hours), Number(Training_Hours)];
  const predictedClass = (cachedClassifier 
    ? cachedClassifier.predict(features) 
    : "Average") as "High" | "Average" | "Low";

  const recommendationString = generateRecommendation(predictedClass, Number(Working_Hours), Number(Training_Hours));

  const result: PredictionResult = {
    id: `PRED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    Employee_ID: `QUERY-${Math.floor(100 + Math.random() * 900)}`,
    Experience: Number(Experience),
    Projects: Number(Projects),
    Working_Hours: Number(Working_Hours),
    Training_Hours: Number(Training_Hours),
    Performance: predictedClass,
    Recommendation: recommendationString,
    timestamp: new Date().toLocaleTimeString()
  };

  recentPredictions.unshift(result);
  if (recentPredictions.length > 25) {
    recentPredictions = recentPredictions.slice(0, 25); // cap at 25 items
  }

  res.json(result);
});

// D. GET RECENT PREDICTIONS LIST
app.get("/api/predict/recent", (req, res) => {
  res.json(recentPredictions);
});

// DD. GET EXPLAINABLE DECISION TREE CONFIGURATION
app.get("/api/model/tree", (req, res) => {
  if (!cachedClassifier) {
    initializeAndTrainClassifier();
  }
  const root = cachedClassifier ? cachedClassifier.getRootNode() : null;
  const features = cachedClassifier ? cachedClassifier.getFeatures() : [];
  const employees = parseEmployeeCsv();

  function calculateStats(node: any): { depth: number; nodes: number } {
    if (!node) return { depth: 0, nodes: 0 };
    if (node.isLeaf) return { depth: 1, nodes: 1 };
    const left = calculateStats(node.left);
    const right = calculateStats(node.right);
    return {
      depth: Math.max(left.depth, right.depth) + 1,
      nodes: left.nodes + right.nodes + 1
    };
  }

  const stats = calculateStats(root);

  res.json({
    success: true,
    features,
    stats: {
      totalSamples: employees.length,
      maxDepth: stats.depth,
      totalNodes: stats.nodes
    },
    root
  });
});

// DDD. BATCH EVALUATION PREDICTIONS
app.post("/api/predict/batch", (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) {
    res.status(400).json({ error: "Missing entries array in request body." });
    return;
  }

  if (!cachedClassifier) {
    initializeAndTrainClassifier();
  }

  const results = entries.map((entry: any) => {
    const { Employee_ID, Experience, Projects, Working_Hours, Training_Hours } = entry;
    const feats = [Number(Experience || 0), Number(Projects || 0), Number(Working_Hours || 0), Number(Training_Hours || 0)];
    const predictedClass = (cachedClassifier 
      ? cachedClassifier.predict(feats) 
      : "Average") as "High" | "Average" | "Low";
    const recommendation = generateRecommendation(predictedClass, Number(Working_Hours || 0), Number(Training_Hours || 0));

    return {
      id: `PRED-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      Employee_ID: (Employee_ID || "").trim() || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      Experience: Number(Experience || 0),
      Projects: Number(Projects || 0),
      Working_Hours: Number(Working_Hours || 0),
      Training_Hours: Number(Training_Hours || 0),
      Performance: predictedClass,
      Recommendation: recommendation,
      timestamp: new Date().toLocaleTimeString()
    };
  });

  // Load into recent audit history
  results.forEach((r: any) => {
    recentPredictions.unshift(r);
  });
  if (recentPredictions.length > 25) {
    recentPredictions = recentPredictions.slice(0, 25);
  }

  res.json({ success: true, results });
});


// ============================================
// 🔹 DETERMINISTIC EMPLOYEE DIRECTORY GENERATOR
// ============================================

const FIRST_NAMES = [
  "James", "Olivia", "Robert", "Emma", "John", "Sophia", "Michael", "Charlotte", 
  "William", "Amelia", "David", "Isabella", "Richard", "Mia", "Joseph", "Evelyn", 
  "Thomas", "Harper", "Charles", "Camila", "Christopher", "Gianna", "Daniel", 
  "Abigail", "Matthew", "Luna", "Anthony", "Ella", "Mark", "Elizabeth", "Paul", 
  "Sofia", "Steven", "Avery", "Andrew", "Mila"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", 
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", 
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
];

const DEPARTMENTS = [
  "Engineering", "Product Management", "Marketing & Growth", "Sales Operations", 
  "Finance & Strategy", "People Operations", "Business Development", "Quality Assurance"
];

const POSITIONS: Record<string, string[]> = {
  "Engineering": ["Lead Systems Architect", "Senior Software Engineer", "Backend Engineering Specialist", "Frontend Developer", "DevOps Engineer"],
  "Product Management": ["Principal Product Manager", "Senior Product Designer", "UX Researcher", "Product Owner"],
  "Marketing & Growth": ["Director of Growth", "Creative Brand Lead", "SEO Strategist", "Growth Marketing Manager"],
  "Sales Operations": ["Enterprise Account Executive", "Sales Operations Analyst", "Acquisitions Specialist"],
  "Finance & Strategy": ["Chief Financial Analyst", "Corporate Strategy Lead", "Treasury Associate"],
  "People Operations": ["HR Director", "Talent Acquisition Lead", "Employee Success Partner"],
  "Business Development": ["Business Development Director", "Strategic Partnerships Manager"],
  "Quality Assurance": ["QA Automation Lead", "Software Quality Engineer", "Test Analyst"]
};

function getEmployeeProfile(empId: string) {
  const cleanId = empId.toUpperCase().trim();
  const num = parseInt(cleanId.replace(/\D/g, "")) || 100;
  
  const firstName = FIRST_NAMES[num % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(num * 17) % LAST_NAMES.length];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`;
  const department = DEPARTMENTS[(num * 31) % DEPARTMENTS.length];
  const positionOptions = POSITIONS[department];
  const position = positionOptions[(num * 7) % positionOptions.length];
  
  return {
    Employee_ID: cleanId,
    Name: name,
    Email: email,
    Department: department,
    Position: position
  };
}

// 1. GET FULL COMPANY DIRECTORY
app.get("/api/directory", (req, res) => {
  const employees = parseEmployeeCsv();
  const directory = employees.map(e => {
    const profile = getEmployeeProfile(e.Employee_ID);
    return {
      Ref_ID: e.Employee_ID,
      Employee_ID: e.Employee_ID,
      Name: profile.Name,
      Email: profile.Email,
      Department: profile.Department,
      Position: profile.Position,
      Experience: e.Experience,
      Projects: e.Projects,
      Working_Hours: e.Working_Hours,
      Training_Hours: e.Training_Hours,
      Performance: e.Performance
    };
  });
  res.json(directory);
});

// 2. POST AUTH LOGIN (HR OR INDIVIDUAL EMPLOYEE)
app.post("/api/auth/login", (req, res) => {
  const { usernameOrEmail, password } = req.body;
  
  if (!usernameOrEmail) {
    res.status(400).json({ error: "Email or Employee ID is required." });
    return;
  }
  
  const input = String(usernameOrEmail).trim().toLowerCase();
  
  // Define authorized HR accounts and secure password from environment or fallback
  const HR_ACCOUNTS = ["hr@company.com", "hr", "anagha.aj26@gmail.com"];
  const SECURE_HR_PASSWORD = process.env.HR_PASSWORD || "companyHR2026";

  // 1. Authenticated HR Account Login
  if (HR_ACCOUNTS.includes(input)) {
    if (!password || password !== SECURE_HR_PASSWORD) {
      res.status(401).json({
        error: "Access Denied. Invalid security code or credentials for Human Resources administration."
      });
      return;
    }

    res.json({
      success: true,
      role: "HR",
      user: {
        Email: input === "hr" ? "hr@company.com" : input,
        Name: "Human Resources Officer",
        Position: "HR Director",
        Department: "People Operations"
      }
    });
    return;
  }
  
  // 2. Individual Employee verification
  const employees = parseEmployeeCsv();
  const matched = employees.find(e => {
    const profile = getEmployeeProfile(e.Employee_ID);
    return e.Employee_ID.toLowerCase() === input || profile.Email.toLowerCase() === input;
  });
  
  if (matched) {
    const profile = getEmployeeProfile(matched.Employee_ID);
    
    // Verify standard employee password
    const cleanPassword = String(password || "").trim();
    const isCorrectPassword = 
      cleanPassword.toLowerCase() === "employee2026" || 
      cleanPassword.toLowerCase() === "companyemp2026" ||
      cleanPassword.toLowerCase() === matched.Employee_ID.toLowerCase();

    if (!isCorrectPassword) {
      res.status(401).json({
        error: "Incorrect password. Standard employees must log in using the secure password 'employee2026' or their case-insensitive Employee ID (e.g. '" + matched.Employee_ID + "')."
      });
      return;
    }

    if (!cachedClassifier) {
      initializeAndTrainClassifier();
    }
    const feats = [matched.Experience, matched.Projects, matched.Working_Hours, matched.Training_Hours];
    const predictedClass = cachedClassifier ? cachedClassifier.predict(feats) : matched.Performance;
    const recommendation = generateRecommendation(predictedClass as any, matched.Working_Hours, matched.Training_Hours);

    res.json({
      success: true,
      role: "Employee",
      employee: {
        Employee_ID: matched.Employee_ID,
        Experience: matched.Experience,
        Projects: matched.Projects,
        Working_Hours: matched.Working_Hours,
        Training_Hours: matched.Training_Hours,
        Performance: matched.Performance,
        Name: profile.Name,
        Email: profile.Email,
        Department: profile.Department,
        Position: profile.Position,
        predictedPerformance: predictedClass,
        recommendation: recommendation
      }
    });
    return;
  }
  
  res.status(401).json({
    error: "Invalid email or Employee ID. Please use 'hr@company.com' for HR, or employee credentials such as 'EMP-101' / 'elizabeth.davis@company.com'."
  });
});


// E. ADD AN EMPLOYEE RECORD TO DATABASE (CSV APPEND)
app.post("/api/employee/add", (req, res) => {
  const { Employee_ID, Experience, Projects, Working_Hours, Training_Hours, Performance } = req.body;

  if (
    !Employee_ID ||
    Experience === undefined ||
    Projects === undefined ||
    Working_Hours === undefined ||
    Training_Hours === undefined ||
    !Performance
  ) {
    res.status(400).json({ error: "Missing employee properties. All properties must be filled." });
    return;
  }

  const newEmployee: EmployeeInfo = {
    Employee_ID: String(Employee_ID).trim().toUpperCase(),
    Experience: Number(Experience),
    Projects: Number(Projects),
    Working_Hours: Number(Working_Hours),
    Training_Hours: Number(Training_Hours),
    Performance: Performance as "High" | "Average" | "Low"
  };

  const ok = appendEmployeeToCsv(newEmployee);
  if (ok) {
    res.json({ success: true, message: "Added employee successfully to active database", employee: newEmployee });
  } else {
    res.status(500).json({ error: "Could not append record to csv storage directory" });
  }
});

// F. DOWNLOAD CURRENT EXCEL/CSV DATASET DIRECTLY
app.get("/api/report/download", (req, res) => {
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      res.status(444).send("File not found");
      return;
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=employee_performance_report.csv");
    
    const stream = fs.createReadStream(CSV_FILE_PATH);
    stream.pipe(res);
  } catch (err) {
    res.status(500).send("Error reading dataset: " + err);
  }
});

// ============================================
// 🔹 VITE FRONTEND MIDDLEWARE SETUP
// ============================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Failed to bootstrap full stack application: ", e);
});
