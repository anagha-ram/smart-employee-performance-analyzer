/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EmployeeInfo {
  Employee_ID: string;
  Experience: number;
  Projects: number;
  Working_Hours: number;
  Training_Hours: number;
  Performance: "High" | "Average" | "Low";
}

export interface ChartSeries {
  category: string;
  High: number;
  Average: number;
  Low: number;
}

export interface TrainingBucket {
  label: string;
  count: number;
}

export interface PerformanceCount {
  label: string;
  count: number;
}

export interface DashboardAnalytics {
  totalEmployees: number;
  highPerformers: number;
  averagePerformers: number;
  lowPerformers: number;
  performanceDistribution: PerformanceCount[];
  experienceData: ChartSeries[];
  projectsData: ChartSeries[];
  workingHoursData: ChartSeries[];
  trainingDistribution: TrainingBucket[];
}

export interface PredictionResult {
  id: string;
  Employee_ID: string;
  Experience: number;
  Projects: number;
  Working_Hours: number;
  Training_Hours: number;
  Performance: "High" | "Average" | "Low";
  Recommendation: string;
  timestamp: string;
}

export interface UserSession {
  role: "HR" | "Employee";
  name: string;
  email: string;
  position: string;
  department: string;
  employeeData?: {
    Employee_ID: string;
    Experience: number;
    Projects: number;
    Working_Hours: number;
    Training_Hours: number;
    Performance: "High" | "Average" | "Low";
    predictedPerformance: "High" | "Average" | "Low";
    recommendation: string;
  };
}

export interface DirectoryEmployee {
  Employee_ID: string;
  Name: string;
  Email: string;
  Department: string;
  Position: string;
  Experience: number;
  Projects: number;
  Working_Hours: number;
  Training_Hours: number;
  Performance: "High" | "Average" | "Low";
}

