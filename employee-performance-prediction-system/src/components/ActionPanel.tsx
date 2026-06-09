/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Brain, UserPlus, Download, Sparkles } from "lucide-react";

interface ActionPanelProps {
  onAddEmployeeClick: () => void;
  onDownloadReport: () => void;
  isDownloading: boolean;
}

export function ActionPanel({
  onAddEmployeeClick,
  onDownloadReport,
  isDownloading
}: ActionPanelProps) {
  return (
    <div id="quick-actions-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Operations Center
          </h3>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Task Actions
          </h2>
        </div>
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      <p className="text-xs text-slate-505 leading-relaxed mb-6 font-medium">
        Expedite talent evaluation workflows. Register newly recruited employees directly into the database or download the latest active CSV report.
      </p>

      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
        {/* Action 2: Add Employee */}
        <button
          id="action-add-employee"
          onClick={onAddEmployeeClick}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow shadow-indigo-600/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-white stroke-[2]" />
          <span>Add Employee</span>
        </button>

        {/* Action 3: Download Report */}
        <button
          id="action-download-report"
          onClick={onDownloadReport}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow shadow-emerald-600/10 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2]" />
          <span>{isDownloading ? "Downloading..." : "Export CSV Report"}</span>
        </button>
      </div>
    </div>
  );
}
