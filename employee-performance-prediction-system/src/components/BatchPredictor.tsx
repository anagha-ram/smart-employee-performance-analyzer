/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, Download, Trash2, ArrowRight, Table, AlertCircle } from "lucide-react";
import { PredictionResult } from "../types";

export function BatchPredictor() {
  const [dragActive, setDragActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV format entries: Employee_ID, Experience, Projects, Working_Hours, Training_Hours
  const handleParseAndRun = async (rawCsv: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const lines = rawCsv.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        throw new Error("No entries detected. Paste some content or drag in a CSV.");
      }

      // Check if header exists and skip it
      let startIndex = 0;
      if (lines[0].toLowerCase().includes("id") || lines[0].toLowerCase().includes("experience")) {
        startIndex = 1;
      }

      const entries: any[] = [];
      for (let i = startIndex; i < lines.length; i++) {
        const cells = lines[i].split(",").map(c => c.trim());
        if (cells.length < 5) continue; // skip invalid rows

        entries.push({
          Employee_ID: cells[0] || `BATCH-ROW-${i}`,
          Experience: parseInt(cells[1]) || 0,
          Projects: parseInt(cells[2]) || 0,
          Working_Hours: parseInt(cells[3]) || 0,
          Training_Hours: parseInt(cells[4]) || 0,
        });
      }

      if (entries.length === 0) {
        throw new Error("Could not find any complete rows with 5 entries: ID, Experience, Projects, Working_Hours, Training_Hours");
      }

      const res = await fetch("/api/predict/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (!res.ok) throw new Error("Batch server evaluation failed.");
      const data = await res.json();
      
      setResults(data.results || []);
      setSuccessCount(data.results ? data.results.length : 0);
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      readCsvFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readCsvFile(e.target.files[0]);
    }
  };

  const readCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      handleParseAndRun(text);
    };
    reader.readAsText(file);
  };

  const clearBatch = () => {
    setResults([]);
    setInputText("");
    setSuccessCount(0);
    setErrorMsg("");
  };

  const downloadPredictedCsv = () => {
    if (results.length === 0) return;
    const headers = "Employee_ID,Experience,Projects,Working_Hours,Training_Hours,Predicted_Performance,Recommendation\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + results.map(r => 
      `"${r.Employee_ID}",${r.Experience},${r.Projects},${r.Working_Hours},${r.Training_Hours},"${r.Performance}","${r.Recommendation.replace(/"/g, '""')}"`
    ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `batch_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="batch-predictor-card" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Bulk Metrics Evaluator</h3>
          </div>
          <h2 className="text-lg font-extrabold text-slate-950 mt-1">
            Batch Performance Prediction
          </h2>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold py-1 px-3 rounded-full">
          Offline processing pipeline
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">
        Process high-volumes of talent entries concurrently. Drag and drop file credentials formatted with headings or comma separators (<code className="font-mono bg-slate-100 p-0.5 px-1 rounded text-red-600">ID,Experience,Projects,Hours,Training</code>) to compute designated classifications instantly.
      </p>

      {/* Drag & Drop Frame Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-55/10 bg-emerald-50/50"
                : "border-slate-200 hover:border-emerald-500 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,.txt"
              className="hidden"
            />
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Drag & Drop CSV File</p>
              <p className="text-[10px] text-slate-400 mt-1">or click to browse from system drive</p>
            </div>
          </div>

          <div className="relative text-center text-xs font-bold text-slate-400 font-mono uppercase bg-white">
            <span className="relative z-10 px-3 bg-white">OR manually paste entries</span>
            <div className="absolute inset-y-1/2 left-0 right-0 h-px bg-slate-100 -z-0" />
          </div>

          {/* Paste Input Area */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g.&#10;EMP101,5,3,8,45&#10;EMP102,1,2,9,15&#10;EMP103,12,7,8,85"
              className="w-full p-3 font-mono text-[11px] font-medium leading-relaxed rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none transition-all resize-none"
            />
            <button
              onClick={() => handleParseAndRun(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>{isLoading ? "Running Predictions..." : "Parse & Evaluate Paste"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Computations Area (Right Column) */}
        <div className="lg:col-span-8">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-2 text-xs font-bold animate-fade-in mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {results.length > 0 ? (
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs space-y-4">
              {/* Table Action Bar */}
              <div className="bg-slate-50 p-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-slate-505 text-slate-500" />
                  <span>Computed Predictions ({successCount} records)</span>
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={downloadPredictedCsv}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download predicted output</span>
                  </button>
                  <button
                    onClick={clearBatch}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 hover:border-rose-100 transition-all cursor-pointer"
                    title="Clear Predictions"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Table contents */}
              <div className="overflow-x-auto max-h-[300px] scrollbar-thin">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="p-3">ID</th>
                      <th className="p-3 text-center">Exp</th>
                      <th className="p-3 text-center">Proj</th>
                      <th className="p-3 text-center font-mono">Hrs/Day</th>
                      <th className="p-3 text-center">Train</th>
                      <th className="p-3 text-right">Predicted Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      let badgeColor = "bg-rose-50 text-rose-700 border-rose-100 font-bold";
                      if (r.Performance === "High") badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100 font-bold";
                      if (r.Performance === "Average") badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100 font-bold";

                      return (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/55 text-xs font-semibold text-slate-600">
                          <td className="p-3 font-mono font-bold text-slate-900">{r.Employee_ID}</td>
                          <td className="p-3 text-center">{r.Experience}y</td>
                          <td className="p-3 text-center">{r.Projects}</td>
                          <td className="p-3 text-center font-mono">{r.Working_Hours}h</td>
                          <td className="p-3 text-center">{r.Training_Hours}h</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-1 rounded-lg border text-[10px] ${badgeColor}`}>
                              {r.Performance}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-20 gap-2.5 text-center bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300" />
              <div>
                <p className="text-xs font-bold text-slate-600">Evaluation Pipeline Ideal</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                  Upload employee tables or copy-paste commas text lines into the left sidebar to run batch queries inside the model.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
