/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Users, Award, TrendingUp, AlertTriangle, BookOpen, Activity, Sparkles } from "lucide-react";
import { DashboardAnalytics } from "../types";
import {
  PerformancePieChart,
  TrainingDonutChart,
  ExperienceVsPerformanceBarChart,
  ProjectsVsPerformanceBarChart,
  WorkingHoursLineChart
} from "./CustomCharts";

interface DashboardProps {
  analytics: DashboardAnalytics;
  onNavigateToPredict: () => void;
}

export function Dashboard({ analytics, onNavigateToPredict }: DashboardProps) {
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<"Low" | "Average" | "High">("Average");

  const pctHigh = Math.round((analytics.highPerformers / analytics.totalEmployees) * 100) || 0;
  const pctAverage = Math.round((analytics.averagePerformers / analytics.totalEmployees) * 100) || 0;
  const pctLow = Math.round((analytics.lowPerformers / analytics.totalEmployees) * 100) || 0;

  return (
    <div id="hr-dashboard" className="space-y-8 animate-fade-in">
      {/* 🔹 TOP METRICS KPI CARDS */}
      <section id="top-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Employees */}
        <div id="kpi-total-employees" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 hover:-translate-y-1 transition-all duration-305 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Total Employees</span>
            <div className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
              {analytics.totalEmployees}
            </div>
            <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Dataset capacity loaded
            </span>
          </div>
          <div className="p-3 bg-indigo-505 text-indigo-600 rounded-xl relative z-10 bg-indigo-50">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 2: High Performers */}
        <div id="kpi-high" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 hover:-translate-y-1 transition-all duration-305 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">High Performance</span>
            <div className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
              {analytics.highPerformers}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
              <span>{pctHigh}% of workforce</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl relative z-10">
            <Award className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 3: Average Performers */}
        <div id="kpi-average" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 hover:-translate-y-1 transition-all duration-305 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Average Performance</span>
            <div className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
              {analytics.averagePerformers}
            </div>
            <span className="text-[10px] text-indigo-650 font-semibold flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-full w-fit">
              <span>{pctAverage}% of workforce</span>
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl relative z-10">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Card 4: Low Performers */}
        <div id="kpi-low" className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 hover:-translate-y-1 transition-all duration-305 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-1 relative z-10">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Low Performance</span>
            <div className="text-3xl font-extrabold text-slate-850 font-sans tracking-tight">
              {analytics.lowPerformers}
            </div>
            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-full w-fit">
              <span>{pctLow}% of workforce</span>
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl relative z-10">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
        </div>
      </section>

      {/* 🔹 GRAPHS CONTAINER DIRECT FROM DATASET REQUIRED */}
      <section id="analytics-graphs" className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 font-mono">Dynamic Graphs</span>
            <h2 className="text-xl font-extrabold text-slate-800 mt-1">Operational Analytics Matrix</h2>
          </div>
          <span className="text-[10.5px] bg-slate-100 text-slate-400 font-mono py-1 px-3 rounded-full select-none">
            Dataset source: active employee_data.csv
          </span>
        </div>

        {/* Row 1: Key Performance Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Experience vs Performance */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex flex-col gap-0.5 px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">Distribution Correlation</h3>
              <h4 className="text-md font-bold text-slate-800">Experience vs Performance</h4>
            </div>
            <ExperienceVsPerformanceBarChart data={analytics.experienceData} />
          </div>

          {/* Chart 2: Projects vs Performance */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex flex-col gap-0.5 px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">Milestones Correlation</h3>
              <h4 className="text-md font-bold text-slate-800">Projects Handled vs Performance</h4>
            </div>
            <ProjectsVsPerformanceBarChart data={analytics.projectsData} />
          </div>
        </div>

        {/* Row 2: Hours distribution & overall weights */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Chart 3: Working Hours vs Performance */}
          <div className="md:col-span-6 lg:col-span-4 space-y-2">
            <div className="flex flex-col gap-0.5 px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">Fatigue / Engagement Index</h3>
              <h4 className="text-md font-bold text-slate-800">Working Hours per Day</h4>
            </div>
            <WorkingHoursLineChart data={analytics.workingHoursData} />
          </div>

          {/* Chart 4: Training Hours Distribution */}
          <div className="md:col-span-6 lg:col-span-4 space-y-2">
            <div className="flex flex-col gap-0.5 px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">L&D Engagement</h3>
              <h4 className="text-md font-bold text-slate-800">Training Hours Breakdown</h4>
            </div>
            <TrainingDonutChart data={analytics.trainingDistribution} />
          </div>

          {/* Chart 5: Performance Distribution */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex flex-col gap-0.5 px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider font-mono">Workforce Density</h3>
              <h4 className="text-md font-bold text-slate-850">Overall Performance Ratio</h4>
            </div>
            <PerformancePieChart data={analytics.performanceDistribution} />
          </div>
        </div>
      </section>

      {/* 🔹 RECOMMENDATION PANEL SPECIFIED BY USER */}
      <section id="recommendation-panel" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-55 pb-4 gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Action Guide</h3>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 mt-1">
              Structured Performance Playbooks
            </h2>
          </div>

          {/* Elegant tab selectors */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-500 border border-slate-200">
            <button
              id="tab-low"
              onClick={() => setActiveRecommendationTab("Low")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRecommendationTab === "Low"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "hover:text-slate-855"
              }`}
            >
              Low Performers
            </button>
            <button
              id="tab-average"
              onClick={() => setActiveRecommendationTab("Average")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRecommendationTab === "Average"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "hover:text-slate-855"
              }`}
            >
              Average Performers
            </button>
            <button
              id="tab-high"
              onClick={() => setActiveRecommendationTab("High")}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRecommendationTab === "High"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "hover:text-slate-855"
              }`}
            >
              High Performers
            </button>
          </div>
        </div>

        {/* Live Tab Content Rendering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {activeRecommendationTab === "Low" && (
            <>
              <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/20 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs font-mono">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Onboarding & Skills Training</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Targeted Core Upskilling</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Enroll immediately in high-intensity technical bootcamp streams. Target foundational language modules, stack architecture concepts, database integrations, or testing paradigms.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Mandate: 15h of training block</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <Users className="w-4 h-4" />
                  <span>Pair Programming Protocols</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">1:1 Mentoring Assignments</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Match with a senior tech lead for daily pair programming sessions. Dedicate 60-minute daily review slots to align on sprint targets, code conventions, and architectural optimization.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Frequency: Daily review syncs</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <TrendingUp className="w-4 h-4" />
                  <span>Working Hours Balance</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Performance Support Audit</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Initiate a structured work-life balance audit. Optimize working hour targets to prevent fatigue spikes. Ensure stable core hours with periodic, focused milestone deadlines.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Limit: Max 8.5 work hours daily</span>
              </div>
            </>
          )}

          {activeRecommendationTab === "Average" && (
            <>
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs font-mono">
                  <TrendingUp className="w-4 h-4" />
                  <span>Horizontal Specialization</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Skill Specialization Boost</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Provide advanced tracks in specialized domains like system architecture, security auditing, or performance profiling. Encourage focused mastery of one specific, high-demand core field.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase font-sans">Option: specialized credential sponsorships</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <Activity className="w-4 h-4" />
                  <span>Milestone Autonomy</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Empowered Module Ownership</h4>
                <p className="text-xs text-slate-550 leading-relaxed font-medium">
                  Transition employees from purely task-based work to full module ownership. Empower them to model systems from blueprint to deployment to build decision-making confidence.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Empowerment: Full sprint ownership</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Innovation Opportunities</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">R&D Hackathons & Sandbox</h4>
                <p className="text-xs text-slate-555 leading-relaxed font-medium">
                  Offer dedicated hackathon days or sandbox hours to prototype creative ideas. Provides a safe space to fail fast, learn dynamically, and generate software innovations.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Allocation: 10% innovation hours</span>
              </div>
            </>
          )}

          {activeRecommendationTab === "High" && (
            <>
              <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/20 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs font-mono">
                  <Award className="w-4 h-4" />
                  <span>Strategic Leadership Fast-Track</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Executive Technical Mentoring</h4>
                <p className="text-xs text-slate-555 leading-relaxed font-medium">
                  Involve key performers in strategic system design reviews with directors. Nominate them for professional leadership pathways, technology-decision bootcamps, and high-level assignments.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Action: Leadership training program nominating</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <Users className="w-4 h-4" />
                  <span>Mentorship Responsibilities</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Cascade Team Mentoring</h4>
                <p className="text-xs text-slate-555 leading-relaxed font-medium">
                  Empower high performers to act as mentors for junior recruits or average performers. This develops vital emotional intelligence skills and scales technical best-practices across teams.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Quota: Support 1-2 junior colleagues</span>
              </div>

              <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-left space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs font-mono">
                  <Activity className="w-4 h-4" />
                  <span>Platform R&D Ownership</span>
                </div>
                <h4 className="text-md font-bold text-slate-850">Platform R&D Stretch Tasks</h4>
                <p className="text-xs text-slate-555 leading-relaxed font-medium">
                  Assign complex platform optimization tasks (database tuning, real-time sync systems, or scaling server pipelines). Nurtures technical authority in target domains.
                </p>
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Project: Critical system scaling pipeline</span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
