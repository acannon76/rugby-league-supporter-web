"use client";

import Link from "next/link";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type ReportDirectoryItem = {
  number: string;
  title: string;
  description: string;
  href: string;
  status: string;
  accent: "red" | "green" | "blue";
  icon: "reports" | "compliance" | "dashboard";
  capabilities: readonly string[];
};

const sidebarItems: SidebarItem[] = [
  { label: "Duty Execution", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Planning", icon: "⚙", href: "/internal/app-ideas/link-message-mock" },
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", alertCount: 16 },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports", active: true },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  { label: "System Configurations", icon: "⚙", href: "/internal/app-ideas/link-message-mock/configurations" },
];

const reportOptions: readonly ReportDirectoryItem[] = [
  {
    number: "Report 1",
    title: "Data Reports",
    description:
      "Open the national reporting suite to review performance, plan, proximity and journey data, with date and site selection for downloads.",
    href: "/internal/app-ideas/link-message-mock/reports/option-1",
    status: "Available",
    accent: "red",
    icon: "reports",
    capabilities: ["4 report types", "Excel, CSV & PDF", "Email scheduling"],
  },
  {
    number: "Report 2",
    title: "Site & User Journey Compliance Dashboard",
    description:
      "Compare tracked vehicle movements with LINK journey legs, investigate missing journeys and monitor compliance by operating site.",
    href: "/internal/app-ideas/link-message-mock/reports/option-2",
    status: "Available",
    accent: "green",
    icon: "compliance",
    capabilities: ["Compliance dashboard", "Raw journey data", "Email scheduling"],
  },
  {
    number: "Report 3",
    title: "Additional Reporting Dashboard",
    description:
      "A reserved reporting workspace for the next dashboard, allowing a further report design to be developed independently.",
    href: "/internal/app-ideas/link-message-mock/reports/option-3",
    status: "Design workspace",
    accent: "blue",
    icon: "dashboard",
    capabilities: ["Future dashboard", "Separate workspace", "Manager review"],
  },
] as const;

const accentStyles = {
  red: {
    border: "border-t-[#e40000]",
    icon: "bg-[#e40000]",
    badge: "bg-[#fff0f0] text-[#b80000] ring-[#ffd1d1]",
  },
  green: {
    border: "border-t-[#139447]",
    icon: "bg-[#139447]",
    badge: "bg-[#eaf8ef] text-[#0e7136] ring-[#c5ecd2]",
  },
  blue: {
    border: "border-t-[#1756a9]",
    icon: "bg-[#1756a9]",
    badge: "bg-[#edf4ff] text-[#174d91] ring-[#cbdcf5]",
  },
} as const;

export default function ReportsOptionsPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Reports" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <section className="overflow-hidden rounded-[24px] border border-[#d6dde8] bg-white shadow-sm">
            <header className="flex flex-col gap-6 border-b border-[#dde4ed] px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-black text-[#10203a] sm:text-4xl">Reports</h1>
                <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[#5b6676]">
                  Open a reporting workspace to review performance, investigate exceptions and download the underlying operational data.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
                <DirectorySummary label="Reports available" value="3" />
                <DirectorySummary label="Download formats" value="3" />
              </div>
            </header>

            <div className="px-5 py-6 sm:px-7 sm:py-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Report directory</p>
                  <h2 className="mt-1 text-xl font-black text-[#10203a]">Available reporting workspaces</h2>
                </div>
                <p className="rounded-full bg-[#f2f5f8] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#526175]">
                  Select a report to open
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                {reportOptions.map((report) => {
                  const styles = accentStyles[report.accent];

                  return (
                    <article
                      key={report.number}
                      className={`group flex min-h-[360px] flex-col overflow-hidden rounded-[22px] border border-[#d4dce7] border-t-4 ${styles.border} bg-white shadow-[0_8px_24px_rgba(16,32,58,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(16,32,58,0.12)]`}
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-[#e6ebf1] bg-[#f8fafc] px-5 py-4">
                        <span className="rounded-full bg-[#10203a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                          {report.number}
                        </span>
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.11em] ring-1 ${styles.badge}`}>
                          {report.status}
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] text-white shadow-sm ${styles.icon}`}>
                            <ReportIcon type={report.icon} />
                          </div>
                          <div className="min-w-0 pt-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#718096]">Reporting workspace</p>
                            <h3 className="mt-1 text-xl font-black leading-7 text-[#10203a]">{report.title}</h3>
                          </div>
                        </div>

                        <p className="mt-5 text-sm font-bold leading-6 text-[#566274]">{report.description}</p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {report.capabilities.map((capability) => (
                            <span
                              key={capability}
                              className="rounded-lg border border-[#d8e0ea] bg-[#f8fafc] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.06em] text-[#526175]"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={report.href}
                          className="mt-auto flex min-h-12 items-center justify-between rounded-xl bg-[#10203a] px-5 py-3 text-sm font-black text-white no-underline transition group-hover:bg-[#1e3558]"
                        >
                          <span>Open {report.number}</span>
                          <span aria-hidden="true" className="text-xl leading-none">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function DirectorySummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[145px] rounded-[16px] border border-[#d5dde7] bg-[#f8fafc] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#69778a]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function ReportIcon({ type }: { type: ReportDirectoryItem["icon"] }) {
  if (type === "compliance") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 36c7-4 7-12 14-12s7 8 14 4" />
        <circle cx="10" cy="36" r="4" />
        <circle cx="24" cy="24" r="4" />
        <circle cx="38" cy="28" r="4" />
        <path d="m29 10 4 4 7-8" />
      </svg>
    );
  }

  if (type === "dashboard") {
    return (
      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="8" width="34" height="32" rx="4" />
        <path d="M14 32V22M24 32V15M34 32v-6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 6h17l8 8v28H13z" />
      <path d="M30 6v9h8M19 23h13M19 30h13M19 37h9" />
    </svg>
  );
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
          aria-label="Back to Duty Execution"
        >
          ≡
        </Link>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">{title}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <Link
          href="/internal/app-ideas"
          className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block"
        >
          ← Back to DriverOS Home
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
        <div className="hidden text-right sm:block">
          <p className="text-base font-black">Andrew Cannon</p>
          <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
        </div>
      </div>
    </header>
  );
}

function OfficeSidebar() {
  return (
    <aside className="flex min-h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[64px] items-center justify-center border-b border-white/10 no-underline transition ${
            item.icon.length > 2 ? "text-sm font-black" : "text-3xl"
          } ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
        >
          <span>{item.icon}</span>
          {item.alertCount ? (
            <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">
              {item.alertCount}
            </span>
          ) : null}
        </Link>
      ))}
    </aside>
  );
}
