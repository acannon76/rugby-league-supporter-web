"use client";

import { useMemo, useState } from "react";

import { exportExcelWorkbook, exportTabularData, type ExportFormat } from "../../exportData";

type JourneyComplianceReportProps = {
  locations: string[];
  onSchedule: () => void;
  scheduledCount?: number;
};

type ComplianceRow = {
  site: string;
  trackedJourneys: number;
  linkLegsAdded: number;
  plannedIntermediateEvents: number;
  missingLegs: number;
  compliancePercent: number;
  nonCompliancePercent: number;
};

type RawJourneyRow = {
  operatingSite: string;
  vehicle: string;
  from: string;
  to: string;
  journeyStart: string;
  journeyEnd: string;
  linkDuty: string;
  linkUser: string;
  intermediateEvent: string;
  linkLegAdded: boolean;
  complianceStatus: "Compliant" | "Non-compliant";
  complianceReason: string;
};

const complianceUsers = [
  "Andrew Cannon",
  "Chris Morgan",
  "Daniel Hughes",
  "Emma Williams",
  "James Carter",
  "Lisa Thompson",
  "Mark Davies",
  "Rachel Evans",
] as const;

const complianceVehicles = [
  "PE68UHD",
  "PN70BUA",
  "PJ24SNN",
  "PE18MDN",
  "PF68UVW",
  "PK19VJV",
  "PJ67WJA",
  "PE17HNW",
] as const;

const intermediateLocations = [
  "Charnock Richard Services",
  "Knutsford Services",
  "Keele Services",
  "Sandbach Services",
  "Stafford Services",
] as const;

const mockDestinations = [
  "PRDC",
  "Warrington VOC",
  "Preston VOC",
  "Manchester VOC",
  "Midlands SH VOC",
  "Yorkshire VOC",
] as const;

export function JourneyComplianceReport({
  locations,
  onSchedule,
  scheduledCount = 0,
}: JourneyComplianceReportProps) {
  const range = useMemo(() => getDefaultRange(), []);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<"explanation" | "configuration">("explanation");
  const [startDate, setStartDate] = useState(range.startDate);
  const [endDate, setEndDate] = useState(range.endDate);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(locations);
  const [locationSearch, setLocationSearch] = useState("");
  const [error, setError] = useState("");

  const rawRows = useMemo(
    () => buildRawJourneyRows(startDate, endDate, selectedLocations),
    [endDate, selectedLocations, startDate],
  );

  const rows = useMemo(() => buildComplianceRows(rawRows), [rawRows]);

  const totals = useMemo(() => {
    const trackedJourneys = rows.reduce((total, row) => total + row.trackedJourneys, 0);
    const linkLegsAdded = rows.reduce((total, row) => total + row.linkLegsAdded, 0);
    const plannedIntermediateEvents = rows.reduce((total, row) => total + row.plannedIntermediateEvents, 0);
    const missingLegs = rows.reduce((total, row) => total + row.missingLegs, 0);
    const compliancePercent = trackedJourneys
      ? Number(((linkLegsAdded / trackedJourneys) * 100).toFixed(1))
      : 0;
    const nonCompliancePercent = trackedJourneys
      ? Number(((missingLegs / trackedJourneys) * 100).toFixed(1))
      : 0;

    return {
      trackedJourneys,
      linkLegsAdded,
      plannedIntermediateEvents,
      missingLegs,
      compliancePercent,
      nonCompliancePercent,
    };
  }, [rows]);

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(locationSearch.trim().toLowerCase()),
  );

  const openReport = () => {
    setError("");
    setScreen("explanation");
    setOpen(true);
  };

  const download = async (format: ExportFormat) => {
    if (startDate > endDate) {
      setError("The start date must be before the end date.");
      return;
    }

    if (selectedLocations.length === 0) {
      setError("Select at least one site before downloading the report.");
      return;
    }

    if (rows.length === 0) {
      setError("No compliance data is available for the selected dates and sites.");
      return;
    }

    setError("");

    const summaryHeaders = [
      "Operating Site / VOC",
      "Tracked Vehicle Journeys",
      "LINK Legs Added",
      "Planned Intermediate Events",
      "Missing LINK Legs",
      "Compliance %",
      "Non-Compliance %",
    ];
    const summaryRows = rows.map((row) => [
      row.site,
      row.trackedJourneys,
      row.linkLegsAdded,
      row.plannedIntermediateEvents,
      row.missingLegs,
      `${row.compliancePercent}%`,
      `${row.nonCompliancePercent}%`,
    ]);

    summaryRows.push([
      "REPORT TOTAL",
      totals.trackedJourneys,
      totals.linkLegsAdded,
      totals.plannedIntermediateEvents,
      totals.missingLegs,
      `${totals.compliancePercent}%`,
      `${totals.nonCompliancePercent}%`,
    ]);

    if (format === "excel") {
      await exportExcelWorkbook({
        fileName: `voc-journey-compliance-${startDate}-to-${endDate}`,
        sheets: [
          {
            name: "VOC Summary",
            headers: summaryHeaders,
            rows: summaryRows,
          },
          {
            name: "Raw Journey Data",
            headers: [
              "Operating Site / VOC",
              "Vehicle",
              "From",
              "To",
              "Journey Started",
              "Journey Ended",
              "LINK Duty",
              "LINK User",
              "Intermediate Event",
              "LINK Leg Added",
              "Compliance Status",
              "Compliance Reason",
            ],
            rows: rawRows.map((row) => [
              row.operatingSite,
              row.vehicle,
              row.from,
              row.to,
              row.journeyStart,
              row.journeyEnd,
              row.linkDuty,
              row.linkUser,
              row.intermediateEvent,
              row.linkLegAdded ? "Yes" : "No",
              row.complianceStatus,
              row.complianceReason,
            ]),
          },
        ],
      });
      return;
    }

    exportTabularData({
      format,
      headers: summaryHeaders,
      rows: summaryRows,
      fileName: `voc-journey-compliance-${startDate}-to-${endDate}`,
      title: "VOC Journey Compliance Report",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-black text-[#10203a]">Site &amp; User Journey Compliance Report</p>
            {scheduledCount > 0 ? (
              <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#166534]">
                {scheduledCount} scheduled
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-semibold text-[#4b5563]">
            One summary line per VOC, with tracked journeys matched against LINK legs and detailed raw journey data for investigation
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={openReport}
            className="rounded-xl bg-[#10203a] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558]"
          >
            Select dates and site download
          </button>
          <button
            type="button"
            onClick={onSchedule}
            className="rounded-xl border-2 border-[#0f3a6d] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-[#0f3a6d] transition hover:bg-[#eff6ff]"
          >
            Schedule email
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-compliance-title"
        >
          <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Journey compliance</p>
                <h2 id="journey-compliance-title" className="mt-1 text-2xl font-black">
                  Site &amp; User Journey Compliance Report
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
                aria-label="Close journey compliance report"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(94vh-82px)] overflow-y-auto p-5 sm:p-6">
              {screen === "explanation" ? (
                <ExplanationScreen
                  onContinue={() => {
                    setError("");
                    setScreen("configuration");
                  }}
                  onClose={() => setOpen(false)}
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setScreen("explanation")}
                    className="text-sm font-black text-[#0f3a6d] hover:underline"
                  >
                    ← Back to explanation
                  </button>

                  <div className="mt-4 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3">
                    <p className="text-sm font-black text-[#0f3a6d]">Compliance rule</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-[#1e3a5f]">
                      Every tracked departure from an operational site should have a corresponding LINK leg. Motorway services, fuel stops, workshops and planned trailer swaps remain intermediate events. A planned trailer swap is matched to the existing LINK journey and must not create an additional missing leg.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DateBox label="Start date" value={startDate} min={range.minimumDate} max={range.maximumDate} onChange={setStartDate} />
                    <DateBox label="End date" value={endDate} min={range.minimumDate} max={range.maximumDate} onChange={setEndDate} />
                  </div>

                  <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
                    <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Operating sites</p>
                        <p className="mt-1 text-xs font-bold text-[#4b5563]">
                          {selectedLocations.length} of {locations.length} sites selected
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLocations(locations)}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] ring-1 ring-[#c7d2df]"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLocations([])}
                          className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#10203a] ring-1 ring-[#c7d2df]"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <input
                        value={locationSearch}
                        onChange={(event) => setLocationSearch(event.target.value)}
                        placeholder="Search by site name"
                        className="w-full rounded-xl border border-[#cfd8e3] bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#0f3a6d]"
                      />
                      <div className="mt-3 grid max-h-56 grid-cols-1 overflow-y-auto rounded-xl border border-[#d7dee9] sm:grid-cols-2">
                        {filteredLocations.map((location) => (
                          <label
                            key={location}
                            className="flex cursor-pointer items-center justify-between border-b border-r border-[#e2e8f0] bg-white px-4 py-2.5 text-xs font-black text-[#10203a]"
                          >
                            <span>{location}</span>
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location)}
                              onChange={() =>
                                setSelectedLocations((current) =>
                                  current.includes(location)
                                    ? current.filter((value) => value !== location)
                                    : [...current, location],
                                )
                              }
                              className="h-4 w-4 accent-[#0f3a6d]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </section>

                  <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
                    <SummaryMetric label="Tracked journeys" value={totals.trackedJourneys} />
                    <SummaryMetric label="LINK legs added" value={totals.linkLegsAdded} />
                    <SummaryMetric label="Planned intermediate events" value={totals.plannedIntermediateEvents} />
                    <SummaryMetric label="Missing LINK legs" value={totals.missingLegs} alert />
                    <SummaryMetric label="Compliance" value={`${totals.compliancePercent}%`} />
                    <SummaryMetric label="Non-compliance" value={`${totals.nonCompliancePercent}%`} alert />
                  </div>

                  <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
                    <div className="border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">VOC compliance comparison</p>
                      <p className="mt-1 text-xs font-bold text-[#4b5563]">One line per Vehicle Operating Centre so each office or site can be measured against the others.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[940px] w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#f8fafc] text-left font-black uppercase tracking-[0.08em] text-[#4b5563]">
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Operating site / VOC</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Tracked journeys</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">LINK legs added</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Planned intermediate events</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Missing legs</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Compliance</th>
                            <th className="border-b border-[#e2e8f0] px-3 py-3">Non-compliance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.site} className="odd:bg-white even:bg-[#f8fafc]">
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#10203a]">{row.site}</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold">{row.trackedJourneys}</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold">{row.linkLegsAdded}</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#0f3a6d]">{row.plannedIntermediateEvents}</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#b91c1c]">{row.missingLegs}</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#166534]">{row.compliancePercent}%</td>
                              <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#b91c1c]">{row.nonCompliancePercent}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <div className="mt-4 rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] px-4 py-3 text-sm font-bold leading-6 text-[#4b5563]">
                    The Excel download contains two tabs: <span className="font-black text-[#10203a]">VOC Summary</span> and <span className="font-black text-[#10203a]">Raw Journey Data</span>. The raw tab includes operating site, vehicle, journey origin and destination, start and end times, LINK duty, LINK user and compliance reason.
                  </div>

                  {error ? (
                    <p className="mt-4 rounded-xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">
                      {error}
                    </p>
                  ) : null}

                  <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#6b7280]">Download report as</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(["excel", "csv", "pdf"] as ExportFormat[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => void download(format)}
                        className="rounded-[16px] border border-[#cfd8e3] bg-[#f8fafc] px-4 py-4 text-left text-base font-black uppercase text-[#10203a] transition hover:bg-[#e9eef9]"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ExplanationScreen({ onContinue, onClose }: { onContinue: () => void; onClose: () => void }) {
  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">How the compliance report works</p>
      <h3 className="mt-2 text-2xl font-black text-[#10203a]">Geofence and LINK journey rules</h3>
      <p className="mt-3 text-sm font-bold leading-6 text-[#4b5563]">
        The report compares actual tracked vehicle journeys against the legs entered in LINK, while preventing legitimate intermediate stops from being counted as separate journeys.
      </p>

      <div className="mt-5 space-y-3">
        <RuleCard title="Do not treat every geofence as a journey destination">
          A geofence visit only starts or ends a compliance journey when it is classified as an operational site.
        </RuleCard>
        <RuleCard title="Operational sites can start or end a LINK journey">
          The journey opens when the vehicle leaves the planned operational origin and closes when it reaches the planned operational destination.
        </RuleCard>
        <RuleCard title="Motorway services, fuel and workshops are intermediate stops">
          These stops are recorded within the same journey and do not create a separate missing LINK leg.
        </RuleCard>
        <RuleCard title="A planned trailer swap at motorway services remains compliant">
          When LINK contains a planned trailer-swap activity at the service-area geofence, the swap is attached to the existing origin-to-destination journey. It is recorded as an intermediate event and does not create an additional journey or non-compliance failure.
        </RuleCard>
        <RuleCard title="Compliance is compared one line per VOC">
          The summary shows tracked journeys, LINK legs added, planned intermediate events, missing legs, compliance percentage and non-compliance percentage for each operating site.
        </RuleCard>
      </div>

      <section className="mt-6 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-white">
        <div className="border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Example: planned trailer swap</p>
          <p className="mt-1 text-xs font-bold text-[#4b5563]">The motorway-services visit is part of the same compliant LINK journey.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8fafc] text-left font-black uppercase tracking-[0.08em] text-[#4b5563]">
                <th className="border-b border-[#e2e8f0] px-3 py-3">Operating site</th>
                <th className="border-b border-[#e2e8f0] px-3 py-3">Vehicle</th>
                <th className="border-b border-[#e2e8f0] px-3 py-3">Planned journey</th>
                <th className="border-b border-[#e2e8f0] px-3 py-3">Intermediate event</th>
                <th className="border-b border-[#e2e8f0] px-3 py-3">Result</th>
                <th className="border-b border-[#e2e8f0] px-3 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#10203a]">North West VOC</td>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold">PE68UHD</td>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold">North West VOC → PRDC</td>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold">Charnock Richard Services – planned trailer swap</td>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-black text-[#166534]">Compliant</td>
                <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">Swap is recorded in LINK and treated as an intermediate event</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#cfd8e3] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#4b5563] hover:border-[#0f3a6d]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-[#10203a] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[#1e3558]"
        >
          Continue to dates and sites
        </button>
      </div>
    </section>
  );
}

function RuleCard({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-sm font-black text-[#166534]">✓</span>
        <div>
          <p className="text-sm font-black text-[#10203a]">{title}</p>
          <p className="mt-1 text-sm font-bold leading-6 text-[#4b5563]">{children}</p>
        </div>
      </div>
    </div>
  );
}

function DateBox({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-[16px] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <legend className="px-2 text-sm font-black text-[#10203a]">{label}</legend>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#cfd8e3] bg-white px-3 py-3 text-sm font-black outline-none focus:border-[#0f3a6d]"
      />
    </fieldset>
  );
}

function SummaryMetric({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string | number;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-[16px] border px-4 py-3 ${alert ? "border-[#fecaca] bg-[#fff1f2]" : "border-[#d7dee9] bg-[#f8fafc]"}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${alert ? "text-[#991b1b]" : "text-[#6b7280]"}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${alert ? "text-[#b91c1c]" : "text-[#10203a]"}`}>{value}</p>
    </div>
  );
}

function getDefaultRange() {
  const today = toDateValue(new Date());
  const endDate = addDays(today, -1);
  const startDate = addDays(endDate, -6);
  const minimumDate = addDays(today, -30);

  return {
    startDate,
    endDate,
    minimumDate,
    maximumDate: today,
  };
}

function buildRawJourneyRows(startDate: string, endDate: string, locations: string[]): RawJourneyRow[] {
  if (!startDate || !endDate || startDate > endDate || locations.length === 0) {
    return [];
  }

  const dayCount = Math.max(1, daysBetween(startDate, endDate) + 1);
  const rows: RawJourneyRow[] = [];

  locations.forEach((site, siteIndex) => {
    for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
      const date = addDays(startDate, dayIndex);
      const dailySeed = stableHash(`${site}-${date}`);
      const journeyCount = 8 + (dailySeed % 9);

      for (let journeyIndex = 0; journeyIndex < journeyCount; journeyIndex += 1) {
        const seed = stableHash(`${site}-${date}-${journeyIndex}`);
        const vehicle = complianceVehicles[(siteIndex + dayIndex + journeyIndex) % complianceVehicles.length];
        const user = complianceUsers[(siteIndex + dayIndex + journeyIndex) % complianceUsers.length];
        const destination = getDifferentDestination(site, seed);
        const startMinutes = 60 + ((seed + journeyIndex * 79) % 1200);
        const durationMinutes = 40 + (seed % 155);
        const plannedTrailerSwap = seed % 9 === 0;
        const intermediateStop = !plannedTrailerSwap && seed % 7 === 0;
        const missingLinkLeg = !plannedTrailerSwap && seed % 13 === 0;
        const intermediateLocation = intermediateLocations[seed % intermediateLocations.length];
        const trailerOne = 7330228 + (seed % 40);
        const trailerTwo = 7330228 + ((seed + 11) % 40);
        const linkDuty = missingLinkLeg ? "Not entered" : `${siteCode(site)}${String((seed % 900) + 100)}`;
        const intermediateEvent = plannedTrailerSwap
          ? `${intermediateLocation} – planned trailer swap ${trailerOne} to ${trailerTwo}`
          : intermediateStop
            ? `${intermediateLocation} – intermediate driver stop`
            : "None";
        const complianceReason = missingLinkLeg
          ? "No matching LINK leg was entered for the tracked vehicle journey"
          : plannedTrailerSwap
            ? "Planned trailer swap recorded in LINK and treated as an intermediate event within the same journey"
            : intermediateStop
              ? "Non-endpoint geofence stop ignored for journey endpoint compliance"
              : "Tracked journey matched to a LINK leg";

        rows.push({
          operatingSite: site,
          vehicle,
          from: site,
          to: destination,
          journeyStart: formatJourneyDateTime(date, startMinutes),
          journeyEnd: formatJourneyDateTime(date, startMinutes + durationMinutes),
          linkDuty,
          linkUser: missingLinkLeg ? "Not entered" : user,
          intermediateEvent,
          linkLegAdded: !missingLinkLeg,
          complianceStatus: missingLinkLeg ? "Non-compliant" : "Compliant",
          complianceReason,
        });
      }
    }
  });

  return rows.sort((left, right) =>
    left.operatingSite.localeCompare(right.operatingSite) || left.journeyStart.localeCompare(right.journeyStart),
  );
}

function buildComplianceRows(rawRows: RawJourneyRow[]): ComplianceRow[] {
  const aggregated = new Map<string, Omit<ComplianceRow, "compliancePercent" | "nonCompliancePercent">>();

  rawRows.forEach((journey) => {
    const current = aggregated.get(journey.operatingSite) ?? {
      site: journey.operatingSite,
      trackedJourneys: 0,
      linkLegsAdded: 0,
      plannedIntermediateEvents: 0,
      missingLegs: 0,
    };

    current.trackedJourneys += 1;
    current.linkLegsAdded += journey.linkLegAdded ? 1 : 0;
    current.missingLegs += journey.linkLegAdded ? 0 : 1;
    current.plannedIntermediateEvents += journey.intermediateEvent.includes("planned trailer swap") ? 1 : 0;
    aggregated.set(journey.operatingSite, current);
  });

  return Array.from(aggregated.values())
    .map((row) => ({
      ...row,
      compliancePercent: row.trackedJourneys
        ? Number(((row.linkLegsAdded / row.trackedJourneys) * 100).toFixed(1))
        : 0,
      nonCompliancePercent: row.trackedJourneys
        ? Number(((row.missingLegs / row.trackedJourneys) * 100).toFixed(1))
        : 0,
    }))
    .sort((left, right) =>
      right.nonCompliancePercent - left.nonCompliancePercent || left.site.localeCompare(right.site),
    );
}

function getDifferentDestination(site: string, seed: number) {
  const options = mockDestinations.filter((destination) => destination.toLowerCase() !== site.toLowerCase());
  return options[seed % options.length] ?? "PRDC";
}

function siteCode(site: string) {
  const code = site
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return code.slice(0, 4) || "VOC";
}

function formatJourneyDateTime(dateValue: string, minutesFromMidnight: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setMinutes(minutesFromMidnight);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function daysBetween(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateValue(date);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
