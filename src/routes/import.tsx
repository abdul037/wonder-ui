import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import Data | Supply Chain Tech Hub" },
      { name: "description", content: "Bulk import has moved into the Admin workspace." },
      { property: "og:title", content: "Import Data | Supply Chain Tech Hub" },
    ],
  }),
  component: ImportPage,
});

function ImportPage() {
  return (
    <AppShell>
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">upload_file</span>
          </div>
          <h1 className="page-title">Import is now inside Admin</h1>
          <p className="text-sm text-on-surface-variant">
            Bulk upload of projects, tasks, and milestones lives alongside the rest of your hub
            management as a dedicated tab.
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            Open Admin · Import Data
          </Link>
        </div>
      </div>
    </AppShell>
  );
}