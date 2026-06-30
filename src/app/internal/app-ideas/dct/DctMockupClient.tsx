"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DctRow,
  formatDateTime,
  formatDelayTotal,
  formatTimeDifference,
  getPositiveDelayMinutes,
  getTimingCellClass,
  readStoredManifestState,
  resetDriverPdaManifestMockup,
  rowHasLateTiming,
} from "../driverPdaManifestData";

export default function DctMockupClient() {
  const [rows, setRows] = useState<DctRow[]>(() => readStoredManifestState().dctRows);

  useEffect(() => {
    const refreshRows = window.setTimeout(() => {
      setRows(readStoredManifestState().dctRows);
    }, 0);

    return () => window.clearTimeout(refreshRows);
  }, []);

  function completeReset() {
    resetDriverPdaManifestMockup();
    const nextState = readStoredManifestState();
    setRows(nextState.dctRows);
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] font-sans text-[#172033]">
      <div className="relative mx-auto min-h-screen w-full max-w-[1500px] bg-white shadow-2xl">
        <DctWebScreen rows={rows} onReset={completeReset} />
      </div>
    </main>
  );
}

function DctWebScreen({
  rows,
  onReset,
}: {
  rows: DctRow[];
  onReset: () => void;
}) {
  const lateLegs = rows.filter((row) => rowHasLateTiming(row)).length;
  const issuesRecorded = rows.filter((row) => row.issues.trim().length > 0).length;
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
    subLabel?: string;
    headerClass: string;
    widthClass: string;
  }[] = [
    { key: "status", label: "Leg Status", headerClass: "bg-[#cfeefa]", widthClass: "w-[90px]" },
    { key: "startDate", label: "Start Date", headerClass: "bg-[#cfeefa]", widthClass: "w-[95px]" },
    { key: "dutyOrder", label: "Duty Order", headerClass: "bg-[#cfeefa]", widthClass: "w-[68px]" },
    { key: "vehicle", label: "Vehicle", headerClass: "bg-[#cfeefa]", widthClass: "w-[92px]" },
    { key: "trailerNumber", label: "Trailer Number", headerClass: "bg-[#cfeefa]", widthClass: "w-[100px]" },
    { key: "userId", label: "UserId", headerClass: "bg-[#cfeefa]", widthClass: "w-[140px]" },
    { key: "contractorCompanyName", label: "Division", subLabel: "Letters/Network/Contractor", headerClass: "bg-[#cfeefa]", widthClass: "w-[130px]" },
    { key: "operator", label: "Operator", headerClass: "bg-[#cfeefa]", widthClass: "w-[62px]" },
    { key: "dutyId", label: "DutyId", headerClass: "bg-[#cfeefa]", widthClass: "w-[82px]" },
    { key: "trailerType", label: "Trailer Type", headerClass: "bg-[#fde7c7]", widthClass: "w-[105px]" },
    { key: "planzCode", label: "Planz Code", headerClass: "bg-[#fde7c7]", widthClass: "w-[105px]" },
    { key: "dueToConvey", label: "Due To Convey", headerClass: "bg-[#fde7c7]", widthClass: "w-[115px]" },
    { key: "departureLocation", label: "Departure location", headerClass: "bg-[#f2e8c9]", widthClass: "w-[112px]" },
    { key: "plannedDeparture", label: "Planned Departure Time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureActual", label: "Departure actual time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureDiff", label: "Departure Diff hh:mm", headerClass: "bg-[#f2e8c9]", widthClass: "w-[92px]" },
    { key: "depAssets", label: "Dep Assets", headerClass: "bg-[#f2e8c9]", widthClass: "w-[82px]" },
    { key: "arrivalLocation", label: "Arrival Location", headerClass: "bg-[#d9f1d5]", widthClass: "w-[112px]" },
    { key: "plannedArrival", label: "Planned Arrival Time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalActual", label: "Arrival actual time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalDiff", label: "Arrival Diff hh:mm", headerClass: "bg-[#d9f1d5]", widthClass: "w-[92px]" },
    { key: "arrAssets", label: "Arr Assets", headerClass: "bg-[#d9f1d5]", widthClass: "w-[82px]" },
    { key: "issueCategory", label: "Issue Category", headerClass: "bg-[#fde7c7]", widthClass: "w-[120px]" },
    { key: "issues", label: "Issues", headerClass: "bg-[#fde7c7]", widthClass: "w-[220px]" },
    { key: "liveTracking", label: "Live Tracking", headerClass: "bg-[#ead5ea]", widthClass: "w-[110px]" },
    { key: "gpsDeparture", label: "GPS Departure", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]" },
    { key: "gpsArrival", label: "GPS Arrival", headerClass: "bg-[#ead5ea]", widthClass: "w-[140px]" },
    { key: "yorkBarcode", label: "York Barcode", headerClass: "bg-[#ead5ea]", widthClass: "w-[130px]" },
  ];

  return (
    <>
      <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5">
        <Link
          href="/internal/app-ideas"
          className="text-sm font-black text-[#d6001c] no-underline"
        >
          ‹ Back
        </Link>

        <h1 className="text-xl font-black text-[#222]">DCT Mockup Test</h1>

        <div className="text-3xl font-black text-[#333]">⋮</div>
      </header>

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

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <button
                type="button"
                onClick={() => downloadRowsAsExcel(rows)}
                disabled={rows.length === 0}
                className="rounded-full bg-[#001b3a] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#0f2f57] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              >
                Download Excel
              </button>

              <button
                type="button"
                onClick={onReset}
                className="rounded-full bg-[#d6001c] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#a90016]"
              >
                Complete Reset
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Rows shown" value={String(rows.length)} />
            <SummaryCard
              label="Leg status completed"
              value={String(rows.filter((row) => row.status === "Complete").length)}
            />
            <SummaryCard label="Late legs" value={String(lateLegs)} />
            <SummaryCard label="Issues recorded" value={String(issuesRecorded)} />
            <SummaryCard label="Total delay" value={formatDelayTotal(totalDelayMinutes)} />
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
              <table className="min-w-[2990px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
                <thead className="sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`${column.headerClass} ${column.widthClass} border border-black px-1 py-2 align-bottom text-left font-normal text-black`}
                      >
                        <div className="whitespace-normal break-words">
                          <div>{column.label}</div>
                          {column.subLabel && (
                            <div className="mt-1 text-[9px] font-black leading-3 text-[#d6001c]">
                              {column.subLabel}
                            </div>
                          )}
                        </div>
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
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{getVehicleNumberForRow(row)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.trailerNumber || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.userId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.contractorCompanyName}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.operator}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.dutyId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.trailerType}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.planzCode}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.dueToConvey}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.departureLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedDepartureTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.departureActualTs ? formatDateTime(row.departureActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedDepartureTs, row.departureActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedDepartureTs, row.departureActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-bold whitespace-nowrap">{getAssetCountForRow(row)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.arrivalLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedArrivalTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatTimeDifference(row.plannedArrivalTs, row.arrivalActualTs)}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-bold whitespace-nowrap">{getAssetCountForRow(row)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.issueCategory || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.issues || "-"}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">
                        <button
                          type="button"
                          className="rounded-full bg-[#001b3a] px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#0f2f57]"
                          aria-label={`Track leg ${row.legNumber}`}
                        >
                          Track
                        </button>
                      </td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsDeparture || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words">{row.gpsArrival || "-"}</td>
                      <td className="border border-black px-1 py-2 font-normal break-words"></td>
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

function downloadRowsAsExcel(rows: DctRow[]) {
  if (typeof window === "undefined" || rows.length === 0) {
    return;
  }

  const headers = [
    "Leg Status",
    "Start Date",
    "Duty Order",
    "Vehicle",
    "Trailer Number",
    "UserId",
    "Division Letters/Network/Contractor",
    "Operator",
    "DutyId",
    "Trailer Type",
    "Planz Code",
    "Due To Convey",
    "Departure location",
    "Planned Departure Time",
    "Departure actual time",
    "Departure Diff hh:mm",
    "Dep Assets",
    "Arrival Location",
    "Planned Arrival Time",
    "Arrival actual time",
    "Arrival Diff hh:mm",
    "Arr Assets",
    "Issue Category",
    "Issues",
    "Live Tracking",
    "GPS Departure",
    "GPS Arrival",
    "York Barcode",
  ];

  const exportRows = rows.map((row) => [
    row.status,
    row.startDate,
    row.dutyOrder,
    getVehicleNumberForRow(row),
    row.trailerNumber || "",
    row.userId,
    row.contractorCompanyName,
    row.operator,
    row.dutyId,
    row.trailerType,
    row.planzCode,
    row.dueToConvey,
    row.departureLocation,
    formatDateTime(row.plannedDepartureTs),
    row.departureActualTs ? formatDateTime(row.departureActualTs) : "-",
    formatTimeDifference(row.plannedDepartureTs, row.departureActualTs),
    getAssetCountForRow(row),
    row.arrivalLocation,
    formatDateTime(row.plannedArrivalTs),
    row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-",
    formatTimeDifference(row.plannedArrivalTs, row.arrivalActualTs),
    getAssetCountForRow(row),
    row.issueCategory || "-",
    row.issues || "-",
    "Track",
    row.gpsDeparture || "-",
    row.gpsArrival || "-",
    "",
  ]);

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
    th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
    th { background: #cfeefa; font-weight: bold; }
  </style>
</head>
<body>
  <table>
    <thead><tr>${headers.map((header) => `<th>${escapeExcelHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${exportRows
        .map(
          (exportRow) =>
            `<tr>${exportRow
              .map((cell) => `<td>${escapeExcelHtml(String(cell))}</td>`)
              .join("")}</tr>`
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `dct-mockup-data-${today}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function escapeExcelHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getVehicleNumberForRow(row: DctRow) {
  if (row.status !== "Complete") {
    return "";
  }

  return "PE68UHD";
}

function getAssetCountForRow(row: DctRow) {
  if (row.status !== "Complete") {
    return "";
  }

  const mockAssetCounts: Record<number, number> = {
    1: 45,
    2: 67,
    3: 32,
    4: 88,
    5: 21,
    6: 74,
  };

  return String(mockAssetCounts[row.legNumber] ?? 0);
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

function getDctStatusCellClass(status: DctRow["status"]) {
  if (status === "Complete") {
    return "bg-[#d9f7e5]";
  }

  if (status === "In Progress") {
    return "bg-[#ffe9c8]";
  }

  return "bg-[#dbeafe]";
}
