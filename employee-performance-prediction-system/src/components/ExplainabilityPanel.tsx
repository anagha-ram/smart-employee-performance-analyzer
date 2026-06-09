/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { TreePine, BookOpen, Layers, GitFork, Clipboard, HelpCircle, Activity, Play } from "lucide-react";
import { TreeNode } from "../server/decisionTree";

interface ModelConfig {
  features: string[];
  stats: {
    totalSamples: number;
    maxDepth: number;
    totalNodes: number;
  };
  root: TreeNode | null;
}

export function ExplainabilityPanel() {
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<ModelConfig | null>(null);
  const [activeTab, setActiveTab] = useState<"tree-structure" | "path-simulator">("tree-structure");

  // User input variables for Path Simulator
  const [simExp, setSimExp] = useState(2);
  const [simProj, setSimProj] = useState(3);
  const [simHours, setSimHours] = useState(8);
  const [simTraining, setSimTraining] = useState(25);
  const [simulatorPath, setSimulatorPath] = useState<{ step: string; decision: string }[]>([]);
  const [predictedResult, setPredictedResult] = useState<string>("");

  const fetchModelConfiguration = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/model/tree");
      if (res.ok) {
        const config: ModelConfig = await res.json();
        setModel(config);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelConfiguration();
  }, []);

  // Compute live logic path tracing
  const handleTraceLogic = () => {
    if (!model?.root) return;
    const pathTrace: { step: string; decision: string }[] = [];
    const inputs = [simExp, simProj, simHours, simTraining];
    const featNames = ["Experience yr", "Projects Handled", "Working Hours/Day", "Training Hours"];

    let currentNode: TreeNode = model.root;
    let limit = 0;

    while (currentNode && limit < 15) {
      limit++;
      if (currentNode.isLeaf) {
        setPredictedResult(currentNode.label || "Average");
        break;
      }

      const { splitFeature, splitValue, left, right } = currentNode;
      if (splitFeature === undefined || splitValue === undefined || !left || !right) {
        setPredictedResult(currentNode.label || "Average");
        break;
      }

      const fName = featNames[splitFeature];
      const actualVal = inputs[splitFeature];
      const isLeft = actualVal <= splitValue;

      pathTrace.push({
        step: `Splitting node criteria: ${fName} (Current default value is ${actualVal})`,
        decision: isLeft
          ? `Value ${actualVal} is <= threshold ${splitValue} ➔ Traversing Left Branch`
          : `Value ${actualVal} is > threshold ${splitValue} ➔ Traversing Right Branch`,
      });

      currentNode = isLeft ? left : right;
    }

    setSimulatorPath(pathTrace);
  };

  useEffect(() => {
    handleTraceLogic();
  }, [simExp, simProj, simHours, simTraining, model]);

  // Recursive element to render tree structure as beautiful human readable guidelines
  const renderTreeNodesRecursive = (node: TreeNode | null | undefined, depth: number = 0, isLeft: boolean | null = null): React.ReactNode => {
    if (!node) return null;
    const featNames = ["Experience", "Projects", "Working_Hours", "Training_Hours"];

    if (node.isLeaf) {
      let variantColor = "text-rose-600 bg-rose-50 border-rose-100";
      if (node.label === "High") variantColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
      if (node.label === "Average") variantColor = "text-indigo-600 bg-indigo-50 border-indigo-100";

      return (
        <div className="flex items-center gap-1.5 py-1 text-xs font-semibold select-none animate-slide-up pl-4 border-l border-slate-100">
          <span className="text-slate-400 font-mono">↳</span>
          <span className="text-[10px] text-zinc-400 font-mono uppercase">Assign bracket</span>
          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold ${variantColor}`}>
            {node.label} Performer
          </span>
        </div>
      );
    }

    const featureName = featNames[node.splitFeature ?? 0]?.replace("_", " ") || "Parameter";

    return (
      <div className="pl-4 border-l-2 border-slate-100/80 space-y-2 text-left py-1 select-none">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 animate-slide-up leading-tight py-1">
          <span className="text-indigo-500 font-bold">●</span>
          <span>Is {featureName} ≤ {node.splitValue}?</span>
        </div>
        
        {/* Child level left */}
        <div className="pl-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">✔ Yes (Value matches splitting constraint)</div>
          {renderTreeNodesRecursive(node.left, depth + 1, true)}
        </div>

        {/* Child level right */}
        <div className="pl-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">✖ No (Value exceeds splitting constraint)</div>
          {renderTreeNodesRecursive(node.right, depth + 1, false)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-650 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono font-bold uppercase">Deconstructing Decision Model weights...</p>
      </div>
    );
  }

  return (
    <div id="explainability-panel-root" className="space-y-8 animate-fade-in">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 text-white rounded-3xl p-6 text-left relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-indigo-600/10 rounded-full pointer-events-none translate-x-12 translate-y-12" />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1">
            <TreePine className="w-4 h-4 text-indigo-400" />
            <span>White-Box Explainable AI Metrics</span>
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Model Inspector & Rule Explorer</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Unlike "black-box" alternative models, our custom Decision Tree classifier exposes the precise binary boundaries splits configured live. Review variables thresholds math or trace custom profiles decisions below.
          </p>
        </div>
      </div>

      {/* Model Statistics Overview Cards */}
      {model && (
        <section id="tree-stats-row" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition-colors flex justify-between items-center text-left">
            <div>
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Dataset Sample size</h5>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{model.stats.totalSamples}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Clipboard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition-colors flex justify-between items-center text-left">
            <div>
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Tree Max Depth</h5>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{model.stats.maxDepth}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 hover:border-slate-200 transition-colors flex justify-between items-center text-left">
            <div>
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Total Decision Cells</h5>
              <p className="text-2xl font-extrabold text-slate-800 mt-1">{model.stats.totalNodes}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <GitFork className="w-5 h-5" />
            </div>
          </div>
        </section>
      )}

      {/* Interactive Tabs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
        <div className="border-b border-slate-105 p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("tree-structure")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                activeTab === "tree-structure"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Logical Rules Explorer
            </button>
            <button
              onClick={() => setActiveTab("path-simulator")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                activeTab === "path-simulator"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Interactive Tree-Path Simulator
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Gini Index Splitting Rules Engine</span>
        </div>

        <div className="p-6">
          {/* Rules Explorer Tab */}
          {activeTab === "tree-structure" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Below lies the programmatic layout of the Gini trained Decision Tree. Nodes labeled with <strong>●</strong> represent split criteria (decision points), while terminal branches labeled with <strong>Assign bracket</strong> represent finalized Performance classes. Keep sliders fixed to modify classifications.
                </span>
              </div>

              {model?.root ? (
                <div id="tree-root-box" className="p-6 bg-slate-50/20 border border-slate-100 rounded-2xl max-h-[500px] overflow-auto scrollbar-thin">
                  {renderTreeNodesRecursive(model.root)}
                </div>
              ) : (
                <div className="text-center py-20 text-xs text-slate-400 font-mono uppercase font-bold">No root structure parsed. Load some employee data.</div>
              )}
            </div>
          )}

          {/* Path Simulator Tab */}
          {activeTab === "path-simulator" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Variable control sidebar (Left) */}
              <div className="md:col-span-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">Draft Test Case Profile</h4>
                
                <div className="space-y-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {/* Exp */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Experience Level</span>
                      <span className="text-indigo-650">{simExp}y</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={simExp}
                      onChange={(e) => setSimExp(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Proj */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Projects handled</span>
                      <span className="text-indigo-650">{simProj}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={simProj}
                      onChange={(e) => setSimProj(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Hours */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Working Hours avg</span>
                      <span className="text-indigo-650">{simHours}h/day</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="14"
                      value={simHours}
                      onChange={(e) => setSimHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                    />
                  </div>

                  {/* Training */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>Training Course hrs</span>
                      <span className="text-indigo-650">{simTraining} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="5"
                      value={simTraining}
                      onChange={(e) => setSimTraining(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded accent-slate-900 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-1">
                  <div className="text-[10px] text-indigo-400 font-mono uppercase font-extrabold tracking-wider">Simulated Performance Outcomes</div>
                  <div className="text-lg font-extrabold font-sans tracking-tight">
                    {predictedResult} Performer
                  </div>
                </div>
              </div>

              {/* Steps timeline output (Right) */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide font-mono">Trace Logic Timeline</h4>

                <div className="space-y-4">
                  {simulatorPath.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-left">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 bg-slate-100 border border-slate-250 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-bold font-mono">
                          {idx + 1}
                        </div>
                        {idx !== simulatorPath.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
                      </div>
                      <div className="space-y-1 pt-0.5">
                        <p className="text-xs font-bold text-slate-700 leading-tight">{step.step}</p>
                        <p className="text-[11px] text-indigo-600 font-semibold font-sans">{step.decision}</p>
                      </div>
                    </div>
                  ))}

                  {/* Terminating Outcome */}
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                      <font className="text-xs font-extrabold font-mono text-emerald-700">✓</font>
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-emerald-900 font-sans">Final Classifier Outcome reached</h5>
                      <span className="text-[11px] text-emerald-755 text-emerald-800 font-medium font-sans">
                        Decision tree reached terminal leaf. Subject is officially predicted as an <strong>{predictedResult} Performer</strong>. Playbook generated successfully!
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
