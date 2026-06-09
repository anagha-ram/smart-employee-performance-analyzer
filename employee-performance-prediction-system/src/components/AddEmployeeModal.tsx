/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, UserPlus, Briefcase, Award, Clock, BookOpen, User, CheckCircle, AlertCircle } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (data: {
    Employee_ID: string;
    Experience: number;
    Projects: number;
    Working_Hours: number;
    Training_Hours: number;
    Performance: "High" | "Average" | "Low";
  }) => Promise<void>;
}

export function AddEmployeeModal({ isOpen, onClose, onAddEmployee }: AddEmployeeModalProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [experience, setExperience] = useState<number>(3);
  const [projects, setProjects] = useState<number>(3);
  const [workingHours, setWorkingHours] = useState<number>(8);
  const [trainingHours, setTrainingHours] = useState<number>(30);
  const [performance, setPerformance] = useState<"High" | "Average" | "Low">("Average");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setErrorMsg("Employee ID is required");
      return;
    }
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    try {
      await onAddEmployee({
        Employee_ID: employeeId.trim().toUpperCase(),
        Experience: Number(experience),
        Projects: Number(projects),
        Working_Hours: Number(workingHours),
        Training_Hours: Number(trainingHours),
        Performance: performance as "High" | "Average" | "Low",
      });
      setSuccessMsg("Employee registered successfully to CSV database!");
      setEmployeeId("");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="add-employee-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div id="add-employee-card" className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up">
        {/* Header wrapper */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-md font-extrabold tracking-tight">Register New Employee</h3>
              <p className="text-[11px] text-slate-400 font-medium">Adds a new entry directly into employee_data.csv</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body wrapper */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Employee ID */}
          <div className="space-y-1.5">
            <label htmlFor="modal-emp-id" className="text-xs font-bold text-slate-600 flex items-center gap-1 font-sans">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Employee ID</span>
            </label>
            <input
              id="modal-emp-id"
              type="text"
              required
              placeholder="e.g. EMP-999"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Experience */}
            <div className="space-y-1.5">
              <label htmlFor="modal-exp" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
                <span>Experience (yrs)</span>
              </label>
              <input
                id="modal-exp"
                type="number"
                min="0"
                max="30"
                required
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
              />
            </div>

            {/* Projects */}
            <div className="space-y-1.5">
              <label htmlFor="modal-projects" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
                <span>Projects</span>
              </label>
              <input
                id="modal-projects"
                type="number"
                min="1"
                max="25"
                required
                value={projects}
                onChange={(e) => setProjects(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Working Hours */}
            <div className="space-y-1.5">
              <label htmlFor="modal-hours" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
                <span>Hours / Day</span>
              </label>
              <input
                id="modal-hours"
                type="number"
                min="4"
                max="16"
                required
                value={workingHours}
                onChange={(e) => setWorkingHours(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
              />
            </div>

            {/* Training Hours */}
            <div className="space-y-1.5">
              <label htmlFor="modal-training" className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
                <span>Training (hrs)</span>
              </label>
              <input
                id="modal-training"
                type="number"
                min="0"
                max="200"
                required
                value={trainingHours}
                onChange={(e) => setTrainingHours(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          {/* Performance Select */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 select-none">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
              <span>Assigned Performance Grade</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {["Low", "Average", "High"].map((perf) => {
                let activeColor = "border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold";
                if (perf === "High") activeColor = "border-emerald-600 bg-emerald-50/50 text-emerald-700 font-bold";
                if (perf === "Low") activeColor = "border-rose-600 bg-rose-50/50 text-rose-700 font-bold";

                return (
                  <button
                    id={`modal-opt-${perf}`}
                    key={perf}
                    type="button"
                    onClick={() => setPerformance(perf as "High" | "Average" | "Low")}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                      performance === perf ? activeColor : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {perf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              id="modal-cancel"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="modal-submit"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {isSubmitting ? "Adding Record..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
