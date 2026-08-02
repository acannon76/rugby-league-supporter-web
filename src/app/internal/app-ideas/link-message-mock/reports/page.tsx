"use client";

import Link from "next/link";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
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

const reportOptions = [
  {
    number: "Option 1",
    title: "Data Reports",
    description:
      "The existing National Reports page, including report downloads, scheduling and the four current report types.",
    href: "/internal/app-ideas/link-message-mock/reports/option-1",
    status: "Current design",
    available: true,
  },
  {
    number: "Option 2",
    title: "Alternative report design",
    description:
      "A separate workspace for the second proposed way of selecting, creating and downloading reports.",
    href: "/internal/app-ideas/link-message-mock/reports/option-2",
    status: "Design workspace",
    available: true,
  },
  {
    number: "Option 3",
    title: "Alternative report design",
    description:
      "A separate workspace for the third proposed way of presenting and creating reports for manager review.",
    href: "/internal/app-ideas/link-message-mock/reports/option-3",
    status: "Design workspace",
    available: true,
  },
] as const;

export default function ReportsOptionsPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Reports" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <section className="rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm sm:p-6">
            <div className="max-w-5xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Report design selection</p>
              <h1 className="mt-2 text-3xl font-black text-[#10203a]">Site & User Journey Compliance Dashboard</h1>
              <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
                Select one of the report design options below. Each option is kept separate so managers can review and compare different ways of creating and presenting reports.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-5 xl:grid-cols-3">
              {reportOptions.map((option) => (
                <article
                  key={option.number}
                  className="flex min-h-[310px] flex-col rounded-[22px] border border-[#cfd8e3] bg-[#f8fafc] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-[#10203a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      {option.number}
                    </span>
                    <span className="rounded-full border border-[#cfd8e3] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#526175]">
                      {option.status}
                    </span>
                  </div>

                  <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#e40000] text-2xl font-black text-white shadow-sm">
                    REP
                  </div>

                  <h2 className="mt-5 text-xl font-black text-[#10203a]">{option.title}</h2>
                  <p className="mt-3 flex-1 text-sm font-bold leading-6 text-[#4b5563]">{option.description}</p>

                  <Link
                    href={option.href}
                    className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-[#10203a] px-5 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-white no-underline transition hover:bg-[#1e3558]"
                  >
                    Open {option.number}
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[18px] border border-dashed border-[#c7d2df] bg-[#f8fafc] px-5 py-5">
              <p className="text-sm font-black text-[#10203a]">Option 1 contains the current reports page.</p>
              <p className="mt-1 text-sm font-bold leading-6 text-[#4b5563]">
                Options 2 and 3 are separate design areas ready for alternative report layouts without changing the existing version.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
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
