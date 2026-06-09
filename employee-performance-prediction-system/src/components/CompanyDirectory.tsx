/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Building,
  Briefcase,
  Copy,
  Check,
  Users,
  ShieldAlert,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles,
  X,
  ChevronRight,
  Activity,
  CheckSquare,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { DirectoryEmployee } from "../types";

export function CompanyDirectory() {
  const [employees, setEmployees] = useState<DirectoryEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Drilldown panel overlay state
  const [activeDrilldownEmp, setActiveDrilldownEmp] = useState<DirectoryEmployee | null>(null);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/directory");
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error("Failed to load staff directory: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const handleCopyEmail = (email: string, empId: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(empId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const departmentsList = ["All", ...Array.from(new Set(employees.map((e) => e.Department)))];

  const filteredEmployees = employees.filter((e) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      e.Name.toLowerCase().includes(query) ||
      e.Employee_ID.toLowerCase().includes(query) ||
      e.Email.toLowerCase().includes(query) ||
      e.Position.toLowerCase().includes(query) ||
      e.Department.toLowerCase().includes(query);

    const matchesDept = selectedDept === "All" || e.Department === selectedDept;

    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-650 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono font-bold uppercase">Loading Directory Records...</p>
      </div>
    );
  }

  return (
    <div id="company-directory-panel" className="space-y-6 text-left animate-fade-in text-slate-800">
      {/* Banner / Info Summary */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-3xl p-6 text-left relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-emerald-600/10 rounded-full pointer-events-none translate-x-12 translate-y-12" />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>Corporate Staff Index</span>
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Active Team Directory</h2>
          <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed font-sans font-medium">
            Verify active personnel currently registered inside the system database. Check company mail domains, active roles, task tracking agendas, and simulated performance metrics syncing in real-time.
          </p>
        </div>
      </div>

      {/* Filter and Search Actions */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Field */}
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, position, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/5 transition-all text-slate-700"
          />
        </div>

        {/* Departments Badges row */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          {departmentsList.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-all cursor-pointer ${
                selectedDept === dept
                  ? "bg-indigo-650 bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-55 bg-slate-50 text-slate-550 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </section>

      {/* Directory Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((e) => {
            const initials = e.Name.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            // Color palette by department
            let badgeBg = "bg-slate-50 text-slate-600";
            if (e.Department === "Engineering") badgeBg = "bg-sky-50 text-sky-800 font-bold";
            if (e.Department === "Product Management") badgeBg = "bg-amber-50 text-amber-800 font-bold";
            if (e.Department === "Marketing & Growth") badgeBg = "bg-rose-50 text-rose-800 font-bold";
            if (e.Department === "Sales Operations") badgeBg = "bg-emerald-50 text-emerald-800 font-bold";
            if (e.Department === "Finance & Strategy") badgeBg = "bg-teal-50 text-teal-800 font-bold";
            if (e.Department === "People Operations") badgeBg = "bg-indigo-50 text-indigo-800 font-bold";
            if (e.Department === "Quality Assurance") badgeBg = "bg-purple-50 text-purple-800 font-bold";

            // Local tracking status flags preview
            const hasTasks = localStorage.getItem(`emp_tasks_${e.Employee_ID}`);
            const isCheckedIn = localStorage.getItem(`emp_is_checked_in_${e.Employee_ID}`) === "true";

            return (
              <div
                key={e.Employee_ID}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:border-slate-300 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top user badge */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-950 font-sans tracking-tight text-xs leading-tight truncate">
                        {e.Name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider mt-0.5 flex flex-wrap items-center gap-1">
                        <span>{e.Employee_ID}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded ${badgeBg} text-[9px] font-mono`}>
                          {e.Department}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Body positions list */}
                  <div className="space-y-2 text-xs pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold truncate">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{e.Position}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 group">
                      <div className="flex items-center gap-2 font-semibold overflow-hidden">
                        <Mail className="w-3.5 h-3.5 text-indigo-550 shrink-0" />
                        <span className="truncate text-[11px] font-mono font-bold text-indigo-900">
                          {e.Email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyEmail(e.Email, e.Employee_ID)}
                        className="p-1 hover:bg-slate-5w rounded text-slate-400 hover:text-slate-700 transition"
                        title="Copy Email Address"
                      >
                        {copiedId === e.Employee_ID ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Micro Live Indicators Snippet inside cards */}
                  {(hasTasks || isCheckedIn) && (
                    <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] font-mono leading-none">
                      <span className="flex items-center gap-1 font-extrabold text-indigo-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                        LIVE SYNC
                      </span>
                      <div className="flex gap-1.5">
                        {isCheckedIn && (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[8.5px]">
                            🟢 Online
                          </span>
                        )}
                        {hasTasks && (() => {
                          const list = JSON.parse(hasTasks);
                          const done = list.filter((t: any) => t.completed).length;
                          return (
                            <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[8.5px]">
                              Tasks: {done}/{list.length}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer specs details + Live inspect button */}
                <div className="mt-4 pt-3 border-t border-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold font-mono">
                    <div className="flex gap-4.5">
                      <div>
                        <span>EXP: </span>
                        <span className="text-slate-700">{e.Experience}y</span>
                      </div>
                      <div>
                        <span>PROJ: </span>
                        <span className="text-slate-700">{e.Projects}</span>
                      </div>
                      <div>
                        <span>TRAIN: </span>
                        <span className="text-slate-700">{e.Training_Hours}h</span>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        e.Performance === "High"
                          ? "bg-emerald-50 text-emerald-700"
                          : e.Performance === "Average"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {e.Performance}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDrilldownEmp(e)}
                    className="w-full py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono rounded-xl border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sync Live Appraisal Report</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 text-center py-20 space-y-2">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-500">No matching employee records found.</p>
          <p className="text-[10px] text-slate-400 font-mono">Verify your search characters or choose a different filter tier.</p>
        </div>
      )}

      {/* 📊 REAL-TIME HR SYNC & APPRAISAL SCORECARD DRILLDOWN OVERLAY */}
      {activeDrilldownEmp && (() => {
        const emp = activeDrilldownEmp;
        const empID = emp.Employee_ID;

        // 1. Fetch Dynamic Tasks
        const storedTasks = localStorage.getItem(`emp_tasks_${empID}`);
        const tasks = storedTasks ? JSON.parse(storedTasks) : [
          { id: "1", title: "Complete Q2 Deliverable Milestones Review", completed: true },
          { id: "2", title: "Review React & Express Server telemetry metrics", completed: false },
          { id: "3", title: "Participate in Departmental OKR Sync Sessions", completed: true },
          { id: "4", title: "Attend Gemini API safety alignment workshop", completed: false },
          { id: "5", title: "Log shift logs & complete pending task items", completed: true }
        ];

        const compTasks = tasks.filter((t: any) => t.completed).length;
        const totTasks = tasks.length;
        const taskRate = totTasks > 0 ? (compTasks / totTasks) : 0;

        // 2. Fetch Active Attendance Check in/out logs
        const isCheckedIn = localStorage.getItem(`emp_is_checked_in_${empID}`) === "true";
        const storedLogs = localStorage.getItem(`emp_attendance_${empID}`);
        const attendanceLogs = storedLogs ? JSON.parse(storedLogs) : [
          { date: "06/07/2026", time: "06:01:30 PM", type: "Check Out", location: "HQ Main Office", note: "Concluded client meetings", duration: "8h 50m" },
          { date: "06/07/2026", time: "09:10:48 AM", type: "Check In", location: "HQ Main Office", note: "Assisting team onboarding", duration: "-" },
          { date: "06/06/2026", time: "05:12:15 PM", type: "Check Out", location: "Remote Work", note: "All daily items resolved", duration: "8h 17m" },
          { date: "06/06/2026", time: "08:55:04 AM", type: "Check In", location: "Remote Work", note: "Working from home - task backlog", duration: "-" }
        ];

        // Total hours calculated dynamically
        let totalMins = 0;
        attendanceLogs.forEach((log: any) => {
          if (log.duration && log.duration !== "-") {
            const parts = log.duration.split(" ");
            let h = 0, m = 0;
            parts.forEach((p: string) => {
              if (p.endsWith("h")) h = parseInt(p) || 0;
              if (p.endsWith("m")) m = parseInt(p) || 0;
            });
            totalMins += h * 60 + m;
          }
        });
        const hrsAgg = Math.floor(totalMins / 60);
        const minsAgg = totalMins % 65 || totalMins % 60; // graceful output formatting

        // 3. Leadership Role Accredited
        const leadershipRole = localStorage.getItem(`emp_leader_role_${empID}`) || "Squad Coordinator";

        // 4. Career Goal Path Simulator states (What-if tracker outputs)
        const simProjects = parseInt(localStorage.getItem(`emp_career_sim_projects_${empID}`) || String(emp.Projects));
        const simHours = parseInt(localStorage.getItem(`emp_career_sim_hours_${empID}`) || String(emp.Working_Hours));
        const simTraining = parseInt(localStorage.getItem(`emp_career_sim_training_${empID}`) || String(emp.Training_Hours));
        const simResult = localStorage.getItem(`emp_career_sim_result_${empID}`) || emp.Performance;
        const simRecommendation = localStorage.getItem(`emp_career_sim_recommendation_${empID}`) || "Strategic baseline performance alignment tracks established.";

        // Live calculation of Dynamic Work Improvement index matching Employee Dashboard mathematical model
        let perfMultiplier = 60;
        if (simResult === "High") perfMultiplier = 88;
        if (simResult === "Average") perfMultiplier = 75;
        if (simResult === "Low") perfMultiplier = 50;

        const trainingFactor = Math.min(12, (simTraining / 120) * 12);
        const taskFactor = taskRate * 15;
        const improvementScore = Math.min(100, Math.round(perfMultiplier + trainingFactor + taskFactor));
        const overallPoints = improvementScore + (leadershipRole !== "None" ? 10 : 0);

        // Appraisal Status text and coloring
        let appraisalStatus = "Meets Expectations";
        let scoreColor = "text-indigo-650";
        let borderBadge = "border-indigo-100 bg-indigo-50/50 text-indigo-800";
        
        if (overallPoints >= 90) {
          appraisalStatus = "★ Exceptional Performer";
          scoreColor = "text-emerald-600";
          borderBadge = "border-emerald-100 bg-emerald-50 text-emerald-800";
        } else if (overallPoints >= 75) {
          appraisalStatus = "Above Expectations";
          scoreColor = "text-indigo-600";
          borderBadge = "border-sky-100 bg-sky-50 text-sky-800";
        } else if (overallPoints < 60) {
          appraisalStatus = "Needs Performance Alignment Dialogue";
          scoreColor = "text-rose-600";
          borderBadge = "border-rose-100 bg-rose-50 text-rose-800";
        }

        return (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in font-sans">
            <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full p-6 space-y-6 shadow-xl relative animate-scale-up text-left text-slate-800">
              
              {/* Close Button top corner */}
              <button
                type="button"
                onClick={() => setActiveDrilldownEmp(null)}
                className="absolute right-5 top-5 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Title */}
              <div className="border-b border-slate-100 pb-4 pr-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400/90 font-mono font-bold uppercase tracking-wider">HR Real-Time Audit Gateway</span>
                    <h3 className="text-lg font-extrabold text-slate-950 mt-0.5">{emp.Name} Appraisal Profile</h3>
                  </div>
                </div>

                <div className="text-[10px] font-mono leading-none flex items-center gap-2">
                  <span className={`inline-flex py-1 px-3.5 rounded-full border text-[10px] font-extrabold ${borderBadge}`}>
                    {appraisalStatus}
                  </span>
                </div>
              </div>

              {/* Top Demographic Data Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Employee ID</span>
                  <div className="font-extrabold text-indigo-600 font-mono mt-0.5">{empID}</div>
                </div>
                <div className="border-l border-slate-200/80 pl-3.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Department</span>
                  <div className="font-extrabold text-slate-800 mt-0.5 mt-0.5 leading-none">{emp.Department}</div>
                </div>
                <div className="border-l border-slate-200/80 pl-3.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Designated Title</span>
                  <div className="font-extrabold text-slate-800 mt-0.5 truncate">{emp.Position}</div>
                </div>
                <div className="border-l border-slate-200/80 pl-3.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Database Exp</span>
                  <div className="font-extrabold text-slate-800 mt-0.5 font-mono">{emp.Experience} Years</div>
                </div>
              </div>

              {/* Main Content Body: Split into Interactive Simulator values & Check-in / Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Panel Left: Tasks & Check-in state */}
                <div className="space-y-4">
                  {/* Attendance Log Box */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Attendance Tracker Stats</span>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${isCheckedIn ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                        {isCheckedIn ? "🟢 Checked In" : "🔴 Checked Out"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Agg Duty Hours</span>
                        <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">{hrsAgg}h {minsAgg}m</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Friction Logs</span>
                        <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">{attendanceLogs.length} shifts</span>
                      </div>
                    </div>

                    {/* Micro logs list */}
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {attendanceLogs.slice(0, 3).map((log: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] font-semibold text-slate-500 bg-slate-50/50 p-1.5 rounded-lg border border-slate-100">
                          <span className="font-mono">{log.date}</span>
                          <span className="font-mono">{log.type}</span>
                          <span className="text-slate-700 font-bold">{log.duration !== "-" ? log.duration : "Active"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tasks List Log Box */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Taskboard Performance logs</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded">
                        {compTasks} Completed / {totTasks - compTasks} Pending
                      </span>
                    </div>

                    {/* Live checklist items loop */}
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {tasks.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-2 p-2 bg-slate-50/60 rounded-xl border border-slate-100/90 text-xs">
                          <div className="shrink-0">
                            {t.completed ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-650 text-emerald-650" style={{ color: "#10b981" }} />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded border border-slate-350 bg-white" />
                            )}
                          </div>
                          <span className={`truncate text-[10.5px] font-semibold ${t.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Panel Right: Career goals simulation outcomes */}
                <div className="space-y-4">
                  {/* Simulated Career Parameters Box */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Active Careers Goals Simulation</span>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-150 py-0.5 px-2 rounded font-mono font-bold">
                        What-If Output Values
                      </span>
                    </div>

                    {/* Compare baseline stats vs simulated stats */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-semibold">Simulated Sprints Project:</span>
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <span className="text-slate-400 line-through">{emp.Projects}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-indigo-750 text-indigo-700">{simProjects}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-semibold">Simulated Duty Hours:</span>
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <span className="text-slate-400 line-through">{emp.Working_Hours}h</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-indigo-750 text-indigo-700">{simHours}h/day</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 font-semibold">Simulated Upskill Courses:</span>
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <span className="text-slate-400 line-through">{emp.Training_Hours}h</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-indigo-750 text-indigo-700">{simTraining} hours</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50">
                        <span className="text-indigo-950 font-bold">Projected Index Category:</span>
                        <div className="flex items-center gap-1.5 font-extrabold font-mono text-xs">
                          <span className="text-slate-400 line-through">{emp.Performance}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="text-indigo-700 uppercase">{simResult} Performance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Apprisal Indexes Points */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500 font-semibold upper font-sans text-[10px] uppercase tracking-wider">Dynamic Work Improvement Index</span>
                      <span className={`text-sm ${scoreColor} font-extrabold font-mono`}>{improvementScore}%</span>
                    </div>
                    {/* Progress slider track */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${improvementScore}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[10px] uppercase font-mono font-bold border-t border-slate-200/60 text-slate-400">
                      <span>Leadership Role:</span>
                      <span className="text-indigo-750 text-indigo-750 bg-indigo-50/80 px-1.5 py-0.2 rounded" style={{ color: "#4f46e5" }}>
                        {leadershipRole !== "None" ? leadershipRole : "Standard path / Member"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-slate-400">
                      <span>Adjusted Compensation Index:</span>
                      <span className="text-slate-800 font-extrabold">{overallPoints} Points Score</span>
                    </div>

                    <p className="text-[10px] text-slate-400 italic leading-snug font-medium pt-1.5">
                      💡 <strong>HR Recommendations Guidance:</strong> {simRecommendation}
                    </p>
                  </div>

                </div>

              </div>

              {/* Close Button footer bar */}
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveDrilldownEmp(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-sm font-semibold"
                >
                  Conclude Sync Audit
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
