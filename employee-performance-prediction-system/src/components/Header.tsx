/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, LogOut, Calendar, UserCheck, ShieldAlert } from "lucide-react";
import { UserSession } from "../types";

interface HeaderProps {
  session?: UserSession | null;
  onLogout?: () => void;
}

export function Header({ session, onLogout }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800 shadow-lg sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 active:scale-95 transition-transform duration-200">
              <Shield className="w-5.5 h-5.5 text-white stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-md font-bold tracking-tight text-slate-100">
                Talent Analytics Suite
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase select-none">
                  {session ? `${session.role} Portal Active` : "Secure Gateway Connected"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Session info on Right */}
          <div className="flex items-center gap-4 sm:gap-6">
            {session && (
              <div className="flex items-center gap-2.5 bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {session.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] font-bold text-slate-100 leading-tight truncate max-w-[100px]">
                    {session.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {session.role}
                  </div>
                </div>
              </div>
            )}

            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentDate}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 select-none uppercase font-bold">
                Local Time
              </span>
            </div>

            {onLogout && (
              <>
                <div className="hidden sm:block h-8 w-px bg-slate-800"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-semibold border border-transparent hover:border-slate-700 transition-all active:scale-95 cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
