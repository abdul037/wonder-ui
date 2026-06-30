import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { setAdminMode, useIsAdmin } from "@/lib/admin";
import { useTheme, toggleTheme } from "@/lib/theme";

const navItems = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/portfolio", icon: "folder_special", label: "Portfolio" },
  { to: "/pipeline", icon: "pending_actions", label: "Pipeline" },
  { to: "/sprint-board", icon: "view_kanban", label: "Sprint Board" },
  { to: "/roadmap", icon: "map", label: "Period Roadmap" },
  { to: "/unified-roadmap", icon: "timeline", label: "Unified Roadmap" },
  { to: "/newsletter", icon: "campaign", label: "Tech Pulse" },
] as const;

const utilityItems = [
  { to: "/admin", icon: "admin_panel_settings", label: "Admin" },
  { to: "/settings", icon: "settings", label: "Settings" },
  { to: "/support", icon: "help", label: "Support" },
] as const;

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

function Sidebar({ pathname }: { pathname: string }) {
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");
  return (
    <aside className="hidden md:flex flex-col h-full py-5 px-3 gap-1.5 bg-surface-container-low border-r border-border-subtle w-60 shrink-0">
      <Link to="/" className="flex items-center gap-2.5 px-2 mb-6">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            insights
          </span>
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-primary leading-tight tracking-tight">Supply Chain Tech Hub</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">Projects · Tasks · Enhancements</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                active
                  ? "bg-primary-fixed text-on-primary-fixed font-bold translate-x-1"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} />
              <span className="text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-border-subtle space-y-0.5">
        {utilityItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 text-on-surface-variant px-3 py-2 hover:bg-surface-container-high transition-all rounded-lg"
          >
            <Icon name={item.icon} />
            <span className="text-[13px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

function TopBar() {
  const isAdmin = useIsAdmin();
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <header className="flex justify-between items-center w-full px-5 py-2 h-14 bg-surface-container-lowest border-b border-border-subtle sticky top-0 z-20">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <Icon
            name="search"
            className="!absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search portfolio, stakeholders, or workstreams..."
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-card transition-all outline-none text-on-surface"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/briefing"
          title="Open SCM Head briefing — present this hub as a deck"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-primary text-on-primary hover:opacity-90 shadow-sm"
        >
          <Icon name="slideshow" className="!text-[16px]" />
          Present
        </Link>
        <button
          onClick={() => setAdminMode(!isAdmin)}
          aria-pressed={isAdmin}
          title={isAdmin ? "Admin mode is ON — click to disable" : "Enable admin mode to edit content inline"}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            isAdmin
              ? "bg-status-medium/10 text-status-medium border-status-medium/30 shadow-sm"
              : "bg-surface-container-low text-on-surface-variant border-border-subtle hover:bg-surface-container"
          }`}
        >
          <Icon name={isAdmin ? "lock_open" : "lock"} className="!text-[16px]" />
          {isAdmin ? "Admin · ON" : "Admin mode"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            <Icon name={dark ? "light_mode" : "dark_mode"} />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
            <Icon name="notifications" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-status-critical rounded-full border-2 border-surface-card" />
          </button>
        </div>
        <div className="h-8 w-px bg-border-subtle mx-1" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium leading-none">Abdul Muwahib</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-tight mt-1">Product Owner</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
            AM
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-screen w-full bg-background text-on-surface overflow-hidden">
      <Sidebar pathname={pathname} />
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
        <TopBar />
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </main>
    </div>
  );
}