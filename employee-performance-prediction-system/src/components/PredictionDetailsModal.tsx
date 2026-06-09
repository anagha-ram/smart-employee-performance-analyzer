/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Calendar, Activity, BookOpen, Clock, Users, Briefcase } from "lucide-react";
import { PredictionResult } from "../types";

interface PredictionDetailsModalProps {
  prediction: PredictionResult | null;
  onClose: () => void;
}

export function PredictionDetailsModal({ prediction, onClose }: PredictionDetailsModalProps) {
  if (!prediction) return null;

  let headerColor = "bg-rose-500";
  let textColor = "text-rose-500";
  if (prediction.Performance === "High") {
    headerColor = "bg-emerald-500";
    textColor = "text-emerald-500";
  } else if (prediction.Performance === "Average") {
    headerColor = "bg-indigo-500";
    textColor = "text-indigo-505";
  }

  return (
    <div id="details-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div
        id="details-modal"
        className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden transform transition-all animate-slide-up"
      >
        {/* Banner with performance category */}
        <div className={`${headerColor} px-6 py-5 text-white flex justify-between items-center relative`}>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffffffcc] font-mono">Prediction Audit Record</span>
            <h3 className="text-xl font-extrabold flex items-center gap-2 mt-0.5">
              <span>Employee: {prediction.Employee_ID}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/10 text-white/80 hover:text-white transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Info Grid */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono border-b border-slate-50 pb-3">
            <span>Timestamp: {prediction.timestamp}</span>
            <span>Ref: {prediction.id}</span>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 font-mono">Audited Parameters</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 font-mono">Experience</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{prediction.Experience} Years</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 font-mono">Projects Handled</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{prediction.Projects} Modules</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 font-mono">Working Hours / Day</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{prediction.Working_Hours} Hours</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 font-mono">Training Conducted</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{prediction.Training_Hours} Hours</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 font-mono">Predicted Outcome</h4>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 font-mono block">Model Classification</span>
                <span className="text-md font-bold text-slate-850 mt-1 block">Expected Potential Performance</span>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-xs ${
                prediction.Performance === "High" ? "bg-emerald-500 text-white" :
                prediction.Performance === "Average" ? "bg-indigo-500 text-white" : "bg-rose-500 text-white"
              }`}>
                {prediction.Performance}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-450 font-mono">Core Structured Advice</h4>
            <div className="bg-indigo-50/30 p-4 border border-indigo-50 rounded-xl leading-relaxed text-xs text-slate-600 font-medium">
              <strong>Recommendation playbook:</strong> {prediction.Recommendation}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
}
