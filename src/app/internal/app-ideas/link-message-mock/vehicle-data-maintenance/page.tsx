"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDriverName } from "../../../DriverName";
import { vehicleRecords, type VehicleRecord } from "./vehicleData";

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
  { label: "Vehicle Data Maintenance", icon: "🚛", href: "/internal/app-ideas/link-message-mock/vehicle-data-maintenance", active: true },
  { label: "Trailer view", icon: "▰", href: "/internal/app-ideas/link-message-mock" },
  { label: "Fleet view", icon: "▱", href: "/internal/app-ideas/link-message-mock" },
  { label: "Comms", icon: "💬", href: "/internal/app-ideas/link-message-mock/comms", alertCount: 4 },
  { label: "Debrief", icon: "🧾", href: "/internal/app-ideas/link-message-mock/debrief" },
  { label: "RHC Team", icon: "RHC", href: "/internal/app-ideas/link-message-mock/rhc-team" },
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking" },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
  { label: "System Configurations", icon: "⚙", href: "/internal/app-ideas/link-message-mock/configurations" },
];

const pageSizeOptions = [10, 20, 30] as const;

export default function VehicleDataMaintenancePage() {
  const driverName = useDriverName();
  const [localIdSearch, setLocalIdSearch] = useState("");
  const [vrnSearch, setVrnSearch] = useState("");
  const [vocFilter, setVocFilter] = useState("All");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [deletedVrns, setDeletedVrns] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof pageSizeOptions)[number]>(10);
  const [modalVehicle, setModalVehicle] = useState<VehicleRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const owningVocs = useMemo(
    () => Array.from(new Set(vehicleRecords.map((vehicle) => vehicle.owningVoc))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const localTerm = localIdSearch.trim().toLowerCase();
    const vrnTerm = vrnSearch.trim().toLowerCase();

    return vehicleRecords.filter((vehicle) => {
      const deleted = deletedVrns.includes(vehicle.vrn);
      if (!includeDeleted && deleted) return false;
      if (localTerm && !vehicle.localId.toLowerCase().includes(localTerm)) return false;
      if (vrnTerm && !vehicle.vrn.toLowerCase().includes(vrnTerm)) return false;
      if (vocFilter !== "All" && vehicle.owningVoc !== vocFilter) return false;
      return true;
    });
  }, [deletedVrns, includeDeleted, localIdSearch, vocFilter, vrnSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(startIndex, startIndex + pageSize);

  function runSearch() {
    setPage(1);
  }

  function deleteVehicle(vrn: string) {
    setDeletedVrns((current) => current.includes(vrn) ? current : [...current, vrn]);
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] font-sans text-[#1d2633]">
      <OfficeHeader driverName={driverName} />
      <div className="flex">
        <OfficeSidebar items={sidebarItems} />

        <section className="min-w-0 flex-1 p-4 lg:p-5">
          <div className="rounded-md border border-[#d9dee6] bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b border-[#e4e9ef] bg-[#fafafa] px-5 py-4">
              <div className="text-4xl leading-none text-[#e40000]" aria-hidden="true">🚛</div>
              <h1 className="text-[22px] font-black text-[#111827]">Vehicle Data Maintenance</h1>
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-[#263240]">
                  <input
                    type="checkbox"
                    checked={includeDeleted}
                    onChange={(event) => {
                      setIncludeDeleted(event.target.checked);
                      setPage(1);
                    }}
                    className="h-5 w-5 rounded border-[#cbd5e1]"
                  />
                  Include Deleted Records
                </label>

                <div className="flex flex-1 flex-wrap justify-end gap-2">
                  <input
                    value={localIdSearch}
                    onChange={(event) => setLocalIdSearch(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && runSearch()}
                    placeholder="Search By Local ID"
                    className="h-11 min-w-[190px] flex-1 border border-[#cfd8e3] bg-white px-3 text-sm outline-none focus:border-[#e40000] xl:max-w-[210px]"
                  />
                  <input
                    value={vrnSearch}
                    onChange={(event) => setVrnSearch(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && runSearch()}
                    placeholder="Search By VRN"
                    className="h-11 min-w-[190px] flex-1 border border-[#cfd8e3] bg-white px-3 text-sm outline-none focus:border-[#e40000] xl:max-w-[210px]"
                  />
                  <select
                    value={vocFilter}
                    onChange={(event) => {
                      setVocFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-11 min-w-[190px] border border-[#cfd8e3] bg-white px-3 text-sm font-semibold text-[#475569] outline-none focus:border-[#e40000] xl:max-w-[220px]"
                    aria-label="Select VOC ID"
                  >
                    <option value="All">Select VOC ID</option>
                    {owningVocs.map((voc) => <option key={voc} value={voc}>{voc}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={runSearch}
                    className="flex h-11 w-16 items-center justify-center rounded-md bg-[#e40000] text-2xl font-black text-white transition hover:bg-[#bd0000]"
                    title="Search"
                    aria-label="Search"
                  >
                    ⌕
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex h-11 min-w-[130px] items-center justify-center gap-2 rounded-md bg-[#e40000] px-5 text-sm font-black text-white transition hover:bg-[#bd0000]"
                  >
                    <span className="text-xl">＋</span> Create
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border-t border-[#dbe2ea]">
              <table className="min-w-[1540px] w-full border-collapse text-[13px]">
                <thead className="bg-white text-[#111827]">
                  <tr>
                    {[
                      "Local ID", "VRN", "C Number", "Capacity", "Type", "Description Code", "Model", "M5 Status", "LINK Status", "Owning VOC", "Last Known Location", "MOT Due Date", "Action",
                    ].map((heading) => (
                      <th key={heading} className="border border-[#dce4ed] px-3 py-3 text-center font-black">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((vehicle, rowIndex) => {
                    const deleted = deletedVrns.includes(vehicle.vrn);
                    return (
                      <tr key={vehicle.vrn} className={`${rowIndex % 2 ? "bg-white" : "bg-[#f7f9fc]"} ${deleted ? "opacity-55" : ""}`}>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center text-[#596579]">{vehicle.localId}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 font-semibold text-[#5d6571]">
                          <div className="flex items-center gap-2">
                            <span className="rounded-sm bg-[#ffe4d6] px-1.5 py-0.5 text-[11px] font-black text-[#e6722f]">RO</span>
                            <span>{vehicle.vrn}</span>
                            {deleted && <span className="text-[10px] font-black uppercase text-[#e40000]">Deleted</span>}
                          </div>
                        </td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.cNumber}</td>
                        <td className="border border-[#dce4ed] px-3 py-2">{vehicle.capacity}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.type}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.descriptionCode}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.model}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.m5Status}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">
                          <StatusPill status={vehicle.linkStatus} />
                        </td>
                        <td className="border border-[#dce4ed] px-3 py-2">{vehicle.owningVoc}</td>
                        <td className="border border-[#dce4ed] px-3 py-2">{vehicle.lastKnownLocation}</td>
                        <td className="border border-[#dce4ed] px-3 py-2 text-center">{vehicle.motDueDate}</td>
                        <td className="border border-[#dce4ed] px-2 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModalVehicle(vehicle)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3472d0] text-sm font-black text-white transition hover:scale-105"
                              title={`Edit ${vehicle.vrn}`}
                              aria-label={`Edit ${vehicle.vrn}`}
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteVehicle(vehicle.vrn)}
                              disabled={deleted}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff9da5] text-sm font-black text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                              title={`Delete ${vehicle.vrn}`}
                              aria-label={`Delete ${vehicle.vrn}`}
                            >
                              ♲
                            </button>
                            <Link
                              href={`/internal/app-ideas/link-message-mock/vehicle-data-maintenance/${vehicle.vrn}`}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#202733] text-sm font-black text-white no-underline transition hover:scale-105 hover:bg-[#e40000]"
                              title={`Vehicle Check History for ${vehicle.vrn}`}
                              aria-label={`Vehicle Check History for ${vehicle.vrn}`}
                            >
                              ◷
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 px-4 py-3 text-sm text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {filtered.length ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button type="button" onClick={() => setPage(1)} disabled={safePage === 1} className="pager">«</button>
                <button type="button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="pager">‹</button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, safePage - 3), Math.max(5, safePage + 2)).map((number) => (
                  <button key={number} type="button" onClick={() => setPage(number)} className={`pager ${number === safePage ? "!border-[#e40000] !bg-[#e40000] !text-white" : ""}`}>{number}</button>
                ))}
                <button type="button" onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages} className="pager">›</button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="pager">»</button>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as (typeof pageSizeOptions)[number]);
                    setPage(1);
                  }}
                  className="ml-2 h-9 rounded-md border border-[#e40000] bg-[#e40000] px-3 font-black text-white"
                  aria-label="Rows per page"
                >
                  {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {modalVehicle && (
        <MockEditModal vehicle={modalVehicle} onClose={() => setModalVehicle(null)} />
      )}
      {showCreate && <CreateMockModal onClose={() => setShowCreate(false)} />}

      <style jsx global>{`
        .pager { min-width: 36px; height: 36px; border: 1px solid #d7dee8; border-radius: 6px; background: #fff; color: #526174; font-weight: 800; }
        .pager:disabled { opacity: .35; cursor: not-allowed; }
        .pager:not(:disabled):hover { border-color: #e40000; color: #e40000; }
      `}</style>
    </main>
  );
}

function StatusPill({ status }: { status: VehicleRecord["linkStatus"] }) {
  const classes = status === "Available" ? "bg-[#eaf7ed] text-[#187239]" : status === "Allocated" ? "bg-[#e8f1ff] text-[#245fba]" : status === "VOR" ? "bg-[#ffe6e6] text-[#bf1515]" : "bg-[#fff4d6] text-[#966100]";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${classes}`}>{status}</span>;
}

function OfficeHeader({ driverName }: { driverName: string }) {
  return (
    <header className="flex min-h-[64px] items-center justify-between bg-[#e40000] text-white shadow-sm">
      <div className="flex h-full items-center">
        <div className="flex h-[64px] w-[68px] items-center justify-center border-r border-white/30 text-3xl font-black">≡</div>
        <div className="px-5">
          <p className="text-2xl font-black uppercase tracking-wide">MOCK UP</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Link Message Mock</p>
        </div>
      </div>
      <div className="flex items-center gap-4 px-4">
        <Link href="/internal/app-ideas" className="hidden rounded-lg border border-white/70 px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-white/15 sm:block">← Back to DriverOS Home</Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-[#e40000]">●</div>
        <div className="hidden text-right sm:block">
          <p className="text-base font-black">{driverName}</p>
          <p className="text-xs font-bold text-white/80">Mock dashboard user</p>
        </div>
        <div className="hidden border-l border-white/40 pl-5 text-2xl font-black sm:block">↪</div>
      </div>
    </header>
  );
}

function OfficeSidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className="sticky top-0 flex h-[calc(100vh-64px)] w-[68px] shrink-0 flex-col overflow-y-auto bg-[#252c33] text-white">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`relative flex h-[64px] shrink-0 items-center justify-center border-b border-white/10 no-underline transition ${item.icon.length > 2 ? "text-sm font-black" : "text-3xl"} ${item.active ? "bg-[#11171d] text-white" : "text-white/75 hover:bg-[#11171d] hover:text-white"}`}
          title={item.label}
          aria-label={item.label}
        >
          <span>{item.icon}</span>
          {item.alertCount ? <span className="absolute bottom-2 right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e40000] px-1 text-[11px] font-black leading-none text-white ring-2 ring-[#252c33]">{item.alertCount}</span> : null}
        </Link>
      ))}
      <div className="mt-auto flex h-[64px] shrink-0 items-center justify-center border-t border-white/10 text-3xl text-white/80">»</div>
    </aside>
  );
}

function MockEditModal({ vehicle, onClose }: { vehicle: VehicleRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between bg-[#e40000] px-5 py-4 text-white">
          <div><p className="text-xs font-black uppercase tracking-widest text-white/80">Mock edit</p><h2 className="text-xl font-black">{vehicle.vrn}</h2></div>
          <button type="button" onClick={onClose} className="text-2xl font-black">×</button>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <ReadOnlyField label="Local ID" value={vehicle.localId} />
          <ReadOnlyField label="C Number" value={vehicle.cNumber} />
          <ReadOnlyField label="Owning VOC" value={vehicle.owningVoc} />
          <ReadOnlyField label="Last Known Location" value={vehicle.lastKnownLocation} />
          <ReadOnlyField label="MOT Due Date" value={vehicle.motDueDate} />
          <ReadOnlyField label="Service Due Date" value={vehicle.serviceDueDate} />
        </div>
        <div className="border-t border-[#e5e7eb] bg-[#f8fafc] px-5 py-4 text-right">
          <button type="button" onClick={onClose} className="rounded-md bg-[#202733] px-5 py-2.5 text-sm font-black text-white">Save Mock Changes</button>
        </div>
      </div>
    </div>
  );
}

function CreateMockModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="bg-[#e40000] px-5 py-4 text-white"><p className="text-xs font-black uppercase tracking-widest text-white/80">Vehicle Data Maintenance</p><h2 className="text-xl font-black">Create Vehicle - Mock</h2></div>
        <div className="space-y-4 p-5">
          <p className="text-sm font-semibold leading-6 text-[#475569]">This demonstrates the Create action. The supplied mock-up already contains 30 fictitious vehicle records, so no permanent record is written.</p>
          <ReadOnlyField label="Example VRN" value="PX26ABC" />
          <ReadOnlyField label="Example Local ID" value="RO2199" />
        </div>
        <div className="border-t border-[#e5e7eb] bg-[#f8fafc] px-5 py-4 text-right"><button type="button" onClick={onClose} className="rounded-md bg-[#202733] px-5 py-2.5 text-sm font-black text-white">Close</button></div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return <label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-wider text-[#64748b]">{label}</span><input value={value} readOnly className="w-full rounded-md border border-[#d6dee8] bg-[#f8fafc] px-3 py-2.5 text-sm font-bold text-[#243144]" /></label>;
}
