/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, Shield, User, ArrowRight, AlertCircle, Sparkles, Building2 } from "lucide-react";
import { UserSession } from "../types";

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setErrorMessage("Please enter your company email ID or Employee ID.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login verification failed");
      }

      const data = await response.json();
      
      const session: UserSession = {
        role: data.role,
        name: data.role === "HR" ? data.user.Name : data.employee.Name,
        email: data.role === "HR" ? data.user.Email : data.employee.Email,
        position: data.role === "HR" ? data.user.Position : data.employee.Position,
        department: data.role === "HR" ? data.user.Department : data.employee.Department,
        employeeData: data.role === "Employee" ? {
          Employee_ID: data.employee.Employee_ID,
          Experience: data.employee.Experience,
          Projects: data.employee.Projects,
          Working_Hours: data.employee.Working_Hours,
          Training_Hours: data.employee.Training_Hours,
          Performance: data.employee.Performance,
          predictedPerformance: data.employee.predictedPerformance,
          recommendation: data.employee.recommendation,
        } : undefined,
      };

      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMessage(err.message || "Unable to reach the secure authentication gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setUsernameOrEmail(email);
    setPassword("employee2026");
    // Trigger submission shortly after setting states
    setTimeout(() => {
      const form = document.getElementById("login-auth-form") as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    }, 150);
  };

  return (
    <div id="login-portal-container" className="min-h-[85vh] flex items-center justify-center py-6 px-4 font-sans antialiased text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl text-left scale-100">
        
        {/* Portal Header Accent */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full translate-x-8 -translate-y-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-x-6 translate-y-6" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </span>
              <span className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-[#a5b4fc]">
                Secure Corporate Enterprise Gate
              </span>
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight font-sans leading-none mt-2">
              Talent Analytics Portal
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Please enter your company assigned email ID or alphanumeric Employee ID. High-contrast security rules apply.
            </p>
          </div>
        </div>

        {/* Form area */}
        <div className="p-8 space-y-6 bg-white">
          {errorMessage && (
            <div id="login-error-toast" className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-semibold leading-relaxed animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Blocked</p>
                <p className="text-[11px] text-rose-700/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form id="login-auth-form" onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="auth-email-input" className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                Company Email Address / Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="text"
                  placeholder="e.g. elizabeth.davis@company.com or EMP-101"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="auth-password-input" className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                  Corporate Security Password
                </label>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">
                  Required for Authentication
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter 'employee2026' or your numeric Employee ID"
                  className="w-full text-xs font-semibold pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5"
                  required
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer active:scale-95 mt-4"
            >
              <span>{isLoading ? "Validating Credentials..." : "Authenticate Session"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Preset Accounts Selection */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">
                Access Authorization Guide
              </h5>
            </div>

            <div className="text-[11px] text-slate-400 font-medium leading-normal bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p>
                ⚠️ <strong className="text-slate-700">HR Portal Login:</strong> Log in as <span className="font-mono font-bold bg-slate-200/80 px-1 py-0.5 rounded text-indigo-950">hr@company.com</span> with password <span className="font-mono font-bold bg-slate-200/80 px-1 py-0.5 rounded text-indigo-950">companyHR2026</span>.
              </p>
              <div className="border-t border-slate-200/60 my-1" />
              <p>
                🔒 <strong className="text-slate-700">All Employees:</strong> <span className="italic font-semibold text-emerald-800">All registered corporate staff</span> (any ID from EMP-101 onwards, high, average, or low performance index) can log in using their email address with either:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10px] font-semibold">
                <li>General passcode: <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1 py-0.2 rounded">employee2026</span></li>
                <li>Individual Employee ID: e.g., <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1 py-0.2 rounded">EMP-101</span></li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("elizabeth.davis@company.com")}
                className="p-3 text-left bg-slate-50 border border-slate-150 hover:border-emerald-200 rounded-xl flex items-center justify-between group transition-all text-xs cursor-pointer hover:bg-emerald-50/20"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="font-bold text-slate-800">Elizabeth Davis (Employee)</h6>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">EMP-101 (Quick access demo)</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  <span>Enter</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
