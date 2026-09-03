import Link from "next/link";

import {
  TIMING_PROFILE_BANDS,
  classifyTimingDifference,
  type TimingCode,
  type TimingProfileBand,
} from "../../../timingProfile";

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
  { label: "Vehicle view", icon: "🚛", href: "/internal/app-ideas/link-message-mock/vehicle-data-maintenance" },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", alertCount: 16 },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  {
    label: "System Configurations",
    icon: "⚙",
    href: "/internal/app-ideas/link-message-mock/configurations",
    active: true,
  },
];

const boundaryExamples = [-121, -120, -31, -30, -16, -15, 0, 15, 16, 30, 31, 119, 120];

export default function MttLateArrivalProfilesPage() {
  return (
    <div className="min-h-screen bg-[#edf3f8] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="MTT Late Arrival Profile" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-2 sm:p-3">
          <section className="overflow-hidden rounded-[20px] border border-[#d9e3ee] bg-white shadow-sm">
            <div className="bg-[#e40000] px-5 py-3 text-white sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-[#e40000] shadow-sm">
                    MTT
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Timing Configuration</p>
                    <h1 className="text-2xl font-black sm:text-3xl">MTT Late Arrival Profile</h1>
                  </div>
                </div>
                <Link
                  href="/internal/app-ideas/link-message-mock/configurations"
                  className="rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15"
                >
                  ← Back to configurations
                </Link>
              </div>
            </div>

            <div className="bg-[#f8fbfe] p-4 sm:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <section className="rounded-[18px] border border-[#d9e3ee] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e40000]">Current mock profile</p>
                      <h2 className="mt-1 text-2xl font-black text-[#10203a]">Standard network timing profile</h2>
                      <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#526176]">
                        The same thresholds are now used by DTT, ATT and MTT calculations across the DriverOS mock screens. Actual time is compared with planned time and assigned to the band below.
                      </p>
                    </div>
                    <span className="rounded-full border border-[#15803d] bg-[#ecfdf3] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#166534]">
                      Shared profile
                    </span>
                  </div>

                  <div className="mt-7 overflow-x-auto pb-2">
                    <div className="min-w-[980px]">
                      <div className="mb-3 grid grid-cols-7 text-center text-xs font-black text-[#475569]">
                        <span>&lt; -120</span>
                        <span>-120</span>
                        <span>-30</span>
                        <span className="text-[#10203a]">-15 / Planned / +15</span>
                        <span>+30</span>
                        <span>+120</span>
                        <span>120+</span>
                      </div>
                      <div className="grid grid-cols-7 overflow-hidden rounded-[12px] border-2 border-[#172033]">
                        {TIMING_PROFILE_BANDS.map((band) => (
                          <TimingBandBlock key={band.id} band={band} />
                        ))}
                      </div>
                      <div className="relative mt-3 h-9 text-center text-xs font-black text-[#10203a]">
                        <span className="inline-flex rounded-full border border-[#94a3b8] bg-white px-3 py-1.5 shadow-sm">
                          Planned time = 00:00 variance
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="space-y-4">
                  <InfoCard title="Read-only mock" icon="🔒">
                    This page is a reference screen rather than a database editor. There is no Save button and no site can accidentally change the thresholds.
                  </InfoCard>
                  <InfoCard title="One source of truth" icon="↔">
                    The mock calculations and this screen use one shared timing profile in the code, so the DCT, Debrief and reporting screens remain aligned without needing a database.
                  </InfoCard>
                  <InfoCard title="Future option" icon="⚙">
                    If DriverOS later stores profiles in a database, this mock can become the administration screen for effective dates, version control and site-specific profiles.
                  </InfoCard>
                </aside>
              </div>

              <section className="mt-4 overflow-hidden rounded-[18px] border border-[#d9e3ee] bg-white shadow-sm">
                <div className="border-b border-[#d9e3ee] px-5 py-4 sm:px-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e40000]">Profile detail</p>
                  <h2 className="mt-1 text-xl font-black text-[#10203a]">Timing bands and exact whole-minute ranges</h2>
                  <p className="mt-1 text-xs font-bold text-[#64748b]">
                    This removes any ambiguity at the -120, -30, -15, +15, +30 and +120 minute boundaries.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-[#10203a] text-[11px] font-black uppercase tracking-[0.08em] text-white">
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Displayed range</th>
                        <th className="px-4 py-3">Whole-minute rule</th>
                        <th className="px-4 py-3">Operational meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIMING_PROFILE_BANDS.map((band, index) => (
                        <tr key={`row-${band.id}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fbfe]"}>
                          <td className="border-b border-[#e2e8f0] px-4 py-3"><TimingCodePill code={band.code} /></td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 font-black text-[#10203a]">{band.label}</td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 font-bold text-[#334155]">{band.range}</td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 font-mono text-xs font-black text-[#334155]">{band.minutes}</td>
                          <td className="border-b border-[#e2e8f0] px-4 py-3 text-xs font-bold leading-5 text-[#526176]">{getOperationalMeaning(band)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-4 rounded-[18px] border border-[#d9e3ee] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e40000]">Boundary check</p>
                    <h2 className="mt-1 text-xl font-black text-[#10203a]">Examples at the profile cut-off points</h2>
                  </div>
                  <p className="text-xs font-bold text-[#64748b]">Negative = early · Positive = late</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {boundaryExamples.map((minutes) => {
                    const code = classifyTimingDifference(minutes) ?? "OT";
                    return (
                      <div key={minutes} className="flex items-center gap-2 rounded-xl border border-[#d9e3ee] bg-[#f8fbfe] px-3 py-2">
                        <span className="font-mono text-xs font-black text-[#334155]">{formatMinutes(minutes)}</span>
                        <span className="text-[#94a3b8]">→</span>
                        <TimingCodePill code={code} />
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function TimingBandBlock({ band }: { band: TimingProfileBand }) {
  const normalClass =
    band.tone === "early"
      ? "bg-[#fbbf24] text-[#172033]"
      : band.tone === "ontime"
        ? "bg-[#79d884] text-white"
        : band.tone === "late"
          ? "bg-[#e42313] text-white"
          : "bg-[#111827] text-white";

  const failedStyle = band.tone === "failed"
    ? {
        backgroundColor: "#111827",
        backgroundImage: "repeating-linear-gradient(45deg, rgba(228,0,0,0.95) 0, rgba(228,0,0,0.95) 4px, transparent 4px, transparent 10px)",
      }
    : undefined;

  return (
    <div style={failedStyle} className={`flex min-h-[92px] flex-col items-center justify-center border-r border-[#172033] px-2 text-center last:border-r-0 ${normalClass}`}>
      <span className="text-2xl font-black">{band.code}</span>
      <span className="mt-1 text-[10px] font-black uppercase tracking-[0.08em]">{band.label}</span>
      <span className="mt-1 text-[10px] font-bold">{band.range}</span>
    </div>
  );
}

function TimingCodePill({ code }: { code: TimingCode }) {
  const classes =
    code === "F"
      ? "bg-[#fecaca] text-[#7f1d1d]"
      : code === "VE" || code === "E"
        ? "bg-[#fef3c7] text-[#92400e]"
        : code === "OT"
          ? "bg-[#dcfce7] text-[#166534]"
          : "bg-[#fee2e2] text-[#991b1b]";

  return <span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-[11px] font-black ${classes}`}>{code}</span>;
}

function getOperationalMeaning(band: TimingProfileBand) {
  if (band.id === "failed-early") return "More than two hours earlier than planned; classed as Failed by the profile.";
  if (band.code === "VE") return "Arrival or departure materially earlier than the agreed planned window.";
  if (band.code === "E") return "Early, but within 30 minutes of planned time.";
  if (band.code === "OT") return "Within the agreed ±15 minute on-time window.";
  if (band.code === "L") return "Outside the on-time window and up to 30 minutes late.";
  if (band.code === "VL") return "More than 30 minutes late but less than two hours late.";
  return "Two hours late or more; classed as Failed by the profile.";
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-[#d9e3ee] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4f8] text-lg">{icon}</span>
        <h3 className="text-base font-black text-[#10203a]">{title}</h3>
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-[#526176]">{children}</p>
    </div>
  );
}

function formatMinutes(minutes: number) {
  const sign = minutes > 0 ? "+" : minutes < 0 ? "-" : "";
  const absolute = Math.abs(minutes);
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

function OfficeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex min-h-[56px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <Link
          href="/internal/app-ideas/link-message-mock"
          className="flex h-[56px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline transition hover:bg-white/10"
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
    <aside className="flex min-h-[calc(100vh-56px)] w-[68px] shrink-0 flex-col bg-[#252c33] text-white">
      {sidebarItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          title={item.label}
          className={`relative flex h-[56px] items-center justify-center border-b border-white/10 no-underline transition ${
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
