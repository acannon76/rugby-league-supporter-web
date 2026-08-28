"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useDriverName } from "../../../../DriverName";
import { findVehicle, type VehicleHistoryRecord } from "../vehicleData";

const checkCategories = [
  "Brakes & air system",
  "Steering & suspension",
  "Tyres & wheels",
  "Lights & electrical",
  "Body, doors & mirrors",
  "Load security & coupling",
  "Fluid leaks & mechanical failures",
  "Legal & compliance",
  "Safety equipment & emergency systems",
  "Structural & general condition",
];

export default function VehicleCheckHistoryOfficePage() {
  const params = useParams<{ vrn: string }>();
  const driverName = useDriverName();
  const vehicle = findVehicle(params.vrn);
  const [historyFilter, setHistoryFilter] = useState<"All" | VehicleHistoryRecord["outcome"]>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    if (!vehicle) return [];
    return historyFilter === "All" ? vehicle.history : vehicle.history.filter((item) => item.outcome === historyFilter);
  }, [historyFilter, vehicle]);

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-[#f4f6f9] p-8 font-sans">
        <div className="mx-auto max-w-xl rounded-xl border border-[#d9dee6] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#111827]">Vehicle not found</h1>
          <Link href="/internal/app-ideas/link-message-mock/vehicle-data-maintenance" className="mt-5 inline-block rounded-md bg-[#e40000] px-5 py-3 font-black text-white no-underline">Back to Vehicle Data Maintenance</Link>
        </div>
      </main>
    );
  }

  const latest = vehicle.history[0];
  const openDefects = vehicle.history.filter((item) => item.status === "Open").length;
  const monitorItems = vehicle.history.filter((item) => item.status === "Monitor").length;

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
        <div className="flex h-full items-center">
          <Link href="/internal/app-ideas/link-message-mock/vehicle-data-maintenance" className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black text-white no-underline" title="Back to Vehicle Data Maintenance">←</Link>
          <div className="px-5"><p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Vehicle Check History</p></div>
        </div>
        <div className="flex items-center gap-4 px-4">
          <Link href="/internal/app-ideas/link-message-mock/vehicle-data-maintenance" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block">← Vehicle Data Maintenance</Link>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
          <div className="hidden text-right sm:block"><p className="text-base font-black">{driverName}</p><p className="text-xs font-bold text-white/80">Manager view</p></div>
        </div>
      </header>

      <section className="border-b border-[#d9dee6] bg-white px-4 py-5 shadow-sm lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Office vehicle record</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-[#111827]">Vehicle Check History - {vehicle.vrn}</h1>
                <StatusBadge status={vehicle.linkStatus} />
              </div>
              <p className="mt-2 text-sm font-semibold text-[#64748b]">Managers can review the same vehicle-check information recorded against this truck, including NIL checks, amber vehicle issues, red defects and workshop history.</p>
            </div>
            <div className="rounded-lg border border-[#d9dee6] bg-[#f8fafc] px-4 py-3 text-sm"><span className="font-black text-[#475569]">Latest check:</span> <span className="font-black text-[#111827]">{latest.checkDate}</span> · {latest.driver}</div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            <VehicleMini label="Local ID" value={vehicle.localId} />
            <VehicleMini label="C Number" value={vehicle.cNumber} />
            <VehicleMini label="Capacity" value={vehicle.capacity} />
            <VehicleMini label="Model" value={vehicle.model} />
            <VehicleMini label="Last Mileage" value={vehicle.lastMileage} highlight />
            <VehicleMini label="MOT Due" value={vehicle.motDueDate} />
            <VehicleMini label="Service Due" value={vehicle.serviceDueDate} />
            <VehicleMini label="Owning VOC" value={vehicle.owningVoc} />
          </div>
        </div>
      </section>

      <section className="px-4 py-5 lg:px-6">
        <div className="mx-auto max-w-[1500px] space-y-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <KpiCard label="Recorded Checks" value={vehicle.history.length.toString()} detail="Mock history currently held against this vehicle" />
            <KpiCard label="Open Defects" value={openDefects.toString()} detail={openDefects ? "Requires manager/workshop attention" : "No open red defects"} danger={openDefects > 0} />
            <KpiCard label="Monitor Items" value={monitorItems.toString()} detail={monitorItems ? "Amber vehicle issues being monitored" : "No amber items being monitored"} warning={monitorItems > 0} />
            <KpiCard label="Last Known Location" value={vehicle.lastKnownLocation} detail={`M5 status ${vehicle.m5Status} · ${vehicle.fuelType}`} compact />
          </div>

          <section className="rounded-lg border border-[#d9dee6] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Driver vehicle checks</p><h2 className="mt-1 text-xl font-black text-[#111827]">Vehicle Check History</h2></div>
              <div className="flex flex-wrap gap-2">
                {(["All", "No defects", "Vehicle issue", "Defect"] as const).map((option) => (
                  <button key={option} type="button" onClick={() => setHistoryFilter(option)} className={`rounded-md border px-3 py-2 text-xs font-black ${historyFilter === option ? "border-[#e40000] bg-[#e40000] text-white" : "border-[#d6dee8] bg-white text-[#475569] hover:border-[#e40000]"}`}>{option}</button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-sm">
                <thead className="bg-[#f7f9fc] text-left text-xs uppercase tracking-wide text-[#475569]">
                  <tr>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Check Date</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Driver / Source</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Mileage</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Outcome</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Category</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">PMT</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3">Issue / Result</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3 text-center">Status</th>
                    <th className="border-b border-[#dce4ed] px-4 py-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((record) => (
                    <HistoryRow key={record.id} record={record} expanded={expandedId === record.id} onToggle={() => setExpandedId((current) => current === record.id ? null : record.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-[#d9dee6] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row">
              <div className="xl:w-[320px]"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#e40000]">Vehicle check coverage</p><h2 className="mt-1 text-xl font-black text-[#111827]">Latest category overview</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#64748b]">The office view mirrors the categories used by the driver check. These are mock results for demonstration.</p></div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {checkCategories.map((category, index) => {
                  const flagged = latest.outcome !== "No defects" && index === (vehicleRecordsIndex(vehicle.vrn) % checkCategories.length);
                  return <div key={category} className={`rounded-lg border p-3 ${flagged ? latest.outcome === "Defect" ? "border-[#ffb4b4] bg-[#fff0f0]" : "border-[#f3d78d] bg-[#fff9e9]" : "border-[#dce4ed] bg-[#f8fafc]"}`}><div className="flex items-start justify-between gap-2"><span className="text-xs font-black text-[#475569]">{index + 1}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${flagged ? latest.outcome === "Defect" ? "bg-[#d92525] text-white" : "bg-[#e6a400] text-white" : "bg-[#dff3e5] text-[#187239]"}`}>{flagged ? latest.outcome : "OK"}</span></div><p className="mt-2 text-xs font-bold leading-5 text-[#253247]">{category}</p></div>;
                })}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function vehicleRecordsIndex(vrn: string) {
  return vrn.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function VehicleMini({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-lg border px-3 py-2 ${highlight ? "border-[#f1d27b] bg-[#fff8e4]" : "border-[#dce4ed] bg-[#f8fafc]"}`}><p className={`text-[10px] font-black uppercase tracking-[0.14em] ${highlight ? "text-[#8b5d00]" : "text-[#64748b]"}`}>{label}</p><p className="mt-1 text-sm font-black text-[#172033]">{value}</p></div>;
}

function KpiCard({ label, value, detail, danger = false, warning = false, compact = false }: { label: string; value: string; detail: string; danger?: boolean; warning?: boolean; compact?: boolean }) {
  const tone = danger ? "border-[#ffb7b7] bg-[#fff3f3]" : warning ? "border-[#f5d58a] bg-[#fff9e8]" : "border-[#d9dee6] bg-white";
  return <div className={`rounded-lg border p-4 shadow-sm ${tone}`}><p className="text-xs font-black uppercase tracking-[0.15em] text-[#64748b]">{label}</p><p className={`mt-2 font-black text-[#111827] ${compact ? "text-lg" : "text-3xl"}`}>{value}</p><p className="mt-2 text-xs font-semibold leading-5 text-[#64748b]">{detail}</p></div>;
}

function StatusBadge({ status }: { status: string }) {
  const className = status === "Available" ? "bg-[#dff3e5] text-[#187239]" : status === "Allocated" ? "bg-[#e4efff] text-[#235eaf]" : status === "VOR" ? "bg-[#ffdede] text-[#b51616]" : "bg-[#fff0c7] text-[#8b5d00]";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{status}</span>;
}

function HistoryRow({ record, expanded, onToggle }: { record: VehicleHistoryRecord; expanded: boolean; onToggle: () => void }) {
  const outcomeClass = record.outcome === "Defect" ? "bg-[#d92525] text-white" : record.outcome === "Vehicle issue" ? "bg-[#e6a400] text-white" : "bg-[#dff3e5] text-[#187239]";
  const statusClass = record.status === "Open" ? "text-[#c81e1e]" : record.status === "Monitor" ? "text-[#9a6800]" : "text-[#187239]";
  return (
    <>
      <tr className="hover:bg-[#fbfcfe]">
        <td className="border-b border-[#e3e8ef] px-4 py-3 font-bold">{record.checkDate}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3">{record.driver}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3">{record.mileage}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${outcomeClass}`}>{record.outcome}</span></td>
        <td className="border-b border-[#e3e8ef] px-4 py-3">{record.category}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3 font-black">{record.pmt}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3 font-semibold">{record.issue}</td>
        <td className={`border-b border-[#e3e8ef] px-4 py-3 text-center font-black ${statusClass}`}>{record.status}</td>
        <td className="border-b border-[#e3e8ef] px-4 py-3 text-center"><button type="button" onClick={onToggle} className="rounded-md bg-[#202733] px-3 py-1.5 text-xs font-black text-white hover:bg-[#e40000]">{expanded ? "Hide" : "View"}</button></td>
      </tr>
      {expanded && <tr><td colSpan={9} className="border-b border-[#dce4ed] bg-[#f8fafc] px-5 py-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#e40000]">Notes</p><p className="mt-1 text-sm font-semibold leading-6 text-[#475569]">{record.notes}</p></td></tr>}
    </>
  );
}
