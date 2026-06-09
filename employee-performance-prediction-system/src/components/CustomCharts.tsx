/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ChartSeries, TrainingBucket, PerformanceCount } from "../types";

const COLORS = {
  High: { bg: "bg-emerald-500", text: "text-emerald-500", hex: "#10b981", gradientStart: "#34d399", gradientEnd: "#059669" },
  Average: { bg: "bg-indigo-500", text: "text-indigo-500", hex: "#6366f1", gradientStart: "#818cf8", gradientEnd: "#4f46e5" },
  Low: { bg: "bg-rose-500", text: "text-rose-500", hex: "#f43f5e", gradientStart: "#fb7185", gradientEnd: "#e11d48" }
};

const DONUT_COLORS = [
  { start: "#6366f1", end: "#4f46e5" }, // Indigo
  { start: "#a855f7", end: "#7c3aed" }, // Purple
  { start: "#ec4899", end: "#db2777" }, // Pink
  { start: "#f43f5e", end: "#e11d48" }, // Rose
  { start: "#10b981", end: "#059669" }  // Mint/Emerald
];

// 1. PERFORMANCE DISTRIBUTION PIE CHART (Sleek Hollow Donut Variant)
export function PerformancePieChart({ data }: { data: PerformanceCount[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const radius = 72;
  const innerRadius = 48;
  const cx = 100;
  const cy = 100;
  
  let currentAngle = 0;
  
  const slices = data.map((item, idx) => {
    const percentage = item.count / total;
    const angle = percentage * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    // Transform angles from degrees list to radians
    const radStart = (startAngle - 90) * (Math.PI / 180);
    const radEnd = (endAngle - 90) * (Math.PI / 180);
    
    // Coordinates for outer circle
    const x1_out = cx + radius * Math.cos(radStart);
    const y1_out = cy + radius * Math.sin(radStart);
    const x2_out = cx + radius * Math.cos(radEnd);
    const y2_out = cy + radius * Math.sin(radEnd);
    
    // Coordinates for inner circle
    const x1_in = cx + innerRadius * Math.cos(radEnd);
    const y1_in = cy + innerRadius * Math.sin(radEnd);
    const x2_in = cx + innerRadius * Math.cos(radStart);
    const y2_in = cy + innerRadius * Math.sin(radStart);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Hollow donut segment path representation
    const d = `
      M ${x1_out} ${y1_out} 
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out} 
      L ${x1_in} ${y1_in} 
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2_in} ${y2_in} 
      Z
    `.trim();
    
    let colorKey: "High" | "Average" | "Low" = "Average";
    if (idx === 0) colorKey = "High";
    if (idx === 2) colorKey = "Low";
    
    return {
      path: d,
      percentage: (percentage * 100).toFixed(1),
      label: item.label,
      count: item.count,
      colors: COLORS[colorKey],
      colorKey,
      index: idx
    };
  });

  return (
    <div id="performance-pie-chart-container" className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative w-[180px] h-[180px] select-none shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm overflow-visible">
          <defs>
            {slices.map((slice) => (
              <linearGradient id={`pie-grad-${slice.index}`} key={slice.index} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={slice.colors.gradientStart} />
                <stop offset="100%" stopColor={slice.colors.gradientEnd} />
              </linearGradient>
            ))}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.index;
            return (
              <path
                id={`pie-slice-${slice.index}`}
                key={slice.label}
                d={slice.path}
                fill={`url(#pie-grad-${slice.index})`}
                className="transition-all duration-300 cursor-pointer outline-none"
                opacity={hoveredIdx === null ? 1 : isHovered ? 1 : 0.4}
                filter={isHovered ? "url(#glow)" : ""}
                transform={isHovered ? "scale(1.05) translate(-5, -5)" : ""}
                onMouseEnter={() => setHoveredIdx(slice.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredIdx !== null ? (
            <>
              <span className={`text-2xl font-black ${slices[hoveredIdx].colors.text} leading-none`}>
                {slices[hoveredIdx].percentage}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 leading-none select-none">
                {slices[hoveredIdx].colorKey}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-slate-800 leading-none">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 leading-none select-none">
                Profiles
              </span>
            </>
          )}
        </div>
      </div>
      
      <div id="pie-chart-legend" className="flex flex-col gap-2.5 flex-1 min-w-[150px] w-full">
        {slices.map((slice) => (
          <div
            id={`pie-legend-item-${slice.index}`}
            key={slice.label}
            className={`flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all cursor-pointer ${
              hoveredIdx === slice.index ? "bg-slate-50/80 border-slate-200/80 shadow-xs" : "hover:bg-slate-50/40"
            }`}
            onMouseEnter={() => setHoveredIdx(slice.index)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-3.5 h-3.5 rounded-lg shrink-0 transition-transform duration-200" style={{ background: `linear-gradient(135deg, ${slice.colors.gradientStart}, ${slice.colors.gradientEnd})` }}></span>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700 leading-none">{slice.label}</span>
                <span className="text-xs font-black text-slate-800 leading-none font-mono">{(slice.count / total * 100).toFixed(0)}%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono font-semibold">{slice.count} recorded employees</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. TRAINING HOURS DISTRIBUTION DONUT CHART
export function TrainingDonutChart({ data }: { data: TrainingBucket[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const radius = 68;
  const strokeWidth = 14;
  const cx = cxValue => cxValue; // dummy mapper, we hardcode 100
  const centerCoord = 100;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;
  
  const rings = data.map((item, idx) => {
    const percentage = item.count / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percentage;
    
    return {
      label: item.label,
      count: item.count,
      percentage: (percentage * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      colors: DONUT_COLORS[idx % DONUT_COLORS.length],
      idx
    };
  });

  return (
    <div id="training-donut-chart-container" className="flex flex-col sm:flex-row items-center justify-around gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative w-[180px] h-[180px] select-none shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 overflow-visible">
          <defs>
            {rings.map((ring) => (
              <linearGradient id={`donut-grad-${ring.idx}`} key={ring.idx} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ring.colors.start} />
                <stop offset="100%" stopColor={ring.colors.end} />
              </linearGradient>
            ))}
            <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx={centerCoord} cy={centerCoord} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          {rings.map((ring) => (
            <circle
              id={`donut-ring-${ring.idx}`}
              key={ring.label}
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              fill="transparent"
              stroke={`url(#donut-grad-${ring.idx})`}
              strokeWidth={hoveredIdx === ring.idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={ring.strokeDasharray}
              strokeDashoffset={ring.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer outline-none"
              opacity={hoveredIdx === null ? 1 : hoveredIdx === ring.idx ? 1 : 0.5}
              filter={hoveredIdx === ring.idx ? "url(#donut-glow)" : ""}
              onMouseEnter={() => setHoveredIdx(ring.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredIdx !== null ? (
            <>
              <span className="text-2xl font-black text-slate-800 leading-none select-none">
                {rings[hoveredIdx].count}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 mt-1.5 leading-none select-none">
                {rings[hoveredIdx].percentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black text-slate-800 leading-none select-none">
                {total}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1.5 leading-none select-none">
                Total Trained
              </span>
            </>
          )}
        </div>
      </div>
      
      <div id="donut-chart-legend" className="flex flex-col gap-2 flex-1 min-w-[200px] w-full">
        {rings.map((ring) => (
          <div
            id={`donut-legend-item-${ring.idx}`}
            key={ring.label}
            className={`flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all cursor-pointer ${
              hoveredIdx === ring.idx ? "bg-slate-50/80 border-slate-200/80 shadow-xs" : "hover:bg-slate-50/40"
            }`}
            onMouseEnter={() => setHoveredIdx(ring.idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="w-3.5 h-3.5 rounded-lg shrink-0" style={{ background: `linear-gradient(135deg, ${ring.colors.start}, ${ring.colors.end})` }}></span>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700 leading-none">{ring.label}</span>
                <span className="text-xs font-black text-slate-800 leading-none font-mono">{ring.percentage}%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono font-semibold">{ring.count} employees</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. EXPERIENCE VS PERFORMANCE BAR CHART
export function ExperienceVsPerformanceBarChart({ data }: { data: ChartSeries[] }) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  
  const maxVal = Math.max(...data.map(g => g.High + g.Average + g.Low), 10);
  const chartHeight = 160;
  const gridLines = Array.from({ length: 4 }, (_, i) => Math.round((maxVal / 3) * i));

  return (
    <div id="experience-bar-chart-container" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative h-[225px] w-full mt-4">
        {/* Y Axis gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none h-[160px] border-b border-slate-200/50">
          {gridLines.reverse().map((val, idx) => (
            <div key={idx} className="flex justify-between w-full h-0 border-t border-dashed border-slate-100 relative">
              <span className="bg-white pr-2 -mt-2 z-10 font-bold">{val}</span>
            </div>
          ))}
        </div>
        
        {/* Chart columns stage */}
        <div className="absolute bottom-11 left-8 right-2 h-[160px] flex items-end justify-around">
          {data.map((group) => {
            const sum = group.High + group.Average + group.Low;
            const totalPct = sum / maxVal;
            const groupHeight = totalPct * chartHeight;
            
            const highPct = group.High / sum || 0;
            const avgPct = group.Average / sum || 0;
            const lowPct = group.Low / sum || 0;
            
            const isSelected = hoveredGroup === group.category;
            
            return (
              <div
                id={`exp-group-${group.category.replace(/\s+/g, "-")}`}
                key={group.category}
                className="group relative flex flex-col items-center w-[76px]"
                onMouseEnter={() => setHoveredGroup(group.category)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {/* Visual Glassmorphic column backdrop for easier hover targets */}
                <div className={`absolute bottom-0 w-12 rounded-t-xl transition-all duration-300 ${isSelected ? "bg-slate-50" : "bg-transparent"}`} style={{ height: '170px' }} />
                
                {/* Actual stacked cylinder stack */}
                <div
                  className="w-[18px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:scale-y-[1.02] cursor-pointer relative z-10"
                  style={{ height: `${groupHeight}px` }}
                >
                  {group.Low > 0 && (
                    <div 
                      style={{ height: `${lowPct * 100}%` }} 
                      className="bg-gradient-to-t from-rose-600 to-rose-400 hover:brightness-105 transition-all" 
                    />
                  )}
                  {group.Average > 0 && (
                    <div 
                      style={{ height: `${avgPct * 100}%` }} 
                      className="bg-gradient-to-t from-indigo-600 to-indigo-400 hover:brightness-105 transition-all" 
                    />
                  )}
                  {group.High > 0 && (
                    <div 
                      style={{ height: `${highPct * 100}%` }} 
                      className="bg-gradient-to-t from-emerald-600 to-emerald-400 hover:brightness-105 transition-all" 
                    />
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute -top-[104px] bg-slate-900/95 backdrop-blur-xs text-white text-[11px] p-3 rounded-2xl shadow-xl z-25 flex flex-col gap-1 whitespace-nowrap min-w-[120px] text-left border border-slate-800 animate-slide-up">
                    <span className="font-extrabold border-b border-slate-700 pb-1 mb-1 font-sans text-slate-200">{group.category}</span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>High</span> <strong className="font-mono text-emerald-300">{group.High}</strong></span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400"></span>Average</span> <strong className="font-mono text-indigo-300">{group.Average}</strong></span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-405 bg-rose-400"></span>Low</span> <strong className="font-mono text-rose-300">{group.Low}</strong></span>
                  </div>
                )}
                
                <div className={`absolute -bottom-10 text-center leading-tight truncate px-1 text-[11px] font-bold select-none transition-colors duration-200 w-full ${isSelected ? "text-indigo-600" : "text-slate-500"}`}>
                  {group.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div id="stacked-legend" className="flex justify-center flex-wrap gap-5 mt-5 pt-4 border-t border-slate-100 select-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-emerald-600 to-emerald-400"></span>
          <span className="text-xs font-bold text-slate-500">High Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400"></span>
          <span className="text-xs font-bold text-slate-500">Average Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-rose-600 to-rose-400"></span>
          <span className="text-xs font-bold text-slate-500">Low Performer</span>
        </div>
      </div>
    </div>
  );
}

// 4. PROJECTS VS PERFORMANCE BAR CHART
export function ProjectsVsPerformanceBarChart({ data }: { data: ChartSeries[] }) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  
  const maxVal = Math.max(...data.map(g => g.High + g.Average + g.Low), 10);
  const chartHeight = 160;
  const gridLines = Array.from({ length: 4 }, (_, i) => Math.round((maxVal / 3) * i));

  return (
    <div id="projects-bar-chart-container" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative h-[225px] w-full mt-4">
        {/* Y Axis gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none h-[160px] border-b border-slate-200/50">
          {gridLines.reverse().map((val, idx) => (
            <div key={idx} className="flex justify-between w-full h-0 border-t border-dashed border-slate-100 relative">
              <span className="bg-white pr-2 -mt-2 z-10 font-bold">{val}</span>
            </div>
          ))}
        </div>
        
        {/* Chart columns stage */}
        <div className="absolute bottom-11 left-8 right-2 h-[160px] flex items-end justify-around">
          {data.map((group) => {
            const sum = group.High + group.Average + group.Low;
            const totalPct = sum / maxVal;
            const groupHeight = totalPct * chartHeight;
            
            const highPct = group.High / sum || 0;
            const avgPct = group.Average / sum || 0;
            const lowPct = group.Low / sum || 0;
            
            const isSelected = hoveredGroup === group.category;
            
            return (
              <div
                id={`projects-group-${group.category.replace(/\s+/g, "-")}`}
                key={group.category}
                className="group relative flex flex-col items-center w-[76px]"
                onMouseEnter={() => setHoveredGroup(group.category)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {/* Visual backdrop */}
                <div className={`absolute bottom-0 w-12 rounded-t-xl transition-all duration-300 ${isSelected ? "bg-slate-50" : "bg-transparent"}`} style={{ height: '170px' }} />
                
                {/* Stacked cylnder segment */}
                <div
                  className="w-[18px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:scale-y-[1.02] cursor-pointer relative z-10"
                  style={{ height: `${groupHeight}px` }}
                >
                  {group.Low > 0 && (
                    <div 
                      style={{ height: `${lowPct * 100}%` }} 
                      className="bg-gradient-to-t from-rose-600 to-rose-400 hover:brightness-105 transition-all" 
                    />
                  )}
                  {group.Average > 0 && (
                    <div 
                      style={{ height: `${avgPct * 100}%` }} 
                      className="bg-gradient-to-t from-indigo-600 to-indigo-400 hover:brightness-105 transition-all" 
                    />
                  )}
                  {group.High > 0 && (
                    <div 
                      style={{ height: `${highPct * 100}%` }} 
                      className="bg-gradient-to-t from-emerald-600 to-emerald-400 hover:brightness-105 transition-all" 
                    />
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute -top-[104px] bg-slate-900/95 backdrop-blur-xs text-white text-[11px] p-3 rounded-2xl shadow-xl z-25 flex flex-col gap-1 whitespace-nowrap min-w-[120px] text-left border border-slate-800 animate-slide-up">
                    <span className="font-extrabold border-b border-slate-700 pb-1 mb-1 font-sans text-slate-200">{group.category}</span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span>High</span> <strong className="font-mono text-emerald-300">{group.High}</strong></span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400"></span>Average</span> <strong className="font-mono text-indigo-300">{group.Average}</strong></span>
                    <span className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span>Low</span> <strong className="font-mono text-rose-300">{group.Low}</strong></span>
                  </div>
                )}
                
                <div className={`absolute -bottom-10 text-center leading-tight truncate px-1 text-[11px] font-bold select-none transition-colors duration-200 w-full ${isSelected ? "text-indigo-600" : "text-slate-500"}`}>
                  {group.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div id="stacked-legend-projects" className="flex justify-center flex-wrap gap-5 mt-5 pt-4 border-t border-slate-100 select-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-emerald-600 to-emerald-400"></span>
          <span className="text-xs font-bold text-slate-500">High Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400"></span>
          <span className="text-xs font-bold text-slate-500">Average Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-tr from-rose-600 to-rose-400"></span>
          <span className="text-xs font-bold text-slate-500">Low Performer</span>
        </div>
      </div>
    </div>
  );
}

// 5. WORKING HOURS VS PERFORMANCE (PREMIUM SMOOTH SPLINE AREA CHART)
export function WorkingHoursLineChart({ data }: { data: ChartSeries[] }) {
  const [hoveredNode, setHoveredNode] = useState<{ group: string; metric: "High" | "Average" | "Low"; val: number } | null>(null);

  const maxCoordsValue = Math.max(...data.map(g => Math.max(g.High, g.Average, g.Low)), 6);
  const chartHeight = 155;
  const chartWidth = 320;
  const paddingX = 35;
  const paddingY = 22;

  const coordinates = data.map((item, idx) => {
    const spaceOffset = (chartWidth - (paddingX * 2)) / (data.length - 1);
    const x = paddingX + idx * spaceOffset;
    const scale = (val: number) => chartHeight - paddingY - (val / maxCoordsValue) * (chartHeight - (paddingY * 2));
    
    return {
      category: item.category,
      High: { x, y: scale(item.High), val: item.High },
      Average: { x, y: scale(item.Average), val: item.Average },
      Low: { x, y: scale(item.Low), val: item.Low }
    };
  });

  // Generates smooth cubic-spline curve paths using Bezier equations
  const getBezierPath = (metric: "High" | "Average" | "Low") => {
    const points = coordinates.map(c => c[metric]);
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2.2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 1.8;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  // Generate smooth closed-area underneath curves for luxurious color fills
  const getAreaPath = (metric: "High" | "Average" | "Low") => {
    const bezierLine = getBezierPath(metric);
    if (!bezierLine) return "";
    const firstPt = coordinates[0][metric];
    const lastPt = coordinates[coordinates.length - 1][metric];
    const baseY = chartHeight - paddingY;
    return `${bezierLine} L ${lastPt.x} ${baseY} L ${firstPt.x} ${baseY} Z`;
  };

  return (
    <div id="working-hours-line-chart-container" className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative">
      <div className="relative h-[225px] w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-[180px] overflow-visible">
          <defs>
            {/* Linear area gradients for futuristic neon analytics vibe */}
            <linearGradient id="area-grad-high" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.High.hex} stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLORS.High.hex} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="area-grad-avg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.Average.hex} stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLORS.Average.hex} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="area-grad-low" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={COLORS.Low.hex} stopOpacity="0.18" />
              <stop offset="100%" stopColor={COLORS.Low.hex} stopOpacity="0.0" />
            </linearGradient>
            <filter id="line-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 4 }).map((_, i) => {
            const gridVal = (maxCoordsValue / 3) * i;
            const gridY = chartHeight - paddingY - (gridVal / maxCoordsValue) * (chartHeight - (paddingY * 2));
            return (
              <g key={i}>
                <line x1={paddingX} y1={gridY} x2={chartWidth - paddingX} y2={gridY} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
                <text x={paddingX - 11} y={gridY + 3.2} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="end">{Math.round(gridVal)}</text>
              </g>
            );
          })}

          {/* Area underfills */}
          <path d={getAreaPath("High")} fill="url(#area-grad-high)" />
          <path d={getAreaPath("Average")} fill="url(#area-grad-avg)" />
          <path d={getAreaPath("Low")} fill="url(#area-grad-low)" />

          {/* Smooth curves with drop shadows */}
          <path d={getBezierPath("High")} fill="none" stroke={COLORS.High.hex} strokeWidth="2.5" strokeLinecap="round" filter="url(#line-shadow)" />
          <path d={getBezierPath("Average")} fill="none" stroke={COLORS.Average.hex} strokeWidth="2.5" strokeLinecap="round" filter="url(#line-shadow)" />
          <path d={getBezierPath("Low")} fill="none" stroke={COLORS.Low.hex} strokeWidth="2.5" strokeLinecap="round" filter="url(#line-shadow)" />

          {/* Core interactive interactive coordinate dots */}
          {coordinates.map((coord) => (
            <g key={coord.category}>
              {/* High dots */}
              <circle
                cx={coord.High.x}
                cy={coord.High.y}
                r={hoveredNode?.group === coord.category && hoveredNode?.metric === "High" ? "6" : "3.5"}
                fill="#ffffff"
                stroke={COLORS.High.hex}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 outline-none"
                onMouseEnter={() => setHoveredNode({ group: coord.category, metric: "High", val: coord.High.val })}
                onMouseLeave={() => setHoveredNode(null)}
              />
              
              {/* Average dots */}
              <circle
                cx={coord.Average.x}
                cy={coord.Average.y}
                r={hoveredNode?.group === coord.category && hoveredNode?.metric === "Average" ? "6" : "3.5"}
                fill="#ffffff"
                stroke={COLORS.Average.hex}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 outline-none"
                onMouseEnter={() => setHoveredNode({ group: coord.category, metric: "Average", val: coord.Average.val })}
                onMouseLeave={() => setHoveredNode(null)}
              />

              {/* Low dots */}
              <circle
                cx={coord.Low.x}
                cy={coord.Low.y}
                r={hoveredNode?.group === coord.category && hoveredNode?.metric === "Low" ? "6" : "3.5"}
                fill="#ffffff"
                stroke={COLORS.Low.hex}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 outline-none"
                onMouseEnter={() => setHoveredNode({ group: coord.category, metric: "Low", val: coord.Low.val })}
                onMouseLeave={() => setHoveredNode(null)}
              />
            </g>
          ))}
        </svg>

        {/* X Axis labels */}
        <div className="absolute bottom-4 left-[30px] right-[30px] flex justify-between text-[10px] font-bold text-slate-400 select-none">
          {data.map(item => (
            <span key={item.category} className="w-14 text-center truncate">{item.category}</span>
          ))}
        </div>

        {/* Dynamic tooltip popup */}
        {hoveredNode && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg z-30 flex items-center gap-1.5 whitespace-nowrap border border-slate-800 animate-slide-up">
            <span className="font-extrabold text-slate-350">{hoveredNode.group}</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[hoveredNode.metric].hex }} />
            <span>{hoveredNode.metric}: <strong className="font-mono text-slate-100">{hoveredNode.val}</strong> employees</span>
          </div>
        )}
      </div>

      <div id="stacked-legend-working" className="flex justify-center gap-5 mt-2 pt-4 border-t border-slate-100 select-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 bg-emerald-500 rounded-full"></span>
          <span className="text-xs font-bold text-slate-500">High Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 bg-indigo-500 rounded-full"></span>
          <span className="text-xs font-bold text-slate-500">Average Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 bg-rose-500 rounded-full"></span>
          <span className="text-xs font-bold text-slate-500">Low Performer</span>
        </div>
      </div>
    </div>
  );
}
