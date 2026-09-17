"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import routeMapImage from "../../mock-route-map.png";
import ExportDataMenu from "../ExportDataMenu";
import { exportTabularData, type ExportFormat } from "../exportData";
import { getOperationalWeekNumberFromDisplayDate } from "../../operationalWeek";
import {
  DctRow,
  type DctStatus,
  formatDateTime,
  formatDelayTotal,
  getPositiveDelayMinutes,
  getTimingCellClass,
  readStoredManifestState,
  resetDriverPdaManifestMockup,
  rowHasLateTiming,
} from "../driverPdaManifestData";
import {
  TIMING_PROFILE_BANDS,
  classifyTimingDifference,
  type TimingCode,
} from "../timingProfile";

type ToTimeCode = TimingCode;
const toTimeOptions: ToTimeCode[] = ["VE", "E", "OT", "L", "VL", "F"];

export default function DctMockupClient() {
  const [rows, setRows] = useState<DctRow[]>(() => readStoredManifestState().dctRows);

  useEffect(() => {
    const refreshRows = () => setRows(readStoredManifestState().dctRows);
    const initialRefresh = window.setTimeout(refreshRows, 0);

    window.addEventListener("focus", refreshRows);
    window.addEventListener("storage", refreshRows);

    return () => {
      window.clearTimeout(initialRefresh);
      window.removeEventListener("focus", refreshRows);
      window.removeEventListener("storage", refreshRows);
    };
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DctStatus>("All");
  const [divisionFilter, setDivisionFilter] = useState<"All" | "Pie Haulage" | "Letters" | "Network">("All");
  const [dttFilter, setDttFilter] = useState<"All" | ToTimeCode>("All");
  const [attFilter, setAttFilter] = useState<"All" | ToTimeCode>("All");
  const [issueFilter, setIssueFilter] = useState<"All" | "With issue" | "No issue">("All");
  const [dutyDateFilter, setDutyDateFilter] = useState("All");
  const [dutyIdFilter, setDutyIdFilter] = useState("All");
  const [dueToConveyFilter, setDueToConveyFilter] = useState("All");
  const [weekNumberFilter, setWeekNumberFilter] = useState("All");
  const [vehicleRegFilter, setVehicleRegFilter] = useState("All");
  const [trailerNumberFilter, setTrailerNumberFilter] = useState("All");
  const [operatorFilter, setOperatorFilter] = useState("All");
  const [departureLocationFilter, setDepartureLocationFilter] = useState("All");
  const [arrivalLocationFilter, setArrivalLocationFilter] = useState("All");
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [topView, setTopView] = useState<"summary" | "route">("summary");

  const dutyDateOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.startDate)), [rows]);
  const dutyIdOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.dutyId)), [rows]);
  const dueToConveyOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.dueToConvey)), [rows]);
  const weekNumberOptions = useMemo(
    () => buildFilterOptions(rows.map((row) => String(getOperationalWeekNumberFromDisplayDate(row.startDate)))),
    [rows]
  );
  const vehicleRegOptions = useMemo(() => buildFilterOptions(rows.map(getVehicleNumberForRow)), [rows]);
  const trailerNumberOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.trailerNumber)), [rows]);
  const operatorOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.operator)), [rows]);
  const departureLocationOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.departureLocation)), [rows]);
  const arrivalLocationOptions = useMemo(() => buildFilterOptions(rows.map((row) => row.arrivalLocation)), [rows]);

  const displayRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const division = getDivisionForRow(row);
      const dtt = getDepartureToTimeCode(row);
      const att = getArrivalToTimeCode(row);
      const hasIssue = row.issues.trim().length > 0;
      const weekNumber = String(getOperationalWeekNumberFromDisplayDate(row.startDate));
      const vehicleReg = getVehicleNumberForRow(row);
      const matchesSearch =
        query.length === 0 ||
        [
          row.startDate,
          weekNumber,
          row.dutyId,
          row.dutyOrder,
          row.userId,
          vehicleReg,
          row.trailerNumber,
          row.operator,
          row.dueToConvey,
          row.departureLocation,
          row.arrivalLocation,
          row.issueCategory,
          row.issues,
          division,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;
      const matchesDivision = divisionFilter === "All" || division === divisionFilter;
      const matchesDtt = dttFilter === "All" || dtt === dttFilter;
      const matchesAtt = attFilter === "All" || att === attFilter;
      const matchesIssue =
        issueFilter === "All" ||
        (issueFilter === "With issue" ? hasIssue : !hasIssue);
      const matchesDutyDate = dutyDateFilter === "All" || row.startDate === dutyDateFilter;
      const matchesDutyId = dutyIdFilter === "All" || row.dutyId === dutyIdFilter;
      const matchesDueToConvey = dueToConveyFilter === "All" || row.dueToConvey === dueToConveyFilter;
      const matchesWeekNumber = weekNumberFilter === "All" || weekNumber === weekNumberFilter;
      const matchesVehicleReg = vehicleRegFilter === "All" || vehicleReg === vehicleRegFilter;
      const matchesTrailerNumber = trailerNumberFilter === "All" || row.trailerNumber === trailerNumberFilter;
      const matchesOperator = operatorFilter === "All" || row.operator === operatorFilter;
      const matchesDepartureLocation = departureLocationFilter === "All" || row.departureLocation === departureLocationFilter;
      const matchesArrivalLocation = arrivalLocationFilter === "All" || row.arrivalLocation === arrivalLocationFilter;

      return matchesSearch && matchesStatus && matchesDivision && matchesDtt && matchesAtt && matchesIssue &&
        matchesDutyDate && matchesDutyId && matchesDueToConvey && matchesWeekNumber && matchesVehicleReg &&
        matchesTrailerNumber && matchesOperator && matchesDepartureLocation && matchesArrivalLocation;
    });
  }, [
    rows,
    searchTerm,
    statusFilter,
    divisionFilter,
    dttFilter,
    attFilter,
    issueFilter,
    dutyDateFilter,
    dutyIdFilter,
    dueToConveyFilter,
    weekNumberFilter,
    vehicleRegFilter,
    trailerNumberFilter,
    operatorFilter,
    departureLocationFilter,
    arrivalLocationFilter,
  ]);

  const lateLegs = displayRows.filter((row) => rowHasLateTiming(row)).length;
  const issuesRecorded = displayRows.filter((row) => row.issues.trim().length > 0).length;
  const totalDelayMinutes = displayRows.reduce(
    (total, row) =>
      total +
      getPositiveDelayMinutes(row.plannedDepartureTs, row.departureActualTs) +
      getPositiveDelayMinutes(row.plannedArrivalTs, row.arrivalActualTs),
    0
  );

  const effectiveSelectedDutyId = dutyIdFilter !== "All"
    ? dutyIdFilter
    : displayRows[0]?.dutyId || "";

  const selectedDutyRows = useMemo(
    () => displayRows.filter((row) => row.dutyId === effectiveSelectedDutyId),
    [displayRows, effectiveSelectedDutyId]
  );

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setDivisionFilter("All");
    setDttFilter("All");
    setAttFilter("All");
    setIssueFilter("All");
    setDutyDateFilter("All");
    setDutyIdFilter("All");
    setDueToConveyFilter("All");
    setWeekNumberFilter("All");
    setVehicleRegFilter("All");
    setTrailerNumberFilter("All");
    setOperatorFilter("All");
    setDepartureLocationFilter("All");
    setArrivalLocationFilter("All");
    setFiltersExpanded(false);
  }

  function resetAndClear() {
    clearFilters();
    onReset();
  }

  const columns: {
    key: string;
    label: string;
    subLabel?: string;
    headerClass: string;
    widthClass: string;
  }[] = [
    { key: "status", label: "Leg Status", headerClass: "bg-[#cfeefa]", widthClass: "w-[90px]" },
    { key: "startDate", label: "Duty Date", headerClass: "bg-[#cfeefa]", widthClass: "w-[95px]" },
    { key: "weekNumber", label: "Week Number", headerClass: "bg-[#cfeefa]", widthClass: "w-[78px]" },
    { key: "dutyOrder", label: "Duty Order", headerClass: "bg-[#cfeefa]", widthClass: "w-[68px]" },
    { key: "vehicle", label: "Vehicle Reg", headerClass: "bg-[#cfeefa]", widthClass: "w-[92px]" },
    { key: "trailerNumber", label: "Trailer Number", headerClass: "bg-[#cfeefa]", widthClass: "w-[100px]" },
    { key: "userId", label: "Drivers Name", headerClass: "bg-[#cfeefa]", widthClass: "w-[140px]" },
    { key: "contractorCompanyName", label: "Division", subLabel: "Letters/Network/Contractor", headerClass: "bg-[#cfeefa]", widthClass: "w-[130px]" },
    { key: "operator", label: "Operator", headerClass: "bg-[#cfeefa]", widthClass: "w-[62px]" },
    { key: "dutyId", label: "Duty ID", headerClass: "bg-[#cfeefa]", widthClass: "w-[82px]" },
    { key: "trailerType", label: "Vehicle Type", headerClass: "bg-[#fde7c7]", widthClass: "w-[105px]" },
    { key: "planzCode", label: "Planz Code", headerClass: "bg-[#fde7c7]", widthClass: "w-[105px]" },
    { key: "dueToConvey", label: "Due To Convey", headerClass: "bg-[#fde7c7]", widthClass: "w-[115px]" },
    { key: "departureLocation", label: "Departure location", headerClass: "bg-[#f2e8c9]", widthClass: "w-[112px]" },
    { key: "plannedDeparture", label: "Planned Departure Time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureActual", label: "Departure actual time", headerClass: "bg-[#f2e8c9]", widthClass: "w-[132px]" },
    { key: "departureDiff", label: "Departure Diff hh:mm", headerClass: "bg-[#f2e8c9]", widthClass: "w-[92px]" },
    { key: "dtt", label: "DTT", headerClass: "bg-[#f2e8c9]", widthClass: "w-[62px]" },
    { key: "depAssets", label: "Dep Assets", headerClass: "bg-[#f2e8c9]", widthClass: "w-[82px]" },
    { key: "arrivalLocation", label: "Arrival Location", headerClass: "bg-[#d9f1d5]", widthClass: "w-[112px]" },
    { key: "plannedArrival", label: "Planned Arrival Time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalActual", label: "Arrival actual time", headerClass: "bg-[#d9f1d5]", widthClass: "w-[132px]" },
    { key: "arrivalDiff", label: "Arrival Diff hh:mm", headerClass: "bg-[#d9f1d5]", widthClass: "w-[92px]" },
    { key: "att", label: "ATT", headerClass: "bg-[#d9f1d5]", widthClass: "w-[62px]" },
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
      <header className="flex h-[52px] items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <Link
          href="/internal/app-ideas"
          className="text-sm font-black text-[#d6001c] no-underline"
        >
          ‹ Back
        </Link>

        <h1 className="text-lg font-black text-[#222]">DCT Mockup Test</h1>

        <div className="text-2xl font-black text-[#333]">⋮</div>
      </header>

      <section className="bg-[#f8fafc] px-3 py-2.5 sm:px-4 lg:px-5">
        <section className="rounded-[14px] border border-[#cfd8e3] bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d6001c]">
                Web results mockup
              </p>
              <h2 className="mt-1 text-xl font-black text-[#172033] sm:text-2xl">
                DCT-style output view
              </h2>
              <p className="mt-1 max-w-[980px] text-xs font-bold leading-5 text-[#4b5563]">
                This shows the output created from the DriverOS Manifest mockup.
                Planned values show first. Actual timings, DTT and ATT populate only as each Manifest / 318 leg is completed.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <ExportDataMenu
                disabled={displayRows.length === 0}
                onExport={(format) => downloadRows(displayRows, format)}
                buttonClassName="rounded-full bg-[#001b3a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f2f57] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
              />

              <button
                type="button"
                onClick={resetAndClear}
                className="rounded-full bg-[#d6001c] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#a90016]"
              >
                Complete Reset
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-[#cfd8e3] bg-[#f8fafc] p-1">
              <button
                type="button"
                onClick={() => setTopView("summary")}
                className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition ${topView === "summary" ? "bg-[#001b3a] text-white" : "text-[#475569] hover:bg-white"}`}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setTopView("route")}
                className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition ${topView === "route" ? "bg-[#001b3a] text-white" : "text-[#475569] hover:bg-white"}`}
              >
                Route Map
              </button>
            </div>

          </div>

          {topView === "summary" ? (
          <>
          <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Rows shown" value={String(displayRows.length)} />
            <SummaryCard
              label="Leg status completed"
              value={String(displayRows.filter((row) => row.status === "Complete").length)}
            />
            <SummaryCard label="Late legs" value={String(lateLegs)} />
            <SummaryCard label="Issues recorded" value={String(issuesRecorded)} />
            <SummaryCard label="Total delay" value={formatDelayTotal(totalDelayMinutes)} />
          </div>

          <div className="mt-2 grid gap-2 xl:grid-cols-[500px_minmax(0,1fr)] xl:items-stretch">
            <ToTimeSummaryTable distribution={buildToTimeDistribution(displayRows)} />
            <ToTimeLegend />
          </div>
          </>
        ) : (
          <DctRouteMapPanel rows={selectedDutyRows} dutyId={effectiveSelectedDutyId || "-"} />
        )}
        </section>

        <section className="mt-2 rounded-[14px] border border-[#cfd8e3] bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d6001c]">DCT filters</p>
            <p className="text-[11px] font-bold text-[#64748b]">
              Showing <span className="font-black text-[#172033]">{displayRows.length}</span> of {rows.length} leg(s)
            </p>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end">
            <label className="block xl:col-span-2">
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#64748b]">Search DCT</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Duty, driver, location, vehicle, trailer or issue"
                className="mt-1 h-8 w-full rounded-lg border border-[#cbd5e1] bg-white px-2 text-xs font-bold text-[#172033] outline-none focus:border-[#d6001c]"
              />
            </label>

            <FilterSelect label="Duty date" value={dutyDateFilter} options={dutyDateOptions} onChange={setDutyDateFilter} />
            <FilterSelect label="Duty ID" value={dutyIdFilter} options={dutyIdOptions} onChange={setDutyIdFilter} />
            <FilterSelect
              label="Leg status"
              value={statusFilter}
              options={["All", "Planned", "In Progress", "Complete"]}
              onChange={(value) => setStatusFilter(value as "All" | DctStatus)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFiltersExpanded((isExpanded) => !isExpanded)}
                aria-expanded={filtersExpanded}
                className="h-8 flex-1 rounded-lg border border-[#001b3a] bg-[#eef4fb] px-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#001b3a] transition hover:bg-[#e2ebf6]"
              >
                {filtersExpanded ? "Fewer filters" : "More filters"}
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="h-8 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[10px] font-black uppercase tracking-[0.08em] text-[#475569] transition hover:border-[#d6001c]"
              >
                Clear
              </button>
            </div>
          </div>

          {filtersExpanded && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:items-end">
              <FilterSelect
                label="Division"
                value={divisionFilter}
                options={["All", "Pie Haulage", "Letters", "Network"]}
                onChange={(value) => setDivisionFilter(value as typeof divisionFilter)}
              />
              <FilterSelect label="Due to convey" value={dueToConveyFilter} options={dueToConveyOptions} onChange={setDueToConveyFilter} />
              <FilterSelect label="Week number" value={weekNumberFilter} options={weekNumberOptions} onChange={setWeekNumberFilter} />
              <FilterSelect label="Vehicle reg" value={vehicleRegFilter} options={vehicleRegOptions} onChange={setVehicleRegFilter} />
              <FilterSelect label="Trailer number" value={trailerNumberFilter} options={trailerNumberOptions} onChange={setTrailerNumberFilter} />
              <FilterSelect label="Operator" value={operatorFilter} options={operatorOptions} onChange={setOperatorFilter} />
              <FilterSelect label="Departure location" value={departureLocationFilter} options={departureLocationOptions} onChange={setDepartureLocationFilter} />
              <FilterSelect label="Arrival location" value={arrivalLocationFilter} options={arrivalLocationOptions} onChange={setArrivalLocationFilter} />
              <FilterSelect
                label="DTT"
                value={dttFilter}
                options={["All", ...toTimeOptions]}
                onChange={(value) => setDttFilter(value as "All" | ToTimeCode)}
              />
              <FilterSelect
                label="ATT"
                value={attFilter}
                options={["All", ...toTimeOptions]}
                onChange={(value) => setAttFilter(value as "All" | ToTimeCode)}
              />
              <FilterSelect
                label="Issues"
                value={issueFilter}
                options={["All", "With issue", "No issue"]}
                onChange={(value) => setIssueFilter(value as typeof issueFilter)}
              />
            </div>
          )}
        </section>

        {displayRows.length === 0 ? (
          <section className="mt-2 rounded-[14px] border border-[#cfd8e3] bg-white p-8 shadow-sm">
            <p className="text-lg font-black text-[#172033]">
              {rows.length === 0 ? "No DCT mockup data is available yet." : "No DCT rows match the selected filters."}
            </p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
              {rows.length === 0
                ? "Open Manifest from the DriverOS dashboard first, then run one or more legs. Return here to view the DCT-style output."
                : "Clear or change the DCT filters to show the reporting rows again."}
            </p>
          </section>
        ) : (
          <section className="mt-2 rounded-[14px] border border-[#cfd8e3] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[3230px] border-collapse text-[10px] leading-[1.15] text-[#111827]">
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
                  {displayRows.map((row, index) => (
                    <tr key={row.legNumber} className={index % 2 === 0 ? "bg-white" : "bg-[#fcfcfc]"}>
                      <td className={`${getDctStatusCellClass(row.status)} border border-black px-1 py-2 font-normal text-black`}>{row.status}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.startDate}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{getOperationalWeekNumberFromDisplayDate(row.startDate)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal">{row.dutyOrder}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{getVehicleNumberForRow(row)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{row.trailerNumber || ""}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{row.userId}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal break-words">{getDivisionForRow(row)}</td>
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
                        {formatSignedDifference(row.plannedDepartureTs, row.departureActualTs)}
                      </td>
                      <td className={`${getToTimeCellClass(getDepartureToTimeCode(row))} border border-black px-1 py-2 text-center font-black whitespace-nowrap`}>
                        {getDepartureToTimeCode(row) || "-"}
                      </td>
                      <td className="border border-black px-1 py-2 text-center font-bold whitespace-nowrap">{getAssetCountForRow(row)}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal uppercase break-words">{row.arrivalLocation}</td>
                      <td className="border border-black px-1 py-2 text-center font-normal whitespace-nowrap">{formatDateTime(row.plannedArrivalTs)}</td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-"}
                      </td>
                      <td className={`${getTimingCellClass(row.plannedArrivalTs, row.arrivalActualTs)} border border-black px-1 py-2 text-center font-bold whitespace-nowrap`}>
                        {formatSignedDifference(row.plannedArrivalTs, row.arrivalActualTs)}
                      </td>
                      <td className={`${getToTimeCellClass(getArrivalToTimeCode(row))} border border-black px-1 py-2 text-center font-black whitespace-nowrap`}>
                        {getArrivalToTimeCode(row) || "-"}
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

type ToTimeDistribution = Record<ToTimeCode, number>;
type ToTimeDistributionSet = { dtt: ToTimeDistribution; att: ToTimeDistribution; mtt: ToTimeDistribution };

function ToTimeSummaryTable({ distribution }: { distribution: ToTimeDistributionSet }) {
  const rowClassName = "border border-[#cbd5e1] px-1.5 py-2 text-center text-[11px] font-black text-[#172033]";

  return (
    <section className="h-full rounded-[14px] border border-[#d9dee6] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d6001c]">
            Timing split summary
          </p>
          <h3 className="mt-1 text-lg font-black text-[#172033]">DTT / ATT / MTT overview</h3>
          <p className="mt-1 text-xs font-bold text-[#64748b]">Completed Manifest / 318 legs only; planned rows remain at 0.00%.</p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-[#cbd5e1]">
        <table className="w-full table-fixed border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#eff4fb] text-[#475569]">
              <th className={`${rowClassName} text-left`}>Measure</th>
              {toTimeOptions.map((code) => (
                <th key={code} className={rowClassName}>{code}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <ToTimeSummaryRow label="DTT" values={distribution.dtt} />
            <ToTimeSummaryRow label="ATT" values={distribution.att} />
            <ToTimeSummaryRow label="MTT" values={distribution.mtt} />
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ToTimeSummaryRow({ label, values }: { label: string; values: ToTimeDistribution }) {
  return (
    <tr>
      <td className="border border-[#cbd5e1] bg-white px-2 py-2 text-left text-[11px] font-black text-[#172033]">{label}</td>
      {toTimeOptions.map((code) => (
        <td key={`${label}-${code}`} className="border border-[#cbd5e1] bg-white px-1.5 py-2 text-center text-[11px] font-black text-[#172033]">{values[code].toFixed(2)}%</td>
      ))}
    </tr>
  );
}

function ToTimeLegend() {
  return (
    <section className="h-full rounded-[14px] border border-[#d9dee6] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d6001c]">
            Timing code guide
          </p>
          <h3 className="mt-1 text-lg font-black text-[#172033]">How each timing code is set</h3>
          <p className="mt-1 text-xs font-bold text-[#64748b]">Reference ranges used for DTT, ATT and MTT.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Link
            href="/internal/app-ideas/link-message-mock/configurations/mtt-late-arrival-profiles"
            className="rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#10203a] no-underline transition hover:border-[#d6001c] hover:text-[#d6001c]"
          >
            View profile →
          </Link>
          <div className="flex flex-wrap justify-end gap-1 text-[8px] font-black uppercase tracking-[0.06em]">
            <span className="rounded-full border border-[#1f7a34] bg-[#d9f7e5] px-2 py-1 text-[#166534]">Green = on time / early</span>
            <span className="rounded-full border border-[#c62828] bg-[#fecaca] px-2 py-1 text-[#7f1d1d]">Red = late</span>
            <span className="rounded-full border border-[#6b7280] bg-[#e5e7eb] px-2 py-1 text-[#374151]">Grey = not populated</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {TIMING_PROFILE_BANDS.map((band) => (
          <ToTimeLegendCard
            key={band.id}
            code={band.code}
            description={band.label}
            range={band.range}
          />
        ))}
      </div>
    </section>
  );
}

function ToTimeLegendCard({ code, description, range }: { code: ToTimeCode; description: string; range: string }) {
  return (
    <div className={`flex min-h-[54px] items-start gap-2 rounded-[10px] border px-2 py-2 ${getToTimeCardClass(code)}`}>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-black">
        {code}
      </div>
      <div>
        <p className="text-[11px] font-black leading-4">{description}</p>
        <p className="text-[9px] font-bold leading-4">{range}</p>
      </div>
    </div>
  );
}

function buildToTimeDistribution(rows: DctRow[]): ToTimeDistributionSet {
  const dttCounts = buildZeroToTimeCounts();
  const attCounts = buildZeroToTimeCounts();
  let dttTotal = 0;
  let attTotal = 0;

  rows.forEach((row) => {
    const dtt = getDepartureToTimeCode(row);
    const att = getArrivalToTimeCode(row);

    if (dtt) {
      dttCounts[dtt] += 1;
      dttTotal += 1;
    }

    if (att) {
      attCounts[att] += 1;
      attTotal += 1;
    }
  });

  const dtt = convertCountsToPercentages(dttCounts, dttTotal);
  const att = convertCountsToPercentages(attCounts, attTotal);
  const mtt = buildZeroToTimeCounts();
  toTimeOptions.forEach((code) => {
    mtt[code] = Number(((dtt[code] + att[code]) / 2).toFixed(2));
  });
  return { dtt, att, mtt };
}

function buildZeroToTimeCounts(): ToTimeDistribution {
  return { VE: 0, E: 0, OT: 0, L: 0, VL: 0, F: 0 };
}

function convertCountsToPercentages(counts: ToTimeDistribution, totalRows: number): ToTimeDistribution {
  const safeTotal = totalRows || 1;
  const percentages = buildZeroToTimeCounts();
  toTimeOptions.forEach((code) => {
    percentages[code] = Number(((counts[code] / safeTotal) * 100).toFixed(2));
  });
  return percentages;
}

function getDepartureToTimeCode(row: DctRow): ToTimeCode | null {
  if (row.status !== "Complete" || !row.departureActualTs) {
    return null;
  }

  return classifyToTime(getDifferenceInMinutes(row.plannedDepartureTs, row.departureActualTs));
}

function getArrivalToTimeCode(row: DctRow): ToTimeCode | null {
  if (row.status !== "Complete" || !row.arrivalActualTs) {
    return null;
  }

  return classifyToTime(getDifferenceInMinutes(row.plannedArrivalTs, row.arrivalActualTs));
}

function getDifferenceInMinutes(plannedTs: number, actualTs: number | null) {
  if (!actualTs) {
    return 0;
  }
  return Math.round((actualTs - plannedTs) / 60000);
}

function classifyToTime(diffMinutes: number): ToTimeCode {
  return classifyTimingDifference(diffMinutes) ?? "OT";
}

function formatSignedDifference(plannedTs: number, actualTs: number | null) {
  if (!actualTs) return "-";
  const diffMinutes = Math.round((actualTs - plannedTs) / 60000);
  const sign = diffMinutes > 0 ? "+" : diffMinutes < 0 ? "-" : "";
  const absMinutes = Math.abs(diffMinutes);
  const hours = String(Math.floor(absMinutes / 60)).padStart(2, "0");
  const minutes = String(absMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function getToTimeCardClass(code: ToTimeCode) {
  if (code === "F") return "border-[#7f1d1d] bg-[#fee2e2] text-[#7f1d1d]";
  if (code === "VE" || code === "E") return "border-[#d97706] bg-[#fef3c7] text-[#92400e]";
  if (code === "OT") return "border-[#15803d] bg-[#ecfdf3] text-[#166534]";
  return "border-[#dc2626] bg-[#fee2e2] text-[#991b1b]";
}

function getToTimeCellClass(code: ToTimeCode | null) {
  if (!code) return "bg-[#f3f4f6] text-[#64748b]";
  if (code === "F") return "bg-[#fecaca] text-[#7f1d1d]";
  if (code === "VE" || code === "E") return "bg-[#fef3c7] text-[#92400e]";
  if (code === "OT") return "bg-[#d9f7e5] text-[#166534]";
  return "bg-[#fee2e2] text-[#991b1b]";
}

function getDivisionForRow(row: DctRow): "Pie Haulage" | "Letters" | "Network" {
  if (row.legNumber <= 4) {
    return "Pie Haulage";
  }

  if (row.legNumber === 5) {
    return "Letters";
  }

  return "Network";
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#64748b]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-8 w-full rounded-lg border border-[#cbd5e1] bg-white px-2 text-xs font-bold text-[#172033] outline-none focus:border-[#d6001c]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function buildFilterOptions(values: string[]) {
  return [
    "All",
    ...Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "en-GB", { numeric: true })),
  ];
}

function downloadRows(rows: DctRow[], format: ExportFormat) {
  const headers = [
    "Leg Status",
    "Duty Date",
    "Week Number",
    "Duty Order",
    "Vehicle Reg",
    "Trailer Number",
    "Drivers Name",
    "Division Letters/Network/Contractor",
    "Operator",
    "Duty ID",
    "Vehicle Type",
    "Planz Code",
    "Due To Convey",
    "Departure location",
    "Planned Departure Time",
    "Departure actual time",
    "Departure Diff hh:mm",
    "DTT",
    "Dep Assets",
    "Arrival Location",
    "Planned Arrival Time",
    "Arrival actual time",
    "Arrival Diff hh:mm",
    "ATT",
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
    getOperationalWeekNumberFromDisplayDate(row.startDate),
    row.dutyOrder,
    getVehicleNumberForRow(row),
    row.trailerNumber || "",
    row.userId,
    getDivisionForRow(row),
    row.operator,
    row.dutyId,
    row.trailerType,
    row.planzCode,
    row.dueToConvey,
    row.departureLocation,
    formatDateTime(row.plannedDepartureTs),
    row.departureActualTs ? formatDateTime(row.departureActualTs) : "-",
    formatSignedDifference(row.plannedDepartureTs, row.departureActualTs),
    getDepartureToTimeCode(row) || "-",
    getAssetCountForRow(row),
    row.arrivalLocation,
    formatDateTime(row.plannedArrivalTs),
    row.arrivalActualTs ? formatDateTime(row.arrivalActualTs) : "-",
    formatSignedDifference(row.plannedArrivalTs, row.arrivalActualTs),
    getArrivalToTimeCode(row) || "-",
    getAssetCountForRow(row),
    row.issueCategory || "-",
    row.issues || "-",
    "Track",
    row.gpsDeparture || "-",
    row.gpsArrival || "-",
    "",
  ]);

  const today = new Date().toISOString().slice(0, 10);
  exportTabularData({
    format,
    headers,
    rows: exportRows,
    fileName: `dct-mockup-data-${today}`,
    title: "DCT Mockup Data",
  });
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

function DctRouteMapPanel({ rows, dutyId }: { rows: DctRow[]; dutyId: string }) {
  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];

  return (
    <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.45fr)] xl:items-start">
      <div className="overflow-hidden rounded-[14px] border border-[#d9dee6] bg-white shadow-sm">
        <div className="border-b border-[#e5e7eb] px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d6001c]">Route map mock-up</p>
          <h3 className="mt-1 text-lg font-black text-[#172033]">Duty {dutyId} route view</h3>
        </div>
        <Image
          src={routeMapImage}
          alt="Mock route map"
          className="aspect-[754/446] h-auto w-full object-cover object-center"
          priority
        />
      </div>

      <div className="rounded-[14px] border border-[#d9dee6] bg-white p-3 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d6001c]">Selected duty summary</p>
        <h3 className="mt-1 text-lg font-black text-[#172033]">{dutyId}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <RouteSummaryCard label="Start location" value={firstRow?.departureLocation || "-"} />
          <RouteSummaryCard label="Final destination" value={lastRow?.arrivalLocation || "-"} />
          <RouteSummaryCard label="Planned first departure" value={firstRow ? formatDateTime(firstRow.plannedDepartureTs) : "-"} />
          <RouteSummaryCard label="Planned final arrival" value={lastRow ? formatDateTime(lastRow.plannedArrivalTs) : "-"} />
        </div>
      </div>
    </section>
  );
}

function RouteSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#d6dee8] bg-[#f8fafc] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748b]">{label}</p>
      <p className="mt-1 text-sm font-black leading-5 text-[#172033]">{value || "-"}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#d6dee8] bg-[#f8fafc] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 text-base font-black leading-5 text-[#172033]">{value || "-"}</p>
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
