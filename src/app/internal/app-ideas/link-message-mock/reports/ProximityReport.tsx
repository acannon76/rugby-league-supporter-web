"use client";

import { useMemo, useState } from "react";

import { exportTabularData, type ExportFormat } from "../../exportData";

type ProximityReportProps = {
  locations: string[];
  onSchedule: () => void;
  scheduledCount?: number;
};

type ProximityRow = {
  location: string;
  eventDateTime: string;
  vehicle: string;
  registration: string;
  trailer: string;
  driver: string;
  duty: string;
  distanceMetres: number;
  speedKph: number;
  latitude: number;
  longitude: number;
};

const vehicleResources = [
  { vehicle: "MSH006", registration: "KS24JWD", trailer: "24250266", driver: "Steven Hilton", duty: "MSH639" },
  { vehicle: "MSH015", registration: "PN74CEU", trailer: "24250225", driver: "Trevor Henry", duty: "MSH113a" },
  { vehicle: "MSH027", registration: "KS24JWC", trailer: "24250265", driver: "Przemyslaw Kucharski", duty: "MSH188a" },
  { vehicle: "MSH038", registration: "PJ24THN", trailer: "24250210", driver: "Deimante Mockute", duty: "MSH100a" },
  { vehicle: "MSH074", registration: "KS24JWM", trailer: "24250273", driver: "Rowan Perrie", duty: "MSH207a" },
  { vehicle: "MSH108", registration: "DE69AVR", trailer: "19251347", driver: "Tafadzwa Chandiwana", duty: "MSH652a" },
  { vehicle: "NHC113", registration: "PK19VJC", trailer: "24316089", driver: "Jithin Erayi", duty: "HATp600a" },
  { vehicle: "PEL018", registration: "PN74CDO", trailer: "24316066", driver: "Graham Crane", duty: "PEVt4080a" },
  { vehicle: "NW433", registration: "PN70BUA", trailer: "7338014", driver: "Andrew Cannon", duty: "NWHx2540b" },
  { vehicle: "CV394", registration: "DE69AXV", trailer: "19251402", driver: "Etienne Anthony", duty: "CVNx6200a" },
  { vehicle: "BMC312", registration: "PK67VGZ", trailer: "19316109", driver: "Goncalo Vicente", duty: "BMCp2052a" },
  { vehicle: "BMC325", registration: "PE17HMA", trailer: "24316135", driver: "Orion Maynard", duty: "BMCx4100a" },
  { vehicle: "SWD372", registration: "PJ67LZR", trailer: "25316069", driver: "D Harris", duty: "SWDc3064t" },
  { vehicle: "SN016", registration: "PJ24JNU", trailer: "4318015", driver: "Levente Pal", duty: "SNVx0430a" },
  { vehicle: "MSH176", registration: "PK67VGX", trailer: "7231074", driver: "Elliott Campbell", duty: "MSHp6611a" },
  { vehicle: "MSH101", registration: "PE18LZO", trailer: "8251041", driver: "Robert Piggot", duty: "MSHp9031a" },
  { vehicle: "MSH129", registration: "DE69AWP", trailer: "24316063", driver: "George Moroiu", duty: "MSHp4791a" },
  { vehicle: "MSH153", registration: "DE69AXF", trailer: "19310023", driver: "Sarah Mitchell", duty: "MSHp5330a" },
  { vehicle: "MSH095", registration: "KS24SVE", trailer: "19310012", driver: "Jasvir Singh", duty: "MSHp4340a" },
  { vehicle: "MSH080", registration: "KS24SUU", trailer: "19310003", driver: "Chris Morgan", duty: "MSHp4202b" },
] as const;

export function ProximityReport({ locations, onSchedule, scheduledCount = 0 }: ProximityReportProps) {
  const defaults = getDefaultRange();
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [startTime, setStartTime] = useState("06:00");
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [endTime, setEndTime] = useState("05:59");
  const [latitude, setLatitude] = useState("52.35702");
  const [longitude, setLongitude] = useState("-1.16276");
  const [radius, setRadius] = useState("100");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(locations);
  const [locationSearch, setLocationSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredLocations = useMemo(
    () => locations.filter((location) => location.toLowerCase().includes(locationSearch.trim().toLowerCase())),
    [locationSearch, locations],
  );

  const previewRows = useMemo(() => {
    const validation = validateInputs({
      startDate,
      startTime,
      endDate,
      endTime,
      latitude,
      longitude,
      radius,
      selectedLocations,
    });

    if (validation) {
      return [];
    }

    return buildMockProximityRows({
      startDate,
      startTime,
      endDate,
      endTime,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMetres: Number(radius),
      selectedLocations,
    });
  }, [startDate, startTime, endDate, endTime, latitude, longitude, radius, selectedLocations]);


  const toggleLocation = (location: string) => {
    setSelectedLocations((current) =>
      current.includes(location) ? current.filter((value) => value !== location) : [...current, location],
    );
  };

  const downloadReport = (format: ExportFormat) => {
    const validation = validateInputs({
      startDate,
      startTime,
      endDate,
      endTime,
      latitude,
      longitude,
      radius,
      selectedLocations,
    });

    if (validation) {
      setErrorMessage(validation);
      return;
    }

    if (previewRows.length === 0) {
      setErrorMessage("No mock vehicle or trailer movements were found within the selected radius and time range.");
      return;
    }

    setErrorMessage("");
    exportProximityRows(previewRows, format, {
      startDate,
      startTime,
      endDate,
      endTime,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMetres: Number(radius),
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-[16px] border border-[#d7dee9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-black text-[#10203a]">Vehicle Proximity Report</p>
            {scheduledCount > 0 ? (
              <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#166534]">
                {scheduledCount} scheduled
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-semibold text-[#4b5563]">
            Vehicles and trailers recorded within a selected GPS radius and time period
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setIsOpen(true);
            }}
            className="rounded-xl bg-[#10203a] px-4 py-2.5 text-xs font-black uppercase tracking-[0.07em] text-white shadow-sm transition hover:bg-[#1e3558]"
          >
            Select GPS area and download
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

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07101f]/65 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="proximity-report-title"
        >
          <div className="max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[24px] border border-[#cfd8e3] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 bg-[#10203a] px-5 py-4 text-white sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">GPS proximity report</p>
                <h2 id="proximity-report-title" className="mt-1 text-2xl font-black">Vehicle Proximity Report</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 text-xl font-black text-white transition hover:bg-white/10"
                aria-label="Close proximity report"
              >
                ×
              </button>
            </div>

            <div className="max-h-[calc(94vh-82px)] overflow-y-auto p-5 sm:p-6">
              <p className="text-sm font-bold leading-6 text-[#4b5563]">
                Choose a date and time range, enter the centre GPS coordinates and radius, then select the depot locations to include. This mock report returns the vehicles and trailers recorded inside that area.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <DateTimePanel
                  title="From"
                  date={startDate}
                  time={startTime}
                  onDateChange={setStartDate}
                  onTimeChange={setStartTime}
                />
                <DateTimePanel
                  title="To"
                  date={endDate}
                  time={endTime}
                  onDateChange={setEndDate}
                  onTimeChange={setEndTime}
                />
              </div>

              <section className="mt-5 rounded-[18px] border border-[#d7dee9] bg-[#f8fafc] p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">GPS search area</p>
                    <p className="mt-1 text-xs font-bold text-[#4b5563]">Maximum report duration: 14 days</p>
                  </div>
                  <p className="text-xs font-black text-[#6b7280]">All distances are measured from the entered latitude and longitude.</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <NumberField label="Latitude" value={latitude} onChange={setLatitude} step="0.00001" placeholder="52.35702" />
                  <NumberField label="Longitude" value={longitude} onChange={setLongitude} step="0.00001" placeholder="-1.16276" />
                  <NumberField label="Radius (metres)" value={radius} onChange={setRadius} step="1" placeholder="100" />
                </div>
              </section>

              <section className="mt-5 overflow-hidden rounded-[18px] border border-[#d7dee9] bg-[#f8fafc]">
                <div className="flex flex-col gap-3 border-b border-[#d7dee9] bg-[#e9eef9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10203a]">Available locations</p>
                    <p className="mt-1 text-xs font-bold text-[#4b5563]">{selectedLocations.length} of {locations.length} locations selected</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLocations(locations)}
                      className="rounded-lg border border-[#c7d2df] bg-white px-3 py-2 text-xs font-black text-[#0f3a6d] transition hover:bg-[#f3f6fa]"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLocations([])}
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
                      className="mt-1 h-10 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-bold text-[#10203a] outline-none focus:border-[#0f3a6d]"
                    />
                  </label>

                  <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-[#d7dee9] bg-white">
                    {filteredLocations.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredLocations.map((location, index) => (
                          <label
                            key={location}
                            className={`flex cursor-pointer items-center justify-between gap-3 border-b border-[#e5eaf2] px-3 py-2.5 text-xs font-bold text-[#10203a] transition hover:bg-[#eef4ff] ${
                              index % 2 === 0 ? "bg-[#f7f8ff]" : "bg-white"
                            }`}
                          >
                            <span className="min-w-0 break-words">{location}</span>
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location)}
                              onChange={() => toggleLocation(location)}
                              className="h-4 w-4 shrink-0 accent-[#0f3a6d]"
                            />
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="px-4 py-8 text-center text-sm font-bold text-[#6b7280]">No locations match that search.</p>
                    )}
                  </div>
                </div>
              </section>


              {errorMessage ? (
                <div className="mt-4 rounded-[14px] border border-[#ef4444] bg-[#fff1f2] px-4 py-3 text-sm font-black text-[#991b1b]">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6b7280]">Download report as</p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormatButton label="Excel" detail="Spreadsheet data" onClick={() => downloadReport("excel")} />
                  <FormatButton label="CSV" detail="Comma-separated data" onClick={() => downloadReport("csv")} />
                  <FormatButton label="PDF" detail="Printable report" onClick={() => downloadReport("pdf")} />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-[#cfd8e3] bg-white px-5 py-2.5 text-sm font-black text-[#10203a] transition hover:bg-[#f3f6fa]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DateTimePanel({
  title,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  title: string;
  date: string;
  time: string;
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
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">Time</span>
          <input
            type="time"
            step="1"
            value={time}
            onChange={(event) => onTimeChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
          />
        </label>
      </div>
    </fieldset>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-[#cfd8e3] bg-white px-3 text-sm font-black text-[#10203a] outline-none focus:border-[#0f3a6d]"
      />
    </label>
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

function validateInputs({
  startDate,
  startTime,
  endDate,
  endTime,
  latitude,
  longitude,
  radius,
  selectedLocations,
}: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  latitude: string;
  longitude: string;
  radius: string;
  selectedLocations: string[];
}) {
  if (!startDate || !startTime || !endDate || !endTime) {
    return "Enter both the from and to dates and times.";
  }

  const start = new Date(`${startDate}T${normaliseTime(startTime)}`);
  const end = new Date(`${endDate}T${normaliseTime(endTime)}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return "The from date and time must be before the to date and time.";
  }

  if (end.getTime() - start.getTime() > 14 * 86_400_000) {
    return "The maximum proximity report duration is 14 days.";
  }

  const latitudeValue = Number(latitude);
  const longitudeValue = Number(longitude);
  const radiusValue = Number(radius);

  if (!Number.isFinite(latitudeValue) || latitudeValue < -90 || latitudeValue > 90) {
    return "Enter a valid latitude between -90 and 90.";
  }

  if (!Number.isFinite(longitudeValue) || longitudeValue < -180 || longitudeValue > 180) {
    return "Enter a valid longitude between -180 and 180.";
  }

  if (!Number.isFinite(radiusValue) || radiusValue < 10 || radiusValue > 50_000) {
    return "Enter a radius between 10 and 50,000 metres.";
  }

  if (selectedLocations.length === 0) {
    return "Select at least one location before downloading the report.";
  }

  return "";
}

function buildMockProximityRows({
  startDate,
  startTime,
  endDate,
  endTime,
  latitude,
  longitude,
  radiusMetres,
  selectedLocations,
}: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  latitude: number;
  longitude: number;
  radiusMetres: number;
  selectedLocations: string[];
}) {
  const start = new Date(`${startDate}T${normaliseTime(startTime)}`);
  const end = new Date(`${endDate}T${normaliseTime(endTime)}`);
  const durationMs = Math.max(1, end.getTime() - start.getTime());
  const seed = Math.abs(Math.round(latitude * 100_000) + Math.round(longitude * 100_000) + Math.round(radiusMetres));
  const eventCount = Math.max(6, Math.min(30, 6 + Math.round(radiusMetres / 12)));
  const rows: ProximityRow[] = [];

  for (let index = 0; index < eventCount; index += 1) {
    const resource = vehicleResources[(seed + index * 7) % vehicleResources.length];
    const location = selectedLocations[(seed + index * 11) % selectedLocations.length];
    const timeFraction = (index + 1) / (eventCount + 1);
    const eventDate = new Date(start.getTime() + Math.round(durationMs * timeFraction));
    const distanceMetres = Math.max(1, Math.round(radiusMetres * (0.08 + ((seed + index * 17) % 88) / 100)));
    const angle = ((seed + index * 43) % 360) * (Math.PI / 180);
    const latitudeOffset = (distanceMetres * Math.cos(angle)) / 111_320;
    const longitudeScale = Math.max(0.2, Math.cos(latitude * (Math.PI / 180)));
    const longitudeOffset = (distanceMetres * Math.sin(angle)) / (111_320 * longitudeScale);

    rows.push({
      location,
      eventDateTime: formatDateTime(eventDate),
      vehicle: resource.vehicle,
      registration: resource.registration,
      trailer: resource.trailer,
      driver: resource.driver,
      duty: `${resource.duty}-${formatIsoDate(eventDate)}`,
      distanceMetres: Math.min(radiusMetres, distanceMetres),
      speedKph: (seed + index * 13) % 4 === 0 ? 0 : 18 + ((seed + index * 9) % 67),
      latitude: Number((latitude + latitudeOffset).toFixed(5)),
      longitude: Number((longitude + longitudeOffset).toFixed(5)),
    });
  }

  return rows.sort((a, b) => parseDisplayDate(a.eventDateTime) - parseDisplayDate(b.eventDateTime));
}

function exportProximityRows(
  rows: ProximityRow[],
  format: ExportFormat,
  parameters: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    latitude: number;
    longitude: number;
    radiusMetres: number;
  },
) {
  const headers = [
    "Location",
    "Date/Time of Event",
    "Vehicle",
    "Vehicle Registration",
    "Trailer Number",
    "Driver",
    "Duty",
    "Distance from Lat/Long (metres)",
    "Speed (KPH)",
    "Latitude",
    "Longitude",
  ];

  const dataRows = rows.map((row) => [
    row.location,
    row.eventDateTime,
    row.vehicle,
    row.registration,
    row.trailer,
    row.driver,
    row.duty,
    row.distanceMetres,
    row.speedKph,
    row.latitude,
    row.longitude,
  ]);

  const fileDate = parameters.startDate.replaceAll("-", "");
  exportTabularData({
    format,
    headers,
    rows: dataRows,
    fileName: `vehicle-proximity-report-${fileDate}`,
    title: `Vehicle Proximity Report | ${parameters.startDate} ${parameters.startTime} to ${parameters.endDate} ${parameters.endTime} | Lat ${parameters.latitude}, Long ${parameters.longitude}, Radius ${parameters.radiusMetres}m`,
  });
}

function getDefaultRange() {
  const today = getLondonDate();
  return {
    startDate: addDays(today, -1),
    endDate: today,
  };
}

function getLondonDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function addDays(dateInput: string, offset: number) {
  const [year, month, day] = dateInput.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + offset);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function normaliseTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
}

function formatIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDisplayDate(value: string) {
  const [datePart, timePart] = value.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}
