/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Sliders, ArrowRight, BookOpen, AlertCircle, HelpCircle, CheckCircle } from "lucide-react";
import { PredictionResult } from "../types";

export function SensitivityOptimizer() {
  const [experience, setExperience] = useState<number>(3);
  const [projects, setProjects] = useState<number>(3);
  const [workingHours, setWorkingHours] = useState<number>(8);
  const [sweepVariable, setSweepVariable] = useState<"Training_Hours" | "Experience" | "Working_Hours">("Training_Hours");
  const [boundaries, setBoundaries] = useState<{ value: number; label: "Low" | "Average" | "High" }[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [explanation, setExplanation] = useState("");

  const runSweep = async () => {
    setIsOptimizing(true);
    try {
      const sweepValues: number[] = [];
      let entries: any[] = [];

      if (sweepVariable === "Training_Hours") {
        // Sweep training from 0 to 120 hrs in increments of 5
        for (let t = 0; t <= 120; t += 5) {
          sweepValues.push(t);
          entries.push({
            Employee_ID: `SWEEP-TRAIN-${t}`,
            Experience: experience,
            Projects: projects,
            Working_Hours: workingHours,
            Training_Hours: t,
          });
        }
      } else if (sweepVariable === "Experience") {
        // Sweep experience from 0 to 20 yrs
        for (let e = 0; e <= 20; e += 1) {
          sweepValues.push(e);
          entries.push({
            Employee_ID: `SWEEP-EXP-${e}`,
            Experience: e,
            Projects: projects,
            Working_Hours: workingHours,
            Training_Hours: 35, // average default
          });
        }
      } else {
        // Sweep working hours from 4 to 16
        for (let w = 4; w <= 16; w += 1) {
          sweepValues.push(w);
          entries.push({
            Employee_ID: `SWEEP-HOURS-${w}`,
            Experience: experience,
            Projects: projects,
            Working_Hours: w,
            Training_Hours: 35,
          });
        }
      }

      const res = await fetch("/api/predict/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (!res.ok) throw new Error("Batch boundary calculation failed");
      const data = await res.json();
      
      const computedBoundaries = entries.map((entry, idx) => {
        const result: PredictionResult = data.results[idx];
        return {
          value: sweepVariable === "Training_Hours" ? entry.Training_Hours : (sweepVariable === "Experience" ? entry.Experience : entry.Working_Hours),
          label: result.Performance,
        };
      });

      setBoundaries(computedBoundaries);

      // Synthesize elegant insights from boundaries array
      const lowRange = computedBoundaries.filter(b => b.label === "Low").map(b => b.value);
      const avgRange = computedBoundaries.filter(b => b.label === "Average").map(b => b.value);
      const highRange = computedBoundaries.filter(b => b.label === "High").map(b => b.value);

      let insight = "";
      if (sweepVariable === "Training_Hours") {
        const lowMax = lowRange.length > 0 ? Math.max(...lowRange) : -1;
        const avgMax = avgRange.length > 0 ? Math.max(...avgRange) : -1;
        const highMin = highRange.length > 0 ? Math.min(...highRange) : -1;

        if (highMin !== -1 && highMin !== Infinity) {
          insight = `Optimized Threshold: Providing at least **${highMin} hours** of Training is predicted to elevate this profile into the **High Performer** tier.`;
        } else if (avgMax !== -1 && avgMax !== Infinity) {
          insight = `Threshold Boundary: Adjusting to at least **${lowMax + 5} hours** of Training transitions profile from Low to **Average Performer**. Model reports high-performer tier is out of reach at current project/experience configuration.`;
        } else {
          insight = `Stable Tier: System evaluates profile stays static as **${computedBoundaries[0]?.label || "Average"}** regardless of Training hours sweep. Try adjusting experience limits or projects.`;
        }
      } else if (sweepVariable === "Experience") {
        const highMin = highRange.length > 0 ? Math.min(...highRange) : -1;
        if (highMin !== -1) {
          insight = `Tenure Impact: A minimum tenure of **${highMin} years** of experience is mathematically required in this simulation model to support High performance.`;
        } else {
          insight = `Tenure Impact: At the current training (${35}h) and project load (${projects}), profile yields **${computedBoundaries[0]?.label || "Average"}** status.`;
        }
      } else {
        const lowMax = lowRange.length > 0 ? Math.max(...lowRange) : -1;
        const highMin = highRange.length > 0 ? Math.min(...highRange) : -1;
        insight = `Workload Tolerance: Working fewer than **${lowMax > 0 ? lowMax : 5} hours/day** is predicted safe. High levels occur between ${highMin > 0 ? `${highMin} and 10` : "moderate limits"} hours daily before fatigue boundaries trigger.`;
      }

      setExplanation(insight);

    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    runSweep();
  }, [experience, projects, workingHours, sweepVariable]);

  return (
    <div id="sensitivity-optimizer-card" className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">What-If Simulation</h3>
          </div>
          <h2 className="text-lg font-extrabold text-slate-950 mt-1">
            Boundary Sensitivity Optimizer
          </h2>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold py-1 px-3 rounded-full">
          Real-time Decision Sweeps
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
        Determine the precise thresholds needed to change employee designations. Choose a target sweep variable to sweep dynamically, then slide the other conditions to observe the tipping points.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sliders Area (Left Column) */}
        <div id="opt-sliders" className="md:col-span-6 space-y-5">
          {/* Base Parameters */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide font-sans flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Fix Profile Benchmarks</span>
            </h4>

            {/* Experience Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Experience Level</span>
                <span className="text-indigo-600">{experience} Years</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Projects Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Projects Handled</span>
                <span className="text-indigo-600">{projects} Projects</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={projects}
                onChange={(e) => setProjects(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Working Hours Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Avg Working Hours</span>
                <span className="text-indigo-600">{workingHours} Hrs/Day</span>
              </div>
              <input
                type="range"
                min="4"
                max="14"
                step="1"
                value={workingHours}
                onChange={(e) => setWorkingHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Sweep Target Option Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-600">Select Sweep Coordinate</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "Training_Hours", label: "Training hrs" },
                { key: "Experience", label: "Experience tenure" },
                { key: "Working_Hours", label: "Working hours" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSweepVariable(opt.key as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                    sweepVariable === opt.key
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Boundary Split Visualization (Right Column) */}
        <div id="opt-visualization" className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                Decision Boundary Segments
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                X-Axis: {sweepVariable.replace("_", " ")}
              </span>
            </div>

            {isOptimizing ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual Segments Bar */}
                <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner border border-slate-200">
                  {boundaries.map((b, idx) => {
                    let color = "bg-rose-500";
                    if (b.label === "Average") color = "bg-indigo-500";
                    if (b.label === "High") color = "bg-emerald-500";
                    
                    const segmentWidth = `${100 / boundaries.length}%`;

                    return (
                      <div
                        key={idx}
                        className={`${color} h-full relative group transition-all duration-300`}
                        style={{ width: segmentWidth }}
                        title={`${sweepVariable.replace("_", " ")}: ${b.value} ➔ Predicted: ${b.label}`}
                      >
                        {/* Tooltip on Hover */}
                        <div className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-slate-955 text-white bg-slate-800 text-[10px] font-bold p-1 px-2 rounded -top-8 left-1/2 transform -translate-x-1/2 z-20 whitespace-nowrap">
                          {b.value} u ➔ {b.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-between items-center text-[10px] font-bold px-1 text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded" />
                    <span>Low Performer</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded" />
                    <span>Average</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
                    <span>High Performer</span>
                  </span>
                </div>

                {/* Boundary Insight Cards */}
                {explanation && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 text-left">
                    <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 leading-4">
                      <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Optimized HR Prescription</span>
                    </h5>
                    <p
                      className="text-xs text-indigo-950 font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: explanation }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-slate-400 font-medium leading-normal">
              Boundary sweeps allow modeling custom budgets and resource levels against Gini tree classifier splits. This helps managers justify training quotas and workload capacities mathematically.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
