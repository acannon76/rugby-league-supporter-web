"use client";

import { useEffect, useState } from "react";
import {
  DctRow,
  DctStatus,
  STORAGE_KEY,
  StoredManifestState,
  DUTY_ID,
  formatDateTime,
  formatDelayTotal,
  formatTimeDifference,
  getPositiveDelayMinutes,
  getTimingCellClass,
  rowHasLateTiming,
} from "../driverPdaManifestData";

export default function DctMockupClient() {
  const [rows, setRows] = useState<DctRow[]>([]);
  const [dutyId, setDutyId] = useState(DUTY_ID);
  const [trailerNumber, setTrailerNumber] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredManifestState;
        setRows(parsed.dctRows || []);
        setDutyId(parsed.dutyId || DUTY_ID);
        setTrailerNumber(parsed.trailerNumber || "");
      } catch {
        setRows([]);
      }
    }

    setLoaded(true);
  }, []);

  function completeReset() {
    window.localStorage.removeItem(STORAGE_KEY);
    setRows([]);
    setDutyId(DUTY_ID);
    setTrailerNumber("");
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#eef2f7] font-sans text-[#222]">
        <section className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-5">
          <p className="text-lg font-black text-[#222]">Loading DCT mockup...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] font-sans text-[#222]">
      <div className="relative mx-auto min-h-screen w-full max-w-[1500px] bg-white shadow-2xl">
        <DctWebScreen
          rows={rows}
          dutyId={dutyId}
          trailerNumber={trailerNumber}
          onBack={() => window.history.back()}
          onReset={completeReset}
        />
      </div>
    </main>
  );
}

function AppHeader({
  title,
  left,
  onBack,
}: {
  title: string;
  left?: string;
  onBack?: () => void;
}) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5">
      <div className="w-[120px]">
        {left && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-black text-[#d6001c]"
          >
            ‹ {left}
          </button>
        )}
      </div>

      <h1 className="text-xl font-black text-[#222]">{title}</h1>

      <div className="w-[120px] text-right text-3xl font-black text-[#333]">
        ⋮
      </div>
    </header>
  );
}

function DctWebScreen({
  rows,
  dutyId,
  trailerNumber,
  onBack,
  onReset,
}: {
  rows: DctRow[];
  dutyId: string;
  trailerNumber: string;
  onBack: () => void;
  onReset: () => void;
}) {
  const lateLegs = rows.filter((row) => rowHasLateTiming(row)).length;
  const skippedLegs = rows.filter((row) => row.status === "Skip").length;
  const issuesRecorded = rows.filter(
    (row) => row.issues.trim().length > 0
  ).length;
  const totalDelayMinutes = rows.reduce(
    (total, row) =>
      total +
      getPositiveDelayMinutes(row.plannedDepartureTs, row.departureActualTs) +
      getPositiveDelayMinutes(row.plannedArrivalTs, row.arrivalActualTs),
    0
  );

  const columns: {
    key: string;
    label: string;
    headerClass: string;
    widthClass: string;
  }[] = [
    { key: "status", label: "Leg Status", headerClass: "bg-[#cfeefa]", widthClass: "w-[90px]" },
    { key: "startDate", label: "Start Date", headerClass: "bg-[#cfeefa]", widthClass: "w-[95px]" },
    { key: "dutyOrder", label: "Duty Order", headerClass: "bg-[#cfeefa]", widthClass: "w-[68px]" },
    { key: "vehicleId", label: "Trailer Id", headerClass: "bg-[#cfeefa]", widthClass: "w-[88px]" },
    { key: "userId", label: "UserId", headerClass: "bg-[#cfeefa]", widthClass: "w-[140px]" },
    { key: "contractorCompanyName", label: "Contractor Company Name", headerClass: "bg-[#cfeefa]", widthClass: "w-[120px]" },
    { key: "operator", label: "Operator", headerClass: "bg-[#cfeefa]", widthClass: "w-[62px]" },
    { key: "dutyId", label: "DutyId", headerClass: "bg-[#cfeefa]", widthClass: "w-[82px]" },
    { key: "departureLocation", label: "Departure location", headerClass: "bg-[#f2e8c9]", widthClass: "w-[112px]" },
    { key: "plannedDeparture", label: "Planned_Departure_Time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureActual", label: "DEPARTURE actual time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureDiff", label: "Departure Diff hh:mm", headerClass: "bg-[#f2e8c9]", widthClass: "w-[92px]" },
    { key: "dueToConvey", label: "Due To Convey", headerClass: "bg-[#f7efd8]", widthClass: "w-[108px]" },
    { key: "departureAssets", label: "DEPARTURE assets", headerClass: "bg-[#f2e8c9]", widthClass: "w-[68px]" },
    { key: "arrivalLocation", label: "Arrival Location", headerClass: "bg-[#d9f1d5]", widthClass: "w-[112px]" },
    { key: "plannedArrival", label: "Planned_Arrival_Time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalActual", label: "ARRIVAL actual time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalDiff", label: "Arrival Diff hh:mm", headerClass: "bg-[#d9f1d5]", widthClass: "w-[92px]" },
    { key: "arrivalAssets", label: "ARRIVAL assets", headerClass: "bg-[#d9f1d5]", widthClass: "w-[68px]" },
    { key: "issueCategory", label: "Issue Category", headerClass: "bg-[#fde7c7]", widthClass: "w-[120px]" },
    { key: "issues", label: "Issues", headerClass: "bg-[#fde7c7]", widthClass: "w-[180px]" },
    { key: "gpsDeparture", label: "GPS Departure", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]" },
    { key: "gpsArrival", label: "GPS Arrival", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]" },
    { key: "yorkBarCodes", label: "York Bar Codes", headerClass: "bg-[#f3d9ec]", widthClass: "w-[118px]" },
  ];

  return (
    <>
      <AppHeader title="DCT Mockup Test" left="Back" onBack={onBack} />

      <section className="bg-[#f8fafc] px-3 py-4 sm:px-4 lg:px-5">
        <section className="rounded-[14px] border border-[#cfd8e3] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d6001c]">
                Web results mockup
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#172033] sm:text-3xl">
                DCT-style output view
              </h2>
              <p className="mt-3 max-w-[980px] text-sm font-bold leading-6 text-[#4b5563]">
                This shows the output created from the Driver PDA Manifest mockup.
                Planned values show first, and actual values populate as the
                mock-up is run.
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="rounded-full bg-[#d6001c] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white"
            >
              Complete Reset
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Source mock-up" value="Driver PDA Manifest" />
            <SummaryCard label="Duty ID" value={dutyId || ""} />
            <SummaryCard label="Rows shown" value={String(rows.length)} />
            <SummaryCard
              label="Leg status completed"
              value={String(rows.filter((row) => row.status === "Complete").length)}
            />
            <SummaryCard label="Late legs" value={String(lateLegs)} />
            <SummaryCard label="Skipped legs" value={String(skippedLegs)} />
            <SummaryCard label="Issues recorded" value={String(issuesRecorded)} />
            <SummaryCard label="Total delay" value={formatDelayTotal(totalDelayMinutes)} />
            <SummaryCard label="Last trailer" value={trailerNumber || ""} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em]">
            <span className="rounded-full border border-[#1f7a34] bg-[#d9f7e5] px-3 py-2 text-[#166534]">
              Green = on time / early
            </span>
            <span className="rounded-full border border-[#c62828] bg-[#fecaca] px-3 py-2 text-[#7f1d1d]">
              Red = late
            </span>
            <span className="rounded-full border border-[#6b7280] bg-[#e5e7eb] px-3 py-2 text-[#374151]">
              Grey = not yet populated
            </span>
          </div>
        </section>

        {rows.length === 0 ? (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white p-8 shadow-sm">
            <p className="text-lg font-black text-[#172033]">
              No DCT mockup data is available yet.
            </p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
              Open Manifest from the Driver PDA dashboard first, then run one or
              more legs. Return here to view the DCT-style output.
            </p>
          </section>
        ) : (
          <section className="mt-5 rounded-[14px] border border-[#cfd8e3] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[2570px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`${column.headerClass} ${column.widthClass} border border-black px-1 py-2 align-bottom text-left font-normal text-black`}
                      >
                        <div className="whitespace-normal break-words">{column.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.legNumber} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}>
                      <td className={`${getDctStatusCellClass(row.status)} border border-black px-1 py-2 font-normal text-black`}>{row.status}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.startDate}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.dutyOrder}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.vehicleId || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.userId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.contractorCompanyName}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.operator}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.dutyId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.departureLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedDepartureTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.departureActualTs ? formatDateTime(row.departureActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedDepartureTs, row.departureActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.dueToConvey || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.departureAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.arrivalLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedArrivalTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedArrivalTs, row.arrivalActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.arrivalAssets || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.issueCategory || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.issues || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsDeparture || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsArrival || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.yorkBarCodes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#d6dee8] bg-[#f8fafc] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-[#172033]">{value || "-"}</p>
    </div>
  );
}

function getDctStatusCellClass(status: DctStatus) {
  if (status === "Complete") {
    return "bg-[#d9f7e5]";
  }

  if (status === "In Progress") {
    return "bg-[#ffe9c8]";
  }

  if (status === "Skip") {
    return "bg-[#d1d5db]";
  }

  return "bg-[#dbeafe]";
}
