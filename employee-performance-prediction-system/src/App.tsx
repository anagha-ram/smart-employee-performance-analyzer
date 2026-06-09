/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { ActionPanel } from "./components/ActionPanel";
import { AddEmployeeModal } from "./components/AddEmployeeModal";
import { Login } from "./components/Login";
import { CompanyDirectory } from "./components/CompanyDirectory";
import { EmployeeDashboard } from "./components/EmployeeDashboard";
import { DashboardAnalytics, UserSession } from "./types";
import { Brain, LayoutDashboard, CheckCircle, AlertCircle, X, Users } from "lucide-react";

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [employeeActiveTab, setEmployeeActiveTab] = useState<"compass" | "directory">("compass");
  const [activeTab, setActiveTab] = useState<"dashboard" | "directory">("dashboard");
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  
  // Modals & UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Notification Management
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    description?: string;
  } | null>(null);

  // Auto-clear helper
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch core analytics
  const fetchDashboardData = async () => {
    try {
      const resAnalytics = await fetch("/api/analytics");
      if (!resAnalytics.ok) throw new Error("Could not fetch analytics payload");
      const dataAnalytics = await resAnalytics.json();
      setAnalytics(dataAnalytics);
    } catch (err: any) {
      console.error(err);
      setNotification({
        type: "error",
        message: "Failed to connect to HR Backend",
        description: err.message || "Ensure the database server is running."
      });
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      await fetchDashboardData();
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  // Handle registering a new employee
  const handleRegisterEmployee = async (values: {
    Experience: number;
    Projects: number;
    Working_Hours: number;
    Training_Hours: number;
  }) => {
    setIsActionLoading(true);
    try {
      const response = await fetch("/api/employee/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Register employee request failed");
      }
      const data = await response.json();
      
      // Refresh current dataset
      await fetchDashboardData();
      
      setNotification({
        type: "success",
        message: "Record Added Successfully",
        description: `Employee ID: [${data.employee.Employee_ID}] registered. Evaluated as average/high performer, modifying dataset in real-time.`
      });
    } catch (err: any) {
      throw err; // Propagate into the modal error handler
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle CSV download export
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      window.location.href = "/api/report/download";
      setNotification({
        type: "success",
        message: "Report Download Triggered",
        description: "Checking active dataset columns, exporting CSV spreadsheet format."
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: "Report export failed",
        description: err.message
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setNotification({
      type: "success",
      message: "Portal Session Safe Out",
      description: "You have signed out of the predictive metrics panel. Security keys cleared."
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Header session={session} onLogout={session ? handleLogout : undefined} />

      {/* Floating global Notifications */}
      {notification && (
        <div
          id="global-toast"
          className={`fixed bottom-6 right-6 max-w-sm w-full p-4 rounded-xl border shadow-lg z-50 flex items-start gap-3 transform transition-all duration-300 animate-slide-in ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold font-sans tracking-tight leading-4">
              {notification.message}
            </h4>
            {notification.description && (
              <p className="text-[11px] text-opacity-80 mt-1 leading-relaxed font-sans font-medium">
                {notification.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-opacity-65 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {!session ? (
          <Login onLoginSuccess={(sess) => {
            setSession(sess);
            setNotification({
              type: "success",
              message: `Welcome to the Portal`,
              description: `Successfully signed in as ${sess.name} (${sess.role}). Session established.`
            });
            if (sess.role === "HR") {
              fetchDashboardData();
            }
          }} />
        ) : session.role === "Employee" ? (
          // ==============================
          // 🔸 EMPLOYEE ROLE DASHBOARD VIEW
          // ==============================
          <div className="space-y-8">
            <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  id="employee-tab-compass"
                  onClick={() => setEmployeeActiveTab("compass")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    employeeActiveTab === "compass"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>My Career Compass</span>
                </button>

                <button
                  id="employee-tab-directory"
                  onClick={() => setEmployeeActiveTab("directory")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    employeeActiveTab === "directory"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Corporate Staff Directory</span>
                </button>
              </div>

              <div id="quick-indicators-employee" className="flex items-center gap-2 text-xs text-slate-500 font-semibold font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Secure Employee Portal</span>
              </div>
            </section>

            {employeeActiveTab === "compass" ? (
              <EmployeeDashboard session={session} onExploreDirectory={() => setEmployeeActiveTab("directory")} />
            ) : (
              <CompanyDirectory />
            )}
          </div>
        ) : (
          // ==============================
          // 🔸 HR ROLE PORTAL VIEWS
          // ==============================
          <div className="space-y-8">
            
            {/* HR Navigation Tab Selector */}
            <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  id="tab-view-dashboard"
                  onClick={() => {
                    setActiveTab("dashboard");
                    fetchDashboardData();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>HR Analytics Dashboard</span>
                </button>

                <button
                  id="tab-view-directory"
                  onClick={() => setActiveTab("directory")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "directory"
                      ? "bg-slate-950 text-white shadow"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Company Directory</span>
                </button>
              </div>

              <div id="quick-indicators" className="flex items-center gap-3 text-xs text-slate-500 font-semibold font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>CSV Database Sync</span>
                </span>
              </div>
            </section>

            {/* HR VIEW WRAPPERS */}
            {isLoading ? (
              <div id="main-loader" className="flex flex-col items-center justify-center py-40 gap-4 text-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Connecting to Gateway</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider font-semibold animate-pulse">Loading dataset...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* VIEW RENDER: DASHBOARD VIEW */}
                {activeTab === "dashboard" && analytics && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-8">
                      <Dashboard
                        analytics={analytics}
                        onNavigateToPredict={() => {}}
                      />
                    </div>

                    <div className="lg:col-span-4 space-y-8 sticky top-20">
                      <ActionPanel
                        onAddEmployeeClick={() => setIsAddModalOpen(true)}
                        onDownloadReport={handleDownloadReport}
                        isDownloading={isDownloading}
                      />
                    </div>
                  </div>
                )}

                {/* VIEW RENDER: COMPANY DIRECTORY */}
                {activeTab === "directory" && (
                  <CompanyDirectory />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-mono mt-auto relative z-10 font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Employee Performance System. All rights reserved.</p>
        </div>
      </footer>

      {/* MODAL: ADD EMPLOYEE TO DATABASES */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEmployee={handleRegisterEmployee}
      />
    </div>
  );
}
