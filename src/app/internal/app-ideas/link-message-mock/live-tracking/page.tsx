"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import routeAnalysisMap from "./live-tracking-route-analysis.png";
import routeHistoryDay1 from "./route-history-day-1.png";
import routeHistoryDay2 from "./route-history-day-2.png";
import routeHistoryDay3 from "./route-history-day-3.png";
import routeHistoryDay4 from "./route-history-day-4.png";
import routeHistoryDay5 from "./route-history-day-5.png";
import routeHistoryDay6 from "./route-history-day-6.png";
import routeHistoryDay7 from "./route-history-day-7.png";

import {
  liveTrackingEvents,
  liveTrackingSummary,
} from "../mockOfficeData";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  alertCount?: number;
  active?: boolean;
};

type LabelMode = "time" | "speed";
type TrackingEvent = (typeof liveTrackingEvents)[number];

type OverlayLabelPoint = {
  id: string;
  place: string;
  x: string;
  y: string;
  time: string;
  speed: string;
};

type HistoricalTrackingDay = {
  dayOffset: number;
  map: StaticImageData;
  route: string;
  resource: string;
  duty: string;
  vehicle: string;
  trailer: string;
  driver: string;
  startTime: string;
  endTime: string;
  distance: string;
  drivingTime: string;
  lastKnownPlace: string;
  events: TrackingEvent[];
};

type SelectedTrackingDay = {
  isCurrent: boolean;
  map: StaticImageData;
  route: string;
  resource: string;
  duty: string;
  vehicle: string;
  trailer: string;
  driver: string;
  statusText: string;
  lastKnownPlace: string;
  events: TrackingEvent[];
  startTime?: string;
  endTime?: string;
  distance?: string;
  drivingTime?: string;
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
  { label: "Live Tracking", icon: "GPS", href: "/internal/app-ideas/link-message-mock/live-tracking", active: true },
  { label: "Reports", icon: "REP", href: "/internal/app-ideas/link-message-mock/reports" },
  { label: "A&D Dashboard", icon: "A&D", href: "/internal/app-ideas/link-message-mock/arrivals-departures" },
];

const DEFAULT_TRACKING_RESOURCE = "PE68UHD";

const trackingResourceOptions = [
  "PE68UHD",
  "1318018 (DD98)",
  "1318021 (DD98)",
  "1318053 (DD98)",
  "1318060 (DD98)",
  "1318064 (DD98)",
  "1318078 (DD98)",
  "1319004 (DD98)",
  "1319005 (DD98)",
  "1319008 (DD98)",
  "1319037 (DD98)",
  "1319050 (DD98)",
  "NW GAS41 (FX22 UHZ) 21255001",
  "NW GAS43 (FX22 UHY) 21255003",
  "NW GAS44 (FX22 UHF) 21255016",
  "NW200 (PO13 EHE) 2370004",
  "NW202 (PO13 EHW) 2370019",
  "NW203 (PO13 EJF) 2370027",
  "NW204 (PE64 EYL) 4370002",
  "NW205 (PE64 EYM) 4370003",
  "NW206 (PE64 EYS) 4370007",
  "NW207 (PE65 VCG) 5370062",
  "NW208 (PE65 VCK) 5370064",
  "NW209 (PE65VCM) 5370066",
  "NW210 (PF66YCD) 6370148",
  "NW211 (PE18 LWZ) 8370204",
  "NW212 (PF68 UVW) 8376025",
  "NW400 (BF69 DPN) 19251417",
  "NW401 (BF69 DNY) 19251408",
  "NW405 (BF69 DRZ) 19251426",
  "NW406 (BF69 DRV) 19251424",
  "NW408 (BF69 DOA) 19251415",
  "NW409 (BF69 DOH) 11691587",
  "NW411 (BF69 DSZ) 11691645",
  "NW412 (BF69 DPO) 19251405",
  "NW414 (BF69 DPZ) 19251404",
  "NW415 (BF69 DSV) 19251430",
  "NW416 (PJ24SNN) 24250105",
  "NW418 (PJ24SVF)",
  "NW419 (PJ24SVE)",
  "NW420 (PJ24SXH)",
  "NW421 PJ24SXO 24250184",
  "NW422 (PJ24 SVK) 24250148",
  "NW423 (PJ24 SVG) 24250147",
  "NW424 PJ24SXE",
  "NW426 PJ24SXR",
  "NW427 (PE18 MDN) 8251058",
  "NW428 PJ24SXP",
  "NW430 (PE18 MDV) 8251061",
  "NW432 (PK19VJV) 19251011",
  "NW433 (PN70BUA) 20250071",
  "NW434 (PN70 BRX) 20250064",
  "NW435 (PN20 CME) 7200115",
  "NW436 (PK67 VCZ) 7251002",
  "NW437 (PK67 VDC) 7251004",
  "NW439 PJ24JKZ 24250075",
  "NW440 PJ24JKV 24250072",
  "NW441 (PJ24 JKX) 24250073",
  "NW442 PJ24SXC",
  "NW443 PJ24SPX",
  "NW444 (PJ24 SPV)",
  "NW445 (PJ24 JKY) 24250074",
  "NW446 PJ24JKU 24250071",
  "NW447 PJ24SXF 24250177",
  "NW448 PJ24SXT 24250187",
  "NW450 (PN25BUV) (25250048) No Tracker Fitted",
  "NW451 (PN25BUW) 25250049 No Tracker Fitted",
  "NW601 (PJ67 WJA) 7231182",
  "NW602 (PJ67 WLW) 7231210",
  "NW620 (PJ67 WLX) 7231211",
  "NW628 (PE18MFF) 8231004",
  "NW629 (PE17 HNW) 6230136",
  "NWGAS33 (FX22 UHM) 21255019",
  "NWGAS36 (FX22 UKB) 21255039",
  "NWGAS37 (FX22 UHL) 21255017",
  "7330228",
  "7330229",
  "7330230",
  "7330231",
  "7330232",
  "7330233",
  "7330234",
  "7330235",
  "7330236",
  "7330237",
  "7330238",
  "7330239",
  "7330240",
  "7330241",
  "7330242",
  "7330243",
  "7330244",
  "7330245",
  "7330246",
  "7330247",
  "7330248",
  "7330249",
  "7330250",
  "7330251",
  "7330253",
  "7330254",
  "7330255",
  "7330256",
  "7330257 T/L",
  "7330258",
  "7330259",
  "7330260",
  "7330261",
  "7330263",
  "7330264",
  "7330265",
  "7330266",
  "7330267",
  "7330268",
  "7330269",
  "7330270",
  "7330271",
  "7330272",
  "7330273",
  "7330274",
  "7330275",
  "7330276",
  "7330277",
  "7330278",
  "7330279",
  "7330280",
  "7330281",
  "7330282",
  "7330283",
  "7330284",
] as const;

const mapLabelPoints: OverlayLabelPoint[] = [
  { id: "north-west-hub", place: "North West Hub", x: "26%", y: "82%", time: "10:59", speed: "52 mph" },
  { id: "manchester-corridor", place: "Manchester corridor", x: "41%", y: "66%", time: "11:11", speed: "44 mph" },
  { id: "halifax-corridor", place: "Halifax corridor", x: "63%", y: "45%", time: "11:39", speed: "57 mph" },
  { id: "d5-mc", place: "D5 MC", x: "79%", y: "32%", time: "12:07", speed: "39 mph" },
  { id: "field-mc", place: "FIELD MC", x: "74%", y: "71%", time: "13:24", speed: "43 mph" },
  { id: "sheffield-mc", place: "SHF/IELD MC", x: "76%", y: "86%", time: "13:32", speed: "57 mph" },
];

function completedEvent(
  time: string,
  duration: string,
  placeType: TrackingEvent["placeType"],
  place: string,
  gisDetails: string,
  traffic: TrackingEvent["traffic"],
): TrackingEvent {
  return { time, duration, placeType, place, gisDetails, traffic, status: "Completed" };
}

const historicalTrackingDays: HistoricalTrackingDay[] = [
  {
    dayOffset: 1,
    map: routeHistoryDay1,
    route: "North West Hub → Midlands Super Hub → Home Counties North MC",
    resource: "NW433 (PN70BUA)",
    duty: "NWH632",
    vehicle: "PE68UHD",
    trailer: "7338014",
    driver: "Andrew Cannon",
    startTime: "07:42",
    endTime: "16:18",
    distance: "286 miles",
    drivingTime: "06:21",
    lastKnownPlace: "Home Counties North MC",
    events: [
      completedEvent("07:42", "00:28", "Depot", "North West Hub", "Vehicle and trailer checks completed", "1C 24 Mail"),
      completedEvent("08:10", "02:47", "On Route", "North West Hub → Midlands Super Hub", "112 miles • M6 southbound", "1C 24 Mail"),
      completedEvent("10:57", "00:46", "Depot", "Midlands Super Hub", "Bay 18 • unload and reload", "1C 24 Mail"),
      completedEvent("11:43", "02:12", "On Route", "Midlands Super Hub → Home Counties corridor", "96 miles • M1 southbound", "2C 48 Mail"),
      completedEvent("13:55", "00:32", "Break", "Leicester Forest East Services", "Statutory driver break", "Empty"),
      completedEvent("14:27", "01:36", "On Route", "Leicester Forest East → Home Counties North MC", "78 miles • average 54 mph", "2C 48 Mail"),
      completedEvent("16:03", "00:15", "Depot", "Home Counties North MC", "Final handover and vehicle secure", "2C 48 Mail"),
    ],
  },
  {
    dayOffset: 2,
    map: routeHistoryDay2,
    route: "North West Hub → Midlands Super Hub → Cardiff MC",
    resource: "NW433 (PN70BUA)",
    duty: "NWH418",
    vehicle: "PE68UHD",
    trailer: "7412608",
    driver: "Andrew Cannon",
    startTime: "06:58",
    endTime: "16:44",
    distance: "301 miles",
    drivingTime: "06:48",
    lastKnownPlace: "Cardiff MC",
    events: [
      completedEvent("06:58", "00:22", "Depot", "North West Hub", "Bay 7 • load confirmed", "1C 24 Mail"),
      completedEvent("07:20", "02:38", "On Route", "North West Hub → Midlands Super Hub", "109 miles • M6", "1C 24 Mail"),
      completedEvent("09:58", "00:41", "Depot", "Midlands Super Hub", "Traffic exchange and seal check", "1C 24 Mail"),
      completedEvent("10:39", "02:26", "On Route", "Midlands Super Hub → Wales Services", "114 miles • M5 southbound", "PF 24 Parcels"),
      completedEvent("13:05", "00:35", "Break", "Wales Services", "Driver break and fuel", "Empty"),
      completedEvent("13:40", "02:42", "On Route", "Wales Services → Cardiff MC", "78 miles • M4 westbound", "PF 24 Parcels"),
      completedEvent("16:22", "00:22", "Depot", "Cardiff MC", "Duty completed and trailer parked", "PF 24 Parcels"),
    ],
  },
  {
    dayOffset: 3,
    map: routeHistoryDay3,
    route: "North West Hub → Midlands Super Hub → Wales Services",
    resource: "NW433 (PN70BUA)",
    duty: "NWH507",
    vehicle: "PE68UHD",
    trailer: "26316023",
    driver: "Andrew Cannon",
    startTime: "07:30",
    endTime: "15:58",
    distance: "248 miles",
    drivingTime: "05:37",
    lastKnownPlace: "Wales Services",
    events: [
      completedEvent("07:30", "00:20", "Depot", "North West Hub", "Trailer coupled and departure checks", "Container Repatriation"),
      completedEvent("07:50", "02:25", "On Route", "North West Hub → Midlands Super Hub", "111 miles • M6", "Container Repatriation"),
      completedEvent("10:15", "00:52", "Depot", "Midlands Super Hub", "Container transfer at Bay 21", "Container Repatriation"),
      completedEvent("11:07", "01:56", "On Route", "Midlands Super Hub → Frankley Services", "83 miles • M5", "Empty"),
      completedEvent("13:03", "00:31", "Break", "Frankley Services", "Driver break", "Empty"),
      completedEvent("13:34", "02:08", "On Route", "Frankley Services → Wales Services", "54 miles • average 50 mph", "PF 48 Parcels"),
      completedEvent("15:42", "00:16", "Known Place", "Wales Services", "Recorded end of historical route", "PF 48 Parcels"),
    ],
  },
  {
    dayOffset: 4,
    map: routeHistoryDay4,
    route: "North West Hub → Frankley Services → Swindon Services",
    resource: "NW433 (PN70BUA)",
    duty: "NWH224",
    vehicle: "PE68UHD",
    trailer: "25316177",
    driver: "Andrew Cannon",
    startTime: "00:52",
    endTime: "05:14",
    distance: "173 miles",
    drivingTime: "03:36",
    lastKnownPlace: "Swindon Services South",
    events: [
      completedEvent("00:52", "00:18", "Depot", "North West Hub", "Night duty departure checks", "PF 24 Parcels"),
      completedEvent("01:10", "01:46", "On Route", "North West Hub → Stoke corridor", "74 miles • M6 southbound", "PF 24 Parcels"),
      completedEvent("02:56", "00:20", "Known Place", "Stoke corridor", "Recorded traffic check", "PF 24 Parcels"),
      completedEvent("03:16", "00:47", "On Route", "Stoke corridor → Frankley Services", "44 miles", "PF 24 Parcels"),
      completedEvent("04:03", "00:32", "Break", "Frankley Services Northbound", "Driver break", "Empty"),
      completedEvent("04:35", "00:29", "On Route", "Frankley Services → Swindon Services", "55 miles", "Empty"),
      completedEvent("05:04", "00:10", "Known Place", "Swindon Services South", "Historical journey ended", "Empty"),
    ],
  },
  {
    dayOffset: 5,
    map: routeHistoryDay5,
    route: "Birkenhead Docks → Warrington Rail Terminal → South Midlands MC",
    resource: "NW433 (PN70BUA)",
    duty: "NWH305",
    vehicle: "PE68UHD",
    trailer: "4318005",
    driver: "Andrew Cannon",
    startTime: "20:10",
    endTime: "03:08",
    distance: "196 miles",
    drivingTime: "04:31",
    lastKnownPlace: "South Midlands MC",
    events: [
      completedEvent("20:10", "00:25", "Depot", "Birkenhead Docks", "Trailer collection and paperwork", "Container Repatriation"),
      completedEvent("20:35", "00:46", "On Route", "Birkenhead Docks → Warrington Rail Terminal", "34 miles", "Container Repatriation"),
      completedEvent("21:21", "00:39", "Depot", "Warrington Rail Terminal", "Container handover", "Container Repatriation"),
      completedEvent("22:00", "01:43", "On Route", "Warrington → Stafford corridor", "79 miles • M6", "Empty"),
      completedEvent("23:43", "00:32", "Break", "Stafford Services", "Driver break", "Empty"),
      completedEvent("00:15", "02:33", "On Route", "Stafford Services → South Midlands MC", "83 miles", "1C 24 Mail"),
      completedEvent("02:48", "00:20", "Depot", "South Midlands MC", "Duty completed", "1C 24 Mail"),
    ],
  },
  {
    dayOffset: 6,
    map: routeHistoryDay6,
    route: "Glasgow MC → North West Hub → Midlands Super Hub → Cardiff MC",
    resource: "NW433 (PN70BUA)",
    duty: "NWH711",
    vehicle: "PE68UHD",
    trailer: "24316007",
    driver: "Andrew Cannon",
    startTime: "07:16",
    endTime: "18:47",
    distance: "431 miles",
    drivingTime: "08:36",
    lastKnownPlace: "Cardiff MC",
    events: [
      completedEvent("07:16", "00:19", "Depot", "Glasgow MC", "Vehicle released from Bay 4", "2C 48 Mail"),
      completedEvent("07:35", "03:44", "On Route", "Glasgow MC → North West Hub", "196 miles • M74/M6", "2C 48 Mail"),
      completedEvent("11:19", "00:44", "Depot", "North West Hub", "Unload, reload and trailer inspection", "1C 24 Mail"),
      completedEvent("12:03", "02:26", "On Route", "North West Hub → Midlands Super Hub", "111 miles", "1C 24 Mail"),
      completedEvent("14:29", "00:41", "Depot", "Midlands Super Hub", "Bay 14 transfer", "PF 48 Parcels"),
      completedEvent("15:10", "03:17", "On Route", "Midlands Super Hub → Cardiff MC", "124 miles • M5/M4", "PF 48 Parcels"),
      completedEvent("18:27", "00:20", "Depot", "Cardiff MC", "Final delivery and secure", "PF 48 Parcels"),
    ],
  },
  {
    dayOffset: 7,
    map: routeHistoryDay7,
    route: "Newcastle Upon Tyne MC → North West Hub",
    resource: "NW433 (PN70BUA)",
    duty: "NWH804",
    vehicle: "PE68UHD",
    trailer: "25316089",
    driver: "Andrew Cannon",
    startTime: "00:30",
    endTime: "06:22",
    distance: "189 miles",
    drivingTime: "04:18",
    lastKnownPlace: "North West Hub",
    events: [
      completedEvent("00:30", "00:24", "Depot", "Newcastle Upon Tyne MC", "Night departure checks", "1C 24 Mail"),
      completedEvent("00:54", "01:35", "On Route", "Newcastle → Scotch Corner", "68 miles • A1(M)", "1C 24 Mail"),
      completedEvent("02:29", "00:25", "Known Place", "Scotch Corner", "Recorded route checkpoint", "1C 24 Mail"),
      completedEvent("02:54", "01:15", "On Route", "Scotch Corner → A6 corridor", "57 miles", "1C 24 Mail"),
      completedEvent("04:09", "00:35", "Break", "A6 / Preston services", "Driver break", "Empty"),
      completedEvent("04:44", "01:20", "On Route", "Preston corridor → North West Hub", "64 miles", "Empty"),
      completedEvent("06:04", "00:18", "Depot", "North West Hub", "Historical route completed", "Empty"),
    ],
  },
];

export default function LiveTrackingPage() {
  const [now, setNow] = useState(() => new Date());
  const [today] = useState(() => startOfDay(new Date()));
  const [selectedDateValue, setSelectedDateValue] = useState(() => toDateInputValue(startOfDay(new Date())));
  const [selectedResource, setSelectedResource] = useState(DEFAULT_TRACKING_RESOURCE);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedDate = useMemo(() => parseDateInputValue(selectedDateValue), [selectedDateValue]);
  const selectedDayOffset = clampDayOffset(daysBetween(today, selectedDate));
  const isCurrentDay = selectedDayOffset === 0;
  const historicalDay = historicalTrackingDays.find((day) => day.dayOffset === selectedDayOffset) ?? historicalTrackingDays[0];

  const selectedTrackingDay: SelectedTrackingDay = isCurrentDay
    ? {
        isCurrent: true,
        map: routeAnalysisMap,
        route: liveTrackingSummary.route,
        resource: selectedResource,
        duty: liveTrackingSummary.duty,
        vehicle: liveTrackingSummary.vehicle,
        trailer: liveTrackingSummary.trailer,
        driver: liveTrackingSummary.driver,
        statusText: liveTrackingSummary.currentStatus,
        lastKnownPlace: liveTrackingSummary.lastKnownPlace,
        events: liveTrackingEvents,
      }
    : {
        isCurrent: false,
        map: historicalDay.map,
        route: historicalDay.route,
        resource: selectedResource,
        duty: historicalDay.duty,
        vehicle: historicalDay.vehicle,
        trailer: historicalDay.trailer,
        driver: historicalDay.driver,
        statusText: "Completed historical route",
        lastKnownPlace: historicalDay.lastKnownPlace,
        events: historicalDay.events,
        startTime: historicalDay.startTime,
        endTime: historicalDay.endTime,
        distance: historicalDay.distance,
        drivingTime: historicalDay.drivingTime,
      };

  const selectedDateLabel = formatLongDate(selectedDate);
  const relativeDateLabel = isCurrentDay ? "Today" : selectedDayOffset === 1 ? "Yesterday" : `${selectedDayOffset} days ago`;
  const currentEvent = selectedTrackingDay.events.find((event) => event.status === "Current") ?? selectedTrackingDay.events.at(-1) ?? selectedTrackingDay.events[0];
  const minimumDate = toDateInputValue(addDays(today, -7));
  const maximumDate = toDateInputValue(today);

  const changeSelectedDate = (days: number) => {
    const nextDate = addDays(selectedDate, days);
    const boundedDate = nextDate < addDays(today, -7) ? addDays(today, -7) : nextDate > today ? today : nextDate;
    setSelectedDateValue(toDateInputValue(boundedDate));
  };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#111827]">
      <OfficeHeader title="MOCK UP" subtitle="Live Tracking" />
      <div className="flex min-w-0">
        <OfficeSidebar />

        <main className="min-w-0 flex-1 p-3 sm:p-4 xl:p-5">
          <section className="rounded-[18px] border border-[#d6dde8] bg-white p-3 shadow-sm">
            <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(300px,0.65fr)_minmax(680px,1.35fr)] xl:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e40000]">Vehicle tracking mockup</p>
                  <TrackingModeChip isCurrent={isCurrentDay} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="text-xl font-black text-[#10203a] xl:text-2xl">
                    {isCurrentDay ? "VEHICLE LIVE TRACKING" : "Vehicle Tracking History"}
                  </h1>
                  <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border-2 border-[#e40000] bg-[#fff5f5] px-3 py-1.5 shadow-sm">
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.16em] text-[#b00000]">Resource</span>
                    <span className="truncate text-base font-black text-[#10203a]" title={selectedTrackingDay.resource}>
                      {selectedTrackingDay.resource}
                    </span>
                  </div>
                </div>
                <p className="mt-1 max-w-4xl text-xs font-bold leading-4 text-[#4b5563]">
                  Select today for live progress, or choose a previous date to review the completed route and recorded events.
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-[minmax(230px,0.72fr)_minmax(430px,1.28fr)]">
                <ResourceSelector
                  value={selectedResource}
                  options={trackingResourceOptions}
                  onChange={setSelectedResource}
                />
                <DateSelector
                  value={selectedDateValue}
                  min={minimumDate}
                  max={maximumDate}
                  dateLabel={selectedDateLabel}
                  relativeLabel={relativeDateLabel}
                  isCurrent={isCurrentDay}
                  canMoveEarlier={selectedDateValue > minimumDate}
                  canMoveLater={selectedDateValue < maximumDate}
                  onChange={setSelectedDateValue}
                  onEarlier={() => changeSelectedDate(-1)}
                  onLater={() => changeSelectedDate(1)}
                  onToday={() => setSelectedDateValue(maximumDate)}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
              <MetricCard label="Duty" value={selectedTrackingDay.duty} detail="Assigned duty" />
              <MetricCard label="Driver" value={selectedTrackingDay.driver} detail="Assigned driver" />
              {isCurrentDay ? (
                <>
                  <MetricCard label="Last updated" value={formatDateTime(now)} detail="Live GPS refresh" />
                  <MetricCard label="Speed" value={liveTrackingSummary.speed} detail="Current speed" />
                  <MetricCard label="ETA" value={liveTrackingSummary.eta} detail="Next point" />
                </>
              ) : (
                <>
                  <MetricCard label="Tracking period" value={`${selectedTrackingDay.startTime}–${selectedTrackingDay.endTime}`} detail="Start and finish" />
                  <MetricCard label="Distance" value={selectedTrackingDay.distance ?? "—"} detail="Route total" />
                  <MetricCard label="Driving time" value={selectedTrackingDay.drivingTime ?? "—"} detail="Moving time" />
                </>
              )}
            </div>
          </section>

          <section className="mt-3 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] 2xl:grid-cols-[minmax(480px,1.2fr)_minmax(350px,0.86fr)_minmax(270px,0.56fr)]">
            <RouteMapCard trackingDay={selectedTrackingDay} selectedDateLabel={selectedDateLabel} />
            <MovementListCard events={selectedTrackingDay.events} isCurrent={isCurrentDay} selectedDateLabel={selectedDateLabel} />
            <JourneyStatusCard trackingDay={selectedTrackingDay} currentEvent={currentEvent} selectedDateLabel={selectedDateLabel} />
          </section>

          <section className="mt-4 rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Event history</p>
                <h2 className="mt-1 text-2xl font-black text-[#10203a]">
                  {isCurrentDay ? "Movement and place history" : `Recorded history for ${selectedDateLabel}`}
                </h2>
              </div>
              <div className="rounded-full bg-[#10203a] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white">
                Showing {selectedTrackingDay.events.length} {isCurrentDay ? "mock" : "recorded"} entries
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-[18px] border border-[#d7dee9]">
              <table className="min-w-[980px] w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#e6f0fb] text-left text-xs font-black uppercase tracking-[0.14em] text-[#10203a]">
                    <th className="border-b border-[#d7dee9] px-3 py-3">Time</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Duration</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Place type</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Place</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">GIS details</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Traffic</th>
                    <th className="border-b border-[#d7dee9] px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTrackingDay.events.map((event, index) => (
                    <tr key={`${event.time}-${event.place}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 text-base font-black text-[#10203a]">{event.time}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.duration}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.placeType}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#10203a]">{event.place}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 font-bold text-[#4b5563]">{event.gisDetails}</td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3 text-[#10203a]">
                        <TrafficChip traffic={event.traffic} />
                      </td>
                      <td className="border-b border-[#e5ebf3] px-3 py-3">
                        <StatusChip status={event.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ResourceSelector({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#cbd7e6] bg-[#f8fbfe] p-2 shadow-sm">
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6b7280]">Tracking resource</p>
        <p className="mt-0.5 truncate text-xs font-black text-[#10203a]">Select a vehicle or trailer</p>
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full min-w-0 rounded-md border border-[#cbd7e6] bg-white px-2.5 py-1.5 text-xs font-black text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
        aria-label="Select tracking resource"
        title={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateSelector({
  value,
  min,
  max,
  dateLabel,
  relativeLabel,
  isCurrent,
  canMoveEarlier,
  canMoveLater,
  onChange,
  onEarlier,
  onLater,
  onToday,
}: {
  value: string;
  min: string;
  max: string;
  dateLabel: string;
  relativeLabel: string;
  isCurrent: boolean;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onChange: (value: string) => void;
  onEarlier: () => void;
  onLater: () => void;
  onToday: () => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#cbd7e6] bg-[#f8fbfe] p-2 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6b7280]">Tracking date</p>
          <p className="mt-0.5 truncate text-xs font-black text-[#10203a]">{relativeLabel} • {dateLabel}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
          isCurrent ? "bg-[#dcfce7] text-[#166534] ring-1 ring-[#86efac]" : "bg-[#e8eef8] text-[#0f3a6d] ring-1 ring-[#bfdbfe]"
        }`}>
          {isCurrent ? "Live tracking" : "Historical"}
        </span>
      </div>

      <div className="mt-1.5 grid grid-cols-[auto_minmax(150px,1fr)_auto_auto] gap-1.5">
        <button
          type="button"
          onClick={onEarlier}
          disabled={!canMoveEarlier}
          className="rounded-md border border-[#cbd7e6] bg-white px-2.5 py-1.5 text-xs font-black text-[#10203a] transition hover:bg-[#edf4fb] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous tracking day"
        >
          ←
        </button>
        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 rounded-md border border-[#cbd7e6] bg-white px-2.5 py-1.5 text-xs font-black text-[#10203a] outline-none transition focus:border-[#0f3a6d] focus:ring-2 focus:ring-[#bfdbfe]"
          aria-label="Select vehicle tracking date"
        />
        <button
          type="button"
          onClick={onLater}
          disabled={!canMoveLater}
          className="rounded-md border border-[#cbd7e6] bg-white px-2.5 py-1.5 text-xs font-black text-[#10203a] transition hover:bg-[#edf4fb] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next tracking day"
        >
          →
        </button>
        <button
          type="button"
          onClick={onToday}
          disabled={isCurrent}
          className="rounded-md bg-[#10203a] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#18335c] disabled:cursor-default disabled:bg-[#9aa7b8]"
        >
          Today
        </button>
      </div>
    </div>
  );
}

function TrackingModeChip({ isCurrent }: { isCurrent: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${
      isCurrent ? "bg-[#dcfce7] text-[#166534] ring-1 ring-[#86efac]" : "bg-[#eff6ff] text-[#0f3a6d] ring-1 ring-[#bfdbfe]"
    }`}>
      {isCurrent ? "Live" : "History"}
    </span>
  );
}

function RouteMapCard({ trackingDay, selectedDateLabel }: { trackingDay: SelectedTrackingDay; selectedDateLabel: string }) {
  const [showLabels, setShowLabels] = useState(false);
  const [labelMode, setLabelMode] = useState<LabelMode>("time");


  return (
    <section className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-3 shadow-sm xl:p-4">
      <div className="flex flex-col gap-2 rounded-[16px] border border-[#dce6c6] bg-[#f5f8e9] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">
            {trackingDay.isCurrent ? "Current route" : "Selected-day route"}
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight text-[#10203a] xl:text-xl">{trackingDay.route}</h2>
          {!trackingDay.isCurrent ? <p className="mt-1 text-xs font-bold text-[#4b5563]">Recorded on {selectedDateLabel}</p> : null}
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
            trackingDay.isCurrent ? "bg-[#10203a] text-white" : "bg-[#e8eef8] text-[#0f3a6d] ring-1 ring-[#bfdbfe]"
          }`}>
            {trackingDay.statusText}
          </div>

          {trackingDay.isCurrent ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#d7dee9] bg-white/90 px-3 py-2 shadow-sm">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-black text-[#10203a]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#9ca3af] text-[#0f3a6d] focus:ring-[#0f3a6d]"
                  checked={showLabels}
                  onChange={(event) => setShowLabels(event.target.checked)}
                />
                Show labels
              </label>

              <div className="flex rounded-full border border-[#cfd8e3] bg-[#f8fafc] p-1">
                {(["time", "speed"] as LabelMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={!showLabels}
                    onClick={() => setLabelMode(mode)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] transition ${
                      labelMode === mode && showLabels ? "bg-[#0f3a6d] text-white" : "text-[#4b5563]"
                    } ${showLabels ? "hover:bg-[#dce6f7]" : "cursor-not-allowed opacity-40"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#cfd8e3] bg-white/90 px-3 py-2 text-xs font-black text-[#4b5563] shadow-sm">
              Recorded time and speed labels shown on map
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-[18px] border border-[#c9d5c1] bg-[#dfe6cf]">
        <div className="absolute left-3 top-3 z-20 rounded-lg bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#10203a] shadow-sm">
          {trackingDay.isCurrent ? "Office route analysis" : "Historical route playback"}
        </div>

        <div className="relative h-[360px] w-full sm:h-[440px] 2xl:h-[500px]">
          <Image
            src={trackingDay.map}
            alt={`${trackingDay.isCurrent ? "Live" : "Historical"} vehicle route map for ${trackingDay.route}`}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className={trackingDay.isCurrent ? "object-cover object-center" : "object-contain object-center"}
            priority={trackingDay.isCurrent}
            unoptimized
          />

          {trackingDay.isCurrent && showLabels
            ? mapLabelPoints.map((point) => <MapOverlayLabel key={point.id} point={point} labelMode={labelMode} />)
            : null}
        </div>
      </div>
    </section>
  );
}

function MapOverlayLabel({ point, labelMode }: { point: OverlayLabelPoint; labelMode: LabelMode }) {
  return (
    <div className="absolute z-20 -translate-x-1/2 -translate-y-full" style={{ left: point.x, top: point.y }}>
      <div className="rounded-lg border border-[#cfd8e3] bg-white/95 px-2 py-1 shadow-md backdrop-blur-[1px]">
        <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.12em] text-[#6b7280]">{point.place}</p>
        <p className="mt-0.5 whitespace-nowrap text-xs font-black text-[#10203a]">{labelMode === "time" ? point.time : point.speed}</p>
      </div>
      <div className="mx-auto h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e40000] shadow-sm" />
    </div>
  );
}

function MovementListCard({ events, isCurrent, selectedDateLabel }: { events: TrackingEvent[]; isCurrent: boolean; selectedDateLabel: string }) {
  return (
    <section className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-3 shadow-sm xl:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">Route event list</p>
          <h2 className="mt-1 text-xl font-black text-[#10203a]">{isCurrent ? "Today’s movements" : selectedDateLabel}</h2>
        </div>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-black text-[#0f3a6d] ring-1 ring-[#bfdbfe]">
          {events.length} events
        </span>
      </div>

      <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1 xl:max-h-[465px] 2xl:max-h-[500px]">
        {events.map((event, index) => (
          <div key={`${event.time}-${index}`} className="rounded-[14px] border border-[#d7e0ec] bg-[#fbfdff] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-black leading-tight text-[#10203a]">{event.time} • {event.place}</p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b7280]">
                  {event.placeType} • {event.duration}
                </p>
              </div>
              <StatusChip status={event.status} compact />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#4b5563]">{event.gisDetails}</p>
              <TrafficChip traffic={event.traffic} compact />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JourneyStatusCard({
  trackingDay,
  currentEvent,
  selectedDateLabel,
}: {
  trackingDay: SelectedTrackingDay;
  currentEvent: TrackingEvent;
  selectedDateLabel: string;
}) {
  return (
    <aside className="min-w-0 rounded-[22px] border border-[#d6dde8] bg-white p-4 shadow-sm xl:col-span-2 2xl:col-span-1">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(250px,0.75fr)_minmax(0,1.25fr)] 2xl:grid-cols-1">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e40000]">
            {trackingDay.isCurrent ? "Current event" : "Journey summary"}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#10203a]">
            {trackingDay.isCurrent ? currentEvent.place : trackingDay.route}
          </h2>
          <p className="mt-2 text-sm font-bold leading-5 text-[#4b5563]">
            {trackingDay.isCurrent
              ? `${currentEvent.gisDetails}. Current traffic is ${currentEvent.traffic}.`
              : `Completed vehicle activity recorded for ${selectedDateLabel}. All displayed events are historical and no live position is shown.`}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 xl:grid-cols-4 2xl:grid-cols-1">
          {trackingDay.isCurrent ? (
            <>
              <DetailRow label="Place type" value={currentEvent.placeType} />
              <DetailRow label="Event time" value={currentEvent.time} />
              <DetailRow label="Duration" value={currentEvent.duration} />
              <DetailRow label="Last known place" value={trackingDay.lastKnownPlace} />
            </>
          ) : (
            <>
              <DetailRow label="Journey start" value={trackingDay.startTime ?? "—"} />
              <DetailRow label="Journey finish" value={trackingDay.endTime ?? "—"} />
              <DetailRow label="Distance" value={trackingDay.distance ?? "—"} />
              <DetailRow label="Final recorded place" value={trackingDay.lastKnownPlace} />
            </>
          )}
        </dl>
      </div>

      <div className="mt-3 rounded-[16px] border border-[#bfdbfe] bg-[#eff6ff] p-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f3a6d]">Office note</p>
        <p className="mt-1 text-sm font-bold leading-5 text-[#1e3a5f]">
          {trackingDay.isCurrent
            ? "Today shows the current GPS position, speed and next-point ETA. Use the calendar above to review a completed route from the previous seven days."
            : "Historical mode shows where the vehicle travelled on the selected date. Route events are completed records and the map is a playback image rather than a live GPS view."}
        </p>
      </div>
    </aside>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#d7dee9] bg-[#f8fafc] px-2 py-1.5">
      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
      <p className="mt-0.5 truncate text-xs font-black text-[#10203a]" title={value}>{value}</p>
      <p className="mt-0.5 truncate text-[9px] font-bold leading-3 text-[#4b5563]">{detail}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#d7dee9] bg-[#f8fafc] px-3 py-2.5">
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[#6b7280]">{label}</dt>
      <dd className="mt-1 break-words text-sm font-black text-[#10203a]">{value}</dd>
    </div>
  );
}

function TrafficChip({ traffic, compact = false }: { traffic: string; compact?: boolean }) {
  return (
    <span className={`inline-flex rounded-full bg-[#ecf5ff] font-black uppercase tracking-[0.1em] text-[#0f3a6d] ring-1 ring-[#bfdbfe] ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"}`}>
      {traffic}
    </span>
  );
}

function StatusChip({ status, compact = false }: { status: TrackingEvent["status"]; compact?: boolean }) {
  const tone =
    status === "Completed"
      ? "border-[#15803d] bg-[#eaf7ef] text-[#166534]"
      : status === "Current"
        ? "border-[#0f3a6d] bg-[#eff6ff] text-[#0f3a6d]"
        : "border-[#d97706] bg-[#fff7ed] text-[#b45309]";

  return (
    <span className={`inline-flex shrink-0 rounded-full border font-black uppercase tracking-[0.12em] ${tone} ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"}`}>
      {status}
    </span>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function daysBetween(laterDate: Date, earlierDate: Date) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(laterDate).getTime() - startOfDay(earlierDate).getTime()) / millisecondsPerDay);
}

function clampDayOffset(offset: number) {
  return Math.min(7, Math.max(0, offset));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", "");
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
