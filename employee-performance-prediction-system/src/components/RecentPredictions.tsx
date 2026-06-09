/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { History, ArrowUpRight, Search, SlidersHorizontal, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { PredictionResult } from "../types";

interface RecentPredictionsProps {
  predictions: PredictionResult[];
  onViewDetails: (pred: PredictionResult) => void;
}

export function RecentPredictions({ predictions, onViewDetails }: RecentPredictionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "High" | "Average" | "Low">("All");

  // Filter logs locally based on search keywords and status selectors!
  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch = p.Employee_ID.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.Performance === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="recent-predictions-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 transition-all duration-300 hover:shadow-md text-left">
      
      {/* CARD HEADER MODULE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#6366f1] font-mono">HR Operations History</span>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-505 text-indigo-600 animate-spin-slow" />
            <span>Audit Prediction Log</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 select-none self-start sm:self-center bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border border-indigo-100">
          <span>{predictions.length} queried this session</span>
        </div>
      </div>

      {predictions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5 items-center select-none">
          {/* Search controls */}
          <div className="relative sm:col-span-5">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-3.5 h-3.5 stroke-[1.8]" />
            </span>
            <input
              type="text"
              placeholder="Search Employee ID..."
              value={searchTerm}
              aria-label="Search items"
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold focus:bg-white focus:ring-3 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none placeholder-slate-400"
            />
          </div>

          {/* Quick tab filters - All, High, Average, Low */}
          <div className="sm:col-span-7 flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/60 max-w-fit md:ml-auto">
            {["All", "High", "Average", "Low"].map((filterOpt) => (
              <button
                key={filterOpt}
                type="button"
                onClick={() => setStatusFilter(filterOpt as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === filterOpt
                    ? "bg-slate-900 text-white shadow-3xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filterOpt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORE GRAPHIC LOGS TABLE */}
      {predictions.length === 0 ? (
        <div id="no-predictions" className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-350 mb-3 border border-dashed border-slate-200">
            <History className="w-5 h-5 stroke-[1.5]" />
          </div>
          <p className="text-sm font-bold text-slate-700">No session queries recorded</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] font-semibold leading-relaxed">
            Run a prediction computation inside the ML engine or register a new record to append queries to this history track.
          </p>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div id="no-matching-predictions" className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-bold text-slate-600">No logged records meet your criteria</p>
          <p className="text-[10.5px] text-slate-400 mt-1 font-semibold">Try modifying your filter keyword or category toggles.</p>
        </div>
      ) : (
        <div id="predictions-table-wrapper" className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-mono font-bold uppercase text-slate-400 select-none">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-2 text-center">Experience</th>
                <th className="py-3 px-2 text-center">Projects</th>
                <th className="py-3 px-2 text-center">Daily Hours</th>
                <th className="py-3 px-2 text-center">Training</th>
                <th className="py-3 px-3 text-center">Outcome Class</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPredictions.map((p) => {
                let badgeStyle = "bg-rose-50 text-rose-700 border-rose-100/60";
                if (p.Performance === "High") {
                  badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100/60";
                } else if (p.Performance === "Average") {
                  badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-100/60";
                }
                
                return (
                  <tr
                    id={`row-${p.id}`}
                    key={p.id}
                    className="group hover:bg-slate-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-slate-700">{p.Employee_ID}</span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-xs font-bold text-slate-600">
                      {p.Experience} yrs
                    </td>
                    <td className="py-3.5 px-2 text-center text-xs font-bold text-slate-600">
                      {p.Projects}
                    </td>
                    <td className="py-3.5 px-2 text-center text-xs font-bold text-slate-600">
                      {p.Working_Hours}h
                    </td>
                    <td className="py-3.5 px-2 text-center text-xs font-bold text-slate-600">
                      {p.Training_Hours}h
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border leading-none ${badgeStyle}`}>
                        {p.Performance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewDetails(p)}
                        className="p-1 px-3 rounded-lg hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 ml-auto transition-all hover:shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <span>Analyze Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
