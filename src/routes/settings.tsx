import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Supply Chain Tech Hub" },
      { name: "description", content: "Workspace, notification, and integration settings for the Supply Chain Tech Hub." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <div className="px-8 py-8 max-w-4xl">
        <h2 className="text-4xl font-black text-on-surface">Settings</h2>
        <p className="text-on-surface-variant mt-1">Workspace, notification, and integration preferences.</p>
        <div className="mt-8 grid gap-4">
          {["Workspace", "Notifications", "Integrations", "Team & Permissions"].map((s) => (
            <div key={s} className="bg-surface-card border border-border-subtle rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{s}</h3>
                <p className="text-xs text-on-surface-variant mt-1">Manage {s.toLowerCase()} configuration.</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}