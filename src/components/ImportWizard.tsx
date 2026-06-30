import { useState } from "react";

/**
 * Import wizard surface — rendered both as a standalone page redirect
 * shim and inside the Admin workspace "Import Data" tab.
 */
export function ImportWizard() {
  const [step] = useState(1);
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <p className="eyebrow">Bulk Operations</p>
          <h2 className="page-title mt-1">Data Import Wizard</h2>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
            Scale your portfolio by bulk-uploading projects, tasks, and workstream milestones from Excel or CSV.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-border-subtle bg-surface-card text-xs font-medium text-on-surface-variant hover:bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Download Template (.xlsx)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { n: 1, t: "Upload", s: "Source File Selection" },
          { n: 2, t: "Map Fields", s: "Attribute Alignment" },
          { n: 3, t: "Validate", s: "Error Checking" },
        ].map((s) => (
          <div
            key={s.n}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              step === s.n ? "bg-primary/5 border-2 border-primary" : "bg-surface-card border border-border-subtle opacity-60"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.n ? "bg-primary text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {s.n}
            </div>
            <div>
              <p className={`text-sm font-semibold ${step === s.n ? "text-primary" : ""}`}>{s.t}</p>
              <p className="text-[11px] text-on-surface-variant">{s.s}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
              <h3 className="section-title">Upload Source File</h3>
            </div>
            <div className="border-2 border-dashed border-border-subtle rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary group transition-colors">
              <div className="w-14 h-14 bg-surface-container-low rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-[28px]">upload_file</span>
              </div>
              <h4 className="text-sm font-semibold mb-1">Drag and drop your file</h4>
              <p className="text-xs text-on-surface-variant mb-5 text-center">
                Support for Microsoft Excel (.xlsx) and Comma Separated Values (.csv)
              </p>
              <button className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all">
                Browse Files
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between p-3 bg-surface-container-lowest border border-border-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-status-low/10 text-status-low rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">Q3_Project_Backlog_Final.xlsx</p>
                  <p className="text-[11px] text-on-surface-variant">1.2 MB • Ready to map</p>
                </div>
              </div>
              <button className="text-on-surface-variant hover:text-status-critical" aria-label="Remove file">
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">schema</span>
                <h3 className="section-title">Data Mapping</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-1 bg-surface-container text-on-surface-variant rounded">
                7/10 Fields Matched
              </span>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-6 pb-2 border-b border-border-subtle eyebrow">
                <span>System Field</span>
                <span>Excel Column</span>
              </div>
              {[
                { f: "Task Name", dot: "bg-status-critical", opts: ["Project_Title", "Task_Name", "Description"] },
                { f: "Workstream", dot: "bg-status-critical", opts: ["Department_ID", "Workstream", "Category"] },
                { f: "Priority", dot: "bg-status-medium", opts: ["Priority_Level", "Urgency", "-- Ignore --"] },
                { f: "Due Date", dot: "bg-status-low", opts: ["Deadline", "Finish_Date"] },
              ].map((row) => (
                <div key={row.f} className="grid grid-cols-2 gap-6 items-center py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${row.dot}`} />
                    <span className="text-xs font-medium">{row.f}</span>
                  </div>
                  <select className="w-full rounded-lg border border-border-subtle bg-surface-card text-xs px-2.5 py-1.5 focus:ring-2 focus:ring-primary outline-none">
                    {row.opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-5 shadow-sm">
            <h4 className="section-title mb-3">Import Guidelines</h4>
            <div className="space-y-3">
              {[
                { t: "Maximum 5,000 Rows", d: "Larger files should be broken into batches." },
                { t: "Date Formats", d: "Use ISO 8601 (YYYY-MM-DD)." },
                { t: "Required Fields", d: "Task Name and Due Date are mandatory." },
              ].map((g) => (
                <div key={g.t} className="flex gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                  <div>
                    <p className="text-xs font-semibold">{g.t}</p>
                    <p className="text-[11px] text-on-surface-variant">{g.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary text-white rounded-xl p-5 shadow-lg shadow-primary/20">
            <h4 className="text-sm font-bold mb-3">Import Summary</h4>
            <div className="space-y-2 mb-4 text-xs">
              {[
                ["Total Rows", "127"],
                ["To be created", "124"],
                ["To be skipped", "3"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-white/20 mb-4" />
            <button className="w-full bg-white text-primary py-2.5 rounded-lg text-xs font-bold hover:bg-surface-container-low transition-all">
              Complete Import
            </button>
            <button className="w-full mt-2 border border-white/30 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}