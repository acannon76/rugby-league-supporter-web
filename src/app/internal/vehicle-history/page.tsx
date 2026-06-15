"use client";

import Link from "next/link";

type VehicleDetail = {
  label: string;
  value: string;
};

type HistoryItem = {
  pmt: string;
  issue: string;
  type: "Vehicle Issue" | "Defect" | "Maintenance";
  reported: string;
  fixed: string;
  status: "Closed";
  notes: string;
};

const driverName = "Andrew Cannon";

const vehicleDetails: VehicleDetail[] = [
  { label: "Registration", value: "PE68UHD" },
  { label: "Weight", value: "41T" },
  { label: "Axle", value: "4x2" },
  { label: "Asset", value: "23301273" },
  { label: "Fuel", value: "Diesel" },
  { label: "Trailer", value: "7338014" },
  { label: "Type", value: "DD95" },
];

const historyItems: HistoryItem[] = [
  {
    pmt: "PMT104582",
    issue: "Nearside door dent",
    type: "Vehicle Issue",
    reported: "12/05/2026",
    fixed: "15/05/2026",
    status: "Closed",
    notes:
      "Minor bodywork dent reported on nearside cab door. Repaired by workshop panel team.",
  },
  {
    pmt: "PMT104231",
    issue: "Engine warning light / sensor fault",
    type: "Defect",
    reported: "03/05/2026",
    fixed: "04/05/2026",
    status: "Closed",
    notes:
      "Diagnostic check identified faulty pressure sensor. Sensor replaced and vehicle tested.",
  },
  {
    pmt: "PMT103977",
    issue: "Rear offside tyre replacement",
    type: "Maintenance",
    reported: "24/04/2026",
    fixed: "24/04/2026",
    status: "Closed",
    notes:
      "Tyre wear found during inspection. Tyre replaced before vehicle returned to service.",
  },
  {
    pmt: "PMT103445",
    issue: "Air leak traced to coupling line",
    type: "Defect",
    reported: "11/04/2026",
    fixed: "12/04/2026",
    status: "Closed",
    notes:
      "Small air leak identified on trailer coupling line. Pipe connection repaired and re-tested.",
  },
  {
    pmt: "PMT102881",
    issue: "Mirror housing damage",
    type: "Vehicle Issue",
    reported: "29/03/2026",
    fixed: "31/03/2026",
    status: "Closed",
    notes:
      "Offside mirror housing cracked. Unit replaced and visibility check completed.",
  },
  {
    pmt: "PMT102214",
    issue: "Front marker bulb replacement",
    type: "Maintenance",
    reported: "14/03/2026",
    fixed: "14/03/2026",
    status: "Closed",
    notes:
      "Failed marker bulb replaced during workshop inspection.",
  },
];

export default function VehicleHistoryPage() {
  return (
    <main className="min-h-screen bg-[#f4f1ec] font-sans text-[#111]">
      <header className="border-b border-white/20 bg-[#b00020] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-[#7d0017] text-lg font-black text-white">
              HGV
            </div>

            <div>
              <p className="text-lg font-black leading-none text-white">
                Vehicle History
              </p>
              <p className="text-sm font-black leading-none text-[#ffd9df]">
                Driver PDA Concept
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd9df]">
                Driver
              </p>
              <p className="text-base font-black text-white">{driverName}</p>
            </div>

            <Link
              href="/internal/app-ideas"
              className="text-sm font-black text-white no-underline"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#b00020] px-4 py-6 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#ffd9df]">
            Driver daily check
          </p>

          <h1 className="text-[42px] font-black leading-[0.95] sm:text-[64px]">
            Vehicle History
          </h1>

          <p className="mt-4 max-w-[760px] text-sm font-bold leading-6 text-[#ffecef] sm:text-base">
            Review previous vehicle issues, defects and maintenance history
            before continuing to today&apos;s vehicle checks.
          </p>

          <div className="mt-5 rounded-[24px] bg-white/95 p-2 shadow-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {vehicleDetails.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-2xl border border-[#ead6dc] bg-[#fff7f8] px-3 py-2"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b00020]">
                    {detail.label}
                  </p>

                  <p className="mt-1 text-sm font-black text-[#18243a]">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Vehicle overview
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#18243a] sm:text-3xl">
                Visual history markers
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
                Basic mock vehicle views showing previously reported areas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TruckDiagram title="Front View" view="front" />
              <TruckDiagram title="Rear View" view="rear" />
              <TruckDiagram title="Left Side View" view="left" showDoorDent />
              <TruckDiagram title="Right Side View" view="right" />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d6dce5] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b00020]">
                Previous records
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#18243a] sm:text-3xl">
                Past vehicle history
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-[#64748b]">
                Fictitious mock entries showing previously raised PMTs for the
                vehicle.
              </p>
            </div>

            <div className="space-y-4">
              {historyItems.map((item) => (
                <HistoryCard key={item.pmt} item={item} />
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Link
              href="/internal/vehicle-checks"
              className="inline-flex w-full items-center justify-center rounded-[24px] bg-[#b00020] px-6 py-5 text-sm font-black uppercase tracking-[0.16em] text-white no-underline shadow-sm transition hover:bg-[#7d0017] sm:w-auto"
            >
              Continue to Vehicle Checks
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const typeClasses =
    item.type === "Defect"
      ? "bg-[#ffe6eb] text-[#b00020] border-[#f3c2cb]"
      : item.type === "Vehicle Issue"
      ? "bg-[#fef3c7] text-[#92400e] border-[#f8df8d]"
      : "bg-[#e8f7ee] text-[#078a3d] border-[#b9e6c8]";

  return (
    <article className="rounded-[24px] border border-[#d6dce5] bg-[#fbfbfc] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-black text-[#18243a]">{item.issue}</p>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${typeClasses}`}
            >
              {item.type}
            </span>
          </div>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#b00020]">
            {item.pmt}
          </p>

          <p className="mt-3 text-sm font-bold leading-6 text-[#64748b]">
            {item.notes}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 lg:min-w-[250px]">
          <InfoMini label="Reported" value={item.reported} />
          <InfoMini label="Fixed" value={item.fixed} />
          <InfoMini label="Status" value={item.status} />
          <InfoMini label="PMT" value={item.pmt} />
        </div>
      </div>
    </article>
  );
}

function InfoMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#b00020]">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-[#18243a]">{value}</p>
    </div>
  );
}

function TruckDiagram({
  title,
  view,
  showDoorDent = false,
}: {
  title: string;
  view: "front" | "rear" | "left" | "right";
  showDoorDent?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[#d6dce5] bg-[#f8fafc] p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#b00020]">
        {title}
      </p>

      <div className="flex min-h-[220px] items-center justify-center rounded-[20px] bg-white p-4">
        {view === "front" && <FrontTruck />}
        {view === "rear" && <RearTruck />}
        {view === "left" && <SideTruck side="left" showDoorDent={showDoorDent} />}
        {view === "right" && <SideTruck side="right" />}
      </div>
    </div>
  );
}

function SideTruck({
  side,
  showDoorDent = false,
}: {
  side: "left" | "right";
  showDoorDent?: boolean;
}) {
  return (
    <div className="relative h-[120px] w-[280px]">
      <div className="absolute bottom-[22px] left-[10px] h-[58px] w-[170px] rounded-[10px] border-[3px] border-[#9a001a] bg-[#d71920]">
        <div className="absolute left-[8px] top-[8px] h-[40px] w-[42px] rounded-[6px] border-2 border-white/80 bg-[#ef9aa8]" />
        <div className="absolute left-[56px] top-[8px] h-[40px] w-[34px] rounded-[4px] border-2 border-white/80 bg-[#ef9aa8]" />
        <div className="absolute right-[12px] top-[14px] h-[20px] w-[56px] rounded-md border-2 border-white/60 bg-[#ffffff30]" />

        {showDoorDent && (
          <div className="absolute left-[66px] top-[10px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#f59e0b] text-sm font-black text-white shadow-md">
            ★
          </div>
        )}
      </div>

      <div className="absolute bottom-[22px] left-[182px] h-[58px] w-[82px] rounded-[8px] border-[3px] border-[#9a001a] bg-[#d71920]" />

      <div className="absolute bottom-[6px] left-[38px] h-[32px] w-[32px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
      <div className="absolute bottom-[6px] left-[126px] h-[32px] w-[32px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
      <div className="absolute bottom-[6px] left-[210px] h-[32px] w-[32px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />

      <div className="absolute bottom-[92px] left-[8px] text-[10px] font-black uppercase tracking-[0.12em] text-[#64748b]">
        {side === "left" ? "Nearside" : "Offside"}
      </div>

      {showDoorDent && (
        <div className="absolute bottom-[88px] left-[82px] rounded-full bg-[#fff7e6] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#92400e] shadow-sm">
          Door dent
        </div>
      )}
    </div>
  );
}

function FrontTruck() {
  return (
    <div className="relative h-[150px] w-[220px]">
      <div className="absolute left-[32px] top-[22px] h-[82px] w-[156px] rounded-[18px] border-[4px] border-[#9a001a] bg-[#d71920]">
        <div className="absolute left-[22px] top-[14px] h-[24px] w-[46px] rounded-md border-2 border-white/80 bg-[#ef9aa8]" />
        <div className="absolute right-[22px] top-[14px] h-[24px] w-[46px] rounded-md border-2 border-white/80 bg-[#ef9aa8]" />
        <div className="absolute left-[48px] bottom-[14px] h-[14px] w-[60px] rounded-md bg-[#f1f5f9]" />
      </div>

      <div className="absolute left-[44px] top-[98px] h-[18px] w-[24px] rounded-md bg-[#facc15]" />
      <div className="absolute right-[44px] top-[98px] h-[18px] w-[24px] rounded-md bg-[#facc15]" />

      <div className="absolute bottom-[8px] left-[48px] h-[34px] w-[34px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
      <div className="absolute bottom-[8px] right-[48px] h-[34px] w-[34px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
    </div>
  );
}

function RearTruck() {
  return (
    <div className="relative h-[150px] w-[220px]">
      <div className="absolute left-[34px] top-[18px] h-[92px] w-[152px] rounded-[12px] border-[4px] border-[#9a001a] bg-[#d71920]">
        <div className="absolute left-[18px] top-[16px] h-[50px] w-[116px] rounded-md border-2 border-white/70 bg-[#ffffff18]" />
        <div className="absolute left-[18px] bottom-[10px] h-[10px] w-[20px] rounded-sm bg-[#facc15]" />
        <div className="absolute right-[18px] bottom-[10px] h-[10px] w-[20px] rounded-sm bg-[#facc15]" />
      </div>

      <div className="absolute bottom-[8px] left-[48px] h-[34px] w-[34px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
      <div className="absolute bottom-[8px] right-[48px] h-[34px] w-[34px] rounded-full border-[4px] border-[#334155] bg-[#111827]" />
    </div>
  );
}