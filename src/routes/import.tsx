import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import Data | PMO Command Center" },
      { name: "description", content: "Bulk-upload portfolio projects, milestones, and workstreams from Excel or CSV." },
      { property: "og:title", content: "Import Data | PMO Command Center" },
      { property: "og:description", content: "Bulk-import wizard for portfolio projects and milestones." },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  const [step] = useState(1);
  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
          <div>
            <nav className="flex text-xs text-on-surface-variant gap-2 mb-2">
              <Link to="/portfolio" className="hover:text-primary">Portfolio</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">Import Projects</span>
            </nav>
            <h1 className="text-3xl font-black text-on-surface">Data Import Wizard</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Scale your portfolio by bulk-uploading executive milestones and project workstreams.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-lg border border-border-subtle bg-surface-card text-xs font-medium text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined">download</span>
            Download Template (.xlsx)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { n: 1, t: "Upload", s: "Source File Selection" },
            { n: 2, t: "Map Fields", s: "Attribute Alignment" },
            { n: 3, t: "Validate", s: "Error Checking" },
          ].map((s) => (
            <div
              key={s.n}
              className={`flex items-center gap-3 p-4 rounded-xl ${
                step === s.n ? "bg-primary/5 border-2 border-primary" : "bg-surface-card border border-border-subtle opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === s.n ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {s.n}
              </div>
              <div>
                <p className={`text-sm font-medium ${step === s.n ? "text-primary" : ""}`}>{s.t}</p>
                <p className="text-xs text-on-surface-variant">{s.s}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                <h3 className="text-lg font-bold">Upload Source File</h3>
              </div>
              <div className="border-2 border-dashed border-border-subtle rounded-xl p-12 flex flex-col items-center justify-center hover:border-primary group transition-colors">
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <h4 className="text-lg font-bold mb-1">Drag and drop your file</h4>
                <p className="text-sm text-on-surface-variant mb-6 text-center">
                  Support for Microsoft Excel (.xlsx) and Comma Separated Values (.csv)
                </p>
                <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  Browse Files
                </button>
              </div>
              <div className="mt-6 flex items-center justify-between p-4 bg-surface-container-lowest border border-border-subtle rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-status-low/10 text-status-low rounded flex items-center justify-center">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Q3_Project_Backlog_Final.xlsx</p>
                    <p className="text-xs text-on-surface-variant">1.2 MB • Ready to map</p>
                  </div>
                </div>
                <button className="text-on-surface-variant hover:text-status-critical">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schema</span>
                  <h3 className="text-lg font-bold">Data Mapping</h3>
                </div>
                <span className="text-xs font-mono px-2 py-1 bg-surface-container text-on-surface-variant rounded">
                  7/10 Fields Matched
                </span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-8 pb-2 border-b border-border-subtle text-xs uppercase tracking-wider text-on-surface-variant">
                  <span>System Field</span>
                  <span>Excel Column</span>
                </div>
                {[
                  { f: "Task Name", dot: "bg-status-critical", opts: ["Project_Title", "Task_Name", "Description"] },
                  { f: "Workstream", dot: "bg-status-critical", opts: ["Department_ID", "Workstream", "Category"] },
                  { f: "Priority", dot: "bg-status-medium", opts: ["Priority_Level", "Urgency", "-- Ignore this field --"] },
                  { f: "Due Date", dot: "bg-status-low", opts: ["Deadline", "Finish_Date"] },
                ].map((row) => (
                  <div key={row.f} className="grid grid-cols-2 gap-8 items-center py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                      <span className="text-sm font-medium">{row.f}</span>
                    </div>
                    <select className="w-full rounded-lg border border-border-subtle bg-surface-card text-sm px-3 py-2 focus:ring-2 focus:ring-primary outline-none">
                      {row.opts.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                  <h3 className="text-lg font-bold">Preview & Validate</h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-status-low">
                    <span className="w-2 h-2 rounded-full bg-status-low" /> 124 Ready
                  </span>
                  <span className="flex items-center gap-1 text-status-critical">
                    <span className="w-2 h-2 rounded-full bg-status-critical" /> 3 Errors
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low text-xs text-on-surface-variant">
                    <tr>
                      {["Status", "Task Name", "Workstream", "Priority", "Validation Note"].map((h) => (
                        <th key={h} className="px-6 py-3 font-medium border-b border-border-subtle">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    <tr>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-status-low/10 text-status-low text-[11px] font-bold border border-status-low/30">READY</span>
                      </td>
                      <td className="px-6 py-4 font-medium">Cloud Infrastructure Migration</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-workstream-ox/10 text-workstream-ox text-[11px] font-bold">TECH</span>
                      </td>
                      <td className="px-6 py-4">High</td>
                      <td className="px-6 py-4 text-on-surface-variant italic">Passed</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-status-critical/10 text-status-critical text-[11px] font-bold border border-status-critical/30">ERROR</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-status-critical">NULL_VAL</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-workstream-ex/10 text-workstream-ex text-[11px] font-bold">OPEX</span>
                      </td>
                      <td className="px-6 py-4">Medium</td>
                      <td className="px-6 py-4 text-status-critical font-medium">Missing Field: Task Name</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-status-medium/10 text-status-medium text-[11px] font-bold border border-status-medium/30">WARNING</span>
                      </td>
                      <td className="px-6 py-4 font-medium">Stakeholder Review P4</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[11px] font-bold italic">UNKNOWN</span>
                      </td>
                      <td className="px-6 py-4">Low</td>
                      <td className="px-6 py-4 text-status-medium font-medium">Invalid Workstream: Mapping Required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold mb-4">Import Guidelines</h4>
              <div className="space-y-4">
                {[
                  { t: "Maximum 5,000 Rows", d: "Larger files should be broken into batches for optimal processing." },
                  { t: "Date Formats", d: "Ensure all dates use the ISO 8601 (YYYY-MM-DD) format." },
                  { t: "Required Fields", d: "Task Name and Due Date are mandatory for all entries." },
                ].map((g) => (
                  <div key={g.t} className="flex gap-3">
                    <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>
                    <div>
                      <p className="text-sm font-medium">{g.t}</p>
                      <p className="text-xs text-on-surface-variant">{g.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Pro Tip</p>
                <p className="text-sm text-on-surface-variant">
                  You can ignore columns by selecting the ignore option in the data mapping phase.
                </p>
              </div>
            </div>

            <div className="bg-primary text-white rounded-xl p-6 shadow-lg shadow-primary/20">
              <h4 className="text-lg font-bold mb-4">Import Summary</h4>
              <div className="space-y-3 mb-6 text-sm">
                {[
                  ["Total Rows Detected", "127"],
                  ["To be created", "124"],
                  ["To be skipped", "3"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span>{k}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/20 mb-6" />
              <button className="w-full bg-white text-primary py-3 rounded-lg text-sm font-bold hover:bg-surface-container-low transition-all">
                Complete Import
              </button>
              <button className="w-full mt-3 border border-white/30 text-white py-3 rounded-lg text-sm font-bold hover:bg-white/10 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}