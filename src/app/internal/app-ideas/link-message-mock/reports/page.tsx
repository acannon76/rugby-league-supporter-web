"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { exportTabularData, type ExportFormat } from "../../exportData";
import { downloadNetworkPerformancePdf } from "./networkPerformancePdf";
import { NationalLocalPlanReport } from "./NationalLocalPlanReport";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type NetworkPerformanceRow = {
  id: string;
  reportingSite: string;
  debriefStatus: "Debriefed";
  legState: "Complete";
  dutyDate: string;
  weekNumber: number;
  dutyOrder: number;
  dutyNumber: string;
  division: "Network";
  driver: string;
  vehicle: string;
  trailerNumber: string;
  traffic: string;
  departureLocation: string;
  plannedStartTs: string;
  actualStartTs: string;
  startDifference: string;
  dtt: TimingCode;
  departureAssets: number;
  finalDestination: string;
  plannedFinishTs: string;
  actualFinishTs: string;
  finishDifference: string;
  att: TimingCode;
  arrivalAssets: number;
  issueCategory: string;
  driverNotes: string;
  outcome: "Complete" | "Part Complete";
  debriefedBy: string;
  debriefedAtTs: string;
};

type TimingCode = "VE" | "E" | "OT" | "L" | "VL" | "F";

type BaseLeg = {
  dutyNumber: string;
  dutyOrder: number;
  traffic: string;
  departureLocation: string;
  finalDestination: string;
  plannedStartMinutes: number;
  durationMinutes: number;
  departureAssets: number;
  arrivalAssets: number;
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
];

type DynamicReportRange = {
  today: string;
  startDate: string;
  endDate: string;
  dates: string[];
};

const drivers = [
  "Andrew Cannon",
  "Chris Morgan",
  "Daniel Hughes",
  "Emma Williams",
  "James Carter",
  "Lisa Thompson",
  "Mark Davies",
  "Rachel Evans",
];

const vehicles = [
  "PE68UHD",
  "PN74CDY",
  "MX73BWW",
  "PN25MHS",
  "MX21DCT",
  "PX25HUB",
  "PN70BUA",
  "MX74FDN",
];

const trailers = [
  "7338014",
  "24316007",
  "4318005",
  "24160021",
  "20316087",
  "7338015",
  "5320233",
  "24163445",
];

const availableLocations = [
  "Aberdeen MC",
  "ABERDEEN VOC",
  "Agency - ADM South",
  "Agency Central (Coventry Hub and NDC)",
  "Agency Drivers",
  "Atherstone VOC",
  "Belfast MC",
  "BELFAST VOC",
  "Birmingham MC (VOC)",
  "BIRMINGHAM VOC",
  "Bridgend VOC",
  "Bristol Mini VOC",
  "Carlisle VOC",
  "Chelmsford (SEAMAC) MC",
  "CHELMSFORD VOC",
  "CHORLEY NORTHERN HUB VOC",
  "Chorley VOC",
  "Coventry National Hub",
  "COVENTRY NATIONAL HUB VOC",
  "Croydon MC (VOC)",
  "CROYDON VOC",
  "Doncaster MC",
  "East London DC",
  "East Mids VOC",
  "Edinburgh MC (VOC)",
  "EDINBURGH VOC",
  "ELDCVOC",
  "Exeter VOC",
  "Gatwick MC (VOC)",
  "GATWICK VOC",
  "Glasgow MC",
  "GLASGOW VOC",
  "Greenford MC/VOC",
  "GREENFORD VOC",
  "HATFIELD PROCESSING CENTRE VOC",
  "HEATHROW WORLDWIDE DC VOC",
  "HIXVOC",
  "HWDC",
  "Inverness MC",
  "INVERNESS VOC",
  "Manchester VOC",
  "MIDLANDS SUPER HUB VOC",
  "NATIONAL DC VOC",
  "NDC",
  "NEDC",
  "New Installs",
  "NHCDC",
  "North West Hub",
  "NORTH WEST SUPER HUB VOC",
  "Norwich MC (VOC)",
  "NORWICH VOC",
  "Perth LD",
  "Peterborough MC (VOC)",
  "PETERBOROUGH VOC",
  "PRDC",
  "PRINCESS ROYAL DC VOC",
  "PRVOC",
  "Roborough VOC",
  "SCOTTISH DC VOC",
  "SDC",
  "Sheffield MC",
  "SOUTH EAST DC VOC",
  "South East WBC (Rochester)",
  "SOUTH WEST DC VOC",
  "Southampton VOC",
  "SWDC",
  "Swindon VOC",
  "Trailers - National Pool",
  "Warrington VOC",
  "WOKING DC VOC",
  "Woking VOC",
  "Wolverhampton MC",
  "YDC",
  "YDC Stourton VOC",
  "YORKSHIRE DC VOC",
  "YPC VOC",
] as const;
const dueToConveyOptions = [
  "1C 24 Mail",
  "2C 48 Mail",
  "Collection",
  "Container Repatriation",
  "D2D",
  "Delievery",
  "Empty",
  "Flex",
  "HV Returns",
  "International",
  "PF 24Parcels",
  "PF 48 Parcels",
  "RDC 24 Tracked",
  "RDC 48 Tracked",
  "RDC Presort",
  "RDC Tracked",
  "RM Relay",
  "Shunting",
  "Tracked",
  "TRacked Collection",
  "ULD Repatriation",
  "Unit Only",
] as const;


const nationalPartnerLocations = [
  "National Distribution Centre",
  "Midlands Super Hub",
  "North West Hub",
  "Princess Royal Distribution Centre",
  "Yorkshire Distribution Centre",
  "South East Distribution Centre",
];

const baseLegs: BaseLeg[] = [
  {
    dutyNumber: "NWH254",
    dutyOrder: 1,
    traffic: "1C 24 Mail",
    departureLocation: "North West Hub",
    finalDestination: "Manchester Mail Centre",
    plannedStartMinutes: 6 * 60,
    durationMinutes: 50,
    departureAssets: 34,
    arrivalAssets: 34,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 2,
    traffic: "2C 48 Mail",
    departureLocation: "Manchester Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 7 * 60 + 20,
    durationMinutes: 40,
    departureAssets: 43,
    arrivalAssets: 41,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 3,
    traffic: "Empty",
    departureLocation: "North West Hub",
    finalDestination: "Chester Mail Centre",
    plannedStartMinutes: 9 * 60,
    durationMinutes: 50,
    departureAssets: 52,
    arrivalAssets: 48,
  },
  {
    dutyNumber: "NWH254",
    dutyOrder: 4,
    traffic: "PF 24 Parcels",
    departureLocation: "Chester Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 10 * 60 + 20,
    durationMinutes: 55,
    departureAssets: 46,
    arrivalAssets: 50,
  },
  {
    dutyNumber: "NWH426",
    dutyOrder: 1,
    traffic: "Container Retriation",
    departureLocation: "North West Hub",
    finalDestination: "Preston Mail Centre",
    plannedStartMinutes: 12 * 60 + 15,
    durationMinutes: 45,
    departureAssets: 61,
    arrivalAssets: 58,
  },
  {
    dutyNumber: "NWH426",
    dutyOrder: 2,
    traffic: "Collection",
    departureLocation: "Preston Mail Centre",
    finalDestination: "North West Hub",
    plannedStartMinutes: 13 * 60 + 30,
    durationMinutes: 50,
    departureAssets: 55,
    arrivalAssets: 63,
  },
];

const startOffsetPattern = [-4, 2, 11, -7, 18, 5, 0, -12, 7, 14, -2, 4, 9, -5, 22, 3, -8, 6, 12, 1, -3, 8, -6, 16, 4, -1, 10, -9, 5, 13];
const finishOffsetPattern = [3, -2, 16, -5, 24, 7, 1, -8, 11, 19, -4, 6, 13, -3, 28, 4, -7, 9, 15, 2, -1, 12, -4, 21, 5, 0, 14, -6, 8, 18];

export default function ReportsPage() {
  const [reportRange, setReportRange] = useState<DynamicReportRange | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("00:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([...availableLocations]);
  const [selectedDueToConvey, setSelectedDueToConvey] = useState<string[]>([...dueToConveyOptions]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextRange = getDynamicReportRange();
      setReportRange(nextRange);
      setStartDate(nextRange.startDate);
      setEndDate(nextRange.endDate);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const networkPerformanceRows = useMemo(
    () => (reportRange ? buildNetworkPerformanceRows(reportRange.dates) : []),
    [reportRange],
  );

  const selectedRows = useMemo(
    () =>
      filterReportRows(
        networkPerformanceRows,
        startDate,
        startTime,
        endDate,
        endTime,
        selectedLocations,
        selectedDueToConvey,
      ),
    [networkPerformanceRows, startDate, startTime, endDate, endTime, selectedLocations, selectedDueToConvey],
  );

  const toggleLocation = (location: string) => {
    setSelectedLocations((currentLocations) =>
      currentLocations.includes(location)
        ? currentLocations.filter((currentLocation) => currentLocation !== location)
        : [...currentLocations, location],
    );
  };

  const selectAllLocations = () => {
    setSelectedLocations([...availableLocations]);
  };

  const clearAllLocations = () => {
    setSelectedLocations([]);
  };

  const toggleDueToConvey = (value: string) => {
    setSelectedDueToConvey((currentValues) =>
      currentValues.includes(value)
        ? currentValues.filter((currentValue) => currentValue !== value)
        : [...currentValues, value],
    );
  };

  const selectAllDueToConvey = () => {
    setSelectedDueToConvey([...dueToConveyOptions]);
  };

  const clearAllDueToConvey = () => {
    setSelectedDueToConvey([]);
  };

  const openReport = () => {
    if (!reportRange) {
      return;
    }

    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeReport = () => {
    setErrorMessage("");
    setIsModalOpen(false);
  };

  const downloadReport = (format: ExportFormat) => {
    if (!reportRange) {
      setErrorMessage("The current report date range is still being prepared.");
      return;
    }

    const startTs = `${startDate}T${startTime}:00`;
    const endTs = `${endDate}T${endTime}:59`;

    if (startTs > endTs) {
      setErrorMessage("The start date and time must be before the end date and time.");
      return;
    }

    if (selectedLocations.length === 0) {
      setErrorMessage("Select at least one site before downloading the report.");
      return;
    }

    if (selectedDueToConvey.length === 0) {
      setErrorMessage("Select at least one Due to Convey option before downloading the report.");
      return;
    }

    if (selectedRows.length === 0) {
      setErrorMessage("No completed debriefs are available in the selected date and time range.");
      return;
    }

    setErrorMessage("");
    exportNetworkPerformanceRows(selectedRows, format, startDate, startTime, endDate, endTime);
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Reports" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <section className="rounded-[24px] border border-[#d6dde8] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Reporting suite</p>
                <h1 className="mt-2 text-3xl font-black text-[#10203a]">Reports</h1>
                <p className="mt-3 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                  Select a report, choose the required date and time range, then download the underlying completed debrief data in Excel, CSV or PDF format.
                </p>
              </div>

              <div>
                <SummaryCard label="Reports available" value="2" />
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#cfd8e3] bg-[#f8fafc] p-4 sm:p-5">
              <div className="min-w-0">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#10203a] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      National reporting suite
                    </span>
                    <span className="rounded-full bg-[#eaf7ef] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#166534] ring-1 ring-[#86c99a]">
                      Available
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-[#10203a]">National Reports</h2>
                  <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-[#4b5563]">
                    Select the required national report, choose the date, time and reporting sites, then download the completed debrief data.
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#6b7280]">
                    {reportRange
                      ? `Available data: ${formatDateOnly(reportRange.startDate)} 00:00 to ${formatDateOnly(reportRange.endDate)} 23:59`
                      : "Preparing the latest five completed days"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <ReportActionCard onOpen={openReport} disabled={!reportRange} />
                  <ReportDetail label="Available formats" value="Excel, CSV and PDF" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <NationalLocalPlanReport locations={[...availableLocations]} />
                  <ReportDetail label="Available formats" value="Excel, CSV and PDF" />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-dashed border-[#c7d2df] bg-white px-5 py-6 text-center">
              <p className="text-sm font-black text-[#10203a]">Additional national reports can be added beneath the existing reports as the reporting suite develops.</p>
            </div>
          </section>
        </main>
      </div>

      {isModalOpen ? (
        <ReportDownloadModal
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          availableStartDate={reportRange?.startDate || ""}
          availableEndDate={reportRange?.endDate || ""}
          locations={[...availableLocations]}
          selectedLocations={selectedLocations}
          dueToConveyOptions={[...dueToConveyOptions]}
          selectedDueToConvey={selectedDueToConvey}
          errorMessage={errorMessage}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndDateChange={setEndDate}
          onEndTimeChange={setEndTime}
          onToggleLocation={toggleLocation}
          onSelectAllLocations={selectAllLocations}
          onClearAllLocations={clearAllLocations}
          onToggleDueToConvey={toggleDueToConvey}
          onSelectAllDueToConvey={selectAllDueToConvey}
          onClearAllDueToConvey={clearAllDueToConvey}
          onClose={closeReport}
          onDownload={downloadReport}
        />
      ) : null}
    </div>
  );
}

function ReportDownloadModal({
  startDate,
  startTime,
  endDate,
  endTime,
  availableStartDate,
  availableEndDate,
  locations,
  selectedLocations,
  dueToConveyOptions,
  selectedDueToConvey,
  errorMessage,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onToggleLocation,
  onSelectAllLocations,
  onClearAllLocations,
  onToggleDueToConvey,
  onSelectAllDueToConvey,
  onClearAllDueToConvey,
  onClose,
  onDownload,
}: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  availableStartDate: string;
  availableEndDate: string;
  locations: string[];
  selectedLocations: string[];
  dueToConveyOptions: string[];
  selectedDueToConvey: string[];
  errorMessage: string;
  onStartDateChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onToggleLocation: (location: string) => void;
  onSelectAllLocations: () => void;
  onClearAllLocations: () => void;
  onToggleDueToConvey: (value: string) => void;
  onSelectAllDueToConvey: () => void;
  onClearAllDueToConvey: () => void;
  onClose: () => void;
  onDownload: (format: ExportFormat) => void;
}) {
  const [locationSearch, setLocationSearch] = useState("");
  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(locationSearch.trim().toLowerCase()),
  );
  const allLocationsSelected = selectedLocations.length === locations.length;
  const allDueToConveySelected = selectedDueToConvey.length === dueToConveyOptions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="network-report-title">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Report download</p>
            <h2 id="network-report-title" className="mt-1 text-2xl font-black">Network Performance Report</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
            aria-label="Close report download"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-6">
          <p className="text-sm font-bold leading-6 text-[#4b5563]">
            Choose the start and end date and time, then select one or more sites and Due to Convey options. The download will contain only completed debrief records that match every selection.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateTimePanel
              title="Start"
              date={startDate}
              time={startTime}
              minDate={availableStartDate}
              maxDate={availableEndDate}
              onDateChange={onStartDateChange}
              onTimeChange={onStartTimeChange}
            />
            <DateTimePanel
              title="End"
              date={endDate}
              time={endTime}
              minDate={availableStartDate}
              maxDate={availableEndDate}
              onDateChange={onEndDateChange}
              onTimeChange={onEndTimeChange}
            />
          </div>

          <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
            <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Available locations</p>
                <p className="mt-1 text-xs font-bold text-[#4b5563]">
                  {selectedLocations.length} of {locations.length} sites selected
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] ring-1 ring-[#c7d2df]">
                  <input
                    type="checkbox"
                    checked={allLocationsSelected}
                    onChange={() => (allLocationsSelected ? onClearAllLocations() : onSelectAllLocations())}
                    className="h-4 w-4 accent-[#0f3a6d]"
                  />
                  Select all
                </label>
                <button
                  type="button"
                  onClick={onClearAllLocations}
                  className="rounded-lg border border-[#c7d2df] bg-white px-3 py-2 text-xs font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="p-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Search locations</span>
                <input
                  type="search"
                  value={locationSearch}
                  onChange={(event) => setLocationSearch(event.target.value)}
                  placeholder="Search by location name"
                  className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-bold text-[#10203a] outline-none focus:border-[#0f3a6d]"
                />
              </label>

              <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-[#d7dee9] bg-white">
                {filteredLocations.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {filteredLocations.map((location, index) => {
                      const checked = selectedLocations.includes(location);

                      return (
                        <label
                          key={location}
                          className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-sm font-bold text-[#10203a] transition hover:bg-[#eef4ff] ${
                            index % 2 === 0 ? "bg-[#f4f6ff]" : "bg-white"
                          } border-b border-[#e5eaf2] lg:border-r`}
                        >
                          <span className="min-w-0 break-words">{location}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggleLocation(location)}
                            className="h-4 w-4 shrink-0 accent-[#0f3a6d]"
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="px-4 py-8 text-center text-sm font-bold text-[#6b7280]">No locations match that search.</p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
            <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Due to Convey</p>
                <p className="mt-1 text-xs font-bold text-[#4b5563]">Choose one or more traffic types to include in the download.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] ring-1 ring-[#c7d2df]">
                  <input
                    type="checkbox"
                    checked={allDueToConveySelected}
                    onChange={() => (allDueToConveySelected ? onClearAllDueToConvey() : onSelectAllDueToConvey())}
                    className="h-4 w-4 accent-[#0f3a6d]"
                  />
                  Select all
                </label>
                <button
                  type="button"
                  onClick={onClearAllDueToConvey}
                  className="rounded-lg border border-[#c7d2df] bg-white px-3 py-2 text-xs font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-px bg-[#d7dee9] sm:grid-cols-2 lg:grid-cols-3">
              {dueToConveyOptions.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center justify-between gap-4 bg-white px-4 py-3 text-sm font-bold text-[#10203a] transition hover:bg-[#eef4ff]"
                >
                  <span>{value}</span>
                  <input
                    type="checkbox"
                    checked={selectedDueToConvey.includes(value)}
                    onChange={() => onToggleDueToConvey(value)}
                    className="h-4 w-4 shrink-0 accent-[#0f3a6d]"
                  />
                </label>
              ))}
            </div>
          </section>

          {errorMessage ? (
            <div className="mt-4 rounded-[14px] border border-[#ef4444] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">Download data as</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FormatButton label="Excel" detail="Spreadsheet data" onClick={() => onDownload("excel")} />
              <FormatButton label="CSV" detail="Comma-separated data" onClick={() => onDownload("csv")} />
              <FormatButton label="PDF" detail="Printable data document" onClick={() => onDownload("pdf")} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#cfd8e3] bg-white px-5 py-2.5 text-sm font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateTimePanel({
  title,
  date,
  time,
  minDate,
  maxDate,
  onDateChange,
  onTimeChange,
}: {
  title: string;
  date: string;
  time: string;
  minDate: string;
  maxDate: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <fieldset className="rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4">
      <legend className="px-2 text-sm font-black text-[#10203a]">{title} date and time</legend>
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_130px]">
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Date</span>
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Time</span>
          <input
            type="time"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
      </div>
    </fieldset>
  );
}

function FormatButton({ label, detail, onClick }: { label: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[16px] border border-[#cfd8e3] bg-[#f8fafc] px-4 py-4 text-left transition hover:border-[#0f3a6d] hover:bg-[#eff6ff]"
    >
      <span className="block text-lg font-black text-[#10203a]">{label}</span>
      <span className="mt-1 block text-xs font-bold text-[#4b5563]">{detail}</span>
    </button>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[135px] rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function ReportActionCard({ onOpen, disabled }: { onOpen: () => void; disabled: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Network Performance Report</p>
        <p className="mt-1 text-sm font-black text-[#10203a]">Completed debrief performance by selected national sites</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className="shrink-0 rounded-xl bg-[#10203a] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558] disabled:cursor-wait disabled:opacity-50"
      >
        Select dates and site download
      </button>
    </div>
  );
}

function ReportDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-1 text-sm font-black text-[#10203a]">{value}</p>
    </div>
  );
}

function buildNetworkPerformanceRows(dates: string[]): NetworkPerformanceRow[] {
  return dates.flatMap((dutyDate, dayIndex) =>
    availableLocations.flatMap((reportingSite, siteIndex) =>
      baseLegs.slice(0, 2).map((_, legIndex) => {
        const rowIndex = dayIndex * availableLocations.length * 2 + siteIndex * 2 + legIndex;
        const startOffset = startOffsetPattern[rowIndex % startOffsetPattern.length];
        const finishOffset = finishOffsetPattern[rowIndex % finishOffsetPattern.length];
        const plannedStartMinutes = 120 + ((siteIndex * 17 + legIndex * 75) % 1_140);
        const durationMinutes = 40 + ((siteIndex + legIndex * 7) % 31);
        const plannedStartTs = buildTimestamp(dutyDate, plannedStartMinutes);
        const actualStartTs = buildTimestamp(dutyDate, plannedStartMinutes + startOffset);
        const plannedFinishTs = buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes);
        const actualFinishTs = buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes + finishOffset);
        const issueCategory = finishOffset >= 9 ? "Late Arrival" : startOffset >= 9 ? "Late Departure" : "No Issue";
        const outcome = finishOffset >= 21 ? "Part Complete" : "Complete";
        const partnerLocation = nationalPartnerLocations[siteIndex % nationalPartnerLocations.length];
        const departureLocation = legIndex === 0 ? reportingSite : partnerLocation;
        const finalDestination = legIndex === 0 ? partnerLocation : reportingSite;
        const dutyNumber = `${buildSiteCode(reportingSite)}${String((siteIndex % 700) + 100).padStart(3, "0")}`;

        return {
          id: `${dutyDate}-${siteIndex}-${legIndex}`,
          reportingSite,
          debriefStatus: "Debriefed",
          legState: "Complete",
          dutyDate,
          weekNumber: getWeekNumberFromAprilFirst(dutyDate),
          dutyOrder: legIndex + 1,
          dutyNumber,
          division: "Network",
          driver: drivers[(dayIndex + siteIndex + legIndex) % drivers.length],
          vehicle: vehicles[(dayIndex * 2 + siteIndex + legIndex) % vehicles.length],
          trailerNumber: trailers[(dayIndex * 3 + siteIndex * 2 + legIndex) % trailers.length],
          traffic: dueToConveyOptions[(dayIndex + siteIndex * 2 + legIndex) % dueToConveyOptions.length],
          departureLocation,
          plannedStartTs,
          actualStartTs,
          startDifference: formatDifference(startOffset),
          dtt: getTimingCode(startOffset),
          departureAssets: clampAssetValue(18 + ((siteIndex * 7 + dayIndex * 3 + legIndex * 11) % 78)),
          finalDestination,
          plannedFinishTs,
          actualFinishTs,
          finishDifference: formatDifference(finishOffset),
          att: getTimingCode(finishOffset),
          arrivalAssets: clampAssetValue(12 + ((siteIndex * 5 + dayIndex * 4 + legIndex * 13) % 84)),
          issueCategory,
          driverNotes: buildDriverNotes(issueCategory, finalDestination),
          outcome,
          debriefedBy: (dayIndex + siteIndex) % 2 === 0 ? "Peter Finch" : "Sarah Mitchell",
          debriefedAtTs: buildTimestamp(dutyDate, plannedStartMinutes + durationMinutes + finishOffset + 20),
        };
      }),
    ),
  );
}


function getDynamicReportRange(): DynamicReportRange {
  const today = getDateInTimeZone("Europe/London");
  const dates = Array.from({ length: 5 }, (_, index) => addDays(today, index - 5));

  return {
    today,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    dates,
  };
}

function getDateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return `${year}-${month}-${day}`;
}

function addDays(dateInput: string, dayOffset: number) {
  const [year, month, day] = dateInput.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + dayOffset);

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function filterReportRows(
  rows: NetworkPerformanceRow[],
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
  selectedLocations: string[],
  selectedDueToConvey: string[],
) {
  const startTs = `${startDate}T${startTime}:00`;
  const endTs = `${endDate}T${endTime}:59`;

  if (
    !startDate ||
    !startTime ||
    !endDate ||
    !endTime ||
    startTs > endTs ||
    selectedLocations.length === 0 ||
    selectedDueToConvey.length === 0
  ) {
    return [];
  }

  const selectedLocationSet = new Set(selectedLocations);
  const selectedDueToConveySet = new Set(selectedDueToConvey);

  return rows.filter(
    (row) =>
      row.actualFinishTs >= startTs &&
      row.actualFinishTs <= endTs &&
      selectedLocationSet.has(row.reportingSite) &&
      selectedDueToConveySet.has(row.traffic),
  );
}

function exportNetworkPerformanceRows(
  rows: NetworkPerformanceRow[],
  format: ExportFormat,
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
) {
  if (format === "pdf") {
    downloadNetworkPerformancePdf({
      rows,
      fileName: `network-performance-report-${startDate}-to-${endDate}.pdf`,
      startDate,
      startTime,
      endDate,
      endTime,
    });
    return;
  }

  const headers = [
    "Reporting Site",
    "Debrief Status",
    "Leg State",
    "Duty Date",
    "Week Number",
    "Duty Order",
    "Duty Number",
    "Division",
    "Driver",
    "Vehicle",
    "Trailer Number",
    "Due to Convey",
    "Departure Location",
    "Planned Start",
    "Actual Start",
    "Start Diff hh:mm",
    "DTT",
    "Dep Assets",
    "Final Destination",
    "Planned Finish",
    "Actual Finish",
    "Finish Diff hh:mm",
    "ATT",
    "Arr Assets",
    "Issue Category",
    "Driver Notes",
    "Outcome",
    "Debriefed By",
    "Debriefed At",
  ];

  const exportRows = rows.map((row) => [
    row.reportingSite,
    row.debriefStatus,
    row.legState,
    formatDateOnly(row.dutyDate),
    row.weekNumber,
    row.dutyOrder,
    row.dutyNumber,
    row.division,
    row.driver,
    row.vehicle,
    row.trailerNumber,
    row.traffic,
    row.departureLocation,
    formatDateTime(row.plannedStartTs),
    formatDateTime(row.actualStartTs),
    row.startDifference,
    row.dtt,
    row.departureAssets,
    row.finalDestination,
    formatDateTime(row.plannedFinishTs),
    formatDateTime(row.actualFinishTs),
    row.finishDifference,
    row.att,
    row.arrivalAssets,
    row.issueCategory,
    row.driverNotes,
    row.outcome,
    row.debriefedBy,
    formatDateTime(row.debriefedAtTs),
  ]);

  exportTabularData({
    format,
    headers,
    rows: exportRows,
    fileName: `network-performance-report-${startDate}-to-${endDate}`,
    title: "Network Performance Report",
  });
}

function buildTimestamp(dateInput: string, totalMinutes: number) {
  const date = new Date(`${dateInput}T00:00:00`);
  date.setMinutes(totalMinutes);
  return `${formatInputDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`;
}

function formatInputDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string) {
  return `${formatDateOnly(value)} ${value.slice(11, 16)}`;
}

function formatDifference(minutes: number) {
  const sign = minutes > 0 ? "+" : minutes < 0 ? "-" : "";
  const absoluteMinutes = Math.abs(minutes);
  return `${sign}${String(Math.floor(absoluteMinutes / 60)).padStart(2, "0")}:${String(absoluteMinutes % 60).padStart(2, "0")}`;
}

function getTimingCode(minutes: number): TimingCode {
  if (minutes <= -31) {
    return "VE";
  }

  if (minutes <= -9) {
    return "E";
  }

  if (minutes <= 8) {
    return "OT";
  }

  if (minutes <= 30) {
    return "L";
  }

  if (minutes < 120) {
    return "VL";
  }

  return "F";
}

function getWeekNumberFromAprilFirst(dateInput: string) {
  const date = new Date(`${dateInput}T00:00:00`);
  const aprilFirst = new Date(`${date.getFullYear()}-04-01T00:00:00`);
  const differenceDays = Math.floor((date.getTime() - aprilFirst.getTime()) / 86_400_000);
  return Math.floor(differenceDays / 7) + 1;
}

function clampAssetValue(value: number) {
  return Math.max(0, Math.min(95, value));
}

function buildSiteCode(site: string) {
  const words = site.toUpperCase().match(/[A-Z0-9]+/g) || ["NAT"];
  const initials = words.map((word) => word[0]).join("");
  const compactCode = initials.length >= 3 ? initials.slice(0, 3) : words.join("").slice(0, 3);

  return compactCode.padEnd(3, "X");
}

function buildDriverNotes(issueCategory: string, destination: string) {
  if (issueCategory === "Late Departure") {
    return "Driver confirmed a short loading delay before departure. Duty completed and debrief closed.";
  }

  if (issueCategory === "Late Arrival") {
    return `Driver reported traffic congestion approaching ${destination}. Duty completed and timings confirmed.`;
  }

  return "Driver confirmed the leg was completed as planned with no operational issues.";
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
          ← Back to PDA Home
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
