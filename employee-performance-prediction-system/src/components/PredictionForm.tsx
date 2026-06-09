/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Brain, BookOpen, Briefcase, Award, TrendingUp, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { PredictionResult } from "../types";

interface PredictionFormProps {
  onPredict: (data: { Experience: number; Projects: number; Working_Hours: number; Training_Hours: number }) => Promise<void>;
  currentResult: PredictionResult | null;
  isLoading: boolean;
}

// Interactive Scenario Presets for HR Simulation
interface ScenarioPreset {
  name: string;
  icon: string;
  desc: string;
  experience: number;
  projects: number;
  workingHours: number;
  trainingHours: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: "Promising Recruit",
    icon: "🌱",
    desc: "Low experience but highly trained with normal hours",
    experience: 2,
    projects: 3,
    workingHours: 8,
    trainingHours: 55
  },
  {
    name: "Hardworking Pioneer",
    icon: "🚀",
    desc: "Robust experience, handles multiple projects, commits average training",
    experience: 10,
    projects: 7,
    workingHours: 9,
    trainingHours: 45
  },
  {
    name: "Overworked Contributor",
    icon: "🥵",
    desc: "High experience and long work hours, but low L&D training hours",
    experience: 11,
    projects: 6,
    workingHours: 12,
    trainingHours: 15
  },
  {
    name: "Standard Mid-Level",
    icon: "⚖️",
    desc: "Sufficient experience, standard hours, stable training baseline",
    experience: 5,
    projects: 4,
    workingHours: 8,
    trainingHours: 30
  }
];

export function PredictionForm({ onPredict, currentResult, isLoading }: PredictionFormProps) {
  const [experience, setExperience] = useState<number>(5);
  const [projects, setProjects] = useState<number>(4);
  const [workingHours, setWorkingHours] = useState<number>(8);
  const [trainingHours, setTrainingHours] = useState<number>(30);
  const [activePreset, setActivePreset] = useState<string | null>("Standard Mid-Level");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPredict({
      Experience: experience,
      Projects: projects,
      Working_Hours: workingHours,
      Training_Hours: trainingHours
    });
    setActivePreset(null);
  };

  const applyPreset = (preset: ScenarioPreset) => {
    setExperience(preset.experience);
    setProjects(preset.projects);
    setWorkingHours(preset.workingHours);
    setTrainingHours(preset.trainingHours);
    setActivePreset(preset.name);
  };

  // Quick reset to defaults helper
  const handleReset = () => {
    setExperience(5);
    setProjects(4);
    setWorkingHours(8);
    setTrainingHours(30);
    setActivePreset("Standard Mid-Level");
  };

  return (
    <div id="predictive-form-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* 1. INPUT FORM COLUMN */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col justify-between">
        
        {/* Header Title */}
        <div className="border-b border-slate-100 pb-4 text-left">
          <div className="flex items-center gap-1.5">
            <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 font-mono">Prediction Settings</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1">Configure Parameters</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Fine-tune the employee attributes below or trigger one of our interactive preset templates to query the ML classifier.</p>
        </div>

        {/* INTERACTIVE PRESETS SECTION */}
        <div className="space-y-2.5 text-left bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono select-none flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Simulation Presets</span>
            </h4>
            <button 
              type="button" 
              onClick={handleReset}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded border border-slate-200 shadow-3xs hover:shadow-2xs transition-all active:scale-95"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Reset parameters
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal font-medium mb-3">Click on a profile to instantly overlay its attributes onto the variables panel below:</p>
          
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activePreset === preset.name
                    ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-3xs"
                    : "border-slate-200/60 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-350"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base select-none leading-none">{preset.icon}</span>
                  <div className="min-w-0 select-none">
                    <h5 className="text-xs font-bold leading-tight truncate">{preset.name}</h5>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 leading-none font-semibold uppercase truncate">EXP: {preset.experience}y • TR: {preset.trainingHours}h</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SLIDERS FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          
          {/* A. Experience */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="experience-input" className="text-slate-700 font-bold flex items-center gap-2">
                <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <span>Experience Indicator</span>
              </label>
              <span className="font-mono bg-indigo-50/80 text-indigo-700 leading-none px-2.5 py-1.5 rounded-lg text-xs font-extrabold select-none border border-indigo-100">
                {experience} {experience === 1 ? "year" : "years"}
              </span>
            </div>
            <div className="relative">
              <input
                id="experience-input"
                type="range"
                min="0"
                max="20"
                step="1"
                value={experience}
                aria-valuenow={experience}
                onChange={(e) => {
                  setExperience(parseInt(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650 accent-indigo-600 transition-all hover:accent-indigo-700"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>0 yrs (Junior)</span>
              <span>10 yrs</span>
              <span>20 yrs (Veteran)</span>
            </div>
          </div>

          {/* B. Number of Projects */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="projects-input" className="text-slate-700 font-bold flex items-center gap-2">
                <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span>Projects Managed</span>
              </label>
              <span className="font-mono bg-indigo-50/80 text-indigo-700 leading-none px-2.5 py-1.5 rounded-lg text-xs font-extrabold select-none border border-indigo-100">
                {projects} {projects === 1 ? "project" : "projects"}
              </span>
            </div>
            <div className="relative">
              <input
                id="projects-input"
                type="range"
                min="1"
                max="15"
                step="1"
                value={projects}
                aria-valuenow={projects}
                onChange={(e) => {
                  setProjects(parseInt(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650 accent-indigo-600 transition-all hover:accent-indigo-700"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>1 project</span>
              <span>8 projects</span>
              <span>15 projects</span>
            </div>
          </div>

          {/* C. Working Hours */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="hours-input" className="text-slate-700 font-bold flex items-center gap-2">
                <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span>Working Hours per Day</span>
              </label>
              <span className={`font-mono leading-none px-2.5 py-1.5 rounded-lg text-xs font-extrabold select-none border ${
                workingHours > 9 
                  ? "bg-rose-50 text-rose-700 border-rose-100" 
                  : "bg-indigo-50/80 text-indigo-700 border-indigo-100"
              }`}>
                {workingHours} hours {workingHours > 9 ? "⚠️" : ""}
              </span>
            </div>
            <div className="relative">
              <input
                id="hours-input"
                type="range"
                min="4"
                max="14"
                step="1"
                value={workingHours}
                aria-valuenow={workingHours}
                onChange={(e) => {
                  setWorkingHours(parseInt(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650 accent-indigo-600 transition-all hover:accent-indigo-700"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>4 hrs (Part-time)</span>
              <span>8 hrs (Standard)</span>
              <span>14 hrs (Extreme)</span>
            </div>
          </div>

          {/* D. Training Hours */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="training-input" className="text-slate-700 font-bold flex items-center gap-2">
                <div className="p-1 rounded-md bg-slate-100 text-slate-600">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>L&D Training Hours</span>
              </label>
              <span className={`font-mono leading-none px-2.5 py-1.5 rounded-lg text-xs font-extrabold select-none border ${
                trainingHours < 20 
                  ? "bg-amber-50 text-amber-700 border-amber-100" 
                  : "bg-indigo-50/80 text-indigo-700 border-indigo-100"
              }`}>
                {trainingHours} hours {trainingHours < 20 ? "📉" : ""}
              </span>
            </div>
            <div className="relative">
              <input
                id="training-input"
                type="range"
                min="0"
                max="120"
                step="5"
                value={trainingHours}
                aria-valuenow={trainingHours}
                onChange={(e) => {
                  setTrainingHours(parseInt(e.target.value));
                  setActivePreset(null);
                }}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-650 accent-indigo-600 transition-all hover:accent-indigo-700"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
              <span>0 hrs (No L&D)</span>
              <span>60 hrs</span>
              <span>120 hrs (Leader)</span>
            </div>
          </div>

          <button
            id="form-submit-predict"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer relative overscroll-none"
          >
            <Brain className="w-4.5 h-4.5 stroke-[1.8]" />
            <span>{isLoading ? "Consulting Decision Tree Model..." : "Evaluate Performance Class"}</span>
          </button>
        </form>
      </div>

      {/* 2. RESULTS & RECOMMENDATIONS COLUMN */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        {currentResult ? (
          <div id="output-rendered-results" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in text-left">
            
            {/* Header section with absolute id indicator */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#6366f1] font-mono">
                  Machine Learning Output
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
                  Performance Classification
                </h3>
              </div>
              <span className="text-[10.5px] text-slate-400 font-mono font-bold flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full select-none border border-slate-200/50">
                QUERY REF: {currentResult.Employee_ID}
              </span>
            </div>

            {/* Performance Meter badge */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl border bg-slate-50 border-slate-100/50 relative overflow-hidden">
              {/* Decorative faint glow */}
              <div className={`absolute -right-12 -bottom-12 w-44 h-44 rounded-full blur-2xl opacity-15 pointer-events-none ${
                currentResult.Performance === "High" ? "bg-emerald-500" :
                currentResult.Performance === "Average" ? "bg-indigo-500" : "bg-rose-500"
              }`} />

              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-spin-slow ${
                  currentResult.Performance === "High" ? "border-emerald-300" :
                  currentResult.Performance === "Average" ? "border-indigo-300" : "border-rose-300"
                }`} />
                <div className={`w-18 h-18 rounded-full flex flex-col items-center justify-center text-xs font-black shadow-lg relative z-10 transition-transform ${
                  currentResult.Performance === "High" ? "bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white" :
                  currentResult.Performance === "Average" ? "bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white" : 
                  "bg-gradient-to-tr from-rose-600 to-rose-400 text-white"
                }`}>
                  <span className="text-[10px] uppercase font-bold text-[#ffffffcb] leading-none mb-0.5">EST.</span>
                  <span className="text-base select-none leading-none font-bold">{currentResult.Performance}</span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1 relative z-10">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                  Gini Decision Outcome
                </span>
                <h4 className="text-lg font-bold text-slate-800 leading-tight">
                  {currentResult.Performance === "High" ? "Exemplary High-Performer" :
                   currentResult.Performance === "Average" ? "Reliable Core Contributor" :
                   "Requires Prompt Skills Support"}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  This class is evaluated using structured splits. Let's inspect the designated HR playbook configured for this candidate below.
                </p>
              </div>
            </div>

            {/* Core Recommendations plays cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                <span>Designated Playbook Guides</span>
              </h4>

              {/* Action columns triggered matching prediction results! */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Low card */}
                <div className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  currentResult.Performance === "Low" 
                    ? "bg-rose-50/50 border-rose-300/80 ring-3 ring-rose-500/5 shadow-xs"
                    : "bg-white border-slate-100 opacity-40 hover:opacity-75"
                }`}>
                  <div className="flex items-center gap-1.5 text-rose-600 mb-2 font-bold text-[10px] font-mono uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Skills Intervention</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">1:1 Supportive Track</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed font-semibold">
                    Recommend immediately assigning a 1-to-1 senior team guide, allocating standard 8h scopes, and avoiding burnout workloads.
                  </p>
                </div>

                {/* Average Card */}
                <div className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  currentResult.Performance === "Average"
                    ? "bg-indigo-50/50 border-indigo-300/80 ring-3 ring-indigo-500/5 shadow-xs"
                    : "bg-white border-slate-100 opacity-40 hover:opacity-75"
                }`}>
                  <div className="flex items-center gap-1.5 text-indigo-650 text-indigo-600 mb-2 font-bold text-[10px] font-mono uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>Engagement Growth</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">Advanced Domain Tracks</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed font-semibold">
                    Enable wider feature responsibility, support specialized stack certifications, and invite them to team R&D panels to elevate capability.
                  </p>
                </div>

                {/* High card */}
                <div className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  currentResult.Performance === "High"
                    ? "bg-emerald-50/50 border-emerald-300/80 ring-3 ring-emerald-500/5 shadow-xs"
                    : "bg-white border-slate-100 opacity-40 hover:opacity-75"
                }`}>
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-2 font-bold text-[10px] font-mono uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Leadership Track</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">Cascade Mentorship</h5>
                  <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed font-semibold">
                    Nominate candidates as lead designers, assign high-scale platform tuning sprints, and fast-track to executive reviews.
                  </p>
                </div>
              </div>

              {/* Plain Executive Summary Text */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white font-sans border border-slate-800 text-xs leading-relaxed relative overflow-hidden flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-400 select-none">
                  <Sparkles className="w-4 h-4 text-indigo-450 text-indigo-400" />
                  <span className="font-bold uppercase tracking-wider text-[9.5px] font-mono">Automated Professional Directives</span>
                </div>
                <p className="text-slate-300 font-medium leading-relaxed mt-0.5">
                  "{currentResult.Recommendation}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div id="result-placeholder" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[440px]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100 relative shadow-3xs">
              <Brain className="w-7 h-7 stroke-[1.6] animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Awaiting Prediction Stream</h3>
            <p className="text-xs text-slate-450 max-w-sm mt-1.5 leading-relaxed font-semibold">
              Adjust variables inside the parameter panels, or choose an HR Simulation preset profile on the left, then click <strong>Evaluate Performance Class</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
