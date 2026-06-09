/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserSession, PredictionResult } from "../types";
import { BookOpen, Award, Compass, TrendingUp, Sparkles, Settings2, Sliders, Play, CornerDownRight, CheckCircle, HelpCircle, Clock, LogIn, LogOut, Calendar, Coffee, Briefcase } from "lucide-react";

interface EmployeeDashboardProps {
  session: UserSession;
  onExploreDirectory: () => void;
}

export function EmployeeDashboard({ session, onExploreDirectory }: EmployeeDashboardProps) {
  const { employeeData, name, email, department, position } = session;

  if (!employeeData) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-800">
        <p className="text-sm font-bold text-slate-600">No telemetry metrics loaded for this session ID.</p>
        <p className="text-xs text-slate-400 mt-1">Please try logging in again.</p>
      </div>
    );
  }

  // Interactive "What-if" parameters initialized with the Employee's actual stats!
  const [simProjects, setSimProjects] = useState(employeeData.Projects);
  const [simHours, setSimHours] = useState(employeeData.Working_Hours);
  const [simTraining, setSimTraining] = useState(employeeData.Training_Hours);
  const [simResult, setSimResult] = useState<"High" | "Average" | "Low">(employeeData.predictedPerformance);
  const [simRecommendation, setSimRecommendation] = useState(employeeData.recommendation);
  const [simLoading, setSimLoading] = useState(false);

  // --- ATTENDANCE SYSTEM STATES & HOOKS ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeLogStart, setActiveLogStart] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [currentWorkLocation, setCurrentWorkLocation] = useState("HQ Main Office");
  const [shiftNote, setShiftNote] = useState("");

  // Live Digital office clock ticking
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Track session duration elapsed time live
  useEffect(() => {
    if (!isCheckedIn || !activeLogStart) {
      setElapsedTime("00:00:00");
      return;
    }
    const durationInterval = setInterval(() => {
      const start = new Date(activeLogStart);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const secs = Math.floor((diffMs / 1000) % 60);
      const mins = Math.floor((diffMs / 60000) % 60);
      const hours = Math.floor(diffMs / 3600000);
      const pad = (num: number) => String(num).padStart(2, "0");
      setElapsedTime(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    }, 1000);
    return () => clearInterval(durationInterval);
  }, [isCheckedIn, activeLogStart]);

  // Read and initialize logs with realistic June 2026 data seeded
  useEffect(() => {
    const key = `emp_attendance_${employeeData.Employee_ID}`;
    const storedLogs = localStorage.getItem(key);
    const storedCheckInState = localStorage.getItem(`emp_is_checked_in_${employeeData.Employee_ID}`);
    const storedStart = localStorage.getItem(`emp_check_in_start_${employeeData.Employee_ID}`);

    if (storedLogs) {
      setAttendanceLogs(JSON.parse(storedLogs));
    } else {
      const seedData = [
        { date: "06/07/2026", time: "06:01:30 PM", type: "Check Out", location: "HQ Main Office", note: "Concluded client meetings", duration: "8h 50m" },
        { date: "06/07/2026", time: "09:10:48 AM", type: "Check In", location: "HQ Main Office", note: "Assisting team onboarding", duration: "-" },
        { date: "06/06/2026", time: "05:12:15 PM", type: "Check Out", location: "Remote Work", note: "All daily items resolved", duration: "8h 17m" },
        { date: "06/06/2026", time: "08:55:04 AM", type: "Check In", location: "Remote Work", note: "Working from home - task backlog", duration: "-" },
        { date: "06/05/2026", time: "05:45:22 PM", type: "Check Out", location: "HQ Main Office", note: "Daily wrap & build test completed", duration: "8h 43m" },
        { date: "06/05/2026", time: "09:02:11 AM", type: "Check In", location: "HQ Main Office", note: "On-site sprints workshop", duration: "-" },
      ];
      setAttendanceLogs(seedData);
      localStorage.setItem(key, JSON.stringify(seedData));
    }

    if (storedCheckInState === "true") {
      setIsCheckedIn(true);
    }
    if (storedStart) {
      setActiveLogStart(storedStart);
    }
  }, [employeeData.Employee_ID]);

  // Handle punch operations
  const handleCheckIn = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" });

    const newLog = {
      date: dateStr,
      time: timeStr,
      type: "Check In",
      location: currentWorkLocation,
      note: shiftNote.trim() || "Regular check-in",
      duration: "-"
    };

    const updated = [newLog, ...attendanceLogs];
    setAttendanceLogs(updated);
    setIsCheckedIn(true);
    setActiveLogStart(now.toISOString());
    setShiftNote("");

    localStorage.setItem(`emp_attendance_${employeeData.Employee_ID}`, JSON.stringify(updated));
    localStorage.setItem(`emp_is_checked_in_${employeeData.Employee_ID}`, "true");
    localStorage.setItem(`emp_check_in_start_${employeeData.Employee_ID}`, now.toISOString());
  };

  const handleCheckOut = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" });

    let durationStr = "-";
    if (activeLogStart) {
      const startTime = new Date(activeLogStart);
      const diffMs = now.getTime() - startTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    const newLog = {
      date: dateStr,
      time: timeStr,
      type: "Check Out",
      location: currentWorkLocation,
      note: shiftNote.trim() || "Shift concluded",
      duration: durationStr
    };

    const updated = [newLog, ...attendanceLogs];
    setAttendanceLogs(updated);
    setIsCheckedIn(false);
    setActiveLogStart(null);
    setShiftNote("");

    localStorage.setItem(`emp_attendance_${employeeData.Employee_ID}`, JSON.stringify(updated));
    localStorage.setItem(`emp_is_checked_in_${employeeData.Employee_ID}`, "false");
    localStorage.removeItem(`emp_check_in_start_${employeeData.Employee_ID}`);
  };

  // --- DYNAMIC TASK TRACKER STATE & COMPUTES ---
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>(() => {
    const key = `emp_tasks_${employeeData.Employee_ID}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      { id: "1", title: "Complete Q2 Deliverable Milestones Review", completed: true },
      { id: "2", title: "Review React & Express Server telemetry metrics", completed: false },
      { id: "3", title: "Participate in Departmental OKR Sync Sessions", completed: true },
      { id: "4", title: "Attend Gemini API safety alignment workshop", completed: false },
      { id: "5", title: "Log shift logs & complete pending task items", completed: true }
    ];
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [leadershipRole, setLeadershipRole] = useState<string>(() => {
    const key = `emp_leader_role_${employeeData.Employee_ID}`;
    return localStorage.getItem(key) || "Squad Coordinator";
  });

  // Save tasks and leadership state changes to localStorage
  useEffect(() => {
    localStorage.setItem(`emp_tasks_${employeeData.Employee_ID}`, JSON.stringify(tasks));
  }, [tasks, employeeData.Employee_ID]);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: String(Date.now()),
      title: newTaskTitle.trim(),
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateLeadershipRole = (role: string) => {
    setLeadershipRole(role);
    localStorage.setItem(`emp_leader_role_${employeeData.Employee_ID}`, role);
  };

  // Live total hours logged calculation
  const getCombinedLoggedHours = () => {
    let totalMins = 0;
    attendanceLogs.forEach(log => {
      if (log.duration && log.duration !== "-") {
        const parts = log.duration.split(" ");
        let h = 0;
        let m = 0;
        parts.forEach((p: string) => {
          if (p.endsWith("h")) h = parseInt(p) || 0;
          if (p.endsWith("m")) m = parseInt(p) || 0;
        });
        totalMins += h * 60 + m;
      }
    });

    if (isCheckedIn && activeLogStart) {
      const diffMs = currentTime.getTime() - new Date(activeLogStart).getTime();
      totalMins += Math.floor(diffMs / 60000);
    }

    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins}m`;
  };

  // Re-run prediction whenever sliders are adjusted
  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Experience: employeeData.Experience,
          Projects: simProjects,
          Working_Hours: simHours,
          Training_Hours: simTraining,
        }),
      });

      if (response.ok) {
        const result: PredictionResult = await response.json();
        setSimResult(result.Performance);
        setSimRecommendation(result.Recommendation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [simProjects, simHours, simTraining]);

  // Synchronize career goal-path simulator values for HR dashboard visibility
  useEffect(() => {
    localStorage.setItem(`emp_career_sim_projects_${employeeData.Employee_ID}`, String(simProjects));
    localStorage.setItem(`emp_career_sim_hours_${employeeData.Employee_ID}`, String(simHours));
    localStorage.setItem(`emp_career_sim_training_${employeeData.Employee_ID}`, String(simTraining));
    localStorage.setItem(`emp_career_sim_result_${employeeData.Employee_ID}`, simResult);
    localStorage.setItem(`emp_career_sim_recommendation_${employeeData.Employee_ID}`, simRecommendation || "");
  }, [simProjects, simHours, simTraining, simResult, simRecommendation, employeeData.Employee_ID]);

  // Styling helper based on performance levels
  const getBadgeStyles = (perf: "High" | "Average" | "Low") => {
    if (perf === "High") return "bg-emerald-50 text-emerald-800 border-emerald-100";
    if (perf === "Average") return "bg-indigo-50 text-indigo-800 border-indigo-100";
    return "bg-rose-50 text-rose-800 border-rose-100";
  };

  return (
    <div id="employee-dashboard-port" className="space-y-8 text-left animate-fade-in text-slate-800">
      
      {/* Dynamic Welcome Heading Panel */}
      <section id="welcome-employee-banner" className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-indigo-500/10 rounded-full translate-x-10 translate-y-10" />
        <div className="absolute top-0 left-1/3 w-28 h-28 bg-emerald-500/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Personal Career Compass Dashboard</span>
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Understand your performance parameters, modify simulator objectives, and lookup colleagues within the official active enterprise directory.
            </p>
          </div>

          <div className="flex flex-col gap-1 text-right text-xs shrink-0 font-semibold bg-white/5 border border-white/10 p-3.5 rounded-2xl md:min-w-[200px]">
            <div className="text-[10px] text-indigo-300 uppercase tracking-wider font-mono font-bold">Logged In Profile</div>
            <div className="text-zinc-50 font-bold mt-1 text-sm">{position}</div>
            <div className="text-indigo-200 text-[11px] font-mono mt-0.5">{email}</div>
          </div>
        </div>
      </section>

      {/* Main KPI Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Personal Bracket Summary */}
        <section id="employee-current-kpis" className="lg:col-span-4 space-y-6">
          {/* Performance Classification Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-slate-400">
                Evaluation Bracket
              </h3>
              <span className="text-[10px] bg-slate-50 border border-slate-100 font-mono text-slate-500 rounded-full py-0.5 px-2.5 font-bold">
                {employeeData.Employee_ID}
              </span>
            </div>

            <div className="text-center py-4 space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-slate-50 to-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <span className={`inline-block border px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyles(employeeData.Performance)}`}>
                  {employeeData.Performance} Performer
                </span>
                <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider mt-2">
                  OFFICIAL MODEL INDEX
                </p>
              </div>
            </div>

            {/* Micro parameters list */}
            <div className="space-y-2.5 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Corporate Experience:</span>
                <span className="text-slate-800 font-bold font-mono">{employeeData.Experience} Years</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Projects Handled:</span>
                <span className="text-slate-800 font-bold font-mono">{employeeData.Projects} Sprints</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Average Working Hours:</span>
                <span className="text-slate-800 font-bold font-mono">{employeeData.Working_Hours}h/day</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Training Course Hours:</span>
                <span className="text-slate-800 font-bold font-mono">{employeeData.Training_Hours} Hours</span>
              </div>
            </div>
          </div>

          {/* Daily Shift & Attendance Tracker */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                <h3 className="text-[11px] font-extrabold uppercase font-mono tracking-wider text-slate-400">
                  Daily Clock-In & Shifts
                </h3>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded-full border ${
                isCheckedIn 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100 animate-pulse" 
                  : "bg-amber-50 text-amber-800 border-amber-150"
              }`}>
                {isCheckedIn ? "● On Duty" : "○ Off Duty"}
              </span>
            </div>

            {/* Office Time Zone / Clock Details */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">Office Clock</span>
                <div className="text-sm font-extrabold font-mono text-slate-850">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
              <div className="space-y-0.5 border-l border-slate-150 pl-3.5">
                {isCheckedIn ? (
                  <>
                    <span className="text-[9px] text-indigo-500 uppercase font-mono font-extrabold tracking-wider">Session Run</span>
                    <div className="text-sm font-bold font-mono text-indigo-600 animate-pulse">
                      {elapsedTime}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">Today's Date</span>
                    <div className="text-xs font-bold font-mono text-slate-700 mt-0.5">
                      {currentTime.toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Work Configuration (Select location) */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                  Active Work Mode
                </label>
                <select
                  value={currentWorkLocation}
                  onChange={(e) => setCurrentWorkLocation(e.target.value)}
                  disabled={isCheckedIn}
                  className="w-full text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 outline-none transition-colors duration-150 text-slate-750 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="HQ Main Office">🏢 HQ Main Office (On-Site)</option>
                  <option value="Remote Work">🏠 Remote Work (Home Office)</option>
                  <option value="Client Site">🤝 Client Site (Field Travel)</option>
                </select>
              </div>

              {/* Enter Note */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">
                  Shift Notes / Focus
                </label>
                <input
                  type="text"
                  placeholder={isCheckedIn ? "E.g. Daily checkout, all sprints tested" : "E.g. In-office task backlog, group sync"}
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2.5 hover:border-slate-300 border border-slate-200 rounded-xl outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 placeholder:text-slate-400"
                />
              </div>

              {/* Check in / Check out Action button */}
              <div>
                {isCheckedIn ? (
                  <button
                    onClick={handleCheckOut}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold tracking-tight transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-600/10 active:scale-98"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Conclude Work Session (Check Out)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold tracking-tight transition flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/10 active:scale-98"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span>Initiate Work Session (Check In)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Shift Activity Logs */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-[9px] uppercase font-mono font-extrabold tracking-wider text-slate-400">
                <span>Shift Activity Logs</span>
                <span>Punch history</span>
              </div>
              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {attendanceLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-4 font-semibold italic">No shift entries on record.</p>
                ) : (
                  attendanceLogs.slice(0, 4).map((log, index) => (
                    <div key={index} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5 text-xs">
                      <div className={`p-1.5 rounded-lg shrink-0 ${log.type === "Check In" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                        {log.type === "Check In" ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-800">{log.type}</span>
                          <span className="text-[9px] text-slate-400 font-bold font-mono">{log.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-indigo-750 font-bold font-mono uppercase bg-indigo-50 px-1 py-0.2 rounded shrink-0">{log.location}</span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold">{log.time}</span>
                        </div>
                        {log.note && (
                          <p className="text-[10px] text-slate-500 font-medium mt-1 bg-white p-2 rounded-lg border border-slate-100 italic break-words shrink-0">
                            "{log.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Directory */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 p-5 rounded-2xl text-left space-y-3">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Looking for teammates?</span>
            </h4>
            <p className="text-[11px] text-indigo-755 leading-relaxed font-sans font-medium text-indigo-700/90">
              Need to contact colleagues or check team emails? You can search the verified corporate people list right now.
            </p>
            <button
              onClick={onExploreDirectory}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
            >
              <span>Launch Coworker Directory</span>
            </button>
          </div>
        </section>

        {/* Right Column: Interactive Sim & Playbook prescriptions */}
        <div id="employee-interactive-sim" className="lg:col-span-8 space-y-8">
          
          {/* Interactive Career Path Goal Simulator */}
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Professional Playground</h3>
                <h2 className="text-base font-extrabold text-slate-950 mt-0.5">Interactive Career Goal Paths Simulator</h2>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
              Curious how adjustments in your core work metrics would alter your predicted evaluation? Move the sliders below to simulate different sprint and training goal levels. All outcomes compute live using the Gini Decision Tree.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Sliders Input Column */}
              <div className="space-y-4 p-4 border border-slate-50 bg-slate-50/50 rounded-2xl">
                {/* 1. Projects */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Target Sprints/Projects Handled</span>
                    <span className="text-indigo-650 text-indigo-600 font-mono">{simProjects}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={simProjects}
                    onChange={(e) => setSimProjects(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                    <span>1 sprint</span>
                    <span>15 sprints</span>
                  </div>
                </div>

                {/* 2. Working Hours */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Target Working Hours per Day</span>
                    <span className="text-indigo-650 text-indigo-600 font-mono">{simHours}h/day</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="14"
                    step="1"
                    value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                    <span>4 hours</span>
                    <span>14 hours</span>
                  </div>
                </div>

                {/* 3. Training Hours */}
                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                    <span>Training Course Hours</span>
                    <span className="text-indigo-650 text-indigo-600 font-mono">{simTraining} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={simTraining}
                    onChange={(e) => setSimTraining(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                    <span>0 hours</span>
                    <span>120 hours</span>
                  </div>
                </div>
              </div>

              {/* Simulation Result Column */}
              <div className="space-y-4">
                <div className="bg-slate-950 text-white rounded-2xl p-5 text-left flex flex-col justify-between min-h-[170px] relative overflow-hidden shadow-md">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-x-5 -translate-y-5" />
                  
                  <div className="space-y-1">
                    <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5" />
                      <span>Simulated Outcome Tier</span>
                    </span>
                    <p className="text-xl font-extrabold tracking-tight mt-1">
                      {simLoading ? "Evaluating Real-time..." : `${simResult} Performer`}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-350 leading-relaxed font-sans font-medium mt-3 border-t border-white/5 pt-3">
                    If you complete <span className="text-indigo-300 font-bold">{simProjects} sprints</span>, schedule <span className="text-indigo-300 font-bold">{simHours}h/day</span>, and complete <span className="text-indigo-300 font-bold">{simTraining} hours</span> of skill builders, the computer classifier targets your status as <span className="font-bold underline decoration-indigo-400">{simResult}</span>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC OVERALL PERFORMANCE APPRAISAL SCORECARD */}
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Real-Time Employee Index</h3>
                  <h2 className="text-base font-extrabold text-slate-950 mt-0.5">Overall Performance & Appraisal Scorecard</h2>
                </div>
              </div>

              {/* Overall Evaluated Health Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Appraisal Status</span>
                <span className="inline-flex mt-1 text-xs font-extrabold bg-indigo-600 text-white shadow-xs rounded-full py-1 px-3.5 tracking-tight animate-fade-in">
                  {(() => {
                    const compTasks = tasks.filter(t => t.completed).length;
                    const totTasks = tasks.length;
                    const taskCompletionRate = totTasks > 0 ? (compTasks / totTasks) : 0;
                    
                    let performanceMultiplier = 60;
                    if (simResult === "High") performanceMultiplier = 88;
                    if (simResult === "Average") performanceMultiplier = 75;
                    if (simResult === "Low") performanceMultiplier = 50;

                    const trainingFactor = Math.min(12, (simTraining / 120) * 12);
                    const taskFactor = taskCompletionRate * 15;
                    const improvementScore = Math.min(100, Math.round(performanceMultiplier + trainingFactor + taskFactor));
                    const overallPoints = improvementScore + (leadershipRole !== "None" ? 10 : 0);
                    
                    if (overallPoints >= 90) return "★ Exceptional Performer";
                    if (overallPoints >= 75) return "Above Expectations";
                    if (overallPoints >= 60) return "Meets Expectations";
                    return "Needs Alignment & Sync";
                  })()}
                </span>
              </div>
            </div>

            {/* Profile & Telemetry Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Verified Name</span>
                <div className="text-xs font-extrabold text-slate-800 truncate">{name}</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200/60 pl-3.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Employee ID</span>
                <div className="text-xs font-mono font-extrabold text-indigo-700">{employeeData.Employee_ID}</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200/60 pl-3.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Department</span>
                <div className="text-xs font-extrabold text-slate-800">{department}</div>
              </div>
              <div className="space-y-0.5 border-l border-slate-200/60 pl-3.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Corp Experience</span>
                <div className="text-xs font-mono font-extrabold text-slate-800">{employeeData.Experience} Years</div>
              </div>
            </div>

            {/* Side-by-Side: Interactive Tasks & Live Performance Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              
              {/* Task Console (Left side) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-extrabold text-slate-800">Target Taskboard Checklist</h4>
                  </div>
                  
                  <div className="flex gap-1 bg-slate-50 border border-slate-100 p-0.5 rounded-lg">
                    <span className="text-[9.5px] font-bold font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                      {tasks.filter(t => t.completed).length} Done
                    </span>
                    <span className="text-[9.5px] font-bold font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                      {tasks.filter(t => !t.completed).length} Pending
                    </span>
                  </div>
                </div>

                {/* Add task bar */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter urgent pending task..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none transition focus:border-indigo-600 focus:bg-white placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                  >
                    Add Task
                  </button>
                </form>

                {/* Tasks loop list */}
                <div className="space-y-2 max-h-[196px] overflow-y-auto pr-1">
                  {tasks.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-slate-400 italic">All taskboard items cleared! Complete your agenda.</div>
                  ) : (
                    tasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          task.completed 
                            ? "bg-slate-50/60 border-slate-100 opacity-75" 
                            : "bg-white border-slate-150 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer shrink-0"
                          />
                          <span className={`text-xs font-semibold truncate ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                            {task.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition ml-2 cursor-pointer"
                          title="Remove task"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic appraisal performance analytics (Right side) */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-dashed border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Interactive Performance Metrics</span>
                </h4>

                <div className="space-y-3">
                  
                  {/* WORK IMPROVEMENT CARD */}
                  <div className="bg-slate-50 hover:bg-slate-100/50 transition-colors p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400">
                      <span>Work Improvement Index</span>
                      <span className="text-xs font-extrabold text-indigo-700">
                        {(() => {
                          const compTasks = tasks.filter(t => t.completed).length;
                          const totTasks = tasks.length;
                          const taskCompletionRate = totTasks > 0 ? (compTasks / totTasks) : 0;
                          
                          let performanceMultiplier = 60;
                          if (simResult === "High") performanceMultiplier = 88;
                          if (simResult === "Average") performanceMultiplier = 75;
                          if (simResult === "Low") performanceMultiplier = 50;

                          const trainingFactor = Math.min(12, (simTraining / 120) * 12);
                          const taskFactor = taskCompletionRate * 15;
                          return Math.min(100, Math.round(performanceMultiplier + trainingFactor + taskFactor));
                        })()}%
                      </span>
                    </div>
                    {/* Glowing Progress bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden font-sans">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${(() => {
                            const compTasks = tasks.filter(t => t.completed).length;
                            const totTasks = tasks.length;
                            const taskCompletionRate = totTasks > 0 ? (compTasks / totTasks) : 0;
                            
                            let performanceMultiplier = 60;
                            if (simResult === "High") performanceMultiplier = 88;
                            if (simResult === "Average") performanceMultiplier = 75;
                            if (simResult === "Low") performanceMultiplier = 50;

                            const trainingFactor = Math.min(12, (simTraining / 120) * 12);
                            const taskFactor = taskCompletionRate * 15;
                            return Math.min(100, Math.round(performanceMultiplier + trainingFactor + taskFactor));
                          })()}%`
                        }}
                      />
                    </div>
                    <span className="text-[9.5px] text-slate-400 leading-normal block italic font-medium">
                      Calculated from real-time performance inputs, training courses, and taskboard completeness.
                    </span>
                  </div>

                  {/* ATTENDANCE DATA LINK */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9.5px] uppercase tracking-wider font-mono font-bold text-slate-400 block">Logged Hours (Check In/Out)</span>
                      <div className="font-extrabold text-slate-800 font-mono mt-0.5 text-xs">{getCombinedLoggedHours()}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9.5px] uppercase tracking-wider font-mono font-bold text-slate-400 block">Duty Logs</span>
                      <div className="font-bold text-emerald-700 font-mono mt-0.5 text-xs">{attendanceLogs.length} entries registered</div>
                    </div>
                  </div>

                  {/* LEADERSHIP ROLES ACCREDITATION */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400">Leadership Accreditation</span>
                      <span className="text-[9px] font-bold font-mono text-indigo-700 uppercase bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded">
                        {leadershipRole !== "None" ? "Active Leadership +10pts" : "Standard track"}
                      </span>
                    </div>

                    <select
                      value={leadershipRole}
                      onChange={(e) => handleUpdateLeadershipRole(e.target.value)}
                      className="w-full text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-xl px-2.5 py-2 hover:border-slate-300 outline-none cursor-pointer"
                    >
                      <option value="None">❌ None / Member Role</option>
                      <option value="Sprint Coordinator">📅 Sprint Coordinator Role</option>
                      <option value="Technical Peer Mentor">🤝 Technical Peer Mentor Role</option>
                      <option value="Squad Coordinator">🛡️ Squad Coordinator Role</option>
                      <option value="Corporate Committee Lead">🏛️ Corporate Committee Lead</option>
                    </select>
                  </div>

                </div>
              </div>

            </div>

            {/* Small footnote */}
            <div className="border-t border-slate-50 pt-3 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span>All appraisal levels sync live with local session memory.</span>
            </div>
          </section>

          {/* Core Personalized Recommended Playbook (Current) */}
          <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Actionable Milestones</h3>
                <h2 className="text-base font-extrabold text-slate-950 mt-0.5">Your Personalized Career Improvement Playbook</h2>
              </div>
            </div>

            <div className="p-4.5 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex items-start gap-3">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
              </span>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-extrabold text-emerald-999 text-emerald-950">Active Action Framework Plan</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                  {simResult === employeeData.predictedPerformance 
                    ? employeeData.recommendation 
                    : simRecommendation
                  }
                </p>
              </div>
            </div>

            <div className="p-4 border border-slate-105 bg-slate-50/50 rounded-xl flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-500 font-medium leading-relaxed font-sans">
                These dynamic playbooks are curated server-side using conditional branches generated by the Decision Tree split boundaries. Discuss details with your People Success Partner.
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
